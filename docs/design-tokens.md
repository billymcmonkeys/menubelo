# Menubelo — Design Tokens

> Version 1.0 · Matt (UX Designer) · 2026-04-14

---

## Brand Direction

Menubelo is a meal planning and shopping app. The brand should feel **clean, warm, modern, and premium-friendly** — like a well-designed kitchen: organised, inviting, alive with colour but never noisy.

The palette is grounded in nature: sage greens anchor structure, warm cream holds space, peach adds warmth and delight. Typography is confident but approachable.

---

## 1. Color Tokens

### Base Palette

| Token name | Hex | CSS Variable | Usage |
|---|---|---|---|
| `color-sage-50` | `#F3F7F1` | `--color-sage-50` | Tinted backgrounds, hover fills |
| `color-sage-100` | `#E2EDE0` | `--color-sage-100` | Card backgrounds, section fills |
| `color-sage-200` | `#C5D9C0` | `--color-sage-200` | Borders, dividers, inactive chips |
| `color-sage-300` | `#9DC195` | `--color-sage-300` | Secondary icons, progress bars |
| `color-sage-400` | `#72A568` | `--color-sage-400` | Accent borders, tag backgrounds |
| `color-sage-500` | `#4D8A42` | `--color-sage-500` | **Primary brand green** — CTAs, active nav |
| `color-sage-600` | `#3D7034` | `--color-sage-600` | Primary hover state |
| `color-sage-700` | `#2E5527` | `--color-sage-700` | Dark accents, focused states |
| `color-sage-800` | `#1F3A1B` | `--color-sage-800` | Deep headings on light |
| `color-sage-900` | `#111F0F` | `--color-sage-900` | Maximum contrast text on cream |

| Token name | Hex | CSS Variable | Usage |
|---|---|---|---|
| `color-cream-50` | `#FFFDF7` | `--color-cream-50` | App background (default surface) |
| `color-cream-100` | `#FFF8EC` | `--color-cream-100` | Warm card surface |
| `color-cream-200` | `#FFF0D5` | `--color-cream-200` | Highlighted sections |
| `color-cream-300` | `#FFE5B8` | `--color-cream-300` | Warm fill, skeleton loaders |

| Token name | Hex | CSS Variable | Usage |
|---|---|---|---|
| `color-peach-50` | `#FFF5F0` | `--color-peach-50` | Peach surface tint |
| `color-peach-100` | `#FFE8DC` | `--color-peach-100` | Notification banners, callouts |
| `color-peach-200` | `#FFCDB5` | `--color-peach-200` | Tag backgrounds, badges |
| `color-peach-300` | `#FFAB87` | `--color-peach-300` | Secondary accent, illustration fills |
| `color-peach-400` | `#FF8A57` | `--color-peach-400` | **Accent/CTA secondary** — delight moments |
| `color-peach-500` | `#F06830` | `--color-peach-500` | High-contrast peach, error-adjacent |

| Token name | Hex | CSS Variable | Usage |
|---|---|---|---|
| `color-neutral-0` | `#FFFFFF` | `--color-neutral-0` | Pure white surfaces |
| `color-neutral-100` | `#F5F5F2` | `--color-neutral-100` | Subtle dividers, placeholder bg |
| `color-neutral-300` | `#D1D0CC` | `--color-neutral-300` | Disabled state borders |
| `color-neutral-500` | `#8A8880` | `--color-neutral-500` | Placeholder text, hint labels |
| `color-neutral-700` | `#4A4845` | `--color-neutral-700` | Body text secondary |
| `color-neutral-900` | `#1A1916` | `--color-neutral-900` | Primary text, headings |

### Semantic Tokens

These tokens reference the base palette and carry meaning. Use semantic tokens in component code — never raw hex.

