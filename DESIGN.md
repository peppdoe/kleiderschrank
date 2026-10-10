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
  title:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "22px"
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
  label:
    fontFamily: "'Jost Variable', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.2em"
rounded:
  weave: "4px"
  base: "12px"
  sheet: "20px"
  tag: "0 10px 10px 0"
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
  care-symbol:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "44px"
  care-symbol-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  care-symbol-on:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.kraft-ink}"
  label-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    typography: "{typography.display}"
    rounded: "{rounded.weave}"
    padding: "18px 22px"
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
  sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: "20px 16px"
---

# Design System: Kleiderschrank

## Overview

**Creative North Star: "Pflegeetikett"**

The wardrobe is sewn like the label inside Lena's clothes. A woven navy name band with an inset dashed stitch greets her by name; seasons are drawn as care-label symbols in a single 1.5px stroke; filters hang as kraft swing tags with a punched hole; one red thread marks what to do next. Everything else steps back so the clothing photos carry the screen.

The ground is a cool porcelain, never cream, with white surfaces and hairline navy-grey lines. Density is calm and single-column (max 720px), built for one hand at the open wardrobe: 44px minimum targets, primary actions in thumb reach, text tab bar at the bottom. Photos are frameless at 3:4 with only a 4px corner. Type is one family, Jost Variable, self-hosted; hierarchy comes from size and from letterspaced caps labels, not from a second face.

The system refuses the iOS-settings grey grid: no pill chips, no emoji tabs, no generic grey list rows.

**Key Characteristics:**
- Navy woven band with an inset dashed stitch as the only branded surface.
- Kraft swing tags (notched left edge, punched hole) for every filter and selectable choice.
- Thread red reserved for the one primary action, the active tab, destructive actions, errors and the focus/caret affordance.
- One 1.5px round-capped stroke system for all pictograms.
- Frameless 3:4 photo tiles; the clothing is the star.
- Full light and dark token sets driven by `prefers-color-scheme`.

## Colors

A cool navy-and-porcelain base, warmed only by kraft paper and pierced by a single thread red.

### Primary
- **Thread Red** (`thread`; dark: `thread-dark`): the sewing thread. Fills the primary button and the round add button, colors the active tab and its stitched underline, destructive text buttons, error text, the 2px focus ring and the text caret. Text on it uses `thread-ink` (white in light, near-black `thread-ink-dark` in dark, because the dark thread is lightened for contrast).
- **Deep Thread** (`danger-solid`; dark: `danger-solid-dark`): the solid confirm button for an irreversible replace (backup import). Darker than thread red in light so the one destructive confirm reads heavier than an ordinary primary action.

### Secondary
- **Kraft** (`kraft`): swing-tag card stock. Active filter tags, selected chips, selected season symbols, text selection highlight. Same value in both themes.
- **Kraft Soft** (`kraft-soft`; dark: `kraft-soft-dark`): resting swing tags and chips, the "+N" overflow cell in outfit previews.
- **Kraft Ink** (`kraft-ink`): text on kraft surfaces.

### Tertiary
- **Woven Navy** (`band`; dark: `band-dark`): the name band background. In light it equals the ink color, so the band reads as the darkest object on the page; in dark it lifts to a brighter navy so it still separates from the ground.
- **Band Ink / Band Stitch** (`band-ink`, `band-stitch`): text and the inset dashed stitch on the band.

### Neutral
- **Porcelain Ground** (`ground`; dark: `ground-dark`): page background, sticky action bar, theme-color meta.
- **Surface** (`surface`; dark: `surface-dark`): tab bar, sheets, inputs, secondary buttons, notice lines.
- **Navy Ink** (`ink`; dark: `ink-dark`): body text, headings, current-season mark, selection outline on tiles, count badges.
- **Muted** (`muted`; dark: `muted-dark`): secondary text, inactive tabs, placeholders, quiet links, notices.
- **Line / Line Strong** (`line`, `line-strong` and dark variants): hairline section dividers and borders; the strong variant outlines secondary buttons and inputs and dashes the empty-photo frame.
- **Chip** (`chip`; dark: `chip-dark`): placeholder fill behind loading photos.
- **Success** (`success`; dark: `success-dark`): confirmation text only.

### Named Rules
**The One Thread Rule.** Thread red appears only on the primary action (primary button, add button), the active tab, destructive actions, error messages, and the focus ring/caret. Never on decoration, headings, icons at rest, or a second button on the same screen.

