import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const systemMessages = [
        {
          role: "system" as const,
          content: systemPrompt || `You are ARIA (Advanced Reasoning Intelligence Assistant), a sophisticated AI personal assistant. You are helpful, intelligent, and conversational. You can assist with a wide range of tasks including answering questions, giving advice, helping with planning, analysis, creative writing, coding, and much more. 
          
Keep responses concise and direct unless asked for detailed explanations. Be warm but professional. Remember context from earlier in the conversation.

When users ask you to help with tasks like setting reminders, sending messages, or opening apps, explain that these device integrations require the user to follow your instructions manually, and guide them step by step. 

Always be proactive in offering help and suggestions.`,
        },
      ];

      const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [...systemMessages, ...messages],
        stream: true,
        max_completion_tokens: 8192,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to get AI response" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
        res.end();
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
