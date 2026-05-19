import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createChatCompletion } from "./services/aiClient.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const prompt = req.body?.prompt;

    if (typeof prompt !== "string") {
      return res.status(400).json({
        error: "Invalid payload. Field 'prompt' must be a string."
      });
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return res.status(400).json({
        error: "Prompt cannot be empty."
      });
    }

    if (trimmedPrompt.length > 6000) {
      return res.status(400).json({
        error: "Prompt is too long. Maximum length is 6000 characters."
      });
    }

    const answer = await createChatCompletion(trimmedPrompt);
    return res.json({ answer });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return res.status(502).json({
      error: "Could not get AI response. Please try again."
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
