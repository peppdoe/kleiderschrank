---
name: Kleiderschrank
description: Lenas persönlicher Kleiderschrank, genäht wie das Pflegeetikett in ihrer Kleidung.
colors:
  ground: "#f5f6f8"
  surface: "#ffffff"
  ink: "#1f2a44"
  muted: "#56617a"
  line: "#d8dce5"
  line-strong: "#9aa3b5"
  chip: "#e8ebf1"
  band: "#f6e3c8"
  band-ink: "#1f2a44"
  band-stitch: "rgba(31, 42, 68, 0.3)"
  stitch: "#c98a3e"
  band-spring: "#e4eedb"
  stitch-spring: "#7fa06c"
  band-summer: "#fde3d0"
  stitch-summer: "#d98a55"
  band-winter: "#e3e9f9"
  stitch-winter: "#7b8fc9"
  kraft: "#d6ad94"
  kraft-soft: "#f2e4db"
  kraft-ink: "#2e1f19"
  season-spring: "#b7d1a8"
  season-summer: "#f3b98f"
  season-autumn: "#e2ad6f"
  season-winter: "#b6c4ec"
  on-season: "#1f2a44"
  thread: "#b8322a"
  thread-ink: "#ffffff"
  danger-solid: "#8f1d17"
  success: "#2e7d4f"
  ground-dark: "#0f1524"
  surface-dark: "#182036"
  ink-dark: "#e9ecf3"
  muted-dark: "#a7b0c3"
  line-dark: "#2b3652"
  line-strong-dark: "#6b7896"
  chip-dark: "#222c46"
  band-dark: "#3a3022"
  band-ink-dark: "#f5ead9"
  band-stitch-dark: "rgba(245, 234, 217, 0.4)"
  band-spring-dark: "#2b3627"
  band-summer-dark: "#3d2c22"
  band-winter-dark: "#262f47"
  kraft-soft-dark: "#46363a"
  thread-dark: "#e8706a"
  thread-ink-dark: "#1b0d0b"
  danger-solid-dark: "#e8706a"
  success-dark: "#6fcf97"
  garment-black: "#1c1c1e"
  garment-white: "#ffffff"
  garment-grey: "#8e8e93"
  garment-beige: "#e8d8bd"
  garment-brown: "#8b5a2b"
  garment-red: "#e0262f"
  garment-pink: "#f4a6c1"
  garment-orange: "#f28c28"
  garment-yellow: "#f5d327"
  garment-green: "#3a9d4f"
  garment-blue: "#2f6fdb"
  garment-purple: "#8a4fc9"
  garment-metallic-light: "#d9d9d9"
  garment-metallic-mid: "#8c8c8c"
  garment-metallic-high: "#f2f2f2"
typography:
  display:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  label-title:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.45
  title-small:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  body-small:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.2em"
  label-small:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  stitch: "2px"
  weave: "4px"
  tag: "10px"
  badge: "11px"
  base: "12px"
  sheet: "20px"
  toast: "22px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
components:
  button-primary:
    backgroundColor: "{colors.thread}"
    textColor: "{colors.thread-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "10px 20px"
    height: "48px"
    width: "100%"
  button-primary-disabled:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.muted}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "10px 20px"
    height: "48px"
  button-danger-solid:
    backgroundColor: "{colors.danger-solid}"
    textColor: "{colors.thread-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "10px 20px"
    height: "48px"
  button-text:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 8px"
    height: "44px"
  button-text-danger:
    textColor: "{colors.thread}"
    padding: "0 8px"
    height: "44px"
  fab:
    backgroundColor: "{colors.thread}"
    textColor: "{colors.thread-ink}"
    rounded: "{rounded.round}"
    size: "60px"
  swing-tag:
    backgroundColor: "{colors.kraft-soft}"
    textColor: "{colors.kraft-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.tag}"
    padding: "0 14px 0 26px"
    height: "44px"
  swing-tag-active:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.kraft-ink}"
  tag-count-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.caption}"
    rounded: "{rounded.badge}"
    height: "22px"
  care-symbol:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "44px"
  care-symbol-on:
    backgroundColor: "{colors.season-autumn}"
    textColor: "{colors.on-season}"
  label-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    typography: "{typography.display}"
    rounded: "{rounded.weave}"
    padding: "18px 22px"
  care-label:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    typography: "{typography.label-title}"
    rounded: "{rounded.weave}"
    padding: "18px 20px 20px"
  link-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 2px"
    height: "48px"
    width: "100%"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "12px 14px"
  tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    height: "62px"
  tab-active:
    textColor: "{colors.thread}"
  photo-tile:
    backgroundColor: "{colors.chip}"
    rounded: "{rounded.weave}"
  selection-strip-item:
    backgroundColor: "{colors.chip}"
    rounded: "{rounded.weave}"
    width: "48px"
  sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: "20px 16px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.body-small}"
    rounded: "{rounded.toast}"
    padding: "10px 18px"
