# Menubelo — API Specification

Base URL: `http://localhost:3000/api`

All responses are JSON. Errors follow `{ "error": "message" }`.

---

## /api/recipes

### GET /api/recipes
Returns all recipes with their ingredients.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Filter by name (case-insensitive) |

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Pasta e Fagioli",
    "description": "...",
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 40,
    "imageUrl": null,
    "ingredients": [
      {
        "id": 1,
        "quantity": 200,
        "unit": "g",
        "notes": null,
        "ingredient": { "id": 1, "name": "pasta tubetti", "category": "pasta y cereales" }
      }
    ]
  }
]
```

### POST /api/recipes
Create a new recipe.

**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "servings": 2,
  "prepTimeMin": 10,
  "cookTimeMin": 30,
  "imageUrl": "string",
  "ingredients": [
    { "name": "string", "quantity": 200, "unit": "g", "notes": "string", "category": "string" }
  ]
}
```

**Response 201:** Created recipe object.

---

### GET /api/recipes/:id
Returns a single recipe with full ingredient list.

**Response 200:** Recipe object (same shape as list item).
**Response 404:** `{ "error": "Recipe not found" }`

### PATCH /api/recipes/:id
Update recipe fields. Partial update supported.

### DELETE /api/recipes/:id
Delete recipe and its `RecipeIngredient` rows (cascade).

---

## /api/parse

### POST /api/parse
Parses a free-text ingredient list and returns structured data.
Intended for AI-assisted recipe import (future feature).

**Body:**
```json
{
  "text": "200g pasta tubetti\n400g alubias blancas\n3 dientes de ajo"
}
```

**Response 200:**
```json
{
  "ingredients": [
    { "name": "pasta tubetti", "quantity": 200, "unit": "g", "notes": null },
    { "name": "alubias blancas", "quantity": 400, "unit": "g", "notes": null },
    { "name": "ajo", "quantity": 3, "unit": "dientes", "notes": null }
  ]
}
```

**Notes:**
- v1 implementation: regex-based parser
- v2 plan: Claude API for fuzzy parsing

---

## /api/planner

### GET /api/planner
List all WeekPlans.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Semana del 14 Abr",
    "startDate": "2026-04-14T00:00:00.000Z",
    "entries": [
      {
        "id": 1,
        "dayOfWeek": 0,
        "mealSlot": "almuerzo",
        "servings": 4,
        "recipe": { "id": 1, "name": "Pasta e Fagioli" }
      }
    ]
  }
]
```

### POST /api/planner
Create a new WeekPlan.

**Body:**
```json
{
  "name": "string (required)",
  "startDate": "2026-04-14T00:00:00.000Z"
}
```

**Response 201:** Created WeekPlan.

---

### GET /api/planner/:id
Get a single WeekPlan with all entries.

### PATCH /api/planner/:id
Update WeekPlan name or startDate.

### DELETE /api/planner/:id
Delete WeekPlan and cascade entries + grocery list.

---

### POST /api/planner/:id/entries
Add a recipe to a day/slot.

**Body:**
```json
{
  "recipeId": 1,
  "dayOfWeek": 0,
  "mealSlot": "almuerzo",
  "servings": 2
}
```

**Response 201:** Created WeekPlanEntry.
**Response 409:** Slot already occupied.

### DELETE /api/planner/:id/entries/:entryId
Remove a recipe from a day/slot.

---

## /api/grocery

### GET /api/grocery/:weekPlanId
Returns the consolidated grocery list for a WeekPlan.

**Response 200:**
```json
{
  "weekPlanId": 1,
  "items": [
    {
      "id": 1,
      "totalQuantity": 200,
      "unit": "g",
      "checked": false,
      "ingredient": { "id": 1, "name": "pasta tubetti", "category": "pasta y cereales" }
    }
  ]
}
```

### POST /api/grocery/:weekPlanId/generate
Recomputes the grocery list from current WeekPlan entries (aggregates ingredients, scales by servings).

**Response 200:** Updated grocery list (same shape as GET).

### PATCH /api/grocery/:weekPlanId/items/:itemId
Toggle checked status or update quantity manually.

**Body:**
```json
{ "checked": true }
```

**Response 200:** Updated item.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request — missing or invalid fields |
| 404 | Resource not found |
| 409 | Conflict — e.g. duplicate slot |
| 500 | Internal server error |
