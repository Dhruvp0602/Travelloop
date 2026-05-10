import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "fallback_key"
});

export async function getAiTripSuggestions(homeCity: string, tripName: string, stops: string[], startDate: Date, endDate: Date) {
  const stopsList = stops.join(", ");
  const contextStr = `Home City: ${homeCity}. Trip Name: ${tripName}. Stops: ${stopsList || 'None'}. Dates: ${startDate.toDateString()} to ${endDate.toDateString()}.`;

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

  return JSON.parse(aiResponseContent);
}
