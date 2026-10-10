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
  band: "#1f2a44"
  band-ink: "#f5f6f8"
  band-stitch: "rgba(245, 246, 248, 0.5)"
  kraft: "#c9a27a"
  kraft-soft: "#eee2d2"
  kraft-ink: "#2a2016"
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
  band-dark: "#28355a"
  band-stitch-dark: "rgba(245, 246, 248, 0.45)"
  kraft-soft-dark: "#3a3126"
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
  headline:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.45
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
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.12em"
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
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
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

The wardrobe is sewn like the label inside Lena's clothes. A woven navy name band with an inset dashed stitch greets her by name; each piece carries its own sewn-in care label on its detail page; seasons are drawn as care-label symbols in a single 1.5px stroke; filters hang as kraft swing tags with a punched hole; one red thread marks what to do next. Everything else steps back so the clothing photos carry the screen.

The ground is a cool porcelain, never cream, with white surfaces and hairline navy-grey lines. Density is calm and single-column (max 720px), built for one hand at the open wardrobe: 44px minimum targets, primary actions in thumb reach, text tab bar at the bottom. Photos are frameless at 3:4 with only a 4px corner. Type is one family, Jost Variable, self-hosted; hierarchy comes from size and from letterspaced caps labels, not from a second face.

The system refuses the iOS-settings grey grid: no pill chips, no emoji tabs, no grey-filled list rows.

**Key Characteristics:**
- Navy woven fabric with an inset dashed stitch as the only branded surface: the name band on the wardrobe, the care label on an item.
- Kraft swing tags (notched left edge, punched hole) for every filter and selectable choice.
- Thread red reserved for the one primary action, the active tab, destructive actions, errors and the focus/caret affordance.
- One 1.5px round-capped stroke system for all pictograms.
- Frameless 3:4 photo tiles; the clothing is the star.
- Full light and dark token sets driven by `prefers-color-scheme`; garment swatches are a separate data palette.

## Colors

A cool navy-and-porcelain base, warmed only by kraft paper and pierced by a single thread red; garment swatches sit outside it as data.

### Primary
- **Thread Red** (`thread`; dark: `thread-dark`): the sewing thread. Fills the primary button and the round add button, colors the active tab and its stitched underline, destructive text buttons, error text, the 2px focus ring and the text caret. Text on it uses `thread-ink` (white in light, near-black `thread-ink-dark` in dark, because the dark thread is lightened for contrast).
- **Deep Thread** (`danger-solid`; dark: `danger-solid-dark`): the solid confirm button in every destructive confirm sheet (delete a piece or outfit, discard changes, replace with a backup). Darker than thread red in light so a destructive confirm reads heavier than an ordinary primary action; in dark it equals the lightened thread.

### Secondary
- **Kraft** (`kraft`): swing-tag card stock. Active filter tags, selected chips, text selection highlight, and the 3px inset ring that marks a just-saved tile. Same value in both themes.
- **Kraft Soft** (`kraft-soft`; dark: `kraft-soft-dark`): resting swing tags and chips, the "+N" overflow cell in outfit previews.
- **Kraft Ink** (`kraft-ink`): text on kraft surfaces.

### Tertiary
- **Woven Navy** (`band`; dark: `band-dark`): the name band and the care label. In light it equals the ink color, so woven fabric reads as the darkest object on the page; in dark it lifts to a brighter navy so it still separates from the ground.
- **Band Ink / Band Stitch** (`band-ink`, `band-stitch`): text and the inset dashed stitch on woven surfaces; the stitch color also rings garment swatches sitting on the care label.

