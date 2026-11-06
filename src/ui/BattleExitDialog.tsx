import { useEffect, useRef } from "react";
import { useT } from "@/i18n";
import "./BattleExitDialog.css";

export function BattleExitDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="battle-exit-dialog"
      aria-labelledby="battle-exit-title"
      aria-describedby="battle-exit-warning"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="battle-exit-title">{t("battleExit.title")}</h2>
      <p id="battle-exit-warning">{t("battleExit.warning")}</p>
      <div className="battle-exit-actions">
        <button className="btn secondary" autoFocus onClick={onCancel}>
          {t("battleExit.cancel")}
        </button>
        <button className="btn" onClick={onConfirm}>
          {t("battleExit.confirm")}
        </button>
      </div>
    </dialog>
  );
}
