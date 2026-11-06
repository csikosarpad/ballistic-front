import shotUrl from "@game/assets/audio/shot.ogg?url";
import explosionUrl from "@game/assets/audio/explosion.ogg?url";
import moveUrl from "@game/assets/audio/tank-move.ogg?url";
import { useGameStore } from "@game/state/gameStore";
import { HoldGate } from "@game/systems/holdGate";
import { useAudioSettings } from "@game/state/audioSettings";
import { DEFAULT_TRACK_ID, trackById } from "@game/data/music";
import { cancelSpeech } from "@game/systems/speech";

export type SoundName = "shot" | "explosion" | "move";

const URLS: Record<SoundName, string> = { shot: shotUrl, explosion: explosionUrl, move: moveUrl };
const MASTER_VOLUME = 0.6;
const MOVE_VOLUME = 0.5;
const MUSIC_VOLUME = 0.25;
/** A mozgáshang ennyi ideig marad meg az utolsó lépés után (a billentyű-ismétlés késése miatt). */
const MOVE_HOLD_MS = 250;
const GESTURES = ["pointerup", "touchend", "click", "keydown"] as const;

/** Web Audio alapú hangkezelő; a böngésző szabálya miatt az első kattintásra/billentyűre éled fel. */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers: Partial<Record<SoundName, AudioBuffer>> = {};
  private move: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private moveGate = new HoldGate(MOVE_HOLD_MS);
  private music: HTMLAudioElement | null = null;
  private unsubscribe: () => void;
  private unsubscribeSettings: () => void;
  private onGesture = () => this.unlock();
  private onVisible = () => {
    if (!document.hidden && this.ctx && this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
  };

  constructor() {
    // Mobilon a pointerdown/touchstart nem számít felhasználói aktivációnak; a felengedés/koppintás igen.
    for (const type of GESTURES) window.addEventListener(type, this.onGesture);
    document.addEventListener("visibilitychange", this.onVisible);
    this.unsubscribe = useGameStore.subscribe((s, previous) => {
      this.applyVolume();
      this.syncMusic();
      if (s.muted && !previous.muted) cancelSpeech();
    });
    this.unsubscribeSettings = useAudioSettings.subscribe((s, previous) => {
      this.applyVolume();
      this.syncMusic();
      // A Web Speech API a már futó mondat hangerejét nem tudja megbízhatóan módosítani.
      if (s.volume !== previous.volume || (!s.channels.voice && previous.channels.voice)) cancelSpeech();
    });
  }

  private applyVolume(): void {
    const { volume, channels } = useAudioSettings.getState();
    if (this.master) {
      this.master.gain.value = useGameStore.getState().muted || !channels.effects ? 0 : MASTER_VOLUME * volume;
    }
  }

  /** A zene a globális némítástól és a zenecsatorna kapcsolójától függ; a lejátszás felhasználói gesztusra indulhat. */
  private syncMusic(): void {
    if (!this.music) return;
    this.music.volume = MUSIC_VOLUME * useAudioSettings.getState().volume;
    const wanted = !useGameStore.getState().muted && useAudioSettings.getState().channels.music;
    if (wanted) void this.music.play().catch(() => {});
    else this.music.pause();
  }

  private removeGestureListeners(): void {
    for (const type of GESTURES) window.removeEventListener(type, this.onGesture);
  }

  private unlock(): void {
    if (this.ctx) {
      // Felfüggesztett (pl. háttérbe került) kontextus újraélesztése; a resume() függőben maradhat, ezért nem várjuk meg.
      if (this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
      this.syncMusic();
      return;
    }
    const music = new Audio(trackById(DEFAULT_TRACK_ID).url);
    music.loop = true;
    music.volume = MUSIC_VOLUME;
    this.music = music;
    this.syncMusic();
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.applyVolume();
    ctx.onstatechange = () => {
      if (ctx.state === "running") this.removeGestureListeners();
    };
    void ctx.resume().catch(() => {});
    if (ctx.state === "running") this.removeGestureListeners();

    // A betöltés nem várhat a resume()-ra: mobilon az függőben maradhat, és a hangok sosem töltődnének be.
    void Promise.all(
      (Object.keys(URLS) as SoundName[]).map(async (name) => {
        try {
          const data = await (await fetch(URLS[name])).arrayBuffer();
          this.buffers[name] = await ctx.decodeAudioData(data);
        } catch (err) {
          // Egy hibás hangfájl miatt a játék hang nélkül is menjen tovább.
          console.warn(`A(z) ${name} hang nem tölthető be`, err);
        }
      }),
    );
  }

  play(name: SoundName, { rate = 1, volume = 1 }: { rate?: number; volume?: number } = {}): void {
    const buffer = this.buffers[name];
    if (!this.ctx || !this.master || !buffer || !useAudioSettings.getState().channels.effects) return;
    if (this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.master);
    source.start();
  }

  /**
   * Szintetizált helyettesítő fanfár; ha lesz valódi hangfájl, ide kell bekötni (SoundName + URLS).
   */
  playFanfare(): void {
    if (!this.ctx || !this.master || !useAudioSettings.getState().channels.effects) return;
    if (this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
    const start = this.ctx.currentTime + 0.05;
    // C-dúr felfelé futó hármashangzat, a végén hosszan kitartott akkord.
    const notes: Array<[freq: number, at: number, length: number]> = [
      [261.63, 0, 0.18],
      [329.63, 0.2, 0.18],
      [392.0, 0.4, 0.18],
      [523.25, 0.6, 0.9],
      [392.0, 0.6, 0.9],
      [329.63, 0.6, 0.9],
    ];
    for (const [freq, at, length] of notes) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const gain = this.ctx.createGain();
      const t0 = start + at;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
      osc.connect(gain).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + length + 0.05);
    }
  }

  /** Minden mozgáslépésnél hívandó; a hang addig szól, amíg a lépések tartanak. */
  moveTick(now = performance.now()): void {
    if (!useAudioSettings.getState().channels.effects) return;
    this.moveGate.touch(now);
    const buffer = this.buffers.move;
    if (this.move || !this.ctx || !this.master || !buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(MOVE_VOLUME, this.ctx.currentTime + 0.05);
    source.connect(gain).connect(this.master);
    // Véletlen helyről indul, hogy ne mindig ugyanaz a kezdet szóljon.
    source.start(0, Math.random() * buffer.duration);
    this.move = { source, gain };
  }

  /** Képkockánként hívandó: lecseng a mozgáshang, ha nincs több lépés. */
  update(now = performance.now()): void {
    if (this.move && !this.moveGate.isActive(now)) this.stopMove();
  }

  private stopMove(): void {
    if (!this.move || !this.ctx) return;
    const { source, gain } = this.move;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);
    source.stop(t + 0.12);
    this.move = null;
  }

  destroy(): void {
    this.removeGestureListeners();
    document.removeEventListener("visibilitychange", this.onVisible);
    this.unsubscribe();
    this.unsubscribeSettings();
    this.music?.pause();
    this.music = null;
    this.stopMove();
    void this.ctx?.close();
  }
}
