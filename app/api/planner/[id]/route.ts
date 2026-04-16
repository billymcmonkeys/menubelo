import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const include = {
  entries: {
    include: { recipe: { select: { id: true, name: true, servings: true } } },
    orderBy: [{ dayOfWeek: "asc" as const }, { mealSlot: "asc" as const }],
  },
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const plan = await db.weekPlan.findUnique({ where: { id }, include });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    return NextResponse.json(plan);
  } catch (err) {
    console.error("[GET /api/planner/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const plan = await db.weekPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const body = await req.json();
    const updated = await db.weekPlan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: String(body.name).trim() }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
      },
      include,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/planner/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const plan = await db.weekPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    await db.weekPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/planner/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
