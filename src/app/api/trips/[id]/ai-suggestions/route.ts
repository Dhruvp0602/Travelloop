import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

// Initialize Groq client. It will automatically use the GROQ_API_KEY environment variable.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "fallback_key"
});

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
      // Fallback to mock data if no API key is provided
      const mainCity = trip.stops.length > 0 ? trip.stops[0].cityName : (trip.name || "Paris");
      const mockResponse = {
        primaryDestination: mainCity,
        nearbyCities: [
          { name: "A beautiful nearby town", distance: "45 mins away", reason: "Highly recommended for a day trip" },
          { name: "Another city", distance: "2 hours away", reason: "Great local food and culture" }
        ],
        expenseBreakdown: {
          travelCosts: [
            { route: `${homeCity} to ${mainCity}`, mode: "Flight", estimatedCost: "₹45,000 - ₹60,000" },
            { route: `${mainCity} to nearby cities`, mode: "Train/Bus", estimatedCost: "₹3,000 - ₹8,000" }
          ],
          hotelCostPerNight: "₹5,000 - ₹12,000",
          dailyOtherCost: "₹3,000 - ₹5,000 (Food & Local Transport)"
        },
        estimatedCost: "₹65,000 - ₹90,000 (Total Estimate)",
        activities: [
          "Historical city center walking tour",
          "Skip-the-line museum passes",
          "Highly-rated local street food tour",
          "Panoramic city views from the main tower"
        ],
        packing: [
          "Comfortable walking shoes (10k+ steps/day)",
          "Universal power adapter",
          "Daypack with anti-theft zippers",
          "Reusable water bottle"
        ]
      };
      return NextResponse.json(mockResponse);
    }

    // Build context string from trip details
    const stopsList = trip.stops.map(s => s.cityName).join(", ");
    const contextStr = `Home City: ${homeCity}. Trip Name: ${trip.name}. Stops: ${stopsList || 'None'}. Dates: ${trip.startDate.toDateString()} to ${trip.endDate.toDateString()}.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert travel agent. Provide a detailed, realistic travel plan in JSON.
          Schema: 
          {
            "estimatedCost": "₹X - ₹Y",
            "expenseBreakdown": {
              "travelCosts": [{"route": "Mumbai to Paris", "mode": "Flight", "estimatedCost": "₹50k"}],
              "hotelCostPerNight": "₹10k",
              "dailyOtherCost": "₹5k"
            },
            "stops": [
              {
                "cityName": "Paris",
                "activities": ["Visit Eiffel Tower", "Louvre Museum"],
                "nearbyCities": [{"name": "Versailles", "distance": "30m", "reason": "Palace"}]
              }
            ],
            "packing": ["Universal Adapter", "Walking Shoes"]
          }
          Calculate travel costs from Home City to first stop, then between all stops. 
          Provide 3-4 specific activities and 2 nearby side-trips for EACH stop.`
        },
        {
          role: "user",
          content: contextStr
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const aiResponseContent = chatCompletion.choices[0]?.message?.content;
    if (!aiResponseContent) {
      throw new Error("No response from Groq AI");
    }

    const jsonResponse = JSON.parse(aiResponseContent);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[AI_SUGGESTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
