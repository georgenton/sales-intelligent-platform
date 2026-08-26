export type CopilotRequestState =
  | { status: 'IDLE' }
  | { status: 'LOADING'; prompt: string }
  | { status: 'SUCCESS'; prompt: string; answer: string }
  | { status: 'EMPTY'; prompt: string }
  | { status: 'ERROR'; prompt: string; message: string };

export function startCopilotRequest(prompt: string): CopilotRequestState | null {
  const normalized = prompt.trim();
  return normalized ? { status: 'LOADING', prompt: normalized } : null;
}

export function completeCopilotRequest(prompt: string, answer: string): CopilotRequestState {
  const normalizedAnswer = answer.trim();
  return normalizedAnswer
    ? { status: 'SUCCESS', prompt, answer: normalizedAnswer }
    : { status: 'EMPTY', prompt };
}

export function failCopilotRequest(prompt: string): CopilotRequestState {
  return {
    status: 'ERROR',
    prompt,
    message: 'Copilot could not answer this request. Your workspace data was not changed.',
  };
}
