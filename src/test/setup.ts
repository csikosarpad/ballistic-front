import "@testing-library/jest-dom/vitest";
import { useLocaleStore } from "@/i18n";

// JSDOM does not implement the native dialog lifecycle.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

// A tesztek a magyar szövegekre épülnek, függetlenül a böngésző nyelvétől.
useLocaleStore.getState().setLocale("hu");
