import { useCallback, useEffect, useRef, type ButtonHTMLAttributes } from "react";

const FIRST_DELAY_MS = 350;

interface RepeatButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onPress: () => void;
  /** Nyomva tartáskor ennyi ms-onként ismétli a műveletet. */
  intervalMs?: number;
}

/** Gomb, amely nyomva tartva ismétel; a billentyűs aktiválás (Enter/szóköz) egyszer fut le. */
export function RepeatButton({ onPress, intervalMs = 90, disabled, onPointerDown, ...rest }: RepeatButtonProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const action = useRef(onPress);
  action.current = onPress;

  const stop = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);

  const tick = (delay: number) => {
    timer.current = setTimeout(() => {
      action.current();
      tick(intervalMs);
    }, delay);
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (e.button > 0) return;
        stop();
        action.current();
        tick(FIRST_DELAY_MS);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onBlur={stop}
      onContextMenu={(e) => e.preventDefault()}
      // Az egér/érintés a pointerdown-ban már lefutott; a click csak a billentyűs aktiválás (detail 0).
      onClick={(e) => {
        if (e.detail === 0) action.current();
      }}
    />
  );
}
