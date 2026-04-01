import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Clothing from "@/models/Clothing";
import { deleteImage } from "@/lib/cloudinary";

// PUT /api/clothes/[id] — update status, expectedReturnDate, etc.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const clothing = await Clothing.findOne({ _id: id, userId: session.user.id });
  if (!clothing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowedFields = ["name", "category", "color", "status", "expectedReturnDate"];
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clothing as any)[field] = body[field];
    }
  });

  // Clear expectedReturnDate when returning to wardrobe
  if (body.status === "wardrobe") {
    clothing.expectedReturnDate = undefined;
  }

  await clothing.save();
  return NextResponse.json(clothing);
}

// DELETE /api/clothes/[id] — delete item + Cloudinary image
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const clothing = await Clothing.findOne({ _id: id, userId: session.user.id });
  if (!clothing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete image from Cloudinary
  try {
    await deleteImage(clothing.imagePublicId);
  } catch {
    // Proceed even if Cloudinary delete fails
  }

  await clothing.deleteOne();
  return NextResponse.json({ success: true });
}
