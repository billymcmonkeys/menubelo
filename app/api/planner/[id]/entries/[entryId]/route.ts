import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  try {
    const entryId = parseInt(params.entryId, 10);
    if (isNaN(entryId)) return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });

    const existing = await db.weekPlanEntry.findUnique({ where: { id: entryId } });
    if (!existing) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    const body = await req.json();
    const entry = await db.weekPlanEntry.update({
      where: { id: entryId },
      data: {
        ...(body.servings !== undefined && { servings: body.servings }),
        ...(body.recipeId !== undefined && { recipeId: body.recipeId }),
      },
      include: { recipe: { select: { id: true, name: true, servings: true } } },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error("[PATCH /api/planner/[id]/entries/[entryId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  try {
    const entryId = parseInt(params.entryId, 10);
    if (isNaN(entryId)) return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });

    const existing = await db.weekPlanEntry.findUnique({ where: { id: entryId } });
    if (!existing) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    await db.weekPlanEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/planner/[id]/entries/[entryId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
