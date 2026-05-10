import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getAiTripSuggestions } from "@/backend/services/ai.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const homeCity = url.searchParams.get("homeCity") || "Unknown Origin";

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { stops: true }
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
      // Fallback logic could be moved to service too, but keeping it simple for now
      return NextResponse.json({ error: "API Key missing" });
    }

    const stops = trip.stops.map(s => s.cityName);
    const jsonResponse = await getAiTripSuggestions(
      homeCity,
      trip.name,
      stops,
      trip.startDate,
      trip.endDate
    );

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[AI_SUGGESTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