**The Porcelain Rule.** The ground is cool porcelain (`ground`), never cream or warm off-white. Warmth enters only through kraft.

## Typography

**Display Font:** Jost Variable (self-hosted via `@fontsource-variable/jost`, with Jost, -apple-system, Segoe UI, sans-serif fallback)
**Body Font:** Jost Variable
**Label Font:** Jost Variable in letterspaced caps

**Character:** A geometric sans with a woven-label calm; one family carries everything, with letterspaced caps acting as the embroidered label voice.

### Hierarchy
- **Display** (500, 30px, 1.1, -0.01em): the greeting in the name band and page titles.
- **Headline** (500, 28px): item and outfit detail titles.
- **Title** (500, 22px / 20px): sheet titles (22px) and centered form headers (20px).
- **Body** (400, 17px, 1.45): base size; buttons and text buttons at 500, primary at 600. Outfit and strip names at 500, 16-17px.
- **Body Small** (400, 15px): notices, chips and tags (tags at 500), section meta, action-bar hints. Band meta at 13px.
- **Label** (600, 12px, 0.2em, uppercase): section titles ("HEUTE", "SCHRANK", form groups). Siblings in the same voice: tab labels (12px, 0.08em), care-symbol labels (12px, 0.12em), the "Pflicht" marker (11px, 0.12em).

### Named Rules
**The One Family Rule.** Jost Variable only, self-hosted; no external font host at runtime and no second display face.

**The Caps Are Labels Rule.** Letterspaced caps name a section, a tab or a symbol. They are the heading or the label itself, never a decorative line stacked above another heading.

**The Tabular Count Rule.** Every count (section meta, tag badge, action-bar count, backup compare) uses `font-variant-numeric: tabular-nums`.

## Layout

Single column, max 720px centered, 16px side padding, top padding respecting the safe area plus 12px. Sections are separated by 22px above a section head and 10px below; settings sections use a 1px top hairline with 20px/24px padding. Spacing steps observed: 4, 8, 12, 16, 22px, with 6px and 14px as in-component gaps.

The wardrobe grid is 3 columns at 8px gap (2 columns at 10px for the large variant); outfit previews use 4 columns at 4px. "Heute" scrolls sideways with scroll-snap and 196px strips, bleeding to the screen edge. The tab bar is fixed at 62px plus the bottom safe area and centers its content to 720px on wide screens; the add button tracks the content column's right edge. Forms hide the tab bar and end in a sticky action bar on the ground color. Bottom sheets rise to 86dvh max.

## Elevation & Depth

Mostly flat with hairlines; soft navy-tinted shadows lift only the three objects that physically sit above the page.

### Shadow Vocabulary
- **Band lift** (`box-shadow: 0 6px 18px var(--shadow)`): the woven name band, as if stitched on top.
- **Button lift** (`box-shadow: 0 6px 16px var(--shadow)`): the round add button.
- **Sheet rise** (`box-shadow: 0 -8px 30px var(--shadow)`): bottom sheets, over a `rgba(15, 21, 36, 0.45)` backdrop.

`--shadow` is `rgba(31, 42, 68, 0.22)` in light and `rgba(0, 0, 0, 0.45)` in dark.

### Named Rules
**The Three Lifts Rule.** Only the band, the add button and sheets cast shadows. Cards, tiles, chips and buttons stay flat; inset shadows are used only for focus and the tag hole.

## Shapes

- **Woven corner (4px):** the band, photo tiles, outfit preview cells. Fabric is barely rounded.
- **Base corner (12px):** buttons, inputs, notice lines, full photos, the empty-photo frame.
- **Sheet corner (20px top only).**
- **Swing-tag silhouette:** flat 12px point on the left via `clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)`, 10px rounding on the right, a 7px punched hole at 11px from the left.
- **Circles:** care-symbol marks (44px, 1.5px ink stroke), the add button (60px), icon buttons (44px), selection check (26px), color swatches (16px).
- **Dashes as stitching:** the band's inset 1.5px dashed border, the active tab's 1.5px dashed underline, the quiet link's dashed underline, the empty-photo dashed frame. Dashed lines always mean thread.

## Components

### Name Band (signature)
- Navy band, 4px corners, 18px/22px padding, centered; inset 1.5px dashed stitch 7px from the edge.
- Contents: greeting at Display, a rotating line at 17px (0.92 opacity), date and season meta at 13px (0.78 opacity).
- **Motion, the stitch-in:** whenever the greeting line changes it reveals left to right with `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)`, 900ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 150ms delay. Disabled under `prefers-reduced-motion`. This is the system's one expressive motion moment.

