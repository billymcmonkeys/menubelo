# Menubelo — Test Plan
> QA: Daniel · Version 1.0 · 2026-04-14

---

## Overview

This document covers the full test strategy for Menubelo: a meal planning and grocery list app. It addresses all four core flows — recipe ingestion, recipe library, weekly planner, and grocery list generation.

**Scope:** functional correctness, edge cases, error paths, and data integrity.  
**Out of scope:** load testing, accessibility audit (tracked separately), browser compatibility matrix.

---

## Testing Pyramid

```
       [E2E / Smoke]     ← Critical happy paths (Playwright)
     [Integration]       ← API contracts, DB writes, parse pipeline
   [Unit Tests]          ← Parser logic, consolidation algorithm, utils
```

---

## 1. Recipe Ingestion — Text Parsing

### 1.1 Happy Path

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-101 | POST `/api/parse` with well-formed recipe text (name, ingredients with quantities and units, servings) | Returns `{ name, servings, ingredients: [{ name, quantity, unit, category }] }` |
| T-102 | Input includes numbered ingredient list ("1. 200g harina") | Each ingredient parsed independently, no merging |
| T-103 | Input includes implicit units ("2 huevos") | `unit` returned as `"unidad"` or `null`; quantity is `2` |
| T-104 | Input with multi-word ingredient names ("aceite de oliva virgen extra") | Full name preserved, not truncated |
| T-105 | Servings stated as "para 4 personas" | `servings: 4` returned |

### 1.2 Parsing Accuracy — Edge Cases

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-111 | Input with fractions ("½ taza de harina") | Parsed as `0.5`, unit `"taza"` |
| T-112 | Input with ranges ("2-3 dientes de ajo") | Uses upper bound OR midpoint, not a string |
| T-113 | Input with mixed languages (Spanish/English) | Ingredients normalized to Spanish names |
| T-114 | Input with approximate quantities ("un puñado de perejil") | Returns quantity as `null` or `1`, unit as `"puñado"` |
| T-115 | Extremely long text (>5000 chars, including blog preamble) | Only recipe content extracted, no crash |
| T-116 | Recipe with no explicit quantity ("Sal y pimienta al gusto") | `quantity: null`, `unit: "al gusto"` |
| T-117 | Ingredient listed twice in input ("Ajo — 2 dientes … Ajo — 1 cabeza") | Two separate rows returned (no auto-merge at parse stage) |

### 1.3 Incomplete / Malformed Data Fallback

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-121 | POST with empty string body | Returns 400 error with message, no crash |
| T-122 | POST with plain paragraph (no ingredient structure) | Parser returns best-effort result or explicit `{ error: "no_recipe_detected" }` |
| T-123 | POST with only a recipe name, no ingredients | Returns `{ name, ingredients: [] }` — user sees empty ingredient list |
| T-124 | POST with ingredients but no recipe name | Name field defaults to `"Receta sin nombre"` or similar |
| T-125 | POST with unrecognized units ("3 bloques de queso") | Unit returned as-is: `"bloques"`; no crash |
| T-126 | Claude API timeout or 5xx during parse | Returns 503 with user-friendly message; nothing saved to DB |
| T-127 | Claude API returns malformed JSON | Parser catches JSON.parse error, returns 502; no crash |

### 1.4 URL Ingestion

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-131 | POST `/api/parse` with valid YouTube URL | Fetches title + description; feeds to parser; returns recipe JSON |
| T-132 | POST with valid TikTok URL | Same as T-131 |
| T-133 | POST with generic recipe website URL | Attempts metadata fetch; returns best-effort parse |
| T-134 | POST with URL that returns 404 | Returns 422 with `"url_not_reachable"` message |
| T-135 | POST with URL that returns non-recipe content (e.g. google.com) | Returns result with empty ingredients OR `"no_recipe_detected"` error |
| T-136 | POST with malformed URL string (not a URL) | Returns 400 validation error |
| T-137 | POST with URL pointing to PDF | Returns error; no crash; no attempt to parse binary |
| T-138 | Neither `text` nor `url` provided in body | Returns 400: "text or url required" |
| T-139 | Both `text` and `url` provided | Uses `text` (or documents which takes precedence); consistent behavior |