```css
/* Surfaces */
--surface-default:        var(--color-cream-50);
--surface-card:           var(--color-neutral-0);
--surface-card-warm:      var(--color-cream-100);
--surface-overlay:        rgba(26, 25, 22, 0.48);
--surface-sidebar:        var(--color-sage-800);

/* Brand */
--brand-primary:          var(--color-sage-500);
--brand-primary-hover:    var(--color-sage-600);
--brand-primary-subtle:   var(--color-sage-100);
--brand-accent:           var(--color-peach-400);
--brand-accent-subtle:    var(--color-peach-100);

/* Text */
--text-primary:           var(--color-neutral-900);
--text-secondary:         var(--color-neutral-700);
--text-placeholder:       var(--color-neutral-500);
--text-disabled:          var(--color-neutral-300);
--text-on-brand:          var(--color-neutral-0);
--text-on-dark:           var(--color-cream-50);

/* Border */
--border-subtle:          var(--color-neutral-100);
--border-default:         var(--color-neutral-300);
--border-strong:          var(--color-sage-200);
--border-focus:           var(--color-sage-500);

/* Feedback */
--feedback-success-bg:    var(--color-sage-50);
--feedback-success-text:  var(--color-sage-700);
--feedback-success-border:var(--color-sage-200);
--feedback-error-bg:      #FFF0EE;
--feedback-error-text:    #C0392B;
--feedback-error-border:  #F5B7B1;
--feedback-warning-bg:    var(--color-cream-200);
--feedback-warning-text:  #8B5E00;
--feedback-info-bg:       var(--color-peach-50);
--feedback-info-text:     var(--color-peach-500);
```

---

## 2. Typography

### Font Pairing

| Role | Font | Source | Weights |
|---|---|---|---|
| **Display / Headings** | `Fraunces` | Google Fonts | 400, 600, 700 |
| **Body / UI** | `DM Sans` | Google Fonts | 400, 500, 600 |

**Rationale:** Fraunces is an optical-size serif with a warm, premium feel — perfect for recipe names and hero headings. DM Sans is humanist, highly legible at small sizes, and pairs naturally with Fraunces without competing.

```html
<!-- Google Fonts import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale

```css
/* Scale base: 16px (1rem) */

--text-xs:    0.75rem;   /* 12px — labels, badges, metadata */
--text-sm:    0.875rem;  /* 14px — secondary body, captions */
--text-base:  1rem;      /* 16px — primary body text */
--text-lg:    1.125rem;  /* 18px — large body, card titles (sm) */
--text-xl:    1.25rem;   /* 20px — section headings */
--text-2xl:   1.5rem;    /* 24px — page headings */
--text-3xl:   1.875rem;  /* 30px — hero titles */
--text-4xl:   2.25rem;   /* 36px — display headings */

/* Leading */
--leading-tight:    1.2;
--leading-snug:     1.35;
--leading-normal:   1.5;
--leading-relaxed:  1.65;

/* Tracking */
--tracking-tight:   -0.02em;
--tracking-normal:   0em;
--tracking-wide:     0.04em;
--tracking-wider:    0.08em;
--tracking-widest:   0.12em;  /* All-caps labels */
```

### Type Roles

| Role | Font | Size | Weight | Leading |
|---|---|---|---|---|
| `display-1` | Fraunces | 4xl (36px) | 700 | tight (1.2) |
| `display-2` | Fraunces | 3xl (30px) | 600 | tight (1.2) |
| `heading-1` | Fraunces | 2xl (24px) | 600 | snug (1.35) |
| `heading-2` | Fraunces | xl (20px) | 600 | snug (1.35) |
| `heading-3` | DM Sans | lg (18px) | 600 | snug (1.35) |
| `body-lg` | DM Sans | lg (18px) | 400 | relaxed (1.65) |
| `body` | DM Sans | base (16px) | 400 | normal (1.5) |
| `body-sm` | DM Sans | sm (14px) | 400 | normal (1.5) |
| `label` | DM Sans | sm (14px) | 500 | tight |
| `label-xs` | DM Sans | xs (12px) | 500 | tight, wide tracking |
| `caption` | DM Sans | xs (12px) | 400 | normal |

---

## 3. Spacing Scale

Base unit: `4px` (0.25rem).

```css
--space-0:    0;
--space-1:    0.25rem;   /* 4px */
--space-2:    0.5rem;    /* 8px */
--space-3:    0.75rem;   /* 12px */
--space-4:    1rem;      /* 16px */
--space-5:    1.25rem;   /* 20px */
--space-6:    1.5rem;    /* 24px */
--space-8:    2rem;      /* 32px */
--space-10:   2.5rem;    /* 40px */
--space-12:   3rem;      /* 48px */
--space-16:   4rem;      /* 64px */
--space-20:   5rem;      /* 80px */
--space-24:   6rem;      /* 96px */
```

**Usage guidelines:**
- `space-1/2`: icon padding, tight metadata gaps
- `space-3/4`: list item internal padding
- `space-4/5`: card internal padding (default)
- `space-6/8`: section internal padding
- `space-10/12`: section vertical margins
- `space-16+`: page-level structural spacing

---

## 4. Border Radius

```css
--radius-sm:   4px;    /* Chips, tags, badges */
--radius-md:   8px;    /* Buttons, inputs, small cards */
--radius-lg:   12px;   /* Cards, modals (default) */
--radius-xl:   16px;   /* Large cards, bottom sheets */
--radius-2xl:  24px;   /* Hero cards, recipe image containers */
--radius-full: 9999px; /* Pills, avatars, FAB */
```

---

## 5. Shadows

```css
/* Elevation system — 5 levels */

