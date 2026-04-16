import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const planInclude = {
  entries: {
    include: { recipe: { select: { id: true, name: true, servings: true } } },
    orderBy: [{ dayOfWeek: "asc" as const }, { mealSlot: "asc" as const }],
  },
};

// GET /api/planner  — list all week plans with entries
export async function GET() {
  try {
    const plans = await db.weekPlan.findMany({
      include: planInclude,
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(plans);
  } catch (err) {
    console.error("[GET /api/planner]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/planner  — create a new WeekPlan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const plan = await db.weekPlan.create({
      data: {
        name: name.trim(),
        startDate: startDate ? new Date(startDate) : new Date(),
      },
      include: planInclude,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/planner]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
