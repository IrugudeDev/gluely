export const SuggestionKind = {
  QA: 'qa',
  REWRITE: 'rewrite',
  QUESTION: 'question',
  ACTION: 'action',
};

export function createSuggestion({ id, kind, text, confidence }) {
  if (!SuggestionKind[kind.toUpperCase()]) {
    throw new Error(`Unknown suggestion kind: ${kind}`);
  }
  return {
    id,
    kind,
    text,
    confidence: typeof confidence === 'number' ? confidence : 0.5,
  };
}

export function createRealtimeFrame({ transcript, ocr, context }) {
  return {
    transcript: transcript ? { ...transcript } : undefined,
    ocr: ocr ? { ...ocr } : undefined,
    context: context ? { ...context } : undefined,
  };
}

export function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