---

# Design System: Kleiderschrank

## Overview

**Creative North Star: "Pflegeetikett"**

Lena is 20; the world is a care label made young, not heritage workwear: soft seasonal thread, blush kraft, a friend's voice. The wardrobe is sewn like the label inside Lena's clothes. A woven navy name band with an inset dashed stitch greets her by name; each piece carries its own sewn-in care label on its detail page; seasons are drawn as care-label symbols in a single 1.5px stroke; filters hang as kraft swing tags with a punched hole; one red thread marks what to do next. Everything else steps back so the clothing photos carry the screen.

The ground is a cool porcelain, never cream, with white surfaces and hairline navy-grey lines. Density is calm and single-column (max 720px), built for one hand at the open wardrobe: 44px minimum targets, primary actions in thumb reach, text tab bar at the bottom. Photos are frameless at 3:4 with only a 4px corner. Type is one family, Jost Variable, self-hosted; hierarchy comes from size and weight in sentence case; letterspaced caps are kept for tabs and care-symbol names only, and there is no second face.

The system refuses the iOS-settings grey grid: no pill chips, no emoji tabs, no grey-filled list rows.

**Key Characteristics:**
- Woven fabric in the color of the chosen season (pale sage, apricot, ochre or ice blue; deep tinted versions in dark) with a stronger dashed stitch is the only branded surface: the name band on the wardrobe (and its preview in the settings), the care label on a piece or an outfit, the small woven name label of each outfit. Navy is the ink, no longer the fabric.
- Kraft swing tags (notched left edge, punched hole) for every filter and selectable choice.
- A seasonal thread (sage, apricot, ochre, ice blue) sews every stitch and fills the chosen season; it follows the Season Row.
- Thread red reserved for the one primary action, the active tab, destructive actions, errors and the focus/caret affordance.
- One 1.5px round-capped stroke system for all pictograms.
- Frameless 3:4 photo tiles; the clothing is the star.
- Full light and dark token sets driven by `prefers-color-scheme`; garment swatches are a separate data palette.

## Colors

A cool navy-and-porcelain base, warmed by blush kraft and a soft seasonal thread, pierced by a single thread red for action; garment swatches sit outside it as data.

### Primary
- **Thread Red** (`thread`; dark: `thread-dark`): the sewing thread. Fills the primary button and the round add button, colors the active tab and its stitched underline, destructive text buttons, error text, the 2px focus ring and the text caret. Text on it uses `thread-ink` (white in light, near-black `thread-ink-dark` in dark, because the dark thread is lightened for contrast).
- **Deep Thread** (`danger-solid`; dark: `danger-solid-dark`): the solid confirm button in every destructive confirm sheet (delete a piece or outfit, discard changes, replace with a backup). Darker than thread red in light so a destructive confirm reads heavier than an ordinary primary action; in dark it equals the lightened thread.

### Seasonal Thread
- **Season colors** (`season-spring` sage, `season-summer` apricot, `season-autumn` ochre, `season-winter` ice blue; same in both themes): the color of the thread. `--accent` points at the season chosen in the Season Row (without a choice: the current season), set as `data-season` on the root by `App.tsx`. It draws the dashed stitch on the name band, the care labels and the outfit name labels, the heart of a favorite, and the favorite mark on tiles. Each care symbol fills in its own season color when chosen, with `on-season` navy marks.
- Never for actions, errors, text or anything that must be read; it is ornament and state. The One Thread Rule still owns red.

### Secondary
- **Kraft** (`kraft`): swing-tag card stock, warmed toward blush sand. Active filter tags, selected chips, text selection highlight, and the 3px inset ring that marks a just-saved tile. Same value in both themes.
- **Kraft Soft** (`kraft-soft`; dark: `kraft-soft-dark`): resting swing tags and chips, the "+N" overflow cell in outfit previews.
- **Kraft Ink** (`kraft-ink`): text on kraft surfaces.

