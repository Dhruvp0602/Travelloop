import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Fallback suggestions when no API key
const FALLBACK: Record<string, string[]> = {
  a: ["Amsterdam", "Athens", "Auckland", "Abu Dhabi"],
  b: ["Barcelona", "Bangkok", "Bali", "Berlin", "Budapest", "Bora Bora"],
  c: ["Cape Town", "Cairo", "Cancun", "Colombo", "Cappadocia"],
  d: ["Dubai", "Delhi", "Dublin", "Dubrovnik"],
  e: ["Edinburgh", "Egypt", "El Nido"],
  f: ["Florence", "Fiji", "Frankfurt"],
  g: ["Goa", "Geneva", "Guilin"],
  h: ["Ho Chi Minh City", "Hawaii", "Hong Kong"],
  i: ["Istanbul", "Iceland", "Ibiza"],
  j: ["Jaipur", "Johannesburg", "Jeju"],
  k: ["Kyoto", "Kuala Lumpur", "Kathmandu", "Krakow"],
  l: ["London", "Lisbon", "Los Angeles", "Ljubljana"],
  m: ["Mumbai", "Madrid", "Maldives", "Marrakech", "Melbourne"],
  n: ["New York", "Naples", "Nairobi"],
  o: ["Oslo", "Osaka"],
  p: ["Paris", "Prague", "Phuket", "Porto"],
  q: ["Quebec City"],
  r: ["Rome", "Reykjavik", "Rio de Janeiro"],
  s: ["Santorini", "Singapore", "Sydney", "Salzburg", "Seoul"],
  t: ["Tokyo", "Tbilisi", "Tulum", "Tel Aviv"],
  u: ["Ubud", "Uluru"],
  v: ["Venice", "Vienna", "Vancouver"],
  w: ["Warsaw", "Wellington"],
  x: ["Xi'an"],
  y: ["Yangon", "Yerevan"],
  z: ["Zanzibar", "Zurich"],
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || query.trim().length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const q = query.trim();

    // If no API key, use smart fallback
    if (!process.env.GROQ_API_KEY) {
      const first = q[0].toLowerCase();
      const fallback = (FALLBACK[first] || [])
        .filter(s => s.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6);
      return NextResponse.json({ suggestions: fallback, source: "local" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a travel destination autocomplete assistant. 
Given a partial search query, return a JSON array of up to 6 real travel destination names (cities or countries) that match.
Prioritize popular tourist destinations.
Return ONLY a valid JSON array of strings, nothing else.
Example: ["Paris", "Phuket", "Prague", "Porto"]`,
        },
        {
          role: "user",
          content: `Query: "${q}"`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_completion_tokens: 100,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let suggestions: string[] = [];

    try {
      const parsed = JSON.parse(raw);
      // Handle both { suggestions: [] } and direct array responses
      suggestions = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : Array.isArray(parsed.destinations)
        ? parsed.destinations
        : [];
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 6), source: "ai" });
  } catch (error) {
    console.error("[SEARCH_AI]", error);
    return NextResponse.json({ suggestions: [], source: "error" });
  }
}