### Buttons
- **Shape:** base corner (12px), 48px minimum height, 10px/20px padding, 17px.
- **Primary:** thread red fill, `thread-ink` text, 600, full width (auto with 140px min in split action bars). One per screen.
- **Secondary:** surface fill, 1px `line-strong` border, ink text, 500.
- **Danger solid:** `danger-solid` fill, only for confirming a destructive replace.
- **Text buttons:** 44px tall, no fill; ink at rest, thread red for delete.
- **Disabled:** 0.4 opacity, with a muted reason line under the action bar.
- **Focus:** 2px thread-red outline at 2px offset (global).

### Add Button
- 60px thread-red circle with the 1.5px plus pictogram, button lift, fixed bottom right 18px above the tab bar.

### Swing Tags and Chips
- Kraft-soft tag stock, kraft-ink 15px text, 44px tall, swing-tag silhouette with punched hole.
- **Selected / active:** kraft fill (chips go to 600). Active filter tags carry a 16px close mark; the "Filter" tag carries a navy count badge (22px, tabular).
- **Focus:** inset 2px thread-red ring (the clip-path would cut an outline).
- Color chips add a 16px swatch circle with a 1px `line-strong` ring.
- Transition: background-color 140ms ease-out.

### Care Symbols (season)
- Four 44px circles with a 1.5px ink stroke and a 1.5px pictogram; 12px caps label below in muted.
- **Current season:** ink fill, ground-colored mark, label in ink at 600.
- **Selected:** kraft fill and border; selected and current adds a 2px inset ink ring.
- Transition: background-color and color 160ms ease-out.

### Photo Tiles
- Frameless 3:4, 4px corners, chip fill while loading.
- **Selected:** 3px inset ink outline and a 26px ink check circle top right.
- Empty photo: 4:3 dashed `line-strong` frame, muted centered text.

### Inputs / Fields
- Surface fill, 1px `line-strong` border, 12px corners, 12px/14px padding, 17px. Placeholder in muted, caret in thread red.
- Field label is the caps section label; required groups add a muted "Pflicht" marker.
- **Error:** thread-red message below with `role="alert"`.

### Navigation
- Fixed bottom bar on surface with a 1px top hairline, three equal text tabs: 24px pictogram over a 12px caps label (0.08em).
- **Rest:** muted. **Active:** thread red, label at 600 with a 1.5px dashed underline in currentColor (the stitch).
- Hidden on form screens.

### Bottom Sheet
- Surface, 20px top corners, sheet rise shadow, 20px/16px padding, slides up 24px from 0.6 opacity in 240ms `cubic-bezier(0.16, 1, 0.3, 1)` (reduced-motion: none). Footer bar separated by a hairline with the primary action filling the row.

### Notice Line and Quiet Link
- Notice: surface, 1px line border, 12px corners, 14px muted text, 44px close icon button.
- Quiet link: muted 15px with a dashed underline at 4px offset, 44px tall.

### Pictograms
- One stroke system: 24px grid, 1.5px stroke, round caps and joins, `currentColor`, inline SVG. Seasons are drawn as care-label symbols.

## Do's and Don'ts

### Do:
- **Do** keep thread red to the primary action, the active tab, destructive actions, errors and the focus ring/caret.
- **Do** use the swing-tag silhouette with its punched hole for every filter value and selectable choice.
- **Do** draw new pictograms on the 24px grid with a 1.5px round-capped stroke.
- **Do** keep photos frameless at 3:4 with 4px corners.
- **Do** keep every interactive target at 44px or more and put the primary action in thumb reach.
- **Do** define every new color in both the light and the dark token set.
- **Do** honor `prefers-reduced-motion` for the stitch-in and the sheet rise.

### Don't:
- **Don't** use pill-shaped chips or a grey settings-style grid; choices are kraft tags.
- **Don't** use emoji or icon fonts for tabs or symbols.
- **Don't** use a cream or warm off-white ground; the ground stays cool porcelain.
- **Don't** add a second primary (thread-red) button to a screen.
- **Don't** load fonts from an external host or add a second typeface.
- **Don't** stack a small caps line above a heading as decoration; caps labels are the heading.
- **Don't** add shadows beyond the band, the add button and sheets.
