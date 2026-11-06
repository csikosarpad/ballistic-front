import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocaleStore } from "@/i18n";
import { MenuCredits } from "./MenuCredits";

describe("MenuCredits", () => {
  beforeEach(() => useLocaleStore.getState().setLocale("hu"));

  it("az ismert, beépített tartalmak forrásait biztonságos linkekkel sorolja fel", () => {
    render(<MenuCredits />);
    const credits = screen.getByRole("complementary", { name: "Köszönet" });
    expect(credits).toHaveTextContent("Cyberpunk Neon City");
    expect(credits).toHaveTextContent("Kenney Vleugels");
    expect(credits).toHaveTextContent("Lövés · robbanás · tankmozgás");
    expect(credits).not.toHaveTextContent("Jamii");
    const links = within(credits).getAllByRole("link");
    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
    }
    expect(within(credits).getByRole("link", { name: "Pavel Prakapovich (energysound)" })).toHaveAttribute(
      "href",
      "https://pixabay.com/hu/users/energysound-41316904/",
    );
    expect(screen.getByRole("region", { name: "Felhasznált tartalmak és források" })).toHaveAttribute("tabindex", "0");
  });

  it("megállítható és újraindítható", () => {
    render(<MenuCredits />);
    const credits = screen.getByRole("complementary");
    const pause = screen.getByRole("button", { name: "Megállítás" });
    expect(pause).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(pause);
    expect(credits).toHaveClass("is-paused");
    const resume = screen.getByRole("button", { name: "Folytatás" });
    expect(resume).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(resume);
    expect(credits).not.toHaveClass("is-paused");
  });

  it("a cím és a vezérlők követik a nyelvváltást", () => {
    render(<MenuCredits />);
    act(() => useLocaleStore.getState().setLocale("en"));
    expect(screen.getByRole("complementary", { name: "Credits" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    act(() => useLocaleStore.getState().setLocale("de"));
    expect(screen.getByRole("complementary", { name: "Danksagung" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anhalten" })).toBeInTheDocument();
  });
});
