import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize data for context
  const dataPath = path.join(process.cwd(), 'src/data.json');
  let agentsData = "[]";
  try {
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    // Map to a slimmed-down format to conserve tokens
    agentsData = JSON.stringify(rawData.map((d: any) => ({
      name: d.name,
      category: d.category,
      desc: d.description,
      tags: d.tags
    })));
  } catch (error) {
    console.error("Failed to load data.json for agent context:", error);
  }

  // API Route for the Live Agent
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key missing. Please provide GEMINI_API_KEY in the Environment Secrets." });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Create a simplified prompt using the user's message and the database context.
      const prompt = `You are "Mainframe Intelligence", the live AI agent for the Awesome AI Agents Directory.

Here is the full directory database of AI agents, frameworks, and tools:
${agentsData}

INSTRUCTIONS:
1. You act as a helpful search and recommendation assistant for the user.
2. Based on the user's request, find and recommend 1 to 3 relevant tools from the database above.
3. Briefly explain why you are recommending each tool.
4. Keep your tone professional, concise, and futuristic.
5. If the user asks something unrelated, kindly remind them that you are the Directory AI and can help them find AI tools.

USER REQUEST:
${message}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Error communicating with Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
