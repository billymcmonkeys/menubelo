import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const weekPlanId = parseInt(params.id, 10);
    if (isNaN(weekPlanId)) return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });

    const body = await req.json();
    const { recipeId, dayOfWeek, mealSlot, servings } = body;

    if (recipeId === undefined || dayOfWeek === undefined || !mealSlot) {
      return NextResponse.json({ error: "recipeId, dayOfWeek, and mealSlot are required" }, { status: 400 });
    }

    const plan = await db.weekPlan.findUnique({ where: { id: weekPlanId } });
    if (!plan) return NextResponse.json({ error: "WeekPlan not found" }, { status: 404 });

    const recipe = await db.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    const existing = await db.weekPlanEntry.findUnique({
      where: { weekPlanId_dayOfWeek_mealSlot: { weekPlanId, dayOfWeek, mealSlot } },
    });

    if (existing) {
      const updated = await db.weekPlanEntry.update({
        where: { weekPlanId_dayOfWeek_mealSlot: { weekPlanId, dayOfWeek, mealSlot } },
        data: { recipeId, servings: servings ?? 2 },
        include: { recipe: { select: { id: true, name: true, servings: true } } },
      });
      return NextResponse.json(updated);
    }

    const entry = await db.weekPlanEntry.create({
      data: { weekPlanId, recipeId, dayOfWeek, mealSlot, servings: servings ?? 2 },
      include: { recipe: { select: { id: true, name: true, servings: true } } },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error("[POST /api/planner/[id]/entries]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
