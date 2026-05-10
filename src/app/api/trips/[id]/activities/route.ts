import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: tripId } = await params;
    const body = await req.json();
    const { name, cost, stopId, date } = body;

    if (!name || !stopId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Verify ownership
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: user.id }
    });

    if (!trip) return new NextResponse("Unauthorized", { status: 401 });

    const activity = await prisma.activity.create({
      data: {
        name,
        cost: Number(cost) || 0,
        stopId,
        type: body.type || "Sightseeing", // Default type
        // date is not in the schema anymore? Wait, checking schema again.
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[ACTIVITIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
