import shotUrl from "@game/assets/audio/shot.ogg?url";
import explosionUrl from "@game/assets/audio/explosion.ogg?url";
import moveUrl from "@game/assets/audio/tank-move.ogg?url";
import { useGameStore } from "@game/state/gameStore";
import { HoldGate } from "@game/systems/holdGate";

export type SoundName = "shot" | "explosion" | "move";

const URLS: Record<SoundName, string> = { shot: shotUrl, explosion: explosionUrl, move: moveUrl };
const MASTER_VOLUME = 0.6;
const MOVE_VOLUME = 0.5;
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
  private unsubscribe: () => void;
  private onGesture = () => void this.unlock();
  private onVisible = () => {
    if (!document.hidden && this.ctx && this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
  };

  constructor() {
    // Mobilon a pointerdown/touchstart nem számít felhasználói aktivációnak; a felengedés/koppintás igen.
    for (const type of GESTURES) window.addEventListener(type, this.onGesture);
    document.addEventListener("visibilitychange", this.onVisible);
    this.unsubscribe = useGameStore.subscribe((s) => this.applyMute(s.muted));
  }

  private applyMute(muted: boolean): void {
    if (this.master) this.master.gain.value = muted ? 0 : MASTER_VOLUME;
  }

  private removeGestureListeners(): void {
    for (const type of GESTURES) window.removeEventListener(type, this.onGesture);
  }

  private async unlock(): Promise<void> {
    if (this.ctx) {
      // Felfüggesztett (pl. háttérbe került vagy tájolásváltáson átesett) kontextus újraélesztése.
      if (this.ctx.state !== "running") await this.ctx.resume().catch(() => {});
      if (this.ctx.state === "running") this.removeGestureListeners();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.applyMute(useGameStore.getState().muted);
    await ctx.resume().catch(() => {});
    if (ctx.state === "running") this.removeGestureListeners();

    await Promise.all(
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
    if (!this.ctx || !this.master || !buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.master);
    source.start();
  }

  /** Minden mozgáslépésnél hívandó; a hang addig szól, amíg a lépések tartanak. */
  moveTick(now = performance.now()): void {
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
    this.stopMove();
    void this.ctx?.close();
  }
}
