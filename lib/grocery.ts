import { db } from "./db";

/**
 * Aggregates ingredients across all WeekPlanEntries for a given WeekPlan
 * and upserts GroceryListItems.
 */
export async function generateGroceryList(weekPlanId: number) {
  const entries = await db.weekPlanEntry.findMany({
    where: { weekPlanId },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      },
    },
  });

  // Aggregate: { ingredientId -> { totalQuantity, unit, ingredientId } }
  // Note: GroceryListItem is unique by (weekPlanId, ingredientId), so if the
  // same ingredient appears with different units across recipes, the first
  // unit wins and quantities are summed. This is a known limitation — mixing
  // units for the same ingredient (e.g. "100g butter" + "1 tbsp butter")
  // produces an inaccurate total. Document this to users via UI if needed.
  const aggregated = new Map<
    number,
    { totalQuantity: number; unit: string; ingredientId: number }
  >();

  for (const entry of entries) {
    // Guard against recipes with servings = 0 (would produce Infinity scale)
    if (!entry.recipe.servings || entry.recipe.servings <= 0) continue;
    const scale = entry.servings / entry.recipe.servings;
    for (const ri of entry.recipe.ingredients) {
      const existing = aggregated.get(ri.ingredientId);
      const scaled = ri.quantity * scale;
      if (existing) {
        existing.totalQuantity += scaled;
      } else {
        aggregated.set(ri.ingredientId, {
          ingredientId: ri.ingredientId,
          totalQuantity: scaled,
          unit: ri.unit,
        });
      }
    }
  }

  // Upsert all items
  const upserts = Array.from(aggregated.values()).map((item) =>
    db.groceryListItem.upsert({
      where: {
        weekPlanId_ingredientId: {
          weekPlanId,
          ingredientId: item.ingredientId,
        },
      },
      update: { totalQuantity: item.totalQuantity, unit: item.unit },
      create: {
        weekPlanId,
        ingredientId: item.ingredientId,
        totalQuantity: item.totalQuantity,
        unit: item.unit,
      },
    })
  );

  await db.$transaction(upserts);

  return db.groceryListItem.findMany({
    where: { weekPlanId },
    include: { ingredient: true },
    orderBy: [{ ingredient: { category: "asc" } }, { ingredient: { name: "asc" } }],
  });
}
