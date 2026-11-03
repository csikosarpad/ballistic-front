export const clamp01 = (value: number, max: number): number => (max > 0 ? Math.min(1, Math.max(0, value / max)) : 0);

interface RingProps {
  kind: "hp" | "shield" | "armor";
  label: string;
  value: number;
  max: number;
  radius: number;
  width: number;
}

/** Egy koncentrikus gyűrű: a pathLength=100 miatt a kitöltés százalékban adható meg. */
function Ring({ kind, label, value, max, radius, width }: RingProps) {
  const shown = `${value}/${max}`;
  return (
    <g
      className={`ring ring-${kind}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={shown}
    >
      <title>{`${label}: ${shown}`}</title>
      <circle className="ring-track" cx="40" cy="40" r={radius} strokeWidth={width} pathLength={100} />
      <circle
        className="ring-fill"
        cx="40"
        cy="40"
        r={radius}
        strokeWidth={width}
        pathLength={100}
        strokeDasharray={`${clamp01(value, max) * 100} 100`}
        transform="rotate(-90 40 40)"
      />
    </g>
  );
}

interface UnitGaugeProps {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  armor: number;
  maxArmor: number;
  labels: { hp: string; shield: string; armor: string };
}

/** Műszerfal-jellegű gyűrűmérő: belül a HP, kívül a pajzs és a páncél gyűrűje, középen a HP értéke. */
export function UnitGauge({ hp, maxHp, shield, maxShield, armor, maxArmor, labels }: UnitGaugeProps) {
  return (
    <svg className="unit-gauge" viewBox="0 0 80 80" focusable="false">
      <Ring kind="hp" label={labels.hp} value={hp} max={maxHp} radius={24} width={8} />
      {maxShield > 0 && (
        <Ring kind="shield" label={labels.shield} value={shield} max={maxShield} radius={31} width={3} />
      )}
      {maxArmor > 0 && <Ring kind="armor" label={labels.armor} value={armor} max={maxArmor} radius={36} width={3} />}
      <text className="unit-gauge-value" x="40" y="45" textAnchor="middle" aria-hidden="true">
        {hp}
      </text>
    </svg>
  );
}

interface PowerDialProps {
  value: number;
  min: number;
  max: number;
}

const DIAL_RADIUS = 34;
const DIAL_LENGTH = Math.PI * DIAL_RADIUS;

/** Félkör alakú erőmérő; csak vizuális kiegészítés, a vezérlést a csúszka végzi. */
export function PowerDial({ value, min, max }: PowerDialProps) {
  const ratio = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const arc = `M 6 40 A ${DIAL_RADIUS} ${DIAL_RADIUS} 0 0 1 74 40`;
  return (
    <svg className="power-dial" viewBox="0 0 80 46" aria-hidden="true" focusable="false">
      <path className="dial-track" d={arc} strokeWidth={6} pathLength={DIAL_LENGTH} />
      <path
        className="dial-fill"
        d={arc}
        strokeWidth={6}
        pathLength={DIAL_LENGTH}
        strokeDasharray={`${ratio * DIAL_LENGTH} ${DIAL_LENGTH}`}
      />
      <text className="dial-value" x="40" y="40" textAnchor="middle">
        {value}
      </text>
    </svg>
  );
}
