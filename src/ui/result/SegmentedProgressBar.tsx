interface SegmentedProgressBarProps {
  value: number;
  max: number;
  accent?: "cyan" | "gold" | "orange";
}

export function SegmentedProgressBar({ value, max, accent = "cyan" }: SegmentedProgressBarProps) {
  return (
    <span
      className={`upgrade-levels accent-${accent}`}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {Array.from({ length: max }, (_, index) => (
        <span className={index < value ? "upgrade-level filled" : "upgrade-level"} key={index} />
      ))}
    </span>
  );
}
