import "@testing-library/jest-dom/vitest";
import { useLocaleStore } from "@/i18n";

// A tesztek a magyar szövegekre épülnek, függetlenül a böngésző nyelvétől.
useLocaleStore.getState().setLocale("hu");