### 1.5 Duplicate Recipe Prevention

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-141 | Save recipe with same name as existing recipe | App warns user ("Ya tenés una receta con este nombre") — does not silently overwrite |
| T-142 | Save duplicate recipe, user confirms → saved | Two recipes with same name coexist; both appear in library |
| T-143 | POST same URL twice | Second parse returns fresh result; saving is gated at UI level |
| T-144 | Recipe name differing only by case ("Tortilla" vs "tortilla") | Treated as duplicate (case-insensitive check) |

---

## 2. Recipe Library

| ID | Test case | Expected result |
|----|-----------|-----------------|
| T-201 | GET `/api/recipes` with empty DB | Returns `[]`; UI shows empty state with CTA |
| T-202 | GET `/api/recipes` with 20 recipes | All 20 returned (no accidental pagination cutoff) |
| T-203 | GET `/api/recipes/[id]` with valid ID | Returns recipe with nested ingredients array |
| T-204 | GET `/api/recipes/[id]` with non-existent ID | Returns 404 |
| T-205 | PUT `/api/recipes/[id]` — update recipe name | Name updated; ingredients unchanged |
| T-206 | DELETE `/api/recipes/[id]` | Recipe removed; associated WeekPlanEntries NOT orphaned (cascaded or blocked) |
| T-207 | Search bar with partial name match | Filters visible cards client-side; case insensitive |
| T-208 | Search with no matches | Shows "No se encontraron recetas" empty state |

---

## 3. Ingredient Consolidation — Grocery List

### 3.1 Unit Consolidation

| ID | Test case | Expected result |
|----|-----------|-----------------|
| C-101 | 200g flour (recipe A) + 300g flour (recipe B) | Consolidated: 500g harina |
| C-102 | 1 cup milk + 250ml milk | Converted to common unit, summed: ~490ml leche (or ~2 cups, documented choice) |
| C-103 | 2 tbsp olive oil + 3 tbsp olive oil | 5 tbsp aceite de oliva |
| C-104 | 1 whole onion + 2 diced onions | 3 cebolla (same ingredient, different prep — prep note discarded or preserved) |
| C-105 | 2 eggs + 3 eggs | 5 huevos |
| C-106 | Same ingredient, different unit families (g vs. units: "100g chicken" + "1 chicken breast") | NOT merged — listed as two separate rows |

### 3.2 Rounding

| ID | Test case | Expected result |
|----|-----------|-----------------|
| C-201 | 333g + 166g butter | 499g (not 500 due to float rounding — check for floating point bugs) |
| C-202 | 0.333 cups + 0.667 cups milk | 1 cup (rounded to 2 decimal places max) |
| C-203 | 1.0000000001 kg (float imprecision) | Displayed as "1 kg", not "1.0000000001 kg" |
| C-204 | Summed quantity results in >1000g | Display in kg: "1.2 kg harina" |

### 3.3 Category Grouping

| ID | Test case | Expected result |
|----|-----------|-----------------|
| C-301 | Ingredients span dairy, produce, protein, pantry | Grocery list grouped by category with headers |
| C-302 | Ingredient with no assigned category | Falls into "Otros" category |
| C-303 | Category order on grocery list | Produce → Protein → Dairy → Pantry → Otros (logical shopping flow) |
| C-304 | Single ingredient in a category | Category header still shown |

### 3.4 Edge Cases

| ID | Test case | Expected result |
|----|-----------|-----------------|
| C-401 | Ingredient with quantity 0 | NOT included in grocery list |
| C-402 | Ingredient with `null` quantity | Listed with quantity shown as blank or "al gusto" |
| C-403 | Ingredient with `null` unit | Listed as "2 huevos" (no unit label) |
| C-404 | Week plan with 0 recipes assigned | POST `/api/grocery` returns empty list, not an error |
| C-405 | Same recipe planned multiple days — servings multiplied | 3 days × 200g = 600g correctly summed |
| C-406 | Week plan with 7 different recipes (maximum stress) | All ingredients consolidated correctly across all 7 |

