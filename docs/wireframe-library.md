# Menubelo — Recipe Library

> Version 1.0 · Matt (UX Designer) · 2026-04-14

---

## Overview

The Recipe Library is the **home base** of the app. Users browse, search, and tap into their personal collection of saved recipes. It must feel effortless to scan and encouraging when empty.

**Design goals:**
- Make good recipes feel beautiful (image-forward cards)
- Fast scanning: title, prep time, tags visible at a glance
- Progressive disclosure: detail only on tap
- Empty state that motivates first action, not just informs

---

## Navigation Context

```
Bottom Navigation Bar
┌──────────┬──────────┬──────────┬──────────┐
│ Library  │ Planner  │ Grocery  │ Profile  │
│   🏠     │   📅     │   🛒     │   👤     │
│ (active) │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

Library tab is the default landing screen on first open.

---

## Screen 1 — Recipe Library (populated)

```
╔═══════════════════════════════════╗
║  Good morning, Ana  ⚙             ║  ← Personalised greeting + settings
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ 🔍  Search recipes...       │  ║  ← Search bar (sticky on scroll)
║  └─────────────────────────────┘  ║
║                                   ║
║  ────── Filter chips ──────────── ║
║  [ All ] [ Breakfast ] [ Quick ]  ║
║  [ Vegetarian ] [ Weeknight ]     ║
║                                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║                                   ║
║  ┌────────────┐  ┌────────────┐   ║
║  │ [  image  ]│  │ [  image  ]│   ║  ← Recipe card grid
║  │            │  │            │   ║     2 columns, equal-width
║  │ Carbonara  │  │ Pad Thai   │   ║     card radius-xl
║  │ 20 min  🌿 │  │ 30 min  🌶 │   ║
║  └────────────┘  └────────────┘   ║
║                                   ║
║  ┌────────────┐  ┌────────────┐   ║
║  │ [  image  ]│  │ [  image  ]│   ║
║  │            │  │            │   ║
║  │ Pancakes   │  │ Caesar     │   ║
║  │ 15 min  🥞 │  │ 10 min  🥗 │   ║
║  └────────────┘  └────────────┘   ║
║                                   ║
║                    ╭───────────╮  ║
║                    │    +      │  ║  ← FAB — Add recipe
║                    ╰───────────╯  ║     sage-500, shadow-xl
╚═══════════════════════════════════╝
```

**Scroll behaviour:**
- Search bar becomes sticky at top when user scrolls past greeting
- FAB stays pinned at bottom-right, above nav bar (safe area inset)
- Infinite scroll (or pagination at 40 cards)

**Filter chips:**
- Horizontally scrollable row (no wrap)
- Active chip: `bg-sage-500`, `text-on-brand`
- Inactive chip: `bg-surface-card`, `border-default`, `text-primary`
- Multiple chips can be active simultaneously (AND filter)

---

## Card Anatomy — Recipe Card

```
┌──────────────────────────────┐
│                              │  ← Image container
│                              │     aspect-ratio: 4/3
│        [recipe photo]        │     radius-xl top corners only
│                              │     object-fit: cover
│                              │
│  ┌────────────────────────┐  │  ← Gradient overlay at bottom
│  │ ♡                      │  │     of image (for favourite icon)
└──┴────────────────────────┴──┘
│                              │  ← Card body padding: space-3
│  Spaghetti Carbonara         │  ← heading-3, text-primary
│  20 min  ·  4 servings       │  ← label-xs, text-secondary
│                              │
│  [ 🌿 Pasta ]  [ Italian ]   │  ← Tag chips, max 2 shown
└──────────────────────────────┘
```

**Token spec:**
- Background: `surface-card`
- Radius: `radius-xl` (16px)
- Shadow: `shadow-sm` at rest, `shadow-md` on press
- Image placeholder: `bg-sage-100` + centered recipe emoji
- Favourite icon (♡): top-right of image, white with `shadow-sm`
- Tag chips: `bg-sage-100`, `text-sage-700`, `radius-sm`, `text-xs`

**States:**
- **Default:** `shadow-sm`
- **Pressed:** scale 0.97, `shadow-inset` (100ms, `ease-in-out`)
- **Long-press:** context menu appears (Edit, Add to plan, Delete)
- **No image:** warm placeholder bg with emoji derived from first tag

---

## Screen 2 — Recipe Library (empty state)

Shown when no recipes have been saved yet.

```
╔═══════════════════════════════════╗
║  Good morning, Ana  ⚙             ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ 🔍  Search recipes...       │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║                                   ║
║                                   ║
║          [  bowl illustration  ]  ║  ← Friendly illustration
║                                   ║     sage/cream/peach palette
║     Your recipe collection        ║  ← heading-2, Fraunces
║         starts here               ║
║                                   ║
║  Add recipes from the web,        ║  ← body-sm, text-secondary
║  paste text, or type them in      ║  ← centered
║  — all in one place.              ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │   [ Add your first recipe ] │  ║  ← Primary CTA, full-width
║  └─────────────────────────────┘  ║
║                                   ║
║  ─────────────────────────────── ║
║  🌟  Try: paste a recipe from     ║  ← Soft onboarding nudge
║  your notes app to get started    ║     surface-card-warm, radius-lg
║                                   ║
╚═══════════════════════════════════╝
```

**Empty state after filter (no matches):**
```
║     No recipes match              ║
║     "Breakfast"                   ║
║                                   ║
║  [ Clear filter ]                 ║
```

---

## Screen 3 — Search Active

```
╔═══════════════════════════════════╗
║  ╔═════════════════════════════╗  ║
║  ║ ←  carbonara            ✕  ║  ║  ← Search bar expands full-width
║  ╚═════════════════════════════╝  ║     back arrow replaces greeting
║                                   ║
║  3 results                        ║  ← label-xs, text-secondary
║                                   ║
║  ┌──────────────────────────────┐ ║
║  │ [img]  Spaghetti Carbonara   │ ║  ← List layout in search
║  │        20 min · Italian      │ ║     (not grid — easier to scan)
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ [img]  Carbonara Pizza       │ ║
║  │        35 min · Italian      │ ║
║  └──────────────────────────────┘ ║
╚═══════════════════════════════════╝
```

---

## Screen 4 — Recipe Detail View

```
╔═══════════════════════════════════╗
║  ←                    ♡  ⋯       ║  ← Transparent nav on image
╠═══════════════════════════════════╣
║  ┌─────────────────────────────┐  ║
║  │                             │  ║
║  │      [recipe hero image]    │  ║  ← Full-width, height ~220px
║  │                             │  ║     (or 45vw with min/max)
║  └─────────────────────────────┘  ║
║                                   ║
║  Spaghetti Carbonara              ║  ← display-2, Fraunces
║                                   ║
║  ┌────────┬────────┬────────────┐ ║
║  │ ⏱ 20m │ 🔥 Easy│ 🍽 4 serv  │ ║  ← Quick facts row
║  └────────┴────────┴────────────┘ ║     bg-sage-50, radius-lg
║                                   ║
║  [🌿 Pasta] [Italian] [Weeknight] ║  ← Tag chips
║                                   ║
║  ─────────────────────────────── ║
║                                   ║
║  Servings                         ║  ← label-xs, tracking-wider
║  ┌──────────────────────────────┐ ║
║  │  [ − ]    4    [ + ]         │ ║  ← Servings stepper
║  └──────────────────────────────┘ ║     adjusts quantities below
║                                   ║
║  INGREDIENTS                      ║  ← label-xs, sage-500
║  ┌──────────────────────────────┐ ║
║  │ ○  200g spaghetti            │ ║  ← Checkable ingredient rows
║  │ ○  100g pancetta             │ ║     tap to check off while cooking
║  │ ○  2 large eggs              │ ║
║  │ ○  50g Parmesan              │ ║
║  │ ○  Black pepper              │ ║
║  └──────────────────────────────┘ ║
║                                   ║
║  STEPS                            ║
║  ┌──────────────────────────────┐ ║
║  │ 1  Bring a large pot of      │ ║
║  │    salted water to boil...   │ ║
║  │                              │ ║
║  │ 2  In a bowl, whisk eggs     │ ║
║  │    with grated Parmesan...   │ ║
║  └──────────────────────────────┘ ║
║                                   ║
║  ════════════════════════════════ ║
║  [ Add to this week's plan  ]     ║  ← Sticky footer CTA
╚═══════════════════════════════════╝
```

**Detail view interactions:**
- Servings stepper: all ingredient quantities update in real-time (scaled proportionally)
- Ingredient checkboxes: toggle `checked` state visually (strikethrough + sage-200 tint)
- Checked state is temporary (session only — resets on close)
- "⋯" menu: Edit recipe, Share, Duplicate, Delete
- "♡" favourite: fills heart icon with `peach-400`, saves to collection

**Scroll behaviour:**
- Hero image parallax-scrolls slightly (subtle depth)
- Recipe title and quick facts stick at top after image scrolls out of view (compact header)

---

## States Summary

| Screen | States |
|---|---|
| Library grid | populated, empty, empty-filtered, loading |
| Recipe card | default, pressed, long-press, no-image |
| Search | idle, active, results, no-results |
| Detail | default, cooking-mode (checked ingredients), scrolled |

---

## Components Required

| Component | Variants/Notes |
|---|---|
| `GreetingHeader` | morning/afternoon/evening |
| `SearchBar` | idle, active, filled |
| `FilterChipRow` | scrollable, multi-select |
| `RecipeCard` | with-image, no-image, loading-skeleton |
| `RecipeCardGrid` | 2-col layout |
| `RecipeListItem` | for search results |
| `EmptyLibraryState` | first-time, filter-empty |
| `FAB` | default (add), context-dependent label |
| `RecipeHeroImage` | with parallax |
| `QuickFactsRow` | time, difficulty, servings |
| `TagChip` | default, active |
| `ServingsStepper` | — |
| `IngredientCheckRow` | unchecked, checked |
| `StepBlock` | numbered step |
| `OverflowMenu` | edit, share, duplicate, delete |
| `StickyFooterCTA` | — |
