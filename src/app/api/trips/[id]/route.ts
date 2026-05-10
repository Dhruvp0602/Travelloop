import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Verify ownership before deleting
    const trip = await prisma.trip.findUnique({
      where: { id, userId: user.id },
    });
    if (!trip) return new NextResponse("Trip not found", { status: 404 });

    // Delete in correct order to respect FK constraints
    await prisma.activity.deleteMany({
      where: { stop: { tripId: id } },
    });
    await prisma.tripStop.deleteMany({ where: { tripId: id } });
    await prisma.expense.deleteMany({ where: { tripId: id } });
    await prisma.packingItem.deleteMany({ where: { tripId: id } });
    await prisma.note.deleteMany({ where: { tripId: id } });
    await prisma.trip.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRIP_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
