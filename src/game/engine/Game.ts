import { Application, Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import { TerrainBloomFilter } from "./TerrainBloomFilter";
import { bloomSettings } from "./bloomQuality";
import tankBodyUrl from "../assets/tank-body.svg?url";
import tankBarrelUrl from "../assets/tank-barrel.svg?url";
import { kick, stepBarrel, type BarrelState } from "../systems/barrelAnimation";
import {
  DEFAULT_WORLD,
  dashPolyline,
  launchVelocity,
  predictTrajectory,
  stepBody,
  type BallisticBody,
} from "../physics/ballistics";
import { PreviewAllowance } from "../systems/previewAllowance";
import { dragToAim, DRAG_POWER_PER_PX } from "../systems/dragAim";
import { createSeededRandom, type MatchSetup } from "../systems/seededRandom";
import { ScreenShake } from "../systems/screenShake";
import { ShellTrail } from "../systems/shellTrail";
import { Terrain } from "../terrain/Terrain";
import { ParticleSystem } from "../systems/particles";
import { DEFAULT_THEME, type Theme } from "../theme";
import { FxRenderer } from "./FxRenderer";
import { loadFxTextures } from "./fxTextures";
import { AudioManager } from "./AudioManager";
import { BattlefieldLayers } from "./BattlefieldLayers";
import { TurnManager } from "../systems/turnManager";
import {
  applyDamage,
  barrelTip,
  createTank,
  explosionDamage,
  isAlive,
  moveTank,
  regenTankShield,
  settleTank,
  tankContains,
  type Tank,
} from "../entities/tank";
import { awardXp, buyUpgrade, computeStats, newProfile, type Profile } from "../systems/upgrades";
import { newMatchStats, recordDamage, recordShot, recordXp, type MatchStats } from "../systems/matchStats";
import { loadProfiles, saveProfiles } from "../systems/profileStorage";
import { MAX_ANGLE, MIN_POWER, useGameStore } from "../state/gameStore";
import { useMultiplayerStore } from "../state/multiplayerStore";
import { useCommandStore } from "../state/commandStore";
import { playerName } from "../state/playerNames";
import { useAiSettings } from "../state/aiSettings";
import { useCampaignStore } from "../state/campaignStore";
import type { MatchMode } from "../state/gameStore";
import { AiBrain, chooseUpgrades, simulateImpact, skillFromMemory } from "../systems/ai";
import type { RoomEvent } from "../multiplayer/protocol";
import { TRAINING_SECTOR, sectorById, type Sector, type SectorId } from "../data/sectors";

/** Ennyi HP-arány alatt kritikus a tank állapota. */
const CRITICAL_HP_FRACTION = 0.3;
/** A fanfár hossza; ennyi idő után hangzik el a győztes neve. */
const VICTORY_ANNOUNCE_DELAY_MS = 1800;
/** A gép „gondolkodási” ideje, majd a célzás látható ideje a lövés előtt. */
const AI_THINK_MS = 900;
const AI_AIM_MS = 700;
const AI_MOVE_STEP_MS = 45;
/** Esélye, hogy a gép a Smart Aimet is bekapcsolja, ha van még töltete. */
const AI_PREVIEW_CHANCE = 0.5;

interface ImpactReport {
  tank: Tank;
  hpBefore: number;
  shieldDown: boolean;
  armorBreach: boolean;
}

const FIXED_DT = 1 / 60;
/** Fix logikai pályaméret; az ablak mérete csak a skálázást befolyásolja. */
export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
const WIN_BONUS_XP = 50;
/** Az előnézet finom pontvonala (px). */
const PREVIEW_DASH = 2;
const PREVIEW_GAP = 4;
/** Ennyi ideig nem találhatja el a lövedék a lövő tankot (tick). */
const SELF_HIT_GRACE = 30;
/** A cső forgáspontja a tank talajszintje fölött (px); egyezik a tank.ts-ben lévővel. */
const BARREL_PIVOT_HEIGHT = 10;
/** Ekkora (képernyő-px) sugarú körben a tank körül indított húzás célzást jelent. */
const DRAG_GRAB_RADIUS = 64;

interface TankView {
  root: Container;
  barrel: Sprite;
  anim: BarrelState;
}

/** Pixi-t és a játéklogikát összefogó engine; Reacttől független, így tesztelhető. */
export class Game {
  private app = new Application();
  private terrain: Terrain | null = null;
  private tanksGfx = new Graphics();
  private tankLayer = new Container();
  private battlefieldLayers = new BattlefieldLayers();
  private tankViews = new Map<string, TankView>();
  private tankTextures: { body: Texture; barrel: Texture } | null = null;
  private shellGfx = new Graphics();
  private shellGlow = new Sprite();
  private trailGfx = new Graphics();
  private shellTrail = new ShellTrail();
  private shake = new ScreenShake();
  private shakeEnabled = true;
  private stageBase = { x: 0, y: 0 };
  private fx: FxRenderer | null = null;
  private audio: AudioManager | null = null;
  private previewGfx = new Graphics();
  private previewAllowance = new PreviewAllowance();
  private previewActive = false;
  private previewLocked = false;
  private dragPointerId: number | null = null;
  private theme: Theme = DEFAULT_THEME;
  private particles = new ParticleSystem(Math.random, this.theme.fx);
  private tanks: Tank[] = [];
  /** A meccsek között megmaradó fejlődés (meta-progresszió). */
  private profiles: Record<string, Profile> = loadProfiles(["P1", "P2"]);
  private matchStats: MatchStats = newMatchStats(["P1", "P2"]);
  private turns = new TurnManager([]);
  private nextStarter = Math.floor(Math.random() * 2);
  private matchRandom = Math.random;
  private multiplayer = false;
  private matchMode: MatchMode = "skirmish";
  private sector: Sector = TRAINING_SECTOR;
  private matchActive = true;
  private matchProfiles: Record<string, Profile> | null = null;
  private lastMultiplayerRevision = 0;
  private pendingMultiplayerEvents: RoomEvent[] = [];
  private pendingMultiplayerStart: { setup: MatchSetup; profiles: Record<string, Profile>; revision: number } | null =
    null;
  private unsubscribeMultiplayer: (() => void) | null = null;
  private unsubscribeAim: (() => void) | null = null;
  private targetLocked = false;
  private victoryTimer = 0;
  /** Offline meccsen a P2-t a gép vezérli; a meccs elején dől el. */
  private aiActive = false;
  private aiBrain: AiBrain | null = null;
  private aiTimers: number[] = [];
  private aiHits = 0;
  private shell: BallisticBody | null = null;
  private shellAge = 0;
  private acc = 0;
  private destroyed = false;

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({ resizeTo: host, background: this.theme.background, antialias: true });
    // Ha az init közben unmountoltak (StrictMode), azonnal takarítunk.
    if (this.destroyed) return this.app.destroy(true);
    host.appendChild(this.app.canvas);
    this.setupDragAim(this.app.canvas);

    const [body, barrel, fxTextures] = await Promise.all([
      Assets.load<Texture>({ src: tankBodyUrl, data: { resolution: 3 } }),
      Assets.load<Texture>({ src: tankBarrelUrl, data: { resolution: 3 } }),
      loadFxTextures(),
      this.battlefieldLayers.loadAssets(),
    ]);
    // Az asset-betöltés alatt is megszúnhetett a komponens (StrictMode).
    if (this.destroyed) return;
    this.audio = new AudioManager();
    this.unsubscribeAim = useGameStore.subscribe((state, prev) => {
      if (this.turns.phase === "aiming" && (state.angle !== prev.angle || state.power !== prev.power)) {
        this.lockTarget();
      }
    });
    this.tankTextures = { body, barrel };
    this.fx = new FxRenderer(fxTextures);
    this.shellGlow.texture = fxTextures.glow;
    this.shellGlow.anchor.set(0.5);
    this.shellGlow.scale.set(30 / fxTextures.glow.width);
    this.shellGlow.tint = this.theme.shell.glow;
    this.shellGlow.blendMode = "add";
    this.shellGlow.visible = false;
    this.trailGfx.blendMode = "add";

    this.terrain = new Terrain(this.app.renderer, this.theme.terrain);
    const bloom = bloomSettings(window.matchMedia("(pointer: coarse)").matches);
    this.terrain.sprite.filters = [
      new TerrainBloomFilter({
        threshold: 0.45,
        bloomScale: bloom.strength,
        blur: bloom.blur,
        quality: bloom.blur > 4 ? 4 : 2,
      }),
    ];
    const backdrop = new Graphics().rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill(this.theme.sky);
    this.app.stage.addChild(
      backdrop,
      this.battlefieldLayers,
      this.terrain.sprite,
      this.previewGfx,
      this.tankLayer,
      this.tanksGfx,
      this.shellGfx,
      this.trailGfx,
      this.shellGlow,
      this.fx.layer,
    );
    this.battlefieldLayers.setMotionEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    this.shakeEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.layout();
    const pendingStart = this.pendingMultiplayerStart;
    if (pendingStart) this.startMultiplayer(pendingStart.setup, pendingStart.profiles, pendingStart.revision);
    else this.restart();
    if (useGameStore.getState().screen !== "playing") this.leaveBattle();
    this.app.renderer.on("resize", () => this.layout());
    this.app.ticker.add((t) => this.update(t.deltaMS / 1000));
  }

  private playerColor(index: number): number {
    const { players } = this.theme;
    return players[index % players.length]!;
  }

  /** A pályát középre illeszti az ablakba, arányt tartva. */
  private layout(): void {
    const { width, height } = this.app.screen;
    const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    this.app.stage.scale.set(scale);
    this.stageBase = { x: (width - WORLD_WIDTH * scale) / 2, y: (height - WORLD_HEIGHT * scale) / 2 };
    this.applyShake();
  }

  /** A rázkódás a kamerát (stage) tolja el, a világ koordinátái és a logika változatlanok. */
  private applyShake(): void {
    const { x, y } = this.shakeEnabled ? this.shake.offset(Math.random) : { x: 0, y: 0 };
    const scale = this.app.stage.scale.x;
    this.app.stage.position.set(this.stageBase.x + x * scale, this.stageBase.y + y * scale);
  }

  /** Húzásos célzás: a soron lévő tank közeléből indított húzás iránya a szög, hossza az erő. */
  private setupDragAim(canvas: HTMLCanvasElement): void {
    canvas.style.touchAction = "none";
    const toWorld = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const { scale, position } = this.app.stage;
      return { x: (e.clientX - rect.left - position.x) / scale.x, y: (e.clientY - rect.top - position.y) / scale.y };
    };
    const pivot = () => ({ x: this.current.x, y: this.current.y - BARREL_PIVOT_HEIGHT });
    const aimTo = (e: PointerEvent) => {
      const { angle, power } = dragToAim(pivot(), toWorld(e), useGameStore.getState().maxPower);
      useGameStore.getState().setAim(angle, power);
    };
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.dragPointerId) return;
      this.dragPointerId = null;
      canvas.releasePointerCapture?.(e.pointerId);
    };

    canvas.addEventListener("pointerdown", (e) => {
      if (this.dragPointerId !== null || this.turns.phase !== "aiming" || !this.canControlCurrentTurn()) return;
      const p = pivot();
      const w = toWorld(e);
      const grab = DRAG_GRAB_RADIUS / this.app.stage.scale.x;
      if (Math.hypot(w.x - p.x, w.y - p.y) > grab) return;
      this.dragPointerId = e.pointerId;
      canvas.setPointerCapture?.(e.pointerId);
      aimTo(e);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId === this.dragPointerId && this.turns.phase === "aiming") aimTo(e);
    });
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
  }

  /** Új meccs: terep újragenerálása, tankok újraszórása. */
  restart(setup?: MatchSetup): void {
    if (!this.terrain) return;
    useCommandStore.getState().clear();
    window.clearTimeout(this.victoryTimer);
    this.clearAiTimers();
    const aiSettings = useAiSettings.getState();
    this.matchActive = true;
    this.aiActive = !this.multiplayer && (this.matchMode === "campaign" || aiSettings.enabled);
    this.aiBrain = this.aiActive ? new AiBrain({ skill: skillFromMemory(aiSettings.memory) }) : null;
    this.aiHits = 0;
    const width = WORLD_WIDTH;
    const matchSetup = setup ?? { seed: Math.floor(Math.random() * 1_000_000), starterIndex: this.nextStarter };
    this.matchRandom = createSeededRandom(matchSetup.seed);
    this.battlefieldLayers.draw(WORLD_WIDTH, WORLD_HEIGHT, matchSetup.seed, this.sector.atmosphere);
    this.terrain.build(WORLD_WIDTH, WORLD_HEIGHT, matchSetup.seed, this.sector);
    this.tanks = [
      createTank("P1", width * 0.12, this.playerColor(0), 45, this.statsFor("P1")),
      createTank("P2", width * 0.88, this.playerColor(1), 135, this.statsFor("P2")),
    ];
    this.tanks.forEach((t) => settleTank(t, this.terrain!.mask));
    this.buildTankViews();
    // Az első lövő meccsenként változik, hogy ne legyen fix kezdő előny.
    const starterIndex = ((matchSetup.starterIndex % this.tanks.length) + this.tanks.length) % this.tanks.length;
    this.turns = new TurnManager(
      this.tanks.map((t) => t.id),
      starterIndex,
    );
    this.nextStarter = (starterIndex + 1) % this.tanks.length;
    this.matchStats = newMatchStats(this.tanks.map((t) => t.id));
    this.previewAllowance.reset(Object.fromEntries(this.tanks.map((tank) => [tank.id, tank.stats.previewCharges])));
    this.shell = null;
    useGameStore.getState().sync({
      matchSequence: useGameStore.getState().matchSequence + 1,
      matchId: crypto.randomUUID(),
      sector: this.sector,
      campaignNewRoutes: [],
    });
    this.beginTurn();
  }

  startMultiplayer(setup: MatchSetup, profiles: Record<string, Profile>, revision: number): void {
    this.matchMode = "skirmish";
    this.sector = TRAINING_SECTOR;
    if (!this.terrain) {
      this.pendingMultiplayerStart = { setup, profiles, revision };
      return;
    }
    this.pendingMultiplayerStart = null;
    this.multiplayer = true;
    this.matchProfiles = profiles;
    this.profiles = Object.fromEntries(
      Object.entries(profiles).map(([id, profile]) => [id, { xp: profile.xp, levels: { ...profile.levels } }]),
    );
    saveProfiles(this.profiles);
    this.lastMultiplayerRevision = revision;
    this.pendingMultiplayerEvents = [];
    this.unsubscribeMultiplayer?.();
    this.unsubscribeMultiplayer = useMultiplayerStore.subscribe((state) => this.receiveMultiplayerEvents(state.events));
    this.restart(setup);
    this.receiveMultiplayerEvents(useMultiplayerStore.getState().events);
  }

  startOffline(mode: MatchMode = "skirmish"): void {
    this.matchMode = mode;
    if (mode === "skirmish") this.sector = TRAINING_SECTOR;
    this.pendingMultiplayerStart = null;
    this.unsubscribeMultiplayer?.();
    this.unsubscribeMultiplayer = null;
    this.multiplayer = false;
    this.matchProfiles = null;
    this.pendingMultiplayerEvents = [];
    this.lastMultiplayerRevision = 0;
    useGameStore.getState().sync({
      matchMode: mode,
      sector: this.sector,
      campaignNewRoutes: [],
      phase: "aiming",
      winner: null,
    });
    this.restart();
  }

  startCampaign(id: SectorId = useCampaignStore.getState().selectedId): boolean {
    const sector = sectorById(id);
    if (!useCampaignStore.getState().select(id)) return false;
    this.sector = sector;
    this.startOffline("campaign");
    return true;
  }

  leaveBattle(): void {
    this.matchActive = false;
    this.clearAiTimers();
    window.clearTimeout(this.victoryTimer);
    this.pendingMultiplayerStart = null;
    this.unsubscribeMultiplayer?.();
    this.unsubscribeMultiplayer = null;
    this.pendingMultiplayerEvents = [];
    this.shell = null;
    this.acc = 0;
    this.dragPointerId = null;
    useCommandStore.getState().clear();
    useGameStore.getState().sync({ canControl: false });
  }

  private statsFor(id: string) {
    return computeStats((this.matchProfiles?.[id] ?? this.profiles[id]!).levels);
  }

  /** Tankonként egy sprite-pár: a cső a test mögött forog a saját forgáspontja körü. */
  private buildTankViews(): void {
    if (!this.tankTextures) return;
    for (const child of this.tankLayer.removeChildren()) child.destroy({ children: true });
    this.tankViews.clear();
    for (const t of this.tanks) {
      const barrel = new Sprite(this.tankTextures.barrel);
      barrel.anchor.set(0, 0.5);
      const body = new Sprite(this.tankTextures.body);
      body.anchor.set(0.5, 1);
      body.tint = t.color;
      const root = new Container();
      root.addChild(barrel, body);
      this.tankLayer.addChild(root);
      this.tankViews.set(t.id, { root, barrel, anim: { angle: t.angle, recoil: 0 } });
    }
  }

  private award(id: string, xp: number): void {
    this.profiles[id] = awardXp(this.profiles[id]!, xp);
    this.matchStats = recordXp(this.matchStats, id, xp);
    saveProfiles(this.profiles);
  }

  /** Minden játékos XP-jének és fejlesztéseinek törlése. */
  resetProgress(): void {
    this.profiles = Object.fromEntries(Object.keys(this.profiles).map((id) => [id, newProfile()]));
    saveProfiles(this.profiles);
    useCampaignStore.getState().reset();
    this.syncStore();
  }

  /** Fejlesztés vásárlása; csak meccsek között (játék végén) működik. */
  buy(playerId: string, upgradeId: string): void {
    if (this.turns.phase !== "gameOver") return;
    if (this.multiplayer) {
      if (useMultiplayerStore.getState().credentials?.playerId !== playerId) return;
      void useMultiplayerStore.getState().publish("upgrade_purchased", { upgradeId });
      return;
    }
    const next = buyUpgrade(this.profiles[playerId]!, upgradeId);
    if (!next) return;
    this.profiles[playerId] = next;
    saveProfiles(this.profiles);
    this.syncStore();
  }

  requestMultiplayerRematch(): void {
    const { credentials, session } = useMultiplayerStore.getState();
    if (
      !this.multiplayer ||
      this.turns.phase !== "gameOver" ||
      credentials?.playerId !== "P1" ||
      session?.status !== "finished"
    )
      return;
    const setup = { seed: Math.floor(Math.random() * 1_000_000), starterIndex: this.nextStarter };
    void useMultiplayerStore.getState().publish("match_started", { setup, profiles: this.profiles });
  }

  private get current(): Tank {
    return this.tanks.find((t) => t.id === this.turns.current)!;
  }

  /** Lövésenként legfeljebb egy közlés hangzik el, a legfontosabb esemény szerint. */
  private announceImpact(shooter: Tank, hurt: ImpactReport[]): void {
    const { announce } = useCommandStore.getState();
    const enemies = hurt.filter((r) => r.tank !== shooter);
    const destroyed = enemies.some((r) => !isAlive(r.tank));
    const critical = hurt.find((r) => {
      const max = r.tank.stats.maxHp;
      return isAlive(r.tank) && r.tank.hp / max <= CRITICAL_HP_FRACTION && r.hpBefore / max > CRITICAL_HP_FRACTION;
    });
    if (destroyed) announce("command.destroyed", undefined, "critical", shooter.id);
    else if (critical) announce("command.critical", { id: playerName(critical.tank.id) }, "critical", critical.tank.id);
    else if (enemies.some((r) => r.armorBreach)) announce("command.armorBreach", undefined, "warning", shooter.id);
    else if (enemies.some((r) => r.shieldDown)) announce("command.shieldDown", undefined, "info", shooter.id);
    else if (enemies.length > 0) announce("command.hit", undefined, "info", shooter.id);
    else announce("command.miss", undefined, "warning", shooter.id);
  }

  /** Fanfár, majd a fanfár lecsengése után a győztes bemondása. */
  private announceVictory(winnerId: string): void {
    this.audio?.playFanfare();
    window.clearTimeout(this.victoryTimer);
    this.victoryTimer = window.setTimeout(
      () => useCommandStore.getState().announce("command.victory", { name: playerName(winnerId) }, "info", winnerId),
      VICTORY_ANNOUNCE_DELAY_MS,
    );
  }

  /** Körönként egyszer, az első célzás vagy mozgás után jelzi, hogy a cél be van fogva. */
  private lockTarget(): void {
    if (this.targetLocked) return;
    this.targetLocked = true;
    useCommandStore.getState().announce("command.targetAcquired", undefined, "info", this.turns.current);
  }

  private beginTurn(): void {
    // A kör elején beállított szög/erő még nem játékos-beavatkozás.
    this.targetLocked = true;
    const tank = this.current;
    regenTankShield(tank);
    tank.moveLeft = tank.stats.moveBudget;
    this.previewActive = false;
    this.previewLocked = false;
    // Új szél minden körben.
    const wind = Math.round((this.matchRandom() - 0.5) * 120);
    this.battlefieldLayers.setWind(wind);
    useGameStore.getState().sync({ angle: tank.angle, power: tank.power, maxPower: tank.stats.maxPower, wind });
    this.syncStore();
    this.targetLocked = false;
    if (this.isAiTurn()) this.scheduleAiTurn();
  }

  private isAiTurn(): boolean {
    return (
      this.matchActive &&
      this.aiActive &&
      !this.multiplayer &&
      this.turns.current === "P2" &&
      this.turns.phase === "aiming"
    );
  }

  private clearAiTimers(): void {
    for (const id of this.aiTimers) window.clearTimeout(id);
    this.aiTimers = [];
  }

  private afterAi(ms: number, action: () => void): void {
    const id = window.setTimeout(() => {
      this.aiTimers = this.aiTimers.filter((t) => t !== id);
      if (!this.destroyed && this.isAiTurn()) action();
    }, ms);
    this.aiTimers.push(id);
  }

  /** A gép látható „gondolkodás” után közelít, ha kell, majd beállítja a célzást és lő. */
  private scheduleAiTurn(): void {
    this.clearAiTimers();
    this.afterAi(AI_THINK_MS, () => {
      const target = this.tanks.find((t) => t.id === "P1");
      if (!this.terrain || !this.aiBrain || !target) return;
      const wind = useGameStore.getState().wind;
      const steps = this.aiBrain.planMove(this.current, target, this.terrain.mask, wind, DEFAULT_WORLD.gravity);
      this.aiMove(target.x < this.current.x ? -1 : 1, steps);
    });
  }

  private aiMove(dir: -1 | 1, stepsLeft: number): void {
    if (stepsLeft > 0 && this.terrain && moveTank(this.current, dir, this.terrain.mask)) {
      this.audio?.moveTick();
      this.syncStore();
      this.afterAi(AI_MOVE_STEP_MS, () => this.aiMove(dir, stepsLeft - 1));
      return;
    }
    this.aiAimAndFire();
  }

  private aiAimAndFire(): void {
    const target = this.tanks.find((t) => t.id === "P1");
    if (!this.terrain || !this.aiBrain || !target) return;
    const wind = useGameStore.getState().wind;
    const smartAim = this.previewAllowance.canUse("P2") && Math.random() < AI_PREVIEW_CHANCE;
    if (smartAim) this.activatePreview();
    const plan = this.aiBrain.decide(this.current, target, this.terrain.mask, wind, DEFAULT_WORLD.gravity, smartAim);
    const angle = Math.round(plan?.angle ?? 135);
    const power = Math.round(plan?.power ?? this.current.stats.maxPower * 0.6);
    useGameStore.getState().setAim(angle, power);
    this.afterAi(AI_AIM_MS, () => this.launchShot(angle, power));
  }

  /** A gép a lövés végén tanul a becsapódásból. */
  private aiObserveImpact(shooterId: string, x: number, dealt: number): void {
    if (!this.aiActive || shooterId !== "P2") return;
    this.aiBrain?.observe(x);
    if (dealt > 0) this.aiHits++;
  }

  /** Meccs végén a gép rögzíti a tapasztalatot, és maga választja ki a fejlesztéseit. */
  private finishAiMatch(): void {
    if (!this.aiActive || !this.aiBrain) return;
    const own = this.matchStats["P2"];
    const other = this.matchStats["P1"];
    if (!own || !other) return;
    const won = this.turns.winner === "P2";
    useAiSettings.getState().recordMatch({ won, shots: own.shots, hits: this.aiHits });
    const { profile } = chooseUpgrades(this.profiles["P2"]!, {
      shots: own.shots,
      damageDealt: own.damage,
      damageTaken: other.damage,
      won,
    });
    this.profiles["P2"] = profile;
    saveProfiles(this.profiles);
  }

  private syncStore(): void {
    useGameStore.getState().sync({
      matchMode: this.matchMode,
      aiActive: this.aiActive,
      phase: this.turns.phase,
      currentId: this.turns.current,
      canControl:
        this.matchActive &&
        !this.isAiTurn() &&
        (!this.multiplayer || useMultiplayerStore.getState().credentials?.playerId === this.turns.current) &&
        this.pendingMultiplayerEvents.length === 0,
      winner: this.turns.winner,
      tanks: this.tanks.map((t) => ({
        id: t.id,
        hp: t.hp,
        maxHp: t.stats.maxHp,
        shield: t.shield,
        maxShield: t.stats.maxEnergyShield,
        armor: t.armor,
        maxArmor: t.stats.maxArmor,
        moveLeft: t.moveLeft,
        color: t.color,
      })),
      profiles: { ...this.profiles },
      matchStats: this.matchStats,
      previewAvailable: this.turns.phase === "aiming" && this.previewAllowance.canUse(this.turns.current),
      previewRemaining: this.previewAllowance.remainingFor(this.turns.current),
      previewActive: this.previewActive,
    });
  }

  /** Meccsenként és játékosonként egyszer: az aktuális kör végéig mutatja a várható röppályát. */
  requestPreview(): void {
    if (this.turns.inputLocked || !this.canControlCurrentTurn()) return;
    this.activatePreview();
  }

  /** Bekapcsolja a röppálya-előnézetet. */
  private activatePreview(): void {
    if (!this.previewAllowance.use(this.turns.current)) return;
    this.previewActive = true;
    this.previewLocked = false;
    useCommandStore.getState().announce("command.smartAim", undefined, "info", this.turns.current);
    this.syncStore();
  }

  /** Neon célkereszt a célponton, ha az aktuális röppálya eltalálja. */
  private drawLockOn(t: Tank): void {
    const cy = t.y - 6;
    const color = 0xff1744;
    const g = this.tanksGfx;
    g.circle(t.x, cy, 12).stroke({ width: 5, color, alpha: 0.3 });
    g.circle(t.x, cy, 12).stroke({ width: 2, color, alpha: 1 });
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      g.moveTo(t.x + dx * 8, cy + dy * 8)
        .lineTo(t.x + dx * 17, cy + dy * 17)
        .stroke({ width: 2, color, alpha: 1 });
    }
  }

  /** Mozgás a jelenlegi tankkal; zárolt bemenetnél nem csinál semmit. */
  move(dir: -1 | 1): void {
    if (!this.matchActive || this.turns.inputLocked || !this.terrain || this.isAiTurn()) return;
    if (this.multiplayer) {
      if (this.canControlCurrentTurn()) void useMultiplayerStore.getState().publish("move", { direction: dir });
      return;
    }
    if (moveTank(this.current, dir, this.terrain.mask)) {
      this.audio?.moveTick();
      this.lockTarget();
      this.syncStore();
    }
  }

  /** Lövés a store-ban beállított szöggel és erővel. */
  fire(): void {
    if (!this.matchActive || this.turns.inputLocked || this.isAiTurn()) return;
    if (this.multiplayer) {
      if (!this.canControlCurrentTurn()) return;
      const { angle, power } = useGameStore.getState();
      void useMultiplayerStore.getState().publish("fire", { angle, power });
      return;
    }
    const { angle, power } = useGameStore.getState();
    this.launchShot(angle, power);
  }

  private launchShot(angle: number, power: number): void {
    if (!this.turns.fire()) return;
    const tank = this.current;
    tank.angle = angle;
    tank.power = power;
    useGameStore.getState().setAim(angle, power);
    this.matchStats = recordShot(this.matchStats, tank.id);
    const tip = barrelTip(tank);
    this.particles.spawnMuzzleFlash(tip.x, tip.y, angle);
    this.audio?.play("shot", { rate: 0.95 + Math.random() * 0.1 });
    this.shell = { pos: tip, vel: launchVelocity(angle, power) };
    const view = this.tankViews.get(tank.id);
    if (view) view.anim = kick(angle);
    this.shellAge = 0;
    this.shellTrail.clear();
    this.syncStore();
  }

  private canControlCurrentTurn(): boolean {
    if (!this.matchActive || this.isAiTurn()) return false;
    return !this.multiplayer || useMultiplayerStore.getState().credentials?.playerId === this.turns.current;
  }

  private receiveMultiplayerEvents(events: RoomEvent[]): void {
    if (!this.multiplayer) return;
    for (const event of events) {
      if (event.revision <= this.lastMultiplayerRevision) continue;
      this.lastMultiplayerRevision = event.revision;
      this.pendingMultiplayerEvents.push(event);
    }
    this.processPendingMultiplayerEvents();
  }

  private processPendingMultiplayerEvents(): void {
    let changed = false;
    while (this.pendingMultiplayerEvents.length > 0) {
      const event = this.pendingMultiplayerEvents[0]!;
      if (event.type === "match_started" && this.turns.phase === "gameOver") {
        const setup = event.payload.setup;
        const profiles = event.payload.profiles;
        if (
          !setup ||
          typeof setup !== "object" ||
          typeof (setup as MatchSetup).seed !== "number" ||
          typeof (setup as MatchSetup).starterIndex !== "number" ||
          !profiles ||
          typeof profiles !== "object"
        ) {
          this.pendingMultiplayerEvents.shift();
          continue;
        }
        this.pendingMultiplayerEvents.shift();
        this.matchProfiles = profiles as Record<string, Profile>;
        this.profiles = Object.fromEntries(
          Object.entries(this.matchProfiles).map(([id, profile]) => [
            id,
            { xp: profile.xp, levels: { ...profile.levels } },
          ]),
        );
        saveProfiles(this.profiles);
        this.lastMultiplayerRevision = event.revision;
        this.restart(setup as MatchSetup);
        useGameStore.getState().setScreen("playing");
        changed = false;
        continue;
      }
      if (event.type === "upgrade_purchased" && this.turns.phase === "gameOver") {
        this.pendingMultiplayerEvents.shift();
        const upgradeId = event.payload.upgradeId;
        if (typeof upgradeId !== "string" || !this.profiles[event.playerId]) continue;
        const next = buyUpgrade(this.profiles[event.playerId]!, upgradeId);
        if (!next) continue;
        this.profiles[event.playerId] = next;
        saveProfiles(this.profiles);
        this.syncStore();
        continue;
      }
      if (event.type !== "move" && event.type !== "fire") {
        this.pendingMultiplayerEvents.shift();
        changed = true;
        continue;
      }
      if (event.playerId !== this.turns.current) {
        this.pendingMultiplayerEvents.shift();
        changed = true;
        continue;
      }
      if (this.turns.inputLocked) break;

      this.pendingMultiplayerEvents.shift();
      changed = true;
      if (event.type === "move") {
        const direction = event.payload.direction;
        if (
          (direction === -1 || direction === 1) &&
          this.terrain &&
          moveTank(this.current, direction, this.terrain.mask)
        ) {
          this.audio?.moveTick();
          this.lockTarget();
        }
        continue;
      }

      const angle = event.payload.angle;
      const power = event.payload.power;
      if (typeof angle !== "number" || angle < 0 || angle > MAX_ANGLE) continue;
      if (typeof power !== "number" || power < MIN_POWER || power > this.current.stats.maxPower) continue;
      this.launchShot(angle, power);
      break;
    }
    if (changed && !this.turns.inputLocked) this.syncStore();
  }

  private explode(x: number, y: number): void {
    const shooter = this.current;
    const radius = shooter.stats.blastRadius;
    this.battlefieldLayers.reactToImpact(Math.min(1, radius / 80));
    this.terrain?.carve(x, y, radius);
    this.particles.spawnExplosion(x, y, radius);
    this.audio?.play("explosion", { rate: 0.9 + Math.random() * 0.2 });
    // XP: az ellenfélnek okozott sérülés (1 HP, pajzs- vagy páncélpont = 1 XP).
    let dealt = 0;
    const hurt: ImpactReport[] = [];
    for (const t of this.tanks) {
      const before = t.hp + t.shield + t.armor;
      const shieldBefore = t.shield;
      const armorBefore = t.armor;
      const hpBefore = t.hp;
      applyDamage(t, explosionDamage(t, x, y, radius, shooter.stats.damage));
      if (t !== shooter) dealt += before - (t.hp + t.shield + t.armor);
      if (before === t.hp + t.shield + t.armor) continue;
      hurt.push({
        tank: t,
        shieldDown: shieldBefore > 0 && t.shield === 0,
        armorBreach: armorBefore > 0 && t.armor === 0,
        hpBefore,
      });
    }
    this.announceImpact(shooter, hurt);
    this.aiObserveImpact(shooter.id, x, dealt);
    this.award(shooter.id, dealt);
    this.matchStats = recordDamage(this.matchStats, shooter.id, dealt);
    this.shake.trigger(Math.min(1, radius / 80) * 0.75 + (dealt > 0 ? 0.25 : 0));
    for (const t of this.tanks) if (this.terrain) settleTank(t, this.terrain.mask);
    this.shell = null;
    this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
    if (this.turns.phase === "aiming") this.beginTurn();
    else {
      if (this.matchMode === "campaign" && this.turns.winner === "P1") {
        const routes = useCampaignStore.getState().complete(this.sector.id);
        useGameStore.getState().sync({ campaignNewRoutes: routes });
      }
      if (this.turns.winner) {
        this.award(this.turns.winner, WIN_BONUS_XP);
        this.finishAiMatch();
        this.announceVictory(this.turns.winner);
      }
      const onlineRoom = useMultiplayerStore.getState();
      if (this.multiplayer && onlineRoom.credentials?.playerId === "P1" && onlineRoom.session?.status === "playing") {
        void useMultiplayerStore.getState().publish("match_finished", { winner: this.turns.winner });
      }
      this.syncStore();
    }
  }

  private stepShell(): void {
    if (!this.shell || !this.terrain) return;
    this.shell = stepBody(this.shell, { ...DEFAULT_WORLD, wind: useGameStore.getState().wind }, FIXED_DT);
    this.shellAge++;
    const { x, y } = this.shell.pos;
    this.shellTrail.push(x, y);
    if (this.shellAge % 3 === 0) this.particles.spawnTrail(x, y);
    const hitTank = this.tanks.some(
      (t) => isAlive(t) && (t.id !== this.turns.current || this.shellAge > SELF_HIT_GRACE) && tankContains(t, x, y),
    );
    if (hitTank || this.terrain.mask.isSolid(x, y)) this.explode(x, y);
    else if (x < 0 || x > this.terrain.mask.width || y > WORLD_HEIGHT) {
      // Pályán kívül: nincs robbanás, a kör véget ér.
      this.aiObserveImpact(this.turns.current, x, 0);
      this.shell = null;
      this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
      this.beginTurn();
    }
  }

  private update(frameDt: number): void {
    this.audio?.update();
    if (!this.matchActive) return;
    // Fix időlépés: a fizika független a képfrissítéstől.
    this.acc += Math.min(frameDt, 0.1);
    while (this.acc >= FIXED_DT) {
      this.acc -= FIXED_DT;
      this.stepShell();
    }
    this.processPendingMultiplayerEvents();
    this.battlefieldLayers.update(frameDt);
    this.particles.update(frameDt);
    this.draw(frameDt);
  }

  /** Halvány szaggatott ív a várható röppályáról; a szelet is figyelembe veszi, a tankokat nem. */
  private drawPreview(): void {
    const g = this.previewGfx.clear();
    const tank = this.tanks.find((t) => t.id === this.turns.current);
    if (!this.previewActive || this.turns.phase !== "aiming" || !this.terrain || !tank || !isAlive(tank)) return;
    const { angle, power, wind } = useGameStore.getState();
    const mask = this.terrain.mask;
    const target = this.tanks.find((t) => t.id !== tank.id && isAlive(t));
    const impact = target
      ? simulateImpact(
          barrelTip({ ...tank, angle }),
          angle,
          power,
          { ...DEFAULT_WORLD, wind },
          mask,
          target,
        )
      : null;
    const locked = impact?.hitTarget === true;
    if (locked && !this.previewLocked) {
      useCommandStore.getState().announce("command.aimed", undefined, "info", this.turns.current);
    }
    this.previewLocked = locked;
    const points = predictTrajectory(
      barrelTip({ ...tank, angle }),
      angle,
      power,
      { ...DEFAULT_WORLD, wind },
      {
        dt: FIXED_DT,
        maxSteps: 600,
        width: mask.width,
        height: WORLD_HEIGHT,
        isBlocked: (x, y) => mask.isSolid(x, y),
      },
    );
    for (const [a, b] of dashPolyline(points, PREVIEW_DASH, PREVIEW_GAP)) g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    g.stroke({ width: 1.5, color: this.theme.hud.previewLine, alpha: 0.18 });
  }

  /** Vékony (3 px) csík a tank fölött; a háttér a hiányzó részt jelzi. */
  private drawStripe(x: number, y: number, fraction: number, color: number): void {
    const filled = 28 * Math.min(1, Math.max(0, fraction));
    this.tanksGfx.rect(x - 14, y, 28, 3).fill(this.theme.hud.hpBack);
    if (filled > 0) this.tanksGfx.rect(x - 14, y, filled, 3).fill(color);
  }

  /** Húzás közben vonal a cső forgásponttól a célzott erőnek megfelelő pontig. */
  private drawDragGuide(tank: Tank): void {
    const { angle, power } = useGameStore.getState();
    const rad = (angle * Math.PI) / 180;
    const length = power / DRAG_POWER_PER_PX;
    const px = tank.x;
    const py = tank.y - BARREL_PIVOT_HEIGHT;
    const ex = px + Math.cos(rad) * length;
    const ey = py - Math.sin(rad) * length;
    const color = this.theme.hud.previewLine;
    this.tanksGfx.moveTo(px, py).lineTo(ex, ey).stroke({ width: 2, color, alpha: 0.85 });
    this.tanksGfx.circle(ex, ey, 7).fill({ color, alpha: 0.9 });
  }

  /** Plazmanyom: két rétegű, additív, a lövedék felé vastagodó és erősödő fénycsík. */
  private drawShellTrail(): void {
    for (const { from, to, t } of this.shellTrail.segments()) {
      this.trailGfx
        .moveTo(from.x, from.y)
        .lineTo(to.x, to.y)
        .stroke({ width: 2 + t * 7, color: this.theme.shell.glow, alpha: t * 0.22, cap: "round" });
      this.trailGfx
        .moveTo(from.x, from.y)
        .lineTo(to.x, to.y)
        .stroke({ width: 1 + t * 2, color: this.theme.shell.core, alpha: t * 0.7, cap: "round" });
    }
  }

  private draw(dt: number): void {
    const aiming = this.turns.phase === "aiming";
    const aimAngle = useGameStore.getState().angle;
    for (const t of this.tanks) {
      const view = this.tankViews.get(t.id);
      if (!view) continue;
      view.root.visible = isAlive(t);
      view.root.position.set(t.x, t.y);
      // Cénzás közben a soron lévő tank csőve a csúszó értékét követi.
      const target = aiming && t.id === this.turns.current ? aimAngle : t.angle;
      view.anim = stepBarrel(view.anim, target, dt);
      const rad = (view.anim.angle * Math.PI) / 180;
      view.barrel.rotation = -rad;
      view.barrel.position.set(
        -Math.cos(rad) * view.anim.recoil,
        -BARREL_PIVOT_HEIGHT + Math.sin(rad) * view.anim.recoil,
      );
    }

    this.drawPreview();
    this.tanksGfx.clear();
    for (const t of this.tanks) {
      if (!isAlive(t)) continue;
      // Egymás feletti vékony csíkok: HP, pajzs, páncél (a pajzs és a páncél csak ha van).
      this.drawStripe(t.x, t.y - 28, t.hp / t.stats.maxHp, this.theme.hud.hpFill);
      let top = t.y - 28;
      if (t.stats.maxEnergyShield > 0) {
        top -= 4;
        this.drawStripe(t.x, top, t.shield / t.stats.maxEnergyShield, this.theme.hud.shieldFill);
      }
      if (t.stats.maxArmor > 0) {
        top -= 4;
        this.drawStripe(t.x, top, t.armor / t.stats.maxArmor, this.theme.hud.armorFill);
      }
      if (this.previewLocked && t.id !== this.turns.current && this.turns.phase !== "gameOver") this.drawLockOn(t);
      if (t.id === this.turns.current && this.turns.phase === "aiming") {
        const my = top - 8;
        this.tanksGfx.poly([t.x - 4, my, t.x + 4, my, t.x, my + 6]).fill(this.theme.hud.turnMarker);
        if (this.dragPointerId !== null) this.drawDragGuide(t);
      }
    }

    this.fx?.render(this.particles.particles);
    this.shellGfx.clear();
    this.trailGfx.clear();
    if (!this.shell) this.shellTrail.shrink();
    this.drawShellTrail();
    this.shake.update(dt);
    this.applyShake();
    this.shellGlow.visible = !!this.shell;
    if (this.shell) {
      this.shellGlow.position.set(this.shell.pos.x, this.shell.pos.y);
      this.shellGfx.circle(this.shell.pos.x, this.shell.pos.y, 3).fill(this.theme.shell.core);
    }
  }

  destroy(): void {
    this.destroyed = true;
    window.clearTimeout(this.victoryTimer);
    this.clearAiTimers();
    this.unsubscribeMultiplayer?.();
    this.unsubscribeMultiplayer = null;
    this.unsubscribeAim?.();
    this.unsubscribeAim = null;
    this.pendingMultiplayerEvents = [];
    this.audio?.destroy();
    if (this.app.renderer) this.app.destroy(true, { children: true });
  }
}
