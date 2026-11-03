import { useEffect, useState } from "react";
import { useCommandStore, type CommandMessage } from "@/game/state/commandStore";
import { useT } from "@/i18n";

const TYPE_INTERVAL_MS = 28;

/** Betűnként "legépeli" a szöveget; csökkentett mozgás kérésekor azonnal kiírja. */
function useTypedText(text: string, animate: boolean): string {
  const [count, setCount] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (!animate) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c + 1 >= text.length) window.clearInterval(timer);
        return c + 1;
      });
    }, TYPE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [text, animate]);
  return text.slice(0, count);
}

const reducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Line({ message, latest }: { message: CommandMessage; latest: boolean }) {
  const t = useT();
  const full = t(message.key, message.params);
  const typed = useTypedText(full, latest && !reducedMotion());
  return (
    <li className={`command-line command-${message.tone}${latest ? " is-latest" : ""}`}>
      <span className="command-time">[{message.time}]</span>
      <span className="command-text" aria-label={full}>
        <span aria-hidden="true">&gt; {typed}</span>
      </span>
    </li>
  );
}

export function CommandConsole() {
  const t = useT();
  const messages = useCommandStore((s) => s.messages);
  return (
    <aside className="command-console" aria-label={t("command.title")}>
      <header className="command-header">
        <strong>{t("command.title")}</strong>
        <span className="command-feed-label">{t("command.feed")}</span>
      </header>
      <ul className="command-feed" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <Line key={m.id} message={m} latest={i === messages.length - 1} />
        ))}
      </ul>
    </aside>
  );
}
