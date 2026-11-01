import { useGameStore } from "@/game/state/gameStore";
import { getUnitPresentation } from "./result/unitPresentation";
import { UnitPanel } from "./result/UnitPanel";

interface ShopProps {
  editablePlayerId?: string;
  disabled?: boolean;
}

/** Meccs utáni bolt: minden játékos a saját XP-jét költi. */
export function Shop({ editablePlayerId, disabled = false }: ShopProps) {
  const profiles = useGameStore((s) => s.profiles);

  return (
    <div className="shop-players">
      {Object.entries(profiles).map(([id, profile]) => (
        <UnitPanel
          key={id}
          id={id}
          profile={profile}
          presentation={getUnitPresentation(id)}
          editable={editablePlayerId === undefined || editablePlayerId === id}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
