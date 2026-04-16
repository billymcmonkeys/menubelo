import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateGroceryList } from "@/lib/grocery";

// GET /api/grocery?weekPlanId=1  — fetch grocery list
export async function GET(request: NextRequest) {
  try {
    const weekPlanId = Number(request.nextUrl.searchParams.get("weekPlanId"));
    if (!weekPlanId || isNaN(weekPlanId)) {
      return NextResponse.json({ error: "weekPlanId is required" }, { status: 400 });
    }

    const items = await db.groceryListItem.findMany({
      where: { weekPlanId },
      include: { ingredient: true },
      orderBy: [{ ingredient: { category: "asc" } }, { ingredient: { name: "asc" } }],
    });
    return NextResponse.json({ weekPlanId, items });
  } catch (err) {
    console.error("[GET /api/grocery]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/grocery  — generate or regenerate grocery list from weekPlanId
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const weekPlanId = Number(body.weekPlanId);
    if (!weekPlanId || isNaN(weekPlanId)) {
      return NextResponse.json({ error: "weekPlanId is required" }, { status: 400 });
    }

    const items = await generateGroceryList(weekPlanId);
    return NextResponse.json({ weekPlanId, items });
  } catch (err) {
    console.error("[POST /api/grocery]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
