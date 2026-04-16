# Menubelo — Grocery List

> Version 1.0 · Matt (UX Designer) · 2026-04-14

---

## Overview

The Grocery List is the **payoff screen** — the moment the app saves the user real time at the supermarket. Ingredients from all planned meals are consolidated, deduplicated, and grouped by category. The list is interactive: users check off items as they shop.

**Design goals:**
- Instant readability in a grocery store (high contrast, large touch targets)
- Category grouping reduces physical scanning effort in the store
- Check-off feels satisfying, not clinical
- Easy to edit: add extras, remove items, adjust quantities

---

## Navigation Context

```
Bottom Navigation Bar
┌──────────┬──────────┬──────────┬──────────┐
│ Library  │ Planner  │ Grocery  │ Profile  │
│   🏠     │   📅     │   🛒     │   👤     │
│          │          │ (active) │          │
└──────────┴──────────┴──────────┴──────────┘
```

Badge on Grocery tab icon shows unchecked item count when a list exists.

---

## Screen 1 — Grocery List (active, shopping mode)

```
╔═══════════════════════════════════╗
║  Grocery list          Apr 14–20  ║  ← Header: title + associated week
║                         ⋯  Share ║  ← overflow menu + share button
╠═══════════════════════════════════╣
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │  ████████████░░░░░  14/20   │  ║  ← Progress bar
║  │  14 of 20 items checked     │  ║     sage-500 fill, cream-300 track
║  └─────────────────────────────┘  ║
║                                   ║
║  ─── PRODUCE ─────────────────── ║  ← Category label
║                                   ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Garlic cloves  ·  8      │ ║  ← Grocery item row (unchecked)
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Cherry tomatoes  ·  400g │ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ✓  Lemon  ·  2               │ ║  ← Grocery item row (checked)
║  └──────────────────────────────┘ ║
║                                   ║
║  ─── DAIRY & EGGS ──────────────  ║
║                                   ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Eggs  ·  6               │ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Parmesan  ·  150g        │ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ✓  Butter  ·  100g           │ ║
║  └──────────────────────────────┘ ║
║                                   ║
║  ─── PANTRY ─────────────────── ║
║                                   ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Spaghetti  ·  400g       │ ║
║  └──────────────────────────────┘ ║
║  ┌──────────────────────────────┐ ║
║  │ ○  Olive oil  ·  as needed  │ ║
║  └──────────────────────────────┘ ║
║                                   ║
║  ─── MEAT & FISH ──────────────  ║
║  ─── BAKERY ────────────────────  ║
║  ─── OTHER ─────────────────────  ║
║                                   ║
║  ┌──────────────────────────────┐ ║
║  │  + Add item manually         │ ║  ← Inline add at bottom of list
║  └──────────────────────────────┘ ║
║                                   ║
╚═══════════════════════════════════╝
```

---

## Grocery Item Row — Anatomy

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ○   Garlic cloves             ·    8    ✎  ×  │
│                                                 │
└─────────────────────────────────────────────────┘

  ①          ②                       ③   ④  ⑤
```

| # | Element | Notes |
|---|---|---|
| ① | Checkbox circle | 24×24px, `radius-full`, `border-default` |
| ② | Item name | `body` weight 400, `text-primary` |
| ③ | Quantity | `body-sm`, `text-secondary`, dot separator |
| ④ | Edit icon | `neutral-500`, 16px, visible on hover/swipe |
| ⑤ | Remove icon | `neutral-400`, 16px, visible on hover/swipe |

**Touch target:** Full row is tappable (min 48px height). Tap anywhere on row toggles check state.

---

## Checked vs Unchecked States

```
Unchecked:
┌──────────────────────────────────────┐
│  ○   Garlic cloves          ·  8    │  bg: surface-card
│                                      │  text: text-primary
└──────────────────────────────────────┘

