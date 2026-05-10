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

    // If API Key is missing, return a Mock Response for development/demonstration
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing. Returning mock data.");
      return NextResponse.json({
        estimatedCost: "₹1,50,000 - ₹2,00,000",
        expenseBreakdown: {
          travelCosts: [
            { route: `${homeCity} to ${trip.stops[0]?.cityName || 'Destination'}`, mode: "Flight", estimatedCost: "₹65,000" },
            { route: "Internal Travel", mode: "Train/Taxi", estimatedCost: "₹25,000" }
          ],
          hotelCostPerNight: "₹8,500",
          dailyOtherCost: "₹4,000"
        },
        stops: trip.stops.map(stop => ({
          cityName: stop.cityName,
          activities: [
            `Explore the central districts of ${stop.cityName}`,
            "Visit top-rated local museums",
            "Fine dining at a traditional restaurant",
            "Sunset city walking tour"
          ],
          nearbyCities: [
            { name: "Scenic Outskirts", distance: "45m", reason: "Nature & Views" },
            { name: "Historic Village", distance: "1h", reason: "Local Heritage" }
          ]
        })),
        packing: ["Universal Adapter", "Power Bank", "Comfortable Walking Shoes", "Local Currency"]
      });
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
