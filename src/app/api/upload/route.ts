import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data } = body; // base64 data URI

  if (!data) {
    return NextResponse.json({ error: "No image data provided" }, { status: 400 });
  }

  try {
    const { url, publicId } = await uploadImage(data);
    return NextResponse.json({ url, publicId });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}
