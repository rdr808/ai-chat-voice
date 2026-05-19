const DEFAULT_TIMEOUT_MS = 30_000;

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

export async function createChatCompletion(userPrompt) {
  const apiKey = readRequiredEnv("OPENAI_API_KEY");
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(baseUrl, "/chat/completions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a concise, helpful assistant."
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(
        `LLM request failed (${response.status}): ${errorPayload || "empty response"}`
      );
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error("LLM response has no assistant message.");
    }

    return answer.trim();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("LLM request timeout exceeded.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
