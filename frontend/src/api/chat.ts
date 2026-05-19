const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function requestAssistantReply(prompt: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  const answer = payload?.answer;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Invalid API response: no answer text.");
  }

  return answer.trim();
}
