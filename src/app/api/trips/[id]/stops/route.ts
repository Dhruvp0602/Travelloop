import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cityName, country, arrivalDate, departureDate } = body;

    if (!cityName || !country) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // First get the highest orderIndex to append to the end
    const existingStops = await prisma.tripStop.findMany({
      where: { tripId: id },
      orderBy: { orderIndex: 'desc' },
      take: 1
    });

    const newOrderIndex = existingStops.length > 0 ? existingStops[0].orderIndex + 1 : 0;

    const stop = await prisma.tripStop.create({
      data: {
        tripId: id,
        cityName,
        country,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        departureDate: departureDate ? new Date(departureDate) : null,
        orderIndex: newOrderIndex
      }
    });

    return NextResponse.json(stop);
  } catch (error) {
    console.error("[TRIP_STOPS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
