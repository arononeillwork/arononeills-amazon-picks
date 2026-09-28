import type { SiteConfig } from "./schema";

type Palette = SiteConfig["palette"]["light"];

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const declarations = (palette: Palette) =>
  Object.entries(palette)
    .map(([key, value]) => `--${kebab(key)}:${value}`)
    .join(";");

/**
 * The profile palette as CSS custom properties, inlined in <head>.
 * global.css keeps its fallbacks in :where(:root), which has zero specificity,
 * so these win even though the bundled stylesheet loads after them.
 * The site is light only (Aron's choice, 28 September 2026), so the dark
 * palette stays in the profile but isn't emitted.
 */
export function themeCss(palette: SiteConfig["palette"]): string {
  return `:root{color-scheme:light;${declarations(palette.light)}}`;
}