### Tertiary
- **Seasonal Weave** (`band`, `band-spring`, `band-summer`, `band-winter`; dark variants): the fabric of the name band, the care labels, the outfit name labels and the favorite disc on tiles. It follows the chosen season through `data-season` on the root (default: ochre, autumn). Light: pale season tints with navy `band-ink`; dark: deep tinted versions with warm `band-ink-dark`. Chosen by the user over navy (too heavy, too heritage) and blush. The light/dark switch stays automatic with the iPhone setting.
- **Band Ink / Stitch / Band Stitch** (`band-ink`, `stitch`, `band-stitch`): text on woven surfaces; `stitch` is the stronger season color of the inset dashed stitch and the favorite heart (sage #7fa06c, apricot #d98a55, ochre #c98a3e, ice blue #7b8fc9 in light; the pale season colors in dark); `band-stitch` rings garment swatches sitting on the care label.

### Neutral
- **Porcelain Ground** (`ground`; dark: `ground-dark`): page background, sticky action bar, theme-color meta, text on ink-filled marks (season, check, badge, toast).
- **Surface** (`surface`; dark: `surface-dark`): tab bar, sheets, inputs, secondary buttons, notice lines.
- **Navy Ink** (`ink`; dark: `ink-dark`): body text, headings, selection outline on tiles, count badges, the toast.
- **Muted** (`muted`; dark: `muted-dark`): secondary text, inactive tabs, placeholders, quiet links, notices, link-row chevrons.
- **Line / Line Strong** (`line`, `line-strong` and dark variants): hairline dividers, link-row rules and borders; the strong variant outlines secondary buttons and inputs and dashes the empty-photo frame.
- **Chip** (`chip`; dark: `chip-dark`): placeholder fill behind loading photos and the disabled primary button.
- **Success** (`success`; dark: `success-dark`): confirmation text only.

### Garment Swatches (data palette)
The `garment-*` colors are data, not interface: each names a clothing color Lena can assign (Schwarz, Weiß, Grau, Beige, Braun, Rot, Rosa, Orange, Gelb, Grün, Blau, Lila), defined in `src/lib/constants.ts`. They render only inside 16px swatch circles (color chips in the form and filter sheet, the care label's color line). "Gemustert" is a conic sweep of red, yellow, green, blue and purple; "Metallic" is a 135° gradient of the three `garment-metallic-*` stops. They are the same in both themes because they describe the garment, not the screen.

### Named Rules
**The One Thread Rule.** Thread red appears only on the primary action (primary button, add button), the active tab, destructive actions, error messages, and the focus ring/caret. Never on decoration, headings, icons at rest, or a second button on the same screen.

**The Porcelain Rule.** The ground is cool porcelain (`ground`), never cream or warm off-white. Warmth enters only through kraft and the seasonal thread.

**The Data Palette Rule.** Garment swatches describe clothing and appear only inside a swatch circle; they never color interface chrome, and no UI token stands in for a garment color.

## Typography

**Display Font:** Jost Variable (self-hosted via `@fontsource-variable/jost`, with Jost, -apple-system, Segoe UI, sans-serif fallback)
**Body Font:** Jost Variable
**Label Font:** Jost Variable; letterspaced caps only for tabs and care-symbol names

**Character:** A geometric sans with a woven-label calm; one family carries everything, in sentence case so it reads personal rather than filed; small letterspaced caps remain the embroidered voice of tabs and care symbols.

### Hierarchy
- **Display** (500, 30px, 1.1, -0.01em): the greeting in the name band and page titles.
- **Label Title** (500, 26px, 1.15): the name on a care label (a piece or an outfit) and in the name-band preview in the settings; one step under Display so it sits inside the stitch.
- **Title** (500, 22px): sheet titles.
- **Title Small** (500, 20px, 1.2): centered form headers ("Neues Teil", "Neuer Look") and section titles in sentence case ("Heute", "Schrank", "In diesen Looks", "Du", "Backup", "Auf diesem iPhone").
- **Group Label** (600, 17px): form group and filter-sheet group titles ("Kategorie", "Farbe", "Saison", "Name", "Notiz", "Name des Looks").
- **Body** (400, 17px, 1.45): base size; buttons, text buttons and link rows at 500, primary at 600. Outfit card names at 500.
- **Body Small** (400, 15px): notices, chips and tags (tags at 500), section meta, action-bar hints, care-label lines, the toast (500).
- **Caption** (400, 13px): the tag count badge (600, tabular) and the inline "Gespeichert" confirmation.
- **Label** (uppercase): tab labels (12px, 0.08em) and care-symbol labels (12px, 0.12em) only. The `label` token (600, 12px, 0.2em) is no longer used for headings.
- **Label Small** (400, 13px): the muted "wähl eine" marker beside a required form group.

### Named Rules
**The One Family Rule.** Jost Variable only, self-hosted; no external font host at runtime and no second display face.

**The Caps Are Labels Rule.** Letterspaced caps name a tab or a symbol, nothing else. Section titles are sentence case. Caps are never a decorative line stacked above another heading.

**The Tabular Count Rule.** Every count (section meta, tag badge, action-bar count, backup compare) uses `font-variant-numeric: tabular-nums`.

## Layout

Single column, max 720px centered, 16px side padding, top padding respecting the safe area plus 12px. Sections are separated by 22px above a section head and 10px below; settings sections use a 1px top hairline with 20px/24px padding. Spacing steps observed: 4, 8, 12, 16, 22px, with 6px and 14px as in-component gaps.

The wardrobe grid is 3 columns at 8px gap (also for the pieces on the outfit detail); outfit previews are collages (see Outfit Look). "Heute" scrolls sideways with scroll-snap and 148px-high looks, bleeding to the screen edge. The tab bar is fixed at 62px plus the bottom safe area and centers its content to 720px on wide screens; the add button tracks the content column's right edge. Forms hide the tab bar and end in a sticky action bar on the ground color. Bottom sheets rise to 86dvh max.

**Section meta pattern.** A section head pairs the sentence-case title with a 15px muted, tabular meta on the same baseline, left-aligned beside the title. In the wardrobe it reads "N von M Teilen · Saison" when filters narrow the list and "M Teile · Saison" when they don't; the season clause joins with a middle dot. "Heute" uses a plain sentence ("2 Outfits passen zum Herbst"), Outfits a count ("3 gespeichert").

## Elevation & Depth

Mostly flat with hairlines; soft navy-tinted shadows lift only the objects that physically sit above the page.

### Shadow Vocabulary
- **Band lift** (`box-shadow: 0 6px 18px var(--shadow)`): the woven name band, as if stitched on top.
- **Button lift** (`box-shadow: 0 6px 16px var(--shadow)`): the round add button and the floating toast.
- **Sheet rise** (`box-shadow: 0 -8px 30px var(--shadow)`): bottom sheets, over a `rgba(15, 21, 36, 0.45)` backdrop.

`--shadow` is `rgba(31, 42, 68, 0.22)` in light and `rgba(0, 0, 0, 0.45)` in dark.

### Named Rules
**The Four Lifts Rule.** Only the name band, the add button, the toast and sheets cast shadows. The care label, the outfit name label and the name-band preview in the settings are sewn into the page and stay flat, as do cards, tiles, chips, rows and buttons; inset shadows are used only for focus, the tag hole and swatch rings.

## Shapes

- **Stitch corner (2px):** the inset dashed stitch inside the band and the care label.
- **Woven corner (4px):** the band, the care label, photo tiles, selection-strip thumbnails, outfit preview cells. Fabric is barely rounded.
- **Base corner (12px):** buttons, inputs, notice lines, full photos, the empty-photo frame.
- **Sheet corner (20px top only).**
- **Swing-tag silhouette:** flat 12px point on the left via `clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)`, the tag radius (10px) on the right corners only, a 7px punched hole at 11px from the left.
- **Capsules:** the 22px count badge (11px) and the toast (22px). Capsules are status, never choices.
- **Circles:** care-symbol marks (44px, 1.5px ink stroke), the add button (60px), icon buttons (44px), selection check (26px), selection-strip remove mark (18px), color swatches (16px).
- **Dashes as stitching:** the inset 1.5px dashed border on woven surfaces, the active tab's 1.5px dashed underline, the current-season ring, the quiet link's dashed underline, the empty-photo dashed frame. Dashed lines always mean thread.

## Components

### Name Band (signature)
- Seasonal woven band, 4px corners, 14px/20px/15px padding (slimmer, so the clothes start higher), centered; inset 1.5px dashed stitch in `stitch` 7px from the edge.
- Contents: greeting at Display, one rotating line at 17px (0.92 opacity, single line, ellipsis), then the Season Row printed onto the band like the symbols of a real care label (see Season Row). No date on the band: it moved to the "Heute" line, so the clothes start higher.
- **Motion, the stitch-in:** whenever the greeting line changes it reveals left to right with `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)`, 900ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 150ms delay. Disabled under `prefers-reduced-motion`. This is the system's one expressive motion moment.
- **Preview (settings):** below the name field in "Du" (input first, then result; the caps label never sits directly above the greeting) the band repeats as a live preview of the greeting (title updates while Lena types; fixed first line, no date). Same size as the real band, title at Display, so a long name wraps exactly as it will on the wardrobe; flat (no lift), no stitch-in. A group named "Vorschau der Begrüßung", not a heading.

### Care Label (item and outfit detail)
- The piece's own sewn-in label under its photo, woven in the **piece's own season** (`data-season` on the label via `stitchSeason`: the chosen season if the piece belongs to it or is all-year, otherwise its first own season), so a summer dress keeps its apricot label in autumn; the band's seasonal weave and inset stitch, 4px corners, 18px/20px/20px padding, 10px gaps, flat (no lift).
- **Favorite:** a 44px heart button top right on the piece's label (`aria-label="Lieblingsteil"`, `aria-pressed`); outline in band ink at rest, filled in the seasonal thread when on, with a 420ms pop from `scale(0.6)` (none under reduced motion). The title keeps 40px clear on the right.
- **Just saved (outfit):** after saving a look its label's stitch draws in left to right with the stitch-in curve (900ms, 120ms delay), paired with the toast "Look gespeichert"; none under reduced motion.
- **Outfit:** the same label is sewn onto the lower edge of the outfit's look (see Outfit Look): name at Label Title, the piece count as the 15px kind line, then the Outfit Seasons Line in band ink at 0.9 opacity with 22px pictograms.
- Name at Label Title; category below at 15px, 0.8 opacity, pulled up 6px; a color line with 16px garment swatches ringed in `band-stitch` (the stitch itself is seasonal thread); seasons as 22px care pictograms with 15px names, wrapping at 14px gaps; the note at 15px, 0.9 opacity, preserving line breaks.

### Season Row ("Heute" control)
- Four care-symbol buttons: 44px circles with a 1.5px ink stroke and a 1.5px pictogram, 12px caps label below in muted, 12px apart, centered (left-aligned in forms and sheets).
- **Chosen (filled):** filled in its own season color (sage, apricot, ochre, ice blue) with the ink stroke kept and an `on-season` navy mark; label in ink at 600, `aria-pressed`. Choosing a season also re-threads every stitch in that color.
- **Current season, not chosen:** the ring turns to a 2px dashed stitch so "today" stays findable when Lena picks another season; announced as "(aktuelle Saison)".
- **On the name band (wardrobe):** the row sits inside the band, 12px under the greeting line, 8px apart: 38px marks stroked in band ink, labels in band ink at 0.8 opacity (chosen: full). Greeting and "Heute" control read as one object: the band takes the chosen season's weave, its symbols say which.
- **"Heute" line:** for the current season the meta beside "Heute" is the date ("Sonntag, 11. Oktober"); for another season the heading already names it ("Für den Sommer"), so the meta only counts the looks ("2 Looks").
- On the wardrobe the current season is preselected on launch. The choice steers Heute, the greeting line and the thread color, but **never hides a piece**: the wardrobe shows everything, pieces of the chosen season first, the rest below a muted 15px heading "Für andere Saisons" (no heading when nothing is out of season). In the item form the same row is a plain multi-select without a current mark.
- Transition: background-color and color 160ms ease-out.

### Buttons
- **Shape:** base corner (12px), 48px minimum height, 10px/20px padding, 17px.
- **Primary:** thread red fill, `thread-ink` text, 600, full width (auto with 140px min in split action bars, flex-filling in a sheet bar). One per screen.
- **Secondary:** surface fill, 1px `line-strong` border, ink text, 500.
- **Danger solid:** `danger-solid` fill, `thread-ink` text, 600; the confirm in destructive confirm sheets, never a resting screen action.
- **Text buttons:** 44px tall, no fill; ink at rest, thread red for delete.
- **Disabled:** primary turns to `chip` fill with muted text at full opacity; other buttons drop to 0.45 opacity. A muted reason line sits under the action bar.
- **Focus:** 2px thread-red outline at 2px offset (global).

### Add Button
- 60px thread-red circle with the 1.5px plus pictogram, button lift, fixed bottom right 18px above the tab bar.

### Swing Tags and Chips
- Kraft-soft tag stock, kraft-ink 15px text, 44px tall, swing-tag silhouette with punched hole.
- **"Lieblinge" tag:** sits next to "Filter" in the tag row; a toggle (`aria-pressed`) with an 18px heart (filled when on) that narrows the grid to favorites; active in kraft like any active tag.
- **Selected / active:** kraft fill (chips go to 600). Active filter tags carry a 16px close mark; the "Filter" tag carries a navy count badge (22px capsule, Caption at 600, tabular).
- **Focus:** inset 2px thread-red ring (the clip-path would cut an outline).
- **In the filter sheet** only categories that exist among the pieces the other filters leave are offered, each with its count (13px, 0.7 opacity, tabular; announced as "Hose, 2 Teile"). A chosen value always stays so it can be undone. No filter can lead into an empty grid.
- Transition: background-color 140ms ease-out.
- The swing tag is reserved for categories, the "Filter"/"Lieblinge" tags and active filters, so it stays special.

### Color Swatches
- Colors are chosen as swatches, not tags (item form and filter sheet): a grid of 7 per row, 44px round tap targets 4px apart, a 30px garment dot with a 1px `line-strong` ring.
- **Chosen:** a 2px ink ring 3px outside the dot (gap in the surface or ground color); the chosen names follow below in muted 15px ("Grün, Blau"). Buttons are named by color (in the filter sheet with the count: "Blau, 2 Teile"), `aria-pressed`.
- **Focus:** 2px thread-red outline. In the filter sheet only colors present among the remaining pieces show, plus chosen ones.

### Photo Tiles
- Frameless 3:4, 4px corners, chip fill while loading.
- **Selected:** 3px inset ink outline and a 26px ink check circle top right.
- **Favorite:** a 24px circle in the seasonal weave bottom left with a filled 14px heart in `stitch`; the tile's accessible name ends in ", Lieblingsteil".
- **Just saved:** 3px inset kraft outline and a 1.2s settle from `scale(0.94)` on `cubic-bezier(0.16, 1, 0.3, 1)`, paired with the toast; no motion under reduced motion.
- Empty photo (new piece): the 4:3 dashed `line-strong` frame is itself the photo picker: camera pictogram (28px) over "Foto aufnehmen oder wählen", the whole frame tappable, thread-red focus ring. Only with a photo does the secondary button "Foto ändern" appear below.

### Selection Strip (outfit editor)
- Above the pick grid, the chosen pieces stay visible as a sideways row of 48px-wide 3:4 thumbnails, 4px corners, 6px apart, chip fill. Each is a button that removes the piece, marked by an 18px ink circle with a ground-colored cross top right. The split action bar below counts "N ausgewählt".

### Outfit Seasons Line
- Says when an outfit shows up under "Heute". The seasons are derived from its pieces (every piece with seasons must include the season; pieces without seasons always fit); outfits have no season of their own.
- **Compact (outfit list):** only the pictograms, plus visible 13px text in the two exceptions ("Ganzjährig", "Keine gemeinsame Saison"); the full sentence stays as visually hidden text and describes the card.
- Full: 18px ink care pictograms of the matching seasons, 4px apart, then a 15px muted sentence: "Erscheint im Herbst und Winter", "Erscheint das ganze Jahr", or, when the pieces share no season, "Die Teile teilen keine Saison, darum taucht der Look unter „Heute“ nicht auf." The conflict stays muted, not red; it is a hint, not an error.
- Sits under the name label in the outfit list, inside the care label on the outfit detail, and in the editor under the selection strip and under the preview on the naming step, updating live. Hidden when no pieces remain.

### Outfit Look (collage)
- An outfit is shown as one look, not a row of boxes: 1 piece fills the frame; 2 sit side by side; 3 or more become a hero piece (2/3 width, full height) with two stacked pieces beside it, the last turning into a kraft-soft "+N" cell when more remain. 3px gaps, 4px outer corners, chip fill behind.
- The look's ratio follows the piece count so every cell stays 3:4 and sleeves and shoulders stay visible: 1 piece 3:4, 2 pieces 3:2, 3+ pieces 9:8. In "Heute" looks share a fixed 148px height and take their width from the ratio (no dead gap); in the outfit list they fill the column (two columns, 22px/10px gaps, top-aligned); on the editor's naming step 62% width, max 260px.
- **Outfit detail:** the look opens the page full width under the back link, the outfit's care label is sewn onto its lower edge (14px overlap, 8px in from each side), then the pieces as a 3-column grid under the sentence-case title "Teile".

### Outfit Look (wear photo)
- An outfit may carry one photo of Lena wearing it. Where it exists it replaces the collage everywhere: a frameless 3:4 thumbnail (360×480, cropped **top-anchored** so a mirror selfie keeps the head) in "Heute" (148px high) and the outfit list (column width), 4px corners, chip fill while loading.
- **Outfit detail with photo:** the full photo opens the page, full width and uncropped (contain, at most 70vh); the care label is sewn onto its lower edge exactly as on the collage; below it two quiet links "Foto ändern" · "Foto entfernen" (removing asks in a sheet: "Foto entfernen?", "Entfernen" in thread red, "Behalten" focused); then the pieces once under "Teile". No collage, so nothing appears twice.
- **Editor naming step:** the chosen or saved photo replaces the collage at its own ratio (max 62% width / 260px, 40vh, no letterbox); a field "Foto von dir im Look" with the muted note "optional" offers the look picker or, with a photo, the quiet links "Ändern" · "Entfernen" (effective only on "Speichern"; a changed photo counts as an unsaved change).

### Look Picker
- The empty state for the wear photo: a whole-surface tappable frame, 1.5px dashed `line-strong` (thread language), 12px corners, min 88px high, camera pictogram (22px) beside muted 15px text "Zeig, wie du den Look trägst". Focus shows the thread-red ring; while a photo is prepared it reads "Foto wird vorbereitet …" and is disabled. A picked photo saves at once on the detail and confirms with the toast "Foto gespeichert".

### Outfit Name Label (outfit list)
- Each outfit's name is sewn onto the lower edge of its look (overlapping it by 14px, 8px in from the left) as a small woven label: seasonal weave, band-ink 15px/500 text, 6px/12px/7px padding, 4px corners, a 1.5px dashed seasonal-thread stitch inset 4px, sized to its text, hyphenated in German when long. Flat. The whole card stays one button, named by the label and described by the seasons line.
- The "Heute" strip on the wardrobe keeps plain outfit names on purpose: the name band directly above is the first viewport's only navy surface.

### Link Rows (outfit references)
- References to other screens are rows, not tags: full-width 48px rows between 1px `line` rules (top rule on the list), 17px ink text, an 18px muted chevron at the right. No fill, no card.

### Inputs / Fields
- Surface fill, 1px `line-strong` border, 12px corners, 12px/14px padding, 17px. Placeholder in muted, caret in thread red.
- Field label is the Group Label (17px, 600, sentence case); required groups add the Label Small "wähl eine" marker.
- **Error:** thread-red message below with `role="alert"`.

### Navigation
- Fixed bottom bar on surface with a 1px top hairline, three equal text tabs: 24px pictogram over a 12px caps label (0.08em).
- **Rest:** muted. **Active:** thread red, label at 600 with a 1.5px dashed underline in currentColor (the stitch).
- Hidden on form screens.
- **Form action bar:** forms hide the tab bar and end in a bar **fixed** to the bottom edge (never floating mid-screen on short content): an optional muted hint line centered on top ("Wähle zuerst ein Foto.", "Tipp die Teile an, die zusammengehören.", "2 ausgewählt"), then a row with "Abbrechen" / "Zurück" as a text button on the left and the primary action (min 160px) on the right. Form headers carry only the centered title. Same thumb logic as the detail bar.
- **Detail bar (piece and look detail):** fixed directly above the tab bar on the ground color with a 1px top hairline, 8px/16px padding: "‹ Schrank" or "‹ Looks" as a text button on the left, "Bearbeiten" as a secondary button (min 140px) on the right. There is no back link at the top: the installed iPhone app has no swipe-back and the top left is out of thumb reach, so photos start at the top. "Löschen" stays at the end of the content, never in the thumb zone. Toasts rise above the bar.
- **Pieces under a collage:** on a look without a wear photo the pieces follow as a 72px-wide strip (sideways, bleeding to the edge) instead of a second full grid; under a wear photo they keep the 3-column grid.

### Sheets
- **Sheet:** surface, 20px top corners, sheet rise shadow, 20px/16px padding, 16px gaps, Title heading; slides up 24px from 0.6 opacity in 240ms `cubic-bezier(0.16, 1, 0.3, 1)` (reduced motion: none). A modal dialog that traps focus, closes on Escape or a tap on the backdrop, focuses the `data-autofocus` element first and returns focus to its opener.
- **Confirm sheet:** an optional 15px muted message, then stacked actions (8px apart): the confirm (danger solid when destructive, primary otherwise) and a centered text-button cancel.
- **Filter sheet:** the filter groups scroll inside the sheet while a pinned bar stays put below a hairline: an optional "Zurücksetzen" text button and a flex-filling primary "N Teile zeigen" that has first focus.
- **Import sheet:** a backup-versus-current comparison as hairline rows with 600 tabular counts, a muted warning that the current state is replaced, then danger-solid "replace", secondary "back up first", and a text-button cancel that has first focus.

### Toast
- An ink capsule (22px corners) with ground-colored 15px/500 text, 10px/18px padding, centered and fixed 22px above the tab bar, button lift, `role="status"`. Used for "Teil gespeichert" together with the kraft-ringed new tile; one short past-tense line, no actions.

### First Run
- **Empty wardrobe:** an invitation, not a grey line: "Noch ganz viel Platz hier." (22px, ink, 500), "Fang mit deinem Lieblingsteil an." (muted), then one primary button "Erstes Teil fotografieren" with the camera pictogram (auto width). The round add button and the season symbols on the band appear only with the first piece, so the screen has exactly one red action and nothing to filter.
- **Empty Looks tab without pieces:** "Für Looks brauchst du erst ein paar Teile. Fang mit deinem ersten an." with the same primary button, which opens the new-piece form. With pieces but no looks it offers "Neuer Look" as before.

### Notice Line and Quiet Link
- Notice: surface, 1px line border, 12px corners, muted text, 44px close icon button.
- On the wardrobe at most one hint shows. The backup reminder (a quiet link) stays between "Heute" and the wardrobe because it protects Lena's data; the install hint sits after the grid, since it only matters until the app is installed and the clothes come first.
- Quiet link: muted 15px with a dashed underline at 4px offset, 44px tall.

### Pictograms
- One stroke system: 24px grid, 1.5px stroke, round caps and joins, `currentColor`, inline SVG. Seasons are real laundry care symbols carrying a small season mark: spring a wash tub with a sprout, summer the tumble-dry square whose circle becomes a sun, autumn an iron with a leaf, winter the bleach triangle with a snowflake. The season name always sits beside or below, so the symbol never has to explain itself.

## Do's and Don'ts

### Do:
- **Do** keep thread red to the primary action, the active tab, destructive actions, errors and the focus ring/caret.
- **Do** use the swing-tag silhouette with its punched hole for every filter value and selectable choice.
- **Do** use hairline link rows for references to another screen, not tags.
- **Do** draw new pictograms on the 24px grid with a 1.5px round-capped stroke.
- **Do** keep photos frameless at 3:4 with 4px corners.
- **Do** keep every interactive target at 44px or more and put the primary action in thumb reach.
- **Do** define every new UI color in both the light and the dark token set; garment swatches stay theme-independent.
- **Do** confirm destructive steps in a confirm sheet with a danger-solid button and the safe action focused.
- **Do** honor `prefers-reduced-motion` for the stitch-in, the sheet rise and the new-tile settle.

### Don't:
- **Don't** use pill-shaped chips or a grey settings-style grid; choices are kraft tags.
- **Don't** use emoji or icon fonts for tabs or symbols.
- **Don't** use a cream or warm off-white ground; the ground stays cool porcelain.
- **Don't** add a second primary (thread-red) button to a screen.
- **Don't** load fonts from an external host or add a second typeface.
- **Don't** stack a small caps line above a heading as decoration; caps labels are the heading.
- **Don't** add shadows beyond the name band, the add button, the toast and sheets.
- **Don't** use garment swatch colors for interface chrome.
