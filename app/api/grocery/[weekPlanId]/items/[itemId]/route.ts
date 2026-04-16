import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { weekPlanId: string; itemId: string } }) {
  try {
    const itemId = parseInt(params.itemId, 10);
    if (isNaN(itemId)) return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });

    const existing = await db.groceryListItem.findUnique({ where: { id: itemId } });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const body = await req.json();
    const item = await db.groceryListItem.update({
      where: { id: itemId },
      data: {
        ...(body.checked !== undefined && { checked: Boolean(body.checked) }),
        ...(body.totalQuantity !== undefined && { totalQuantity: body.totalQuantity }),
      },
      include: { ingredient: true },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error("[PATCH /api/grocery/[weekPlanId]/items/[itemId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
