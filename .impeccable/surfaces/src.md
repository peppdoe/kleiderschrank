---
version: 1
slug: "src"
primary_target: "src"
related_targets: []
---

## Scope

Whole app (all screens of the Kleiderschrank PWA), mode: Operate. Audience: Lena alone, morning at the open wardrobe, one hand on the iPhone. Task: see what to wear today, find a piece fast, add a piece in seconds, never lose work. Constraints: German UI, offline PWA, no external font hosts at runtime (self-hosted), WCAG AA, ≥44pt targets, backup format v1 unchanged.

Critique 2026-10-10 (22/40) priorities folded into this build: filters collapsed behind one tag with visible active tags; install/backup notices quiet and short; tab bar hidden in forms + required category marked + reason under disabled save; bottom action bar in thumb reach and FAB on Outfits; guarded import sheet showing backup vs current counts. New feature: personal greeting with rotating outfit/wardrobe lines and a name set in Einstellungen.

## Direction contract

THESIS: Lena's wardrobe is sewn like the label inside her clothes: a woven name band greets her by name each morning and care symbols carry the seasons. It refuses the iOS-settings grey grid with pill chips and emoji tabs.

OWN-WORLD: Woven navy satin band (#1f2a44) with an inset dashed stitch; cool porcelain ground (#f5f6f8, never cream); kraft swing tags (#c9a27a) with a punched hole mark filters and active state; thread red (#b8322a) owns the one primary action and the active tab; Jost, letterspaced caps for labels; season pictograms drawn as care-label symbols in one 1.5px stroke; photos frameless at 3:4.

STORY: Lena opens the app at the wardrobe, is greeted by her name with a changing line, sees today's season and outfits that fit it, taps one or narrows the wardrobe with a single tag; adding a piece is photo, one category, save.

FIRST VIEWPORT: Top: the navy woven band with the caps label "LENAS KLEIDERSCHRANK", the greeting at display size and the date and season line. Below: four care-symbol season buttons, the current season marked. Then "Heute" with season-matching outfit strips scrolling sideways, then "Schrank · N Teile" with one kraft "Filter" tag and the active tags, then the 3-column 3:4 photo grid. Red round add button bottom right in thumb reach; text tab bar at the bottom, the active label in thread red with a stitched underline.

FORM: Pflegeetikett (woven care and name labels, kraft swing tags), position 1 on the ordered list (IMPECCABLE'S PICK, chosen by the user over the rolled Abholschein); seed key be9caa31. Code-led; chosen sketch: .impeccable/mocks/decision/model-pick.html.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Weather is out of scope (no external services); "today" means the current season by month.