Checked:
┌──────────────────────────────────────┐
│  ✓   ~~Garlic cloves~~      ·  8    │  bg: sage-50
│                                      │  text: text-placeholder (strikethrough)
└──────────────────────────────────────┘  checkmark: sage-500
```

**Check animation:**
1. Tap row → circle fills with `sage-500` (150ms, `ease-out`)
2. Checkmark icon draws in (100ms stroke animation)
3. Text fades to `text-placeholder` + strikethrough (200ms)
4. Row slides subtly to "checked" visual weight

**Uncheck:** reverse animation at 80% speed.

---

## Category Labels

Categories are rendered as sticky section headers within the scroll.

```
─── PRODUCE ─────────────────────────────
```

**Spec:**
- Font: `label-xs`, `tracking-widest` (0.12em), `DM Sans` 500
- Color: `text-secondary` (`neutral-700`)
- Line: 1px `border-subtle` through a flex row
- Sticky: sticks at top of viewport as user scrolls through that section
- Collapsed state (all items checked): header shows `✓` indicator and collapses items

**Default category order:**
1. Produce
2. Dairy & Eggs
3. Meat & Fish
4. Seafood
5. Bakery & Bread
6. Pantry & Dry Goods
7. Frozen
8. Beverages
9. Snacks
10. Other

Categories with 0 items are hidden automatically.

---

## Screen 2 — Empty State (no plan exists)

```
╔═══════════════════════════════════╗
║  Grocery list                     ║
╠═══════════════════════════════════╣
║                                   ║
║         [shopping bag icon]       ║
║                                   ║
║    Your list will appear          ║  ← heading-2, Fraunces
║    once you plan meals            ║
║                                   ║
║  Head to the Planner, add some    ║  ← body-sm, text-secondary
║  meals for the week, then come    ║
║  back here to shop.               ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │  [ Go to Planner  📅 ]      │  ║  ← Primary CTA
║  └─────────────────────────────┘  ║
║                                   ║
║  ─────────────────────────────── ║
║  Or add items manually:           ║  ← body-sm, text-secondary
║  ┌─────────────────────────────┐  ║
║  │  + Start a manual list      │  ║  ← Ghost button / secondary CTA
║  └─────────────────────────────┘  ║
╚═══════════════════════════════════╝
```

---

## Screen 3 — All Items Checked (done shopping)

```
╔═══════════════════════════════════╗
║  Grocery list          Apr 14–20  ║
╠═══════════════════════════════════╣
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │  ████████████████  20/20   │  ║  ← Full progress bar (peach-400)
║  └─────────────────────────────┘  ║
║                                   ║
║         🎉                        ║  ← Peach-tinted confetti
║                                   ║
║    All done! You've got           ║  ← heading-2, Fraunces
║    everything.                    ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │  [ Back to Planner ]        │  ║
║  └─────────────────────────────┘  ║
║  ┌─────────────────────────────┐  ║
║  │  [ Clear checked items ]    │  ║  ← Secondary, destructive-light
║  └─────────────────────────────┘  ║
║                                   ║
╚═══════════════════════════════════╝
```

---

## Screen 4 — Edit Item (inline edit)

Tapping the edit icon (✎) on an item opens a minimal sheet:

```
╔═══════════════════════════════════╗
║                                   ║
║  ╭─────────────────────────────╮  ║
║  │  ════                       │  ║
║  │                             │  ║
║  │  Edit item                  │  ║
║  │                             │  ║
║  │  Name                       │  ║
║  │  ┌─────────────────────┐    │  ║
║  │  │ Garlic cloves       │    │  ║
║  │  └─────────────────────┘    │  ║
║  │                             │  ║
║  │  Quantity                   │  ║
║  │  ┌─────────────────────┐    │  ║
║  │  │ 8                   │    │  ║
║  │  └─────────────────────┘    │  ║
║  │                             │  ║
║  │  Unit (optional)            │  ║
║  │  ┌─────────────────────┐    │  ║
║  │  │ cloves         ▼    │    │  ║  ← Dropdown: cloves, g, kg,
║  │  └─────────────────────┘    │  ║     ml, l, cups, pcs, tbsp...
║  │                             │  ║
║  │  [ Save ]   [ Cancel ]      │  ║
║  ╰─────────────────────────────╯  ║
╚═══════════════════════════════════╝
```

---

## Screen 5 — Add Item Manually

Tapping `+ Add item manually` opens a similar but creation-oriented sheet:

```
╭─────────────────────────────╮
│  ════                       │
│                             │
│  Add item                   │
│                             │
│  ┌─────────────────────┐    │
│  │ Item name...        │    │  ← Autofocus on open
│  └─────────────────────┘    │
│                             │
│  Quantity (optional)        │
│  ┌──────────┐ ┌─────────┐   │
│  │ 2        │ │ cups ▼  │   │
│  └──────────┘ └─────────┘   │
│                             │
│  Category (optional)        │
│  ┌─────────────────────┐    │
│  │ Produce          ▼  │    │
│  └─────────────────────┘    │
│                             │
│  [ Add item ]               │
╰─────────────────────────────╯
```

---

## Overflow Menu (⋯)

```
┌────────────────────────────────┐
│  Share list                    │  ← Share as text / image
│  Regenerate from plan          │  ← Re-sync with planner
│  Clear checked items           │
│  Clear all items               │  ← destructive
└────────────────────────────────┘
```

---

## Share Feature

Tapping "Share list" generates a plain-text or image version:

```
🛒 Menubelo — Grocery List
Week of Apr 14–20