--shadow-sm:
  0 1px 2px rgba(26, 25, 22, 0.06),
  0 0 1px rgba(26, 25, 22, 0.04);

--shadow-md:
  0 2px 6px rgba(26, 25, 22, 0.08),
  0 0 2px rgba(26, 25, 22, 0.04);

--shadow-lg:
  0 4px 16px rgba(26, 25, 22, 0.10),
  0 1px 4px rgba(26, 25, 22, 0.06);

--shadow-xl:
  0 8px 32px rgba(26, 25, 22, 0.12),
  0 2px 8px rgba(26, 25, 22, 0.06);

--shadow-2xl:
  0 16px 48px rgba(26, 25, 22, 0.16),
  0 4px 12px rgba(26, 25, 22, 0.08);

/* Tinted shadow for brand cards */
--shadow-brand:
  0 4px 16px rgba(77, 138, 66, 0.18),
  0 1px 4px rgba(77, 138, 66, 0.10);

/* Inset — used for active/pressed states */
--shadow-inset:
  inset 0 1px 3px rgba(26, 25, 22, 0.10);
```

**Elevation guidelines:**
- `sm`: default card resting
- `md`: interactive card hover
- `lg`: bottom sheet, modal, dropdown
- `xl`: floating action button, popovers
- `2xl`: full-screen overlays (cautious use)

---

## 6. Motion Tokens

```css
/* Duration */
--duration-instant:  50ms;
--duration-fast:    150ms;
--duration-normal:  250ms;
--duration-slow:    400ms;
--duration-slowest: 600ms;

/* Easing */
--ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1.0);   /* Elements entering */
--ease-in:       cubic-bezier(0.4, 0.0, 1.0, 1.0);   /* Elements leaving */
--ease-in-out:   cubic-bezier(0.4, 0.0, 0.2, 1.0);   /* State changes */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1.0); /* Delight moments */
```

---

## 7. Icon System

- **Library:** Lucide React (MIT, consistent stroke style)
- **Default size:** 20px × 20px (UI icons), 24px (navigation), 16px (inline/label)
- **Stroke width:** 1.5px
- **Colour:** Always use semantic text or brand tokens — never hardcoded hex on icons

---

## 8. Tailwind Config Reference

Mapping of token names to Tailwind custom theme keys:

```js
// tailwind.config.ts (summary — expand as needed)
theme: {
  extend: {
    colors: {
      sage: { 50: '#F3F7F1', 100: '#E2EDE0', /* ... */ 500: '#4D8A42', /* ... */ 900: '#111F0F' },
      cream: { 50: '#FFFDF7', 100: '#FFF8EC', 200: '#FFF0D5', 300: '#FFE5B8' },
      peach: { 50: '#FFF5F0', 100: '#FFE8DC', 200: '#FFCDB5', 300: '#FFAB87', 400: '#FF8A57', 500: '#F06830' },
    },
    fontFamily: {
      display: ['Fraunces', 'Georgia', 'serif'],
      body:    ['DM Sans', 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px',
    },
    boxShadow: {
      sm: '0 1px 2px rgba(26,25,22,0.06)', /* ... */
      brand: '0 4px 16px rgba(77,138,66,0.18)',
    },
  }
}
```
