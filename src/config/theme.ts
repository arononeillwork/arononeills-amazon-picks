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
 */
export function themeCss(palette: SiteConfig["palette"]): string {
  return (
    `:root{color-scheme:light dark;${declarations(palette.light)}}` +
    `@media (prefers-color-scheme:dark){:root{${declarations(palette.dark)}}}`
  );
}
