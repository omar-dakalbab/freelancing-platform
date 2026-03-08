import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ data: { unverified: false } });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    // Only reveal unverified status, never whether account exists
    const unverified = user ? !user.emailVerified : false;

    return NextResponse.json({ data: { unverified } });
  } catch {
    return NextResponse.json({ data: { unverified: false } });
  }
}
