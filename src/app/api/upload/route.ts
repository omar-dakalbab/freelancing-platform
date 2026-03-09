import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file type by magic bytes, not MIME type (which can be spoofed)
const MAGIC_BYTES: Record<string, { ext: string; bytes: number[]; offset?: number }[]> = {
  jpg: [{ ext: "jpg", bytes: [0xff, 0xd8, 0xff] }],
  png: [{ ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  webp: [{ ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }], // RIFF header
  gif: [{ ext: "gif", bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
};

function detectImageType(buffer: Buffer): string | null {
  // Check JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  // Check PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  // Check WebP (RIFF....WEBP)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "webp";
  // Check GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return "gif";

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "NO_FILE", message: "No file provided" } },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "File size cannot exceed 5MB" } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length < 12) {
      return NextResponse.json(
        { error: { code: "INVALID_TYPE", message: "File is too small to be a valid image" } },
        { status: 400 }
      );
    }

    // Validate by magic bytes — not user-supplied MIME type
    const detectedType = detectImageType(buffer);
    if (!detectedType) {
      return NextResponse.json(
        { error: { code: "INVALID_TYPE", message: "Only JPEG, PNG, WebP, and GIF images are allowed" } },
        { status: 400 }
      );
    }

    // Generate random filename — never use user-supplied name/extension
    const randomId = crypto.randomBytes(16).toString("hex");
    const filename = `${session.user.id}-${randomId}.${detectedType}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the resolved path is within the upload directory
    const resolvedPath = path.resolve(uploadDir, filename);
    if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json(
        { error: { code: "INVALID_PATH", message: "Invalid file path" } },
        { status: 400 }
      );
    }

    await mkdir(uploadDir, { recursive: true });
    await writeFile(resolvedPath, buffer);

    const url = `/uploads/${filename}`;

    // Update user avatar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: url },
    });

    return NextResponse.json({ data: { url }, message: "File uploaded successfully" });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}
