# Menubelo — Recipe Ingestion Flow

> Version 1.0 · Matt (UX Designer) · 2026-04-14

---

## Overview

The ingestion flow is the **primary entry point** to the recipe library. Users add recipes in one of two ways: pasting raw text, or submitting a URL. In both cases the AI parses the content and returns a structured recipe for the user to review and confirm before saving.

**Core principles for this flow:**
- Reduce cognitive load at entry — one clear action at a time
- Never lose user's data — preserve input during parsing
- Give honest, friendly feedback during AI processing
- Let users fix AI mistakes before saving — trust through control

---

## Flow Map

```
[Home / Library]
       |
  [ + Add Recipe ]  (FAB or header button)
       |
       v
┌──────────────────────────────┐
│      INGESTION ENTRY         │
│  "How would you like to      │
│   add this recipe?"          │
│                              │
│  [ Paste text ]  [ From URL ]│
└──────────────────────────────┘
       |                |
       v                v
  [TEXT INPUT]      [URL INPUT]
       |                |
       └────────┬───────┘
                |
                v
         [AI PARSING]
         Loading state
                |
           ┌────┴────┐
           |         |
          OK        Error
           |         |
           v         v
    [EDIT/CONFIRM]  [Error state
     step           + retry]
           |
           v
    [Recipe saved]
    → Library view
```

---

## Screen 1 — Ingestion Entry (method chooser)

This screen appears as a **bottom sheet** on mobile (slides up from bottom), or a **centered modal** on tablet/desktop.

```
╔═══════════════════════════════════╗
║                                   ║
║   ╭─────────────────────────╮     ║
║   │  ════════               │     ║
║   │  Add a recipe           │  ← Fraunces heading-1
║   │                         │
║   │  How do you want to     │  ← DM Sans body-sm, text-secondary
║   │  add it?                │
║   │                         │
║   │  ┌───────────────────┐  │
║   │  │  📋  Paste text   │  │  ← Option card, tappable
║   │  │  From a recipe    │  │
║   │  │  you copied       │  │
║   │  └───────────────────┘  │
║   │                         │
║   │  ┌───────────────────┐  │
║   │  │  🔗  From a URL   │  │  ← Option card, tappable
║   │  │  Paste a link     │  │
║   │  │  from the web     │  │
║   │  └───────────────────┘  │
║   │                         │
║   │  ──────────────────     │
║   │  [ Cancel ]             │  ← Text button, text-secondary
║   ╰─────────────────────────╯
║                                   ║
╚═══════════════════════════════════╝
```

**Component notes:**
- Bottom sheet handle (`────────`) is always visible and draggable to dismiss
- Option cards: `bg-surface-card`, `border-default`, `radius-lg`, `shadow-sm`
- Icon left + title (label weight) + subtitle (caption)
- On tap: short haptic feedback + transition to next screen

---

## Screen 2A — Text Input

```
╔═══════════════════════════════════╗
║  ←   Add recipe                   ║  ← Nav bar, back arrow
╠═══════════════════════════════════╣
║                                   ║
║  Paste your recipe                ║  ← heading-2, Fraunces
║  Copy any recipe text and paste   ║  ← body-sm, text-secondary
║  it here — we'll do the rest.     ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │                             │  ║
║  │  Ingredients, steps,        │  ║  ← Textarea
║  │  quantities... just paste   │  ║     min-height: 200px
║  │  everything as-is.          │  ║     placeholder text
║  │                             │  ║
║  │                             │  ║
║  │                      0/...  │  ║  ← Character count (optional)
║  └─────────────────────────────┘  ║
║                                   ║
║  ════════════════════════════════ ║
║  [ Parse with AI  →  ]            ║  ← Primary button, full-width
║                                   ║
╚═══════════════════════════════════╝
```

**States:**
- **Empty:** placeholder text visible, CTA disabled (greyed)
- **Has content:** CTA enabled, character count shown
- **Pasted:** brief flash of `surface-card-warm` background to confirm paste

