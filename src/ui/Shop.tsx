import { UPGRADES } from "@/game/data/upgrades";
import { upgradeCost } from "@/game/systems/upgrades";
import { useGameStore } from "@/game/state/gameStore";
import { useT, type MessageKey } from "@/i18n";
import { gameRef } from "./gameRef";

interface ShopProps {
  editablePlayerId?: string;
  disabled?: boolean;
}

const UPGRADE_ICONS: Record<string, string> = {
  armor: "◆",
  shield: "ϟ",
  warhead: "✦",
  blast: "✹",
  barrel: "◎",
  engine: "▣",
};

/** Meccs utáni bolt: minden játékos a saját XP-jét költi. */
export function Shop({ editablePlayerId, disabled = false }: ShopProps) {
  const profiles = useGameStore((s) => s.profiles);
  const t = useT();

  return (
    <div className="shop-players">
      {Object.entries(profiles).map(([id, profile]) => (
        <section className="player-upgrades-panel" key={id} aria-labelledby={`upgrades-${id}`}>
          <div className="player-upgrades-header">
            <h3 id={`upgrades-${id}`}>{id}</h3>
            <div className="player-earned-xp">
              <span>{t("shop.totalXp")}</span>
              <strong>{profile.xp} XP</strong>
            </div>
          </div>
          <table className="player-upgrades-table">
            <tbody>
              {UPGRADES.map((def) => {
                const level = profile.levels[def.id] ?? 0;
                const maxed = level >= def.maxLevel;
                const cost = upgradeCost(def, level);
                const name = t(`upgrade.${def.id}.name` as MessageKey);
                const value = def.stat === "damage" ? Math.round(def.perLevel * 100) : def.perLevel;
                return (
                  <tr key={def.id}>
                    <td className="upgrade-icon" aria-hidden="true">
                      {UPGRADE_ICONS[def.id] ?? "◆"}
                    </td>
                    <td className="upgrade-label">
                      <strong>{name}</strong>
                      <small>{t(`upgrade.${def.id}.desc` as MessageKey, { value })}</small>
                    </td>
                    <td className="upgrade-cell">
                      <span className="upgrade-levels" aria-label={`${level}/${def.maxLevel}`}>
                        {Array.from({ length: def.maxLevel }, (_, index) => (
                          <span className={index < level ? "upgrade-level filled" : "upgrade-level"} key={index} />
                        ))}
                      </span>
                      <span className="upgrade-level-label">
                        {level}/{def.maxLevel}
                      </span>
                      <button
                        aria-label={`${id}: ${name}`}
                        className={maxed ? "upgrade-buy maxed" : "upgrade-buy"}
                        disabled={
                          disabled ||
                          (editablePlayerId !== undefined && editablePlayerId !== id) ||
                          maxed ||
                          profile.xp < cost
                        }
                        onClick={() => gameRef.current?.buy(id, def.id)}
                      >
                        {maxed ? t("shop.max") : t("shop.costShort", { cost })}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
