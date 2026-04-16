import { NextRequest, NextResponse } from "next/server";
import { generateGroceryList } from "@/lib/grocery";

export async function POST(_req: NextRequest, { params }: { params: { weekPlanId: string } }) {
  try {
    const weekPlanId = parseInt(params.weekPlanId, 10);
    if (isNaN(weekPlanId)) return NextResponse.json({ error: "Invalid weekPlanId" }, { status: 400 });

    const items = await generateGroceryList(weekPlanId);
    return NextResponse.json({ weekPlanId, items });
  } catch (err) {
    console.error("[POST /api/grocery/[weekPlanId]/generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