PRODUCE
□ Garlic cloves · 8
□ Cherry tomatoes · 400g

DAIRY & EGGS
□ Eggs · 6
□ Parmesan · 150g
...
```

Shared via native share sheet (iOS/Android) or clipboard copy on web.

---

## Full Component Spec

### `GroceryHeader`

```ts
interface GroceryHeaderProps {
  weekLabel: string;       // e.g. "Apr 14–20"
  onOverflowPress: () => void;
  onSharePress: () => void;
}
```

### `ProgressBar`

```ts
interface ProgressBarProps {
  total: number;           // total items in list
  checked: number;         // number of checked items
  variant?: 'default' | 'complete';  // default: sage-500, complete: peach-400
}
```

### `CategorySection`

```ts
interface CategorySectionProps {
  label: string;           // e.g. "PRODUCE"
  items: GroceryItem[];
  isSticky?: boolean;      // default true
  collapsedWhenAllChecked?: boolean; // default true
}
```

### `GroceryItemRow`

```ts
interface GroceryItemRowProps {
  id: string;
  name: string;
  quantity?: string | number;
  unit?: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  sourceRecipes?: string[];  // recipe names that contributed this item
}
```

States: `unchecked` | `checked` | `editing` | `swiped`

### `AddItemInlineRow`

```ts
interface AddItemInlineRowProps {
  onPress: () => void;
  label?: string;  // default: "+ Add item"
}
```

### `EditItemSheet`

```ts
interface EditItemSheetProps {
  item: GroceryItem | null;  // null = create mode
  isOpen: boolean;
  onSave: (item: GroceryItem) => void;
  onClose: () => void;
  units: string[];  // ['g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pcs', 'cloves', ...]
  categories: string[];
}
```

### `GroceryListEmpty`

```ts
interface GroceryListEmptyProps {
  hasPlan: boolean;          // if false: show "go to planner" CTA
  onGoToPlanner: () => void;
  onStartManual: () => void;
}
```

### `AllCheckedState`

```ts
interface AllCheckedStateProps {
  onGoToPlanner: () => void;
  onClearChecked: () => void;
}
```

### `OverflowMenu` (grocery context)

```ts
interface GroceryOverflowMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}
```

### `CategoryLabel`

```ts
interface CategoryLabelProps {
  label: string;
  itemCount: number;
  checkedCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
```

### `ShareListModal`

```ts
interface ShareListModalProps {
  isOpen: boolean;
  listText: string;      // pre-formatted plain text
  onCopy: () => void;
  onNativeShare: () => void;
  onClose: () => void;
}
```

---

## States Summary

| Component | States |
|---|---|
| `GroceryItemRow` | unchecked, checked, editing, swipe-revealed |
| `CategorySection` | has-unchecked, all-checked (collapsed), empty (hidden) |
| `ProgressBar` | 0%, partial, 100% (variant change) |
| Screen | empty (no plan), active (shopping), all-checked (done) |
| `EditItemSheet` | create-mode, edit-mode |

---

## Accessibility Notes

- Checkbox rows have `role="checkbox"` and `aria-checked`
- Category headers are `role="heading"` `aria-level="2"`
- Progress bar has `role="progressbar"` with `aria-valuenow` / `aria-valuemax`
- Checked items remain in the list (not removed) — preserves orientation while shopping
- Minimum row height 48px ensures touch target compliance
- Swipe actions (edit/remove) also accessible via long-press context menu
- Color + icon both indicate checked state (never color alone)
- "All done" state announced via `aria-live="assertive"` when last item checked
