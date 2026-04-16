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

async function buildIngredientCreate(ingredients: IngredientInput[]) {
  return Promise.all(
    ingredients.map(async (ing) => {
      const ingredient = await db.ingredient.upsert({
        where: { name: ing.name.trim().toLowerCase() },
        update: {},
        create: { name: ing.name.trim().toLowerCase(), category: ing.category ?? "otros" },
      });
      return { ingredientId: ingredient.id, quantity: ing.quantity, unit: ing.unit, notes: ing.notes ?? null };
    })
  );
}

// GET /api/recipes?q=
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    const recipes = await db.recipe.findMany({
      where: q ? { name: { contains: q } } : undefined,
      include: recipeInclude,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(recipes);
  } catch (err) {
    console.error("[GET /api/recipes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recipes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, servings, prepTimeMin, cookTimeMin, imageUrl, ingredients } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const recipe = await db.recipe.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        servings: servings ?? 2,
        prepTimeMin: prepTimeMin ?? null,
        cookTimeMin: cookTimeMin ?? null,
        imageUrl: imageUrl ?? null,
        ingredients: ingredients?.length
          ? { create: await buildIngredientCreate(ingredients) }
          : undefined,
      },
      include: recipeInclude,
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error("[POST /api/recipes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
