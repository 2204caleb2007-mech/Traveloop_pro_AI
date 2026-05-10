import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const PlannerInput = z.object({
  destination: z.string().min(1).max(120),
  travelers: z.number().int().min(1).max(20),
  budgetTier: z.enum(["low", "medium", "high"]),
  customBudget: z.string().optional(),
  startDate: z.string().min(1).max(40),
  endDate: z.string().min(1).max(40),
  mode: z.enum(["best", "hidden", "budget", "mix"]),
});

const ItinerarySchema = z.object({
  summary: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      activities: z.array(z.string()),
      food: z.array(z.string()),
      stay: z.string(),
    }),
  ),
  budget: z.object({
    flights: z.number(),
    hotels: z.number(),
    food: z.number(),
    transport: z.number(),
    activities: z.number(),
    total: z.number(),
    currency: z.string(),
  }),
  tips: z.array(z.string()),
  hiddenGems: z.array(z.string()),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;

export const planTrip = createServerFn({ method: "POST" })
  .inputValidator((data) => PlannerInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
    if (!key) {
      return { error: "AI is not configured. Please add the GEMINI_API_KEY.", itinerary: null };
    }

    const google = createGoogleGenerativeAI({ apiKey: key });
    const model = google("gemini-2.5-flash");

    const modeText = {
      best: "iconic all-time best places",
      hidden: "hidden gems and offbeat experiences",
      budget: "budget-friendly options that are still memorable",
      mix: "a balanced mix of icons, hidden gems, and budget wins",
    }[data.mode];

    const tierText = {
      low: "low budget (hostels, street food, public transport)",
      medium: "mid-range comfort (3-star hotels, mix of dining)",
      high: "luxury (4-5 star, fine dining, private transport)",
    }[data.budgetTier];

    const customBudgetText = data.customBudget 
      ? `\nCRITICAL: The user has a STRICT CUSTOM BUDGET of ${data.customBudget}. Evaluate if this trip is realistically possible within this exact amount. Make sure the total budget in your JSON precisely adds up to this custom budget or less.` 
      : "";

    const prompt = `Plan a detailed travel itinerary.

Destination: ${data.destination}
Travelers: ${data.travelers}
Budget tier: ${tierText}${customBudgetText}
Start: ${data.startDate}
End: ${data.endDate}
Focus: ${modeText}

Build a realistic day-by-day plan from start to end date. Include morning/afternoon/evening activities, food recommendations, and where to stay. 
Include a budget breakdown for the WHOLE GROUP in USD: flights, hotels, food, transport, activities, total. Provide realistic numbers for these categories as pure integers.
Include 3-6 practical tips and 3-5 hidden gems. Be specific (real place names).`;

    try {
      const { experimental_output: output } = await generateText({
        model,
        prompt,
        experimental_output: Output.object({ schema: ItinerarySchema }),
      });
      return { itinerary: output as Itinerary, error: null };
    } catch (e) {
      const err = e as { statusCode?: number; message?: string };
      if (err.statusCode === 429) {
        return { error: "Rate limit reached. Please try again in a moment.", itinerary: null };
      }
      if (err.statusCode === 402) {
        return { error: "AI credits exhausted. Add credits in workspace settings.", itinerary: null };
      }
      console.error("AI planner error:", e);
      return { error: err.message || "AI request failed.", itinerary: null };
    }
  });
