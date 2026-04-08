import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import LaundryBag from "@/models/LaundryBag";
import Clothing from "@/models/Clothing";
import User from "@/models/User";

// GET /api/laundry — Fetch all laundry bags for the authenticated user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const bags = await LaundryBag.find({ user: session.user.id })
    .sort({ takenDate: -1 })
    .populate("clothes")
    .lean();
    
  return NextResponse.json(bags);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clothes, expectedReturnDate } = body;

    if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
      return NextResponse.json({ error: "No clothes selected" }, { status: 400 });
    }

    await connectDB();

    const takenDate = new Date();

    // Create the new laundry bag
    const bag = await LaundryBag.create({
      user: session.user.id,
      clothes,
      takenDate,
      expectedReturnDate: expectedReturnDate 
        ? new Date(expectedReturnDate) 
        : new Date(takenDate.getTime() + 2 * 24 * 60 * 60 * 1000), // Default to 2 days
      status: "pending",
    });

    // Update selected clothes: set status to laundry, isInLaundry, and link the bag
    await Clothing.updateMany(
      { _id: { $in: clothes } },
      {
        $set: {
          status: "laundry",
          isInLaundry: true,
          currentLaundryBag: bag._id,
          expectedReturnDate: bag.expectedReturnDate,
        },
      }
    );

    // Update User's history
    await User.findByIdAndUpdate(session.user.id, {
      $push: { laundryHistory: bag._id },
    });

    return NextResponse.json(bag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laundry bag:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
