import shotUrl from "../assets/audio/shot.wav?url";
import explosionUrl from "../assets/audio/explosion.flac?url";
import moveUrl from "../assets/audio/tank-move.wav?url";
import { useGameStore } from "../state/gameStore";
import { HoldGate } from "../systems/holdGate";

export type SoundName = "shot" | "explosion" | "move";

const URLS: Record<SoundName, string> = { shot: shotUrl, explosion: explosionUrl, move: moveUrl };
const MASTER_VOLUME = 0.6;
const MOVE_VOLUME = 0.5;
/** A mozgáshang ennyi ideig marad meg az utolsó lépés után (a billentyű-ismétlés késése miatt). */
const MOVE_HOLD_MS = 250;

/** Web Audio alapú hangkezelő; a böngésző szabálya miatt az első kattintásra/billentyűre éled fel. */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers: Partial<Record<SoundName, AudioBuffer>> = {};
  private move: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private moveGate = new HoldGate(MOVE_HOLD_MS);
  private unsubscribe: () => void;
  private onGesture = () => void this.unlock();

  constructor() {
    window.addEventListener("pointerdown", this.onGesture);
    window.addEventListener("keydown", this.onGesture);
    this.unsubscribe = useGameStore.subscribe((s) => this.applyMute(s.muted));
  }

  private applyMute(muted: boolean): void {
    if (this.master) this.master.gain.value = muted ? 0 : MASTER_VOLUME;
  }

  private async unlock(): Promise<void> {
    if (this.ctx) return;
    window.removeEventListener("pointerdown", this.onGesture);
    window.removeEventListener("keydown", this.onGesture);
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.applyMute(useGameStore.getState().muted);
    await ctx.resume();

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
    window.removeEventListener("pointerdown", this.onGesture);
    window.removeEventListener("keydown", this.onGesture);
    this.unsubscribe();
    this.stopMove();
    void this.ctx?.close();
  }
}
