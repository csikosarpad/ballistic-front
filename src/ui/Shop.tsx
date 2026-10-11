import { UPGRADES } from "@/game/data/upgrades";
import { upgradeCost } from "@/game/systems/upgrades";
import { useGameStore } from "@/game/state/gameStore";
import { gameRef } from "./gameRef";

/** Meccs utáni bolt: minden játékos a saját XP-jét költi. */
export function Shop() {
  const profiles = useGameStore((s) => s.profiles);

  return (
    <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
      {Object.entries(profiles).map(([id, profile]) => (
        <div key={id}>
          <strong>
            {id} – {profile.xp} XP
          </strong>
          {UPGRADES.map((def) => {
            const level = profile.levels[def.id] ?? 0;
            const maxed = level >= def.maxLevel;
            const cost = upgradeCost(def, level);
            return (
              <div key={def.id}>
                <button disabled={maxed || profile.xp < cost} onClick={() => gameRef.current?.buy(id, def.id)}>
                  {def.name} {level}/{def.maxLevel} {maxed ? "(max)" : `– ${cost} XP`}
                </button>{" "}
                <small>{def.description}</small>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
