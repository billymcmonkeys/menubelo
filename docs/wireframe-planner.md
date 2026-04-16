# Menubelo — Weekly Planner

> Version 1.0 · Matt (UX Designer) · 2026-04-14

---

## Overview

The Weekly Planner helps users assign meals to days of the week. Planning reduces decision fatigue and unlocks the grocery list generation feature. The UI should feel effortless — not like a spreadsheet.

**Design goals:**
- Visualise the whole week at once (no scrolling to see Mon–Sun)
- Meal slots are obvious drop targets and tap targets
- Quick to fill: "assign" flow from recipe is 2 taps max
- Servings per meal adjustable without friction

**Key design decision — Day-first layout:**
We chose a vertical day-based layout (days as rows, meal slots as columns) over a "weekly view by meal type" because:
1. Users think "what am I eating Monday" not "what's breakfast every day"
2. Easier to handle variable meal counts per day
3. Better for mixed use cases (3 meals vs. 2 meals vs. just dinner)

---

## Navigation Context

```
Bottom Navigation Bar
┌──────────┬──────────┬──────────┬──────────┐
│ Library  │ Planner  │ Grocery  │ Profile  │
│   🏠     │   📅     │   🛒     │   👤     │
│          │ (active) │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

---

## Screen 1 — Planner (populated week)

```
╔═══════════════════════════════════╗
║  This week             Apr 14–20  ║  ← Header: week label + date range
║  ←                            →  ║     arrow navigation prev/next week
╠═══════════════════════════════════╣
║                                   ║
║  Week overview                    ║  ← label-xs, tracking-wider
║  ┌───────────────────────────┐    ║
║  │ M  T  W  T  F  S  S      │    ║  ← 7-dot week strip
║  │ ●  ●  ●  ○  ●  ○  ○      │    ║     ● = has meals, ○ = empty
║  └───────────────────────────┘    ║
║                                   ║
║  ─────────────────────────────── ║
║                                   ║
║  MON  14                          ║  ← Day header: day + date
║  ┌──────────────────────────────┐ ║
║  │ 🌅 Breakfast                 │ ║  ← Meal slot card
║  │   [img]  Pancakes  ·  2 srv  │ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ☀️ Lunch                    │ ║
║  │   [img]  Caesar Salad · 1 srv│ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ 🌙 Dinner                   │ ║
║  │   [img]  Carbonara  ·  4 srv │ ║
║  └──────────────────────────────┘ ║
║  [ + Add a meal ]                 ║  ← Inline add link for extra slots
║                                   ║
║  ─────────────────────────────── ║
║                                   ║
║  TUE  15                          ║
║  ┌──────────────────────────────┐ ║
║  │ 🌙 Dinner                   │ ║
║  │   [img]  Pad Thai   ·  3 srv │ ║
║  └──────────────────────────────┘ ║
║  [ + Add a meal ]                 ║
║                                   ║
║  ─────────────────────────────── ║
║  ...                              ║  ← continues for each day
║                                   ║
║  ════════════════════════════════ ║
║  [ Generate grocery list  🛒 ]    ║  ← Sticky footer CTA
╚═══════════════════════════════════╝
```

**Week overview strip:**
- 7 dots: each represents one day of the week
- Tapping a dot scrolls the view to that day (smooth scroll)
- Active day (today): dot is outlined with `sage-500` ring
- Day with meals: `sage-400` filled dot
- Day without: `neutral-300` unfilled dot

**Day sections:**
- Header: `label-xs`, tracking-wider, `text-secondary`
- Today's section has a subtle left border `sage-500` (4px)
- Sections are collapsible on long-term planning (v1.1)

---

## Meal Slot Card

```
┌──────────────────────────────────────┐
│  🌙  Dinner                          │  ← Meal type icon + label
│                                      │
│  ┌──────┐                            │
│  │ img  │  Spaghetti Carbonara       │  ← Recipe mini-card
│  │      │  20 min · Italian          │
│  └──────┘                            │
│                                      │
│  Servings:  [ − ]  4  [ + ]          │  ← Inline servings stepper
│                                      │
│                          [ × ]       │  ← Remove button (icon only)
└──────────────────────────────────────┘
```

**Token spec:**
- Background: `surface-card`
- Border: `border-subtle`
- Radius: `radius-lg`
- Shadow: `shadow-sm`
- Recipe thumbnail: 48×48px, `radius-md`, `object-fit: cover`
- Servings stepper: compact version (see `ServingsStepper` component)
- Remove (×): `neutral-500`, `16px`, top-right corner

**States:**
- **Default:** as above
- **Pressed:** `surface-card-warm` tint, scale 0.98
- **Drag-in-progress (reorder):** `shadow-xl`, slight rotation (±2°)

---

## Screen 2 — Empty State (no meals planned)

```
╔═══════════════════════════════════╗
║  This week             Apr 14–20  ║
║  ←                            →  ║
╠═══════════════════════════════════╣
║                                   ║
║       [calendar illustration]     ║  ← warm, inviting illustration
║                                   ║
║    Plan your meals for            ║  ← heading-2, Fraunces
║    the week                       ║
║                                   ║
║  Tap any day slot to add a        ║  ← body-sm, text-secondary
║  recipe — then generate your      ║
║  grocery list automatically.      ║
║                                   ║
║  ─────────────────────────────── ║
║  MON  14                          ║
║  ┌──────────────────────────────┐ ║
║  │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │ ║  ← Empty slot (dashed border)
║  │   + Breakfast                 │ ║     label-xs, text-placeholder
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │ ║
║  │   + Lunch                    │ ║
║  └──────────────────────────────┘ ║
║  ...                              ║
╚═══════════════════════════════════╝
```

---

## Screen 3 — Meal Picker (assign recipe to slot)

Opens as a **bottom sheet** when the user taps `+ [Meal]` or taps an empty slot.

```
╔═══════════════════════════════════╗
║                                   ║
║  ╭─────────────────────────────╮  ║
║  │  ════                       │  ║  ← Bottom sheet handle
║  │                             │  ║
║  │  Choose a recipe            │  ║  ← heading-2, Fraunces
║  │  Monday · Breakfast         │  ║  ← body-sm, text-secondary
║  │                             │  ║
║  │  ┌─────────────────────┐    │  ║
║  │  │ 🔍  Search recipes  │    │  ║  ← Search bar
║  │  └─────────────────────┘    │  ║
║  │                             │  ║
║  │  YOUR RECIPES               │  ║  ← label-xs, tracking-wider
║  │  ┌───────────────────────┐  │  ║
║  │  │ [img]  Pancakes       │  │  ║  ← Compact recipe list
║  │  │        15 min · 2 srv │  │  ║
║  │  └───────────────────────┘  │  ║
║  │  ┌───────────────────────┐  │  ║
║  │  │ [img]  Granola Bowl   │  │  ║
║  │  │        5 min · 1 srv  │  │  ║
║  │  └───────────────────────┘  │  ║
║  │  ┌───────────────────────┐  │  ║
║  │  │ [img]  Omelette       │  │  ║
║  │  │        10 min · 1 srv │  │  ║
║  │  └───────────────────────┘  │  ║
║  │                             │  ║
║  │  ─────────────────────────  │  ║
║  │  Servings for this meal:    │  ║  ← Appears after recipe is tapped
║  │  [ − ]  2  [ + ]            │  ║     (step 2 of assignment)
║  │                             │  ║
║  │  ┌─────────────────────┐    │  ║
║  │  │  [ Add to Monday ]  │    │  ║  ← Primary CTA — greyed until
║  │  └─────────────────────┘    │  ║     recipe is selected
║  ╰─────────────────────────────╯  ║
╚═══════════════════════════════════╝
```

**Assignment flow:**
1. User taps empty slot or `+ Meal`
2. Bottom sheet opens — recipe list shown
3. User taps a recipe → recipe highlights, servings stepper appears
4. User adjusts servings (default: recipe's default servings)
5. Taps "Add to [Day]" → bottom sheet dismisses, slot fills with animation

---

## Screen 4 — Slot Actions (long-press on filled meal)

A compact action sheet (not full bottom sheet) at the meal card level.

```
┌──────────────────────────────────────┐
│  🌙 Dinner — Monday                  │
│  ─────────────────────────────────── │
│  [ Change recipe ]                   │
│  [ Adjust servings ]                 │
│  [ Move to another day ]             │
│  [ Remove from plan ]                │  ← destructive, text-error color
└──────────────────────────────────────┘
```

---

## Screen 5 — Weekly Overview (collapsed days mode)

Alternative compact view for users with dense plans — accessible via a toggle icon in the header.

```
╔═══════════════════════════════════╗
║  This week  Apr 14–20  [≡] [▤]   ║  ← Toggle: expanded / compact
╠═══════════════════════════════════╣
║                                   ║
║  MON 14  ●●●                      ║  ← Day name + meal count dots
║  TUE 15  ●○○                      ║     tap to expand a single day
║  WED 16  ●●○                      ║
║  THU 17  ○○○  [+ Plan meals]      ║  ← Inline CTA for empty days
║  FRI 18  ●●●                      ║
║  SAT 19  ○○○                      ║
║  SUN 20  ●○○                      ║
║                                   ║
║  ════════════════════════════════ ║
║  [ Generate grocery list  🛒 ]    ║
╚═══════════════════════════════════╝
```

---

## Servings Stepper — Component Spec

Used throughout the planner. Two sizes:

**Compact (inline in meal slot):**
```
[ − ]   4   [ + ]
```
- Button size: 28×28px, `radius-full`
- Value: `label` weight, `text-primary`
- Min: 1, Max: 20
- Tap `−` at 1: no-op (button fades, no error)

**Full (in meal picker sheet):**
```
┌───────────────────────────────┐
│     [ −  ]    4    [  + ]     │
│   Feeds approximately 4       │
└───────────────────────────────┘
```
- Larger buttons: 40×40px
- Caption below value: "Feeds approximately N"

---

## Generate Grocery List CTA

Sticky at the bottom of the planner view. Communicates progress.

```
[ Generate grocery list  🛒 ]
   3 of 7 days have meals
```

- When 0 meals planned: button disabled, caption "Plan some meals first"
- When ≥1 meal planned: button enabled
- Confirmation step (optional): shows a summary — "This will create a list for 12 meals across 3 days. Continue?"

---

## States Summary

| Screen | States |
|---|---|
| Week view | empty, partially-filled, full, today-highlighted |
| Meal slot | empty, filled, loading, drag-over |
| Meal picker | open, searching, recipe-selected, confirming |
| Servings stepper | default, at-min, at-max |
| Grocery CTA | disabled, enabled, loading |

---

## Components Required

| Component | Variants / Notes |
|---|---|
| `WeekHeader` | with prev/next nav |
| `WeekOverviewStrip` | 7 dots, filled/empty/today states |
| `DaySection` | with today highlight |
| `MealSlotCard` | filled, empty (dashed) |
| `RecipeMiniCard` | thumbnail + title + time |
| `ServingsStepper` | compact, full |
| `MealPickerSheet` | bottom sheet with search + list |
| `RecipePickerListItem` | compact, selected state |
| `MealActionSheet` | long-press context sheet |
| `WeekCompactView` | collapsed day rows |
| `StickyFooterCTA` | with subtitle caption |
| `EmptyPlannerState` | illustration + copy |
