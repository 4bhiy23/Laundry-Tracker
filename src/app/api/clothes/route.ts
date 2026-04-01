import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Clothing from "@/models/Clothing";

// GET /api/clothes — fetch all clothes for the authenticated user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();
  const query: Record<string, unknown> = { userId: session.user.id };
  if (status) query.status = status;

  const clothes = await Clothing.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(clothes);
}

// POST /api/clothes — create a new clothing item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, imageUrl, imagePublicId, category, color } = body;

  if (!name || !imageUrl || !imagePublicId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  const clothing = await Clothing.create({
    userId: session.user.id,
    name,
    imageUrl,
    imagePublicId,
    category: category || "other",
    color,
    status: "wardrobe",
  });

  return NextResponse.json(clothing, { status: 201 });
}
