type RecognitionAlternative = { transcript: string };
type RecognitionResult = { 0?: RecognitionAlternative };
type RecognitionEvent = { results?: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string };

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechResultHandlers = {
  onText: (text: string) => void;
  onError: (errorMessage: string) => void;
  onEnd?: () => void;
};

export function isSpeechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startSpeechRecognition(handlers: SpeechResultHandlers) {
  const SpeechRecognitionImpl =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionImpl) {
    handlers.onError("Speech recognition is not supported in this browser.");
    return null;
  }

  const recognition: SpeechRecognitionInstance = new SpeechRecognitionImpl();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (text.trim()) {
      handlers.onText(text.trim());
    }
  };

  recognition.onerror = (event) => {
    handlers.onError(`Voice input error: ${event.error}`);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  recognition.start();
  return recognition;
}
