import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type IngredientInput = {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  category?: string;
};

const recipeInclude = {
  ingredients: { include: { ingredient: true } },
};

// GET /api/recipes/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const recipe = await db.recipe.findUnique({ where: { id }, include: recipeInclude });
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    return NextResponse.json(recipe);
  } catch (err) {
    console.error("[GET /api/recipes/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/recipes/[id]  (partial update; replaces ingredients if provided)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const existing = await db.recipe.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    const body = await req.json();
    const { name, description, servings, prepTimeMin, cookTimeMin, imageUrl, ingredients } = body;

    // Replace ingredients: delete old RecipeIngredient rows, create new ones
    let ingredientsUpdate = {};
    if (Array.isArray(ingredients)) {
      const created = await Promise.all(
        (ingredients as IngredientInput[]).map(async (ing) => {
          const ingredient = await db.ingredient.upsert({
            where: { name: ing.name.trim().toLowerCase() },
            update: {},
            create: { name: ing.name.trim().toLowerCase(), category: ing.category ?? "otros" },
          });
          return { ingredientId: ingredient.id, quantity: ing.quantity, unit: ing.unit, notes: ing.notes ?? null };
        })
      );
      ingredientsUpdate = {
        ingredients: {
          deleteMany: {},
          create: created,
        },
      };
    }

    const recipe = await db.recipe.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description }),
        ...(servings !== undefined && { servings }),
        ...(prepTimeMin !== undefined && { prepTimeMin }),
        ...(cookTimeMin !== undefined && { cookTimeMin }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...ingredientsUpdate,
      },
      include: recipeInclude,
    });

    return NextResponse.json(recipe);
  } catch (err) {
    console.error("[PATCH /api/recipes/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/recipes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const existing = await db.recipe.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    await db.recipe.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/recipes/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
