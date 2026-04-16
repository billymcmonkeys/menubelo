import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { weekPlanId: string } }) {
  try {
    const weekPlanId = parseInt(params.weekPlanId, 10);
    if (isNaN(weekPlanId)) return NextResponse.json({ error: "Invalid weekPlanId" }, { status: 400 });

    const items = await db.groceryListItem.findMany({
      where: { weekPlanId },
      include: { ingredient: true },
      orderBy: [{ ingredient: { category: "asc" } }, { ingredient: { name: "asc" } }],
    });

    return NextResponse.json({ weekPlanId, items });
  } catch (err) {
    console.error("[GET /api/grocery/[weekPlanId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
