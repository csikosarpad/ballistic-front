export type SpeechLocale = "hu" | "en";

const LANG_TAG: Record<SpeechLocale, string> = { hu: "hu-HU", en: "en-US" };

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

/** Nyelv szerint szűr; azon belül férfi, helyi, majd bármely hangot választ. A név megadása felülír. */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: SpeechLocale,
  voiceName?: string,
): SpeechSynthesisVoice | null {
  const matching = voices.filter((voice) => normalizeLang(voice.lang).startsWith(locale));
  const named = voiceName ? matching.find((voice) => voice.name === voiceName) : undefined;
  if (named) return named;
  const notFemale = matching.filter((voice) => !FEMALE_NAME.test(voice.name));
  const male = notFemale.filter((voice) => MALE_NAME.test(voice.name));
  const pool = male.length > 0 ? male : notFemale.length > 0 ? notFemale : matching;
  return pool.find((voice) => voice.localService) ?? pool[0] ?? null;
}

const MAX_QUEUED = 3;
let queued = 0;

/** Tetszőleges szöveget felolvas; a mondatok sorban követik egymást, de a felgyülemlett sort eldobja. */
export function speak(text: string, locale: SpeechLocale, settings: VoiceSettings = DEFAULT_VOICE): void {
  if (!speechSupported() || !text) return;
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
  const voice = pickVoice(synth.getVoices(), locale, settings.voiceName);
  if (voice) utterance.voice = voice;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  synth.speak(utterance);
}

export function cancelSpeech(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
