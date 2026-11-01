import { UPGRADES } from "@/game/data/upgrades";
import { upgradeCost } from "@/game/systems/upgrades";
import { useGameStore } from "@/game/state/gameStore";
import { useT, type MessageKey } from "@/i18n";
import { gameRef } from "./gameRef";

interface ShopProps {
  editablePlayerId?: string;
  disabled?: boolean;
}

/** Meccs utáni bolt: minden játékos a saját XP-jét költi. */
export function Shop({ editablePlayerId, disabled = false }: ShopProps) {
  const profiles = useGameStore((s) => s.profiles);
  const t = useT();

  return (
      <tr>
      {Object.entries(profiles).map(([id, profile]) => (
        <td key={id} colSpan={2} align="left">
          <strong>
            {id} – {profile.xp} XP
          </strong>
          <table className="player-upgrades">
          {UPGRADES.map((def) => {
            const level = profile.levels[def.id] ?? 0;
            const maxed = level >= def.maxLevel;
            const cost = upgradeCost(def, level);
            const name = t(`upgrade.${def.id}.name` as MessageKey);
            const value = def.stat === "damage" ? Math.round(def.perLevel * 100) : def.perLevel;
            return (
              <tr key={def.id}>
                <td>{name}</td>
                <td className="upgrade-cell">
                  <button
                    aria-label={`${id}: ${name}`}
                    disabled={
                      disabled ||
                      (editablePlayerId !== undefined && editablePlayerId !== id) ||
                      maxed ||
                      profile.xp < cost
                    }
                    onClick={() => gameRef.current?.buy(id, def.id)}
                  >
                     <span className="level">{level}</span>/{def.maxLevel} {maxed ? t("shop.max") : t("shop.cost", { cost })}
                  </button> <small>{t(`upgrade.${def.id}.desc` as MessageKey, { value })}</small>
              </td>
              </tr>
            );
          })}
          </table>
        </td>
      ))}
      </tr>
  );
}