### Neutral
- **Porcelain Ground** (`ground`; dark: `ground-dark`): page background, sticky action bar, theme-color meta, text on ink-filled marks (season, check, badge, toast).
- **Surface** (`surface`; dark: `surface-dark`): tab bar, sheets, inputs, secondary buttons, notice lines.
- **Navy Ink** (`ink`; dark: `ink-dark`): body text, headings, the chosen season, selection outline on tiles, count badges, the toast.
- **Muted** (`muted`; dark: `muted-dark`): secondary text, inactive tabs, placeholders, quiet links, notices, link-row chevrons.
- **Line / Line Strong** (`line`, `line-strong` and dark variants): hairline dividers, link-row rules and borders; the strong variant outlines secondary buttons and inputs and dashes the empty-photo frame.
- **Chip** (`chip`; dark: `chip-dark`): placeholder fill behind loading photos and the disabled primary button.
- **Success** (`success`; dark: `success-dark`): confirmation text only.

### Garment Swatches (data palette)
The `garment-*` colors are data, not interface: each names a clothing color Lena can assign (Schwarz, Weiß, Grau, Beige, Braun, Rot, Rosa, Orange, Gelb, Grün, Blau, Lila), defined in `src/lib/constants.ts`. They render only inside 16px swatch circles (color chips in the form and filter sheet, the care label's color line). "Bunt/Muster" is a conic sweep of red, yellow, green, blue and purple; "Metallic" is a 135° gradient of the three `garment-metallic-*` stops. They are the same in both themes because they describe the garment, not the screen.

### Named Rules
**The One Thread Rule.** Thread red appears only on the primary action (primary button, add button), the active tab, destructive actions, error messages, and the focus ring/caret. Never on decoration, headings, icons at rest, or a second button on the same screen.

**The Porcelain Rule.** The ground is cool porcelain (`ground`), never cream or warm off-white. Warmth enters only through kraft.

**The Data Palette Rule.** Garment swatches describe clothing and appear only inside a swatch circle; they never color interface chrome, and no UI token stands in for a garment color.

## Typography

**Display Font:** Jost Variable (self-hosted via `@fontsource-variable/jost`, with Jost, -apple-system, Segoe UI, sans-serif fallback)
**Body Font:** Jost Variable
**Label Font:** Jost Variable in letterspaced caps

**Character:** A geometric sans with a woven-label calm; one family carries everything, with letterspaced caps acting as the embroidered label voice.

### Hierarchy
- **Display** (500, 30px, 1.1, -0.01em): the greeting in the name band and page titles.
- **Headline** (500, 28px): outfit detail title.
- **Label Title** (500, 26px, 1.15): the piece's name on its care label; one step under Headline so it sits inside the stitch.
- **Title** (500, 22px): sheet titles.
- **Title Small** (500, 20px): centered form headers ("Neues Teil", "Neues Outfit").
- **Body** (400, 17px, 1.45): base size; buttons, text buttons and link rows at 500, primary at 600. Outfit card names at 500.
- **Body Small** (400, 15px): notices, chips and tags (tags at 500), section meta, action-bar hints, care-label lines, the toast (500).
- **Caption** (400, 13px): band date meta, the tag count badge (600, tabular) and the inline "Gespeichert" confirmation.
- **Label** (600, 12px, 0.2em, uppercase): section titles ("HEUTE", "SCHRANK", "IN DIESEN OUTFITS", form groups). Siblings in the same voice: tab labels (12px, 0.08em), care-symbol labels (12px, 0.12em).
- **Label Small** (400, 11px, 0.12em): the muted "Pflicht" marker beside a required form group.

### Named Rules
**The One Family Rule.** Jost Variable only, self-hosted; no external font host at runtime and no second display face.

**The Caps Are Labels Rule.** Letterspaced caps name a section, a tab or a symbol. They are the heading or the label itself, never a decorative line stacked above another heading.

**The Tabular Count Rule.** Every count (section meta, tag badge, action-bar count, backup compare) uses `font-variant-numeric: tabular-nums`.

## Layout

Single column, max 720px centered, 16px side padding, top padding respecting the safe area plus 12px. Sections are separated by 22px above a section head and 10px below; settings sections use a 1px top hairline with 20px/24px padding. Spacing steps observed: 4, 8, 12, 16, 22px, with 6px and 14px as in-component gaps.

The wardrobe grid is 3 columns at 8px gap (2 columns at 10px for the large variant); outfit previews use 4 columns at 4px. "Heute" scrolls sideways with scroll-snap and 196px strips, bleeding to the screen edge. The tab bar is fixed at 62px plus the bottom safe area and centers its content to 720px on wide screens; the add button tracks the content column's right edge. Forms hide the tab bar and end in a sticky action bar on the ground color. Bottom sheets rise to 86dvh max.

**Section meta pattern.** A section head pairs the caps title with a 15px muted, tabular meta on the same baseline, left-aligned beside the title. In the wardrobe it reads "N von M Teilen · Saison" when filters narrow the list and "M Teile · Saison" when they don't; the season clause joins with a middle dot. "Heute" uses a plain sentence ("2 Outfits passen zum Herbst"), Outfits a count ("3 gespeichert").

## Elevation & Depth

Mostly flat with hairlines; soft navy-tinted shadows lift only the objects that physically sit above the page.

### Shadow Vocabulary
- **Band lift** (`box-shadow: 0 6px 18px var(--shadow)`): the woven name band, as if stitched on top.
- **Button lift** (`box-shadow: 0 6px 16px var(--shadow)`): the round add button and the floating toast.
- **Sheet rise** (`box-shadow: 0 -8px 30px var(--shadow)`): bottom sheets, over a `rgba(15, 21, 36, 0.45)` backdrop.

`--shadow` is `rgba(31, 42, 68, 0.22)` in light and `rgba(0, 0, 0, 0.45)` in dark.

### Named Rules
**The Four Lifts Rule.** Only the name band, the add button, the toast and sheets cast shadows. The care label is sewn into the page and stays flat, as do cards, tiles, chips, rows and buttons; inset shadows are used only for focus, the tag hole and swatch rings.

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
- Navy band, 4px corners, 18px/22px padding, centered; inset 1.5px dashed stitch 7px from the edge.
- Contents: greeting at Display, one rotating line at 17px (0.92 opacity, single line, ellipsis), date meta at Caption (0.78 opacity).
- **Motion, the stitch-in:** whenever the greeting line changes it reveals left to right with `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)`, 900ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 150ms delay. Disabled under `prefers-reduced-motion`. This is the system's one expressive motion moment.

### Care Label (item detail)
- The piece's own sewn-in label under its photo: the band's woven navy and inset stitch, 4px corners, 18px/20px/20px padding, 10px gaps, flat (no lift).
- Name at Label Title; category below at 15px, 0.8 opacity, pulled up 6px; a color line with 16px garment swatches ringed in `band-stitch`; seasons as 22px care pictograms with 15px names, wrapping at 14px gaps; the note at 15px, 0.9 opacity, preserving line breaks.

### Season Row ("Heute" control)
- Four care-symbol buttons: 44px circles with a 1.5px ink stroke and a 1.5px pictogram, 12px caps label below in muted, 12px apart, centered (left-aligned in forms and sheets).
- **Chosen (filled):** ink fill, ground-colored mark, label in ink at 600, `aria-pressed`.
- **Current season, not chosen:** the ring turns to a 2px dashed stitch so "today" stays findable when Lena picks another season; announced as "(aktuelle Saison)".
- On the wardrobe the current season is preselected on launch, and the choice filters both Heute and the wardrobe grid. In the item form the same row is a plain multi-select without a current mark.
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
- **Selected / active:** kraft fill (chips go to 600). Active filter tags carry a 16px close mark; the "Filter" tag carries a navy count badge (22px capsule, Caption at 600, tabular).
- **Focus:** inset 2px thread-red ring (the clip-path would cut an outline).
- Color chips add a 16px garment swatch with a 1px `line-strong` ring.
- Transition: background-color 140ms ease-out.

### Photo Tiles
- Frameless 3:4, 4px corners, chip fill while loading.
- **Selected:** 3px inset ink outline and a 26px ink check circle top right.
- **Just saved:** 3px inset kraft outline and a 1.2s settle from `scale(0.94)` on `cubic-bezier(0.16, 1, 0.3, 1)`, paired with the toast; no motion under reduced motion.
- Empty photo: 4:3 dashed `line-strong` frame, muted centered text.

### Selection Strip (outfit editor)
- Above the pick grid, the chosen pieces stay visible as a sideways row of 48px-wide 3:4 thumbnails, 4px corners, 6px apart, chip fill. Each is a button that removes the piece, marked by an 18px ink circle with a ground-colored cross top right. The split action bar below counts "N ausgewählt".

### Outfit Seasons Line
- Says when an outfit shows up under "Heute". The seasons are derived from its pieces (every piece with seasons must include the season; pieces without seasons always fit); outfits have no season of their own.
- One line: 18px ink care pictograms of the matching seasons, 4px apart, then a 15px muted sentence: "Erscheint im Herbst und Winter", "Erscheint das ganze Jahr", or, when the pieces share no season, "Erscheint nie unter „Heute“: Die Teile haben keine gemeinsame Saison." The conflict stays muted, not red; it is a hint, not an error.
- Sits under the name in the outfit list, under the title on the outfit detail, and in the editor under the selection strip and under the preview on the naming step, updating live. Hidden when no pieces remain.

### Link Rows (outfit references)
- References to other screens are rows, not tags: full-width 48px rows between 1px `line` rules (top rule on the list), 17px ink text, an 18px muted chevron at the right. No fill, no card.

### Inputs / Fields
- Surface fill, 1px `line-strong` border, 12px corners, 12px/14px padding, 17px. Placeholder in muted, caret in thread red.
- Field label is the caps section label; required groups add the Label Small "Pflicht" marker.
- **Error:** thread-red message below with `role="alert"`.

### Navigation
- Fixed bottom bar on surface with a 1px top hairline, three equal text tabs: 24px pictogram over a 12px caps label (0.08em).
- **Rest:** muted. **Active:** thread red, label at 600 with a 1.5px dashed underline in currentColor (the stitch).
- Hidden on form screens.

### Sheets
- **Sheet:** surface, 20px top corners, sheet rise shadow, 20px/16px padding, 16px gaps, Title heading; slides up 24px from 0.6 opacity in 240ms `cubic-bezier(0.16, 1, 0.3, 1)` (reduced motion: none). A modal dialog that traps focus, closes on Escape or a tap on the backdrop, focuses the `data-autofocus` element first and returns focus to its opener.
- **Confirm sheet:** an optional 15px muted message, then stacked actions (8px apart): the confirm (danger solid when destructive, primary otherwise) and a centered text-button cancel.
- **Filter sheet:** the filter groups scroll inside the sheet while a pinned bar stays put below a hairline: an optional "Zurücksetzen" text button and a flex-filling primary "N Teile zeigen" that has first focus.
- **Import sheet:** a backup-versus-current comparison as hairline rows with 600 tabular counts, a muted warning that the current state is replaced, then danger-solid "replace", secondary "back up first", and a text-button cancel that has first focus.

### Toast
- An ink capsule (22px corners) with ground-colored 15px/500 text, 10px/18px padding, centered and fixed 22px above the tab bar, button lift, `role="status"`. Used for "Teil gespeichert" together with the kraft-ringed new tile; one short past-tense line, no actions.

### Notice Line and Quiet Link
- Notice: surface, 1px line border, 12px corners, muted text, 44px close icon button.
- Quiet link: muted 15px with a dashed underline at 4px offset, 44px tall.

### Pictograms
- One stroke system: 24px grid, 1.5px stroke, round caps and joins, `currentColor`, inline SVG. Seasons are drawn as care-label symbols.

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