**Validation:**
- Minimum ~50 chars before enabling CTA (soft threshold — no harsh error)
- If too short: inline hint below textarea, not a blocking error

---

## Screen 2B — URL Input

```
╔═══════════════════════════════════╗
║  ←   Add recipe                   ║
╠═══════════════════════════════════╣
║                                   ║
║  Add from URL                     ║  ← heading-2, Fraunces
║  Paste the link to any recipe     ║  ← body-sm, text-secondary
║  page and we'll extract it.       ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ 🔗  https://...             │  ║  ← URL input field
║  └─────────────────────────────┘  ║
║                                   ║
║  ┌─────────────────────────────┐  ║  ← URL preview card
║  │  ┌────┐                     │  ║     (appears after valid URL)
║  │  │img │  Recipe title       │  ║
║  │  │    │  site.com           │  ║
║  │  └────┘                     │  ║
║  └─────────────────────────────┘  ║
║         (hidden until URL valid)  ║
║                                   ║
║  Popular sources:                 ║  ← label-xs, tracking-wider
║  ┌────────┐  ┌────────┐  ┌────┐  ║
║  │ NYT    │  │Serious │  │BBC │  ║  ← Source chips (tappable)
║  │Cooking │  │ Eats   │  │Food│  ║
║  └────────┘  └────────┘  └────┘  ║
║                                   ║
║  ════════════════════════════════ ║
║  [ Import recipe  →  ]            ║
║                                   ║
╚═══════════════════════════════════╝
```

**States:**
- **Empty:** source chips visible as discoverability helpers
- **Typing:** chips fade out, URL preview hidden
- **Valid URL pasted:** preview card animates in (thumbnail + title + domain)
- **Invalid URL:** inline error below input: `"That doesn't look like a recipe URL — try copying it again"`
- **CTA:** enabled once URL is valid (not just non-empty)

---

## Screen 3 — AI Parsing / Loading State

This is a **full-screen loading experience** — not a spinner modal. The user must feel that something meaningful is happening.

```
╔═══════════════════════════════════╗
║                                   ║
║                                   ║
║            ┌─────────┐           ║
║            │         │           ║
║            │  ~~~~   │           ║  ← Animated illustration
║            │  ~ AI ~ │           ║     (Lottie or CSS keyframes)
║            │  ~~~~   │           ║     Soft pulse in sage green
║            └─────────┘           ║
║                                   ║
║      Reading your recipe...       ║  ← body-lg, text-primary
║                                   ║
║   ●────────────────────── ○       ║  ← Progress steps (animated)
║  Parsing     Structuring  Done    ║  ← label-xs, step labels
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ ✦  Found 6 ingredients      │  ║  ← Discovery chips
║  │ ✦  Detected prep time       │  ║     appear one by one
║  │ ✦  4 cooking steps          │  ║     as parsing progresses
║  └─────────────────────────────┘  ║
║                                   ║
║  ─────────────────────────────── ║
║  [ Cancel ]                       ║  ← Text button — always visible
║                                   ║
╚═══════════════════════════════════╝
```

**Animation timing:**
- Step indicator advances at ~1.5s intervals (simulated progress)
- Discovery chips fade in sequentially: 0.8s, 1.8s, 3.0s
- Total expected duration: 3–6s (real AI time)
- If > 8s: show "Taking a bit longer than usual..." below the illustration

**Accessibility:**
- `aria-live="polite"` on the status text region
- Progress bar has `role="progressbar"` with `aria-valuenow` updating
- Cancel button always focusable

---

## Screen 4A — Edit / Confirm (successful parse)

The AI has returned a structured recipe. The user reviews each section, can edit inline, then saves.

