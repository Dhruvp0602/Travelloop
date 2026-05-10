import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import crypto from "crypto";

// PATCH /api/trips/[id]/share  → generate / toggle shareToken
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const trip = await prisma.trip.findUnique({ where: { id, userId: user.id } });
    if (!trip) return new NextResponse("Not Found", { status: 404 });

    // If already has a token → remove it (toggle off). Otherwise create one.
    if (trip.shareToken) {
      const updated = await prisma.trip.update({
        where: { id },
        data: { shareToken: null, isPublic: false },
        select: { shareToken: true, isPublic: true },
      });
      return NextResponse.json(updated);
    }

    const token = crypto.randomBytes(16).toString("hex");
    const updated = await prisma.trip.update({
      where: { id },
      data: { shareToken: token, isPublic: true },
      select: { shareToken: true, isPublic: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TRIP_SHARE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
