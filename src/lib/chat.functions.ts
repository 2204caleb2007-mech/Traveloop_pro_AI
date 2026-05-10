import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const ChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string()
  }))
});

export const chatWithSupport = createServerFn({ method: "POST" })
  .inputValidator((data) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
    if (!key) {
      return { error: "AI is not configured.", response: null };
    }

    const google = createGoogleGenerativeAI({ apiKey: key });
    const model = google("gemini-2.5-flash");

    const systemPrompt = "You are a helpful travel assistant for GlobeX AI. You help users navigate the app, explain how to use the AI planner, and give general travel advice. Keep your answers concise, friendly, and helpful.";

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...data.messages
    ];

    try {
      const { text } = await generateText({
        model,
        messages: fullMessages,
      });
      return { response: text, error: null };
    } catch (e) {
      console.error("Chat error:", e);
      return { error: "Failed to connect to support agent.", response: null };
    }
  });