```
╔═══════════════════════════════════╗
║  ←   Review recipe                ║
╠═══════════════════════════════════╣
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │                             │  ║
║  │   [  Recipe image  ]        │  ║  ← Image if found, else
║  │   (tap to change / add)     │  ║     a placeholder with +icon
║  │                             │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ Title                       │  ║  ← Editable field (tap to edit)
║  │ Spaghetti Carbonara    ✎    │  ║     pencil icon shows on hover/tap
║  └─────────────────────────────┘  ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ ⏱ 20 min    🍽 4 servings   │  ║  ← Quick facts row
║  │              (tap to edit)  │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║  INGREDIENTS                      ║  ← label-xs, tracking-wider, sage-500
║  ┌─────────────────────────────┐  ║
║  │ • 200g spaghetti        ✎  │  ║
║  │ • 100g pancetta         ✎  │  ║
║  │ • 2 eggs                ✎  │  ║
║  │ • Parmesan cheese       ✎  │  ║
║  │ + Add ingredient            │  ║  ← Inline add, dashed border
║  └─────────────────────────────┘  ║
║                                   ║
║  STEPS                            ║
║  ┌─────────────────────────────┐  ║
║  │ 1. Boil salted water...  ✎  │  ║
║  │ 2. Fry pancetta...       ✎  │  ║
║  │ + Add step                  │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║  ════════════════════════════════ ║
║  [ Save recipe ]                  ║  ← Primary CTA
║  [ Discard ]                      ║  ← Ghost/text button
║                                   ║
╚═══════════════════════════════════╝
```

**Inline editing behaviour:**
- Tap any field → expands to text input with soft keyboard
- On blur → saves change in local state
- Changes are highlighted with a subtle `surface-card-warm` tint for 1s
- Drag handles (≡) on ingredient/step rows to reorder

**Confidence indicators (optional v1.1):**
- Fields the AI is less sure about show a `~` prefix or a soft amber underline
- Tooltip: "We're not 100% sure about this — please double-check"

---

## Screen 4B — Error State (parse failed)

```
╔═══════════════════════════════════╗
║  ←   Add recipe                   ║
╠═══════════════════════════════════╣
║                                   ║
║                                   ║
║         [  sad plate icon  ]       ║
║                                   ║
║      We couldn't read that        ║  ← heading-2, Fraunces
║                                   ║
║   The recipe didn't come through  ║  ← body-sm, text-secondary
║   clearly. This can happen with   ║
║   paywalled or unusual sites.     ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ [ Try a different URL  ]    │  ║  ← Primary button
║  └─────────────────────────────┘  ║
║  ┌─────────────────────────────┐  ║
║  │ [ Paste the text instead ]  │  ║  ← Secondary button
║  └─────────────────────────────┘  ║
║                                   ║
║  ─────────────────────────────── ║
║  [ Cancel ]                       ║
║                                   ║
╚═══════════════════════════════════╝
```

**Error variants:**
| Scenario | Message |
|---|---|
| Network error | "Check your connection and try again" |
| Paywall / login required | "This site requires a login — try pasting the text directly" |
| URL not a recipe | "This doesn't look like a recipe page" |
| Timeout | "Taking too long — try again or paste the text" |
| Partial parse | Show what was found, flag missing fields in edit step |

---

## Components Required for This Flow

| Component | Variants |
|---|---|
| `BottomSheet` | default, fullscreen |
| `OptionCard` | default, pressed |
| `TextareaField` | default, filled, error, disabled |
| `UrlInputField` | default, valid, invalid, loading |
| `UrlPreviewCard` | loading-skeleton, loaded |
| `SourceChip` | default, pressed |
| `LoadingIllustration` | — |
| `StepIndicator` | 3 steps |
| `DiscoveryChip` | idle, appearing |
| `ImagePlaceholder` | empty, with-image |
| `EditableField` | display, editing |
| `IngredientRow` | display, editing, dragging |
| `StepRow` | display, editing, dragging |
| `ErrorIllustration` | — |
| `PrimaryButton` | default, disabled, loading |
| `SecondaryButton` | default |
| `TextButton` | default |

---

## Accessibility Notes

- All form fields have visible labels (not just placeholders)
- Error messages are associated with their field via `aria-describedby`
- Loading screen has descriptive `aria-label` on the animated element
- Minimum touch target: 44×44px
- Color is never the sole conveyor of state (icons + text accompany color changes)
- Back navigation always available (no trapping)