---

## 4. Weekly Planner

| ID | Test case | Expected result |
|----|-----------|-----------------|
| P-101 | Add recipe to Monday slot | GET `/api/planner` returns Monday entry |
| P-102 | Add two recipes to same day | Both appear in the day slot |
| P-103 | Set servings = 0 on a planner entry | Validation error: servings must be ≥ 1 |
| P-104 | Clear a day (DELETE all entries for a day) | Day slot returns empty; grocery list updates accordingly |
| P-105 | Plan a recipe that has since been deleted from library | Planner gracefully handles missing recipe (shows warning, doesn't crash) |
| P-106 | Full week planned (Mon–Sun, all slots filled) | Grocery list generates without timeout or crash |

---

## 5. Grocery List Checklist

| ID | Test case | Expected result |
|----|-----------|-----------------|
| G-101 | Check off an item | Item visually struck through; state persists on reload |
| G-102 | Uncheck a checked item | Item returns to unchecked state |
| G-103 | "Limpiar completados" action | All checked items removed from view; unchecked remain |
| G-104 | Grocery list with all items checked | "Lista completada" feedback state shown |
| G-105 | Re-generate grocery list after planner change | New list reflects updated plan; old checked states cleared |

---

## 6. UI Smoke Tests

| ID | Test case | Expected result |
|----|-----------|-----------------|
| S-101 | Navigate to `/agregar` | Ingestion page loads; tab switcher visible |
| S-102 | Switch between "Texto" and "URL" tabs | Correct input shown; no JS errors |
| S-103 | Submit empty text form | Inline validation error shown; no API call |
| S-104 | Parse succeeds → confirm step | Editable ingredient list shown; "Guardar receta" CTA enabled |
| S-105 | Parse loading state | Spinner/skeleton visible; form inputs disabled |
| S-106 | Navigate to `/recetas` | Library loads; all cards visible |
| S-107 | Navigate to `/planificador` | 7-day grid renders |
| S-108 | Navigate to `/compras` | Grocery list renders or empty state shown |
| S-109 | Mobile viewport (375px) | Nav, forms, cards all usable without horizontal scroll |
| S-110 | Delete recipe — confirm dialog | Confirmation shown before destructive action executes |

---

## 7. Security Checks

| ID | Test case | Expected result |
|----|-----------|-----------------|
| SEC-101 | POST `/api/parse` with `{ text: "<script>alert(1)</script>" }` | Response JSON-encoded; no script execution in UI |
| SEC-102 | PUT `/api/recipes/[id]` with id belonging to a non-existent recipe | 404, no crash |
| SEC-103 | POST `/api/grocery` with tampered weekPlanId | 404 or 403; no data leakage |
| SEC-104 | URL field accepts `javascript:alert(1)` | Rejected at validation; never fetched |

---

## 8. Execution Checklist (Smoke Run)

Before demo, verify all of the following manually:

- [ ] App starts cleanly with `npm run dev` — no console errors on load
- [ ] Add recipe via text (use "Tortilla española" — see demo script)
- [ ] Add recipe via URL (use YouTube link — see demo script)
- [ ] Add recipe via text (use "Ensalada César" — see demo script)
- [ ] All 3 recipes visible in `/recetas`
- [ ] Plan Mon: Tortilla, Wed: Ensalada César, Fri: URL recipe
- [ ] Generate grocery list — 3+ categories present
- [ ] Check off 2 items — persists on reload
- [ ] Mobile viewport looks correct

---

## Defect Priority Matrix

| Severity | Definition | Examples |
|----------|------------|---------|
| **P0 — Blocker** | Demo cannot proceed | App crashes on load, parse always fails, grocery list empty |
| **P1 — Critical** | Core flow broken | Ingredient not saved, planner doesn't persist |
| **P2 — High** | Feature degraded | Wrong quantity consolidation, categories missing |
| **P3 — Medium** | UX issue | Missing empty state, loading state absent |
| **P4 — Low** | Polish | Minor styling inconsistency |

Only P0 and P1 bugs block the demo.
