# ADR-001: Menubelo — Architecture & Tech Stack

## Context

Menubelo is a web app for meal planning and grocery list generation. Users select recipes for each day of the week and automatically get a consolidated shopping list. The app targets Spanish-speaking users; all UI copy is in Spanish.

Initial scope: single-user (no auth), local data, web-first. The priority is speed to shipping, not distributed scale.

## Decision

**Next.js 14 (App Router) + Tailwind CSS + Prisma ORM + SQLite**

### Why Next.js 14

- App Router gives us server components + route handlers in one framework
- No need for a separate API layer at this scale
- TypeScript first-class, great DX
- We already know it — YAGNI on evaluating alternatives

### Why Tailwind CSS

- Utility-first, no CSS modules overhead
- Ships with create-next-app, zero setup cost
- Fast iteration for UI-heavy features like the week planner

### Why Prisma + SQLite

- SQLite: zero infrastructure, file on disk, sufficient for single-user
- Prisma: type-safe queries, schema-as-code, easy migrations
- Migration path: swap SQLite → Postgres in `schema.prisma` when multi-user is needed

## Alternatives Considered

| Alternative | Why ruled out |
|-------------|--------------|
| Drizzle ORM | Less mature ecosystem, not worth the switch cost |
| PostgreSQL | Overkill for single-user local-first app; adds infra complexity |
| tRPC | Adds abstraction layer we don't need yet (Route Handlers suffice) |
| Supabase | Cloud dependency, latency, cost — wrong fit for local-first |

## Consequences

**Gain:**
- Zero-infra deployment (SQLite file is portable)
- Type-safe DB queries via Prisma client
- Fast iteration: one repo, one process

**Lose:**
- SQLite doesn't support concurrent writes well (not a concern for single-user)
- Prisma migrations require a deploy step when schema changes

---

## Data Model

### Entity Relationship

```
Recipe 1──N RecipeIngredient N──1 Ingredient
WeekPlan 1──N WeekPlanEntry N──1 Recipe
GroceryListItem N──1 WeekPlan
GroceryListItem N──1 Ingredient
```

### Models

#### Recipe
Stores a recipe with metadata. Ingredients are linked via `RecipeIngredient`.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| name | String | Recipe name in Spanish |
| description | String? | Short description |
| servings | Int | Default serving size |
| prepTimeMin | Int? | Prep time in minutes |
| cookTimeMin | Int? | Cook time in minutes |
| imageUrl | String? | Optional image |
| createdAt | DateTime | |
| updatedAt | DateTime | |

#### Ingredient
Canonical ingredient catalog.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| name | String (unique) | Canonical name |
| category | String? | e.g. "lácteos", "verduras" |
| createdAt | DateTime | |

#### RecipeIngredient
Join table: which ingredient, how much, in what unit.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| recipeId | Int (FK) | |
| ingredientId | Int (FK) | |
| quantity | Float | Numeric amount |
| unit | String | e.g. "g", "ml", "unidad", "taza" |
| notes | String? | e.g. "picado fino" |

#### WeekPlan
A named week plan. Can have multiple plans.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| name | String | e.g. "Semana del 14 Abr" |
| startDate | DateTime | Monday of the week |
| createdAt | DateTime | |
| updatedAt | DateTime | |

#### WeekPlanEntry
Maps a recipe to a day + meal slot in a WeekPlan.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| weekPlanId | Int (FK) | |
| recipeId | Int (FK) | |
| dayOfWeek | Int | 0=Mon … 6=Sun |
| mealSlot | String | "desayuno" / "almuerzo" / "merienda" / "cena" |
| servings | Int | Overrides recipe default |

#### GroceryListItem
Consolidated grocery list derived from a WeekPlan.

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK, autoincrement) | |
| weekPlanId | Int (FK) | |
| ingredientId | Int (FK) | |
| totalQuantity | Float | Aggregated across all entries |
| unit | String | Canonical unit |
| checked | Boolean | Default false |
| createdAt | DateTime | |

---

## Folder Structure

```
menubelo/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata
│   ├── page.tsx            # Home — recipe list
│   ├── recetas/
│   │   └── [id]/page.tsx   # Recipe detail
│   ├── planner/
│   │   └── page.tsx        # Week planner
│   ├── compras/
│   │   └── page.tsx        # Grocery list
│   └── api/
│       ├── recipes/route.ts
│       ├── parse/route.ts
│       ├── planner/route.ts
│       └── grocery/route.ts
├── components/
│   ├── ui/                 # Base design system (Button, Card, Badge...)
│   ├── recipe/             # RecipeCard, RecipeGrid, IngredientList
│   ├── planner/            # WeekGrid, MealSlot, DayColumn
│   └── grocery/            # GroceryList, GroceryItem
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── grocery.ts          # Aggregation logic
│   └── utils.ts            # cn(), formatters
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db              # SQLite file (gitignored)
├── data/                   # Static data, fixtures
├── docs/
│   ├── architecture.md     # This file
│   └── api-spec.md
└── public/
    └── images/
```
