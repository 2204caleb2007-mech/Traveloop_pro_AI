// ─── AI Planner API Service ────────────────────────────────────────────────
// Implements the TravelFlow Orchestrator pattern:
//   - tavily_search  → real-time web info
//   - synthesize_with_llm → GROQ-powered response synthesis
//   - run_travelflow_agent → internal workflow routing

// Env var or hardcoded keys
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "your-groq-api-key";
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || "your-tavily-api-key";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export interface TavilySearchResponse {
  success: boolean;
  results: TavilyResult[];
  answer?: string;
}

// ─── Orchestrator Decision Types ──────────────────────────────────────────
type OrchestratorDecision =
  | { type: "travelflow"; tool: "run_travelflow_agent"; arguments: { clarified_query: string } }
  | { type: "web_search"; tool: "tavily_search"; arguments: { query: string; max_results: number } }
  | { type: "direct_answer"; answer: string };

// ─── System Prompt ────────────────────────────────────────────────────────
const ORCHESTRATOR_SYSTEM_PROMPT = `You are "TravelFlow Orchestrator", an intelligent AI travel assistant for a modern tourism and trip-planning application.

Your responsibilities:
* Use Tavily web search for real-time travel, tourism, destination, pricing, weather, and general knowledge queries.
* Use the internal tourism workflow engine for trip-related actions such as itinerary creation, destination management, bookings, budgeting, packing lists, and travel planning operations.

Available Tools:
1. tavily_search(query, max_results) - for real-time travel info, destination recommendations, weather, hotels, flights, cultural insights
2. synthesize_with_llm(query, search_results, model, role) - to synthesize search results into concise answers
3. run_travelflow_agent(clarified_query) - for trip planning workflows: itineraries, budgets, packing lists, destination management

Routing Rules:
A) Tourism Workflow Actions → run_travelflow_agent
   Examples: "Create a 7-day Japan itinerary", "Plan a budget Bali vacation", "Add Paris to my trip", "Update my packing checklist"

B) Web Search / Travel Knowledge → tavily_search then synthesize_with_llm
   Examples: "Best historical places in Turkey", "Average cost of traveling in Switzerland", "Top beaches in Thailand", "Best time to visit Iceland"

No Hallucination Rules:
* Never fabricate travel restrictions, pricing, or tourism facts.
* If Tavily lacks reliable evidence, clearly state it and ask user to rephrase.
* Never invent itinerary data, bookings, or saved-trip information.

Tool Calling Output Format (STRICT JSON only, no extra text):
A) For tourism workflows:
{"type":"travelflow","tool":"run_travelflow_agent","arguments":{"clarified_query":"..."}}

B) For web search:
{"type":"web_search","tool":"tavily_search","arguments":{"query":"...","max_results":5}}

C) For direct answers:
{"type":"direct_answer","answer":"..."}

Clarification Rules:
* Always rewrite the user request into a self-contained query before tool calls.
* Preserve travel context and traveler intent.
* Include travel-focused constraints when relevant: budget, duration, travel style, destination type, activity preferences.

Response Style: Concise but informative, modern AI travel assistant tone, helpful and premium-feeling.`;

// ─── Tavily Search ────────────────────────────────────────────────────────
export async function tavilySearch(
  query: string,
  maxResults: number = 5,
  apiKey: string
): Promise<TavilySearchResponse> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
      search_depth: "advanced",
      include_answer: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    results?: Array<{ title: string; url: string; content: string }>;
    answer?: string;
  };
  return {
    success: true,
    results: (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
    answer: data.answer,
  };
}

// ─── GROQ LLM Call ────────────────────────────────────────────────────────
async function groqChat(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
  jsonMode = false
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GROQ API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

// ─── Synthesize with LLM ──────────────────────────────────────────────────
async function synthesizeWithLLM(
  query: string,
  searchResults: TavilySearchResponse,
  model: string,
  apiKey: string
): Promise<string> {
  const context = searchResults.answer
    ? `Direct answer from search: ${searchResults.answer}\n\nAdditional sources:\n${searchResults.results.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join("\n\n")}`
    : searchResults.results.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`).join("\n\n");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a premium travel assistant. Synthesize the provided search results into a concise, informative, and engaging travel-focused response. Be specific, accurate, and helpful. Format with markdown when useful (bullet points, bold key info). Never invent facts not present in the search results.",
    },
    {
      role: "user",
      content: `User question: ${query}\n\nSearch Results:\n${context}\n\nProvide a helpful, concise response based on the search results.`,
    },
  ];

  return groqChat(messages, model, apiKey, false);
}

// ─── Run TravelFlow Agent ─────────────────────────────────────────────────
async function runTravelflowAgent(
  clarifiedQuery: string,
  model: string,
  apiKey: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a premium AI travel planning assistant handling internal trip management workflows. 
Help the user with: trip itinerary generation, destination management, activity planning, budget planning, packing checklists, trip notes, sharing itineraries, saved destinations, travel preferences, smart recommendations, and route optimization.
Be detailed, practical, and inspiring. Format responses clearly with markdown. Use emojis sparingly for visual appeal.`,
    },
    ...conversationHistory.slice(-6),
    {
      role: "user",
      content: clarifiedQuery,
    },
  ];

  return groqChat(messages, model, apiKey, false);
}

// ─── Main Orchestrator ────────────────────────────────────────────────────
export async function runOrchestrator(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<{ content: string; sources?: TavilyResult[]; type: string }> {
  // Step 1: Ask GROQ orchestrator to decide what tool to use
  const orchestratorMessages: ChatMessage[] = [
    { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
    ...conversationHistory.slice(-4).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  let rawDecision = "";
  try {
    rawDecision = await groqChat(orchestratorMessages, GROQ_MODEL, GROQ_API_KEY, true);
  } catch (err) {
    throw new Error(`Orchestrator failed: ${(err as Error).message}`);
  }

  let decision: OrchestratorDecision;
  try {
    decision = JSON.parse(rawDecision) as OrchestratorDecision;
  } catch {
    // Fallback: treat as direct answer if JSON parse fails
    decision = { type: "direct_answer", answer: rawDecision };
  }

  // Step 2: Execute based on decision
  if (decision.type === "direct_answer") {
    return { content: decision.answer, type: "direct_answer" };
  }

  if (decision.type === "travelflow") {
    const clarifiedQuery = decision.arguments.clarified_query;
    const content = await runTravelflowAgent(
      clarifiedQuery,
      GROQ_MODEL,
      GROQ_API_KEY,
      conversationHistory
    );
    return { content, type: "travelflow" };
  }

  if (decision.type === "web_search") {
    const { query, max_results } = decision.arguments;
    const searchResults = await tavilySearch(query, max_results, TAVILY_API_KEY);
    const content = await synthesizeWithLLM(userMessage, searchResults, GROQ_MODEL, GROQ_API_KEY);
    return { content, sources: searchResults.results, type: "web_search" };
  }

  throw new Error("Unknown orchestrator decision type");
}

