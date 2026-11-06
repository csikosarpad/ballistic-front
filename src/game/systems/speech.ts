export type SpeechLocale = "hu" | "en" | "de";

const LANG_TAG: Record<SpeechLocale, string> = { hu: "hu-HU", en: "en-US", de: "de-DE" };

export function speechSupported(): boolean {
  return (
    typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"
  );
}

/** A hang jellemzői; később a beállításokból is megadhatók. */
export interface VoiceSettings {
  /** 0..2, a mélyebb hang kisebb értékű. */
  pitch: number;
  /** 0.1..10, 1 a normál tempó. */
  rate: number;
  /** Ha meg van adva és létezik ilyen hang, az nyer a automatikus választással szemben. */
  voiceName?: string;
}

export const DEFAULT_VOICE: VoiceSettings = { pitch: 0.55, rate: 0.95 };

/** A Web Speech API nem ad nemet, ezért az elterjedt hangok neve alapján ismerjük fel a férfi hangokat. */
const MALE_NAME = /\b(male|david|mark|george|james|guy|daniel|alex|fred|ryan|richard|thomas|szabolcs|andras|gabor)\b/i;
const FEMALE_NAME = /\b(female|zira|hazel|susan|samantha|victoria|karen|moira|fiona|eva|katalin|noemi|hedda)\b/i;

const normalizeLang = (lang: string) => lang.toLowerCase().replace("_", "-");

/** A nyelvhez illő hangok előnyben részesített sorrendben: férfi, helyi, majd a többi; női nevűek csak végszükségben. */
export function rankVoices(voices: readonly SpeechSynthesisVoice[], locale: SpeechLocale): SpeechSynthesisVoice[] {
  const matching = voices.filter((voice) => normalizeLang(voice.lang).startsWith(locale));
  const notFemale = matching.filter((voice) => !FEMALE_NAME.test(voice.name));
  const base = notFemale.length > 0 ? notFemale : matching;
  const score = (voice: SpeechSynthesisVoice) => (MALE_NAME.test(voice.name) ? 2 : 0) + (voice.localService ? 1 : 0);
  return base
    .map((voice, index) => ({ voice, index }))
    .sort((a, b) => score(b.voice) - score(a.voice) || a.index - b.index)
    .map((entry) => entry.voice);
}

/** Nyelv szerint szűr; azon belül férfi, helyi, majd bármely hangot választ. A név megadása felülír. */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: SpeechLocale,
  voiceName?: string,
): SpeechSynthesisVoice | null {
  const named = voiceName
    ? voices.find((voice) => voice.name === voiceName && normalizeLang(voice.lang).startsWith(locale))
    : undefined;
  return named ?? rankVoices(voices, locale)[0] ?? null;
}

export interface SlotVoice {
  voice: SpeechSynthesisVoice | null;
  pitch: number;
  rate: number;
}

/** A második parancsnok hangmagasság- és tempóeltolása, külön hang használatakor is. */
const SECOND_SLOT_PITCH_SHIFT = 0.7;
const SECOND_SLOT_RATE_SHIFT = 0.15;

/**
 * Játékosonként (0 = P1, 1 = P2) eltérő hang: ha van legalább két megfelelő hang, mindenki a sajátját kapja,
 * a második hang minden esetben magasabban és gyorsabban szólal meg.
 */
export function voiceForSlot(
  voices: readonly SpeechSynthesisVoice[],
  locale: SpeechLocale,
  slot: number,
  settings: VoiceSettings = DEFAULT_VOICE,
): SlotVoice {
  const first = pickVoice(voices, locale, settings.voiceName);
  if (slot <= 0) return { voice: first, pitch: settings.pitch, rate: settings.rate };
  const distinct = rankVoices(voices, locale).find((voice) => voice !== first);
  return {
    voice: distinct ?? first,
    pitch: Math.min(2, settings.pitch + SECOND_SLOT_PITCH_SHIFT),
    rate: settings.rate + SECOND_SLOT_RATE_SHIFT,
  };
}

const MAX_QUEUED = 3;
let queued = 0;

/** Tetszőleges szöveget felolvas; a mondatok sorban követik egymást, de a felgyülemlett sort eldobja. */
export function speak(
  text: string,
  locale: SpeechLocale,
  settings: VoiceSettings = DEFAULT_VOICE,
  slot = 0,
  volume = 1,
): void {
  if (!speechSupported() || !text || volume === 0) return;
  const synth = window.speechSynthesis;
  // A böngésző nem adja meg a sor hosszát, ezért magunk számoljuk; túlcsordulásnál újrakezdünk.
  if (!synth.speaking && !synth.pending) queued = 0;
  if (queued >= MAX_QUEUED) {
    synth.cancel();
    queued = 0;
  }
  queued += 1;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_TAG[locale];
  const { voice, pitch, rate } = voiceForSlot(synth.getVoices(), locale, slot, settings);
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  synth.speak(utterance);
}

export function cancelSpeech(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
