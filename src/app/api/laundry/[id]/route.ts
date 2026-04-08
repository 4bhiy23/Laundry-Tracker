import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import LaundryBag from "@/models/LaundryBag";
import Clothing from "@/models/Clothing";

// GET /api/laundry/[id] — Fetch details of a specific laundry bag
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  const bag = await LaundryBag.findOne({ _id: id, user: session.user.id })
    .populate("clothes")
    .lean();

  if (!bag) {
    return NextResponse.json({ error: "Laundry bag not found" }, { status: 404 });
  }

  return NextResponse.json(bag);
}

// PUT /api/laundry/[id] — Mark laundry bag as returned
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  const bag = await LaundryBag.findOne({ _id: id, user: session.user.id });

  if (!bag) {
    return NextResponse.json({ error: "Laundry bag not found" }, { status: 404 });
  }

  // Update bag
  bag.actualReturnDate = new Date();
  await bag.save(); // triggers pre-save middleware to update status

  // Update all clothes in this bag
  await Clothing.updateMany(
    { _id: { $in: bag.clothes } },
    {
      $set: {
        status: "wardrobe",
        isInLaundry: false,
      },
      $unset: {
        currentLaundryBag: "",
        expectedReturnDate: "",
      },
    }
  );

  const updatedBag = await LaundryBag.findById(id).populate("clothes").lean();

  return NextResponse.json(updatedBag);
}
