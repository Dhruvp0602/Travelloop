import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

// Initialize Groq client. It will automatically use the GROQ_API_KEY environment variable.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "fallback_key"
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { stops: true }
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
      // Fallback to mock data if no API key is provided
      const mockResponse = {
        primaryDestination: "Paris",
        nearbyCities: [
          { name: "Versailles", distance: "45 mins by train", reason: "Famous Palace and Gardens" },
          { name: "Lyon", distance: "2 hours by high-speed train", reason: "Culinary capital of France" }
        ],
        expenseBreakdown: {
          flightCost: "₹40,000 - ₹55,000 (from major hubs)",
          hotelCost: "₹5,000 - ₹12,000 per night"
        },
        estimatedCost: "₹45,000 - ₹60,000 (excluding flights)",
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
    const contextStr = `Trip Name: ${trip.name}. Description: ${trip.description || 'None'}. Destinations added so far: ${stopsList || 'Not defined yet'}. Dates: ${trip.startDate.toDateString()} to ${trip.endDate.toDateString()}.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert travel agent. The user will provide their trip details. You must return a JSON object exactly matching this schema: {\"primaryDestination\": \"string\", \"nearbyCities\": [{\"name\": \"string\", \"distance\": \"string\", \"reason\": \"string\"}], \"expenseBreakdown\": {\"flightCost\": \"string\", \"hotelCost\": \"string\"}, \"estimatedCost\": \"string\", \"activities\": [\"string\", \"string\", \"string\", \"string\"], \"packing\": [\"string\", \"string\", \"string\", \"string\"]}. Do not return any other text, only the raw JSON. Provide the main city being discussed as 'primaryDestination'. Provide 2-3 'nearbyCities' they should consider visiting. Estimate 'flightCost' (assume from India if unspecified) and 'hotelCost' (per night). Make all estimated costs realistic ranges in Indian Rupees (using the ₹ symbol). Provide 4 top contextual activity ideas and 4 smart packing tips."
        },
        {
          role: "user",
          content: contextStr
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_completion_tokens: 1024,
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
