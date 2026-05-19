import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { requestAssistantReply } from "./api/chat";
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition
} from "./lib/speech";

type RequestState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [error, setError] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const speechSupported = useMemo(() => isSpeechRecognitionSupported(), []);

  useEffect(() => {
    if (!answer) {
      setTypedAnswer("");
      setIsTyping(false);
      return;
    }

    let index = 0;
    const chunkSize = Math.max(2, Math.ceil(answer.length / 80));
    setTypedAnswer("");
    setIsTyping(true);

    const timerId = window.setInterval(() => {
      index = Math.min(answer.length, index + chunkSize);
      setTypedAnswer(answer.slice(0, index));

      if (index >= answer.length) {
        window.clearInterval(timerId);
        setIsTyping(false);
      }
    }, 12);

    return () => window.clearInterval(timerId);
  }, [answer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Введите текст запроса.");
      setRequestState("error");
      return;
    }

    setRequestState("loading");
    setError("");
    setAnswer("");
    setTypedAnswer("");
    setIsTyping(false);

    try {
      const assistantReply = await requestAssistantReply(trimmed);
      setAnswer(assistantReply);
      setRequestState("success");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Произошла ошибка при отправке запроса.";
      setError(message);
      setRequestState("error");
    }
  }

  function handleVoiceInput() {
    if (isListening) {
      return;
    }

    setError("");
    setIsListening(true);

    const recognition = startSpeechRecognition({
      onText: (text) => {
        setPrompt((previous) => {
          if (!previous.trim()) return text;
          return `${previous} ${text}`.trim();
        });
      },
      onError: (message) => {
        setError(message);
        setRequestState("error");
      },
      onEnd: () => setIsListening(false)
    });

    if (!recognition) {
      setIsListening(false);
    }
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (requestState === "loading") {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">AI ASSISTANT</p>
        <h1>AI Chat</h1>
        <p className="subtitle">Введите текст или используйте голосовой ввод.</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="prompt-shell">
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Напишите ваш запрос... (Enter отправить, Shift+Enter новая строка)"
              rows={6}
              disabled={requestState === "loading"}
            />
            <button
              className={`voice-btn${isListening ? " is-listening" : ""}`}
              type="button"
              onClick={handleVoiceInput}
              disabled={!speechSupported || isListening || requestState === "loading"}
              title={
                speechSupported
                  ? "Записать голос"
                  : "Браузер не поддерживает Web Speech API"
              }
              aria-label={isListening ? "Слушаю..." : "Микрофон"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 15.25a3.75 3.75 0 0 0 3.75-3.75V7.25a3.75 3.75 0 0 0-7.5 0v4.25A3.75 3.75 0 0 0 12 15.25Zm0-9.75A1.75 1.75 0 0 1 13.75 7.25v4.25a1.75 1.75 0 0 1-3.5 0V7.25A1.75 1.75 0 0 1 12 5.5Zm6 6.75a1 1 0 1 0-2 0 4 4 0 1 1-8 0 1 1 0 0 0-2 0 6 6 0 0 0 5 5.91V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-1.84a6 6 0 0 0 5-5.91Z" />
              </svg>
            </button>
          </div>
          <p className="input-hint">Enter - отправить, Shift+Enter - новая строка</p>

          <div className="controls">
            <button className="primary-btn" type="submit" disabled={requestState === "loading"}>
              {requestState === "loading" ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>

        {requestState === "loading" && (
          <p className="status status-loading">Генерируется ответ...</p>
        )}
        {error && <p className="status status-error">{error}</p>}
        {answer && (
          <article className="answer">
            <h2>Ответ</h2>
            <p className="answer-text">
              {typedAnswer}
              {isTyping && <span className="typing-caret" aria-hidden="true" />}
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
