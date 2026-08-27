export const COPILOT_INTENT_IDS = ['RISK', 'COMMIT', 'MISSING', 'MEETING', 'FOLLOW_UP'] as const;

export type CopilotIntentId = (typeof COPILOT_INTENT_IDS)[number] | 'CUSTOM';

export type CopilotRequestState =
  | { status: 'IDLE' }
  | { status: 'LOADING'; prompt: string; intentId: CopilotIntentId }
  | { status: 'SUCCESS'; prompt: string; intentId: CopilotIntentId; answer: string }
  | { status: 'EMPTY'; prompt: string; intentId: CopilotIntentId }
  | { status: 'ERROR'; prompt: string; intentId: CopilotIntentId; message: string };

export function startCopilotRequest(
  prompt: string,
  intentId: CopilotIntentId = 'CUSTOM',
): CopilotRequestState | null {
  const normalized = prompt.trim();
  return normalized ? { status: 'LOADING', prompt: normalized, intentId } : null;
}

export function completeCopilotRequest(
  prompt: string,
  answer: string,
  intentId: CopilotIntentId = 'CUSTOM',
): CopilotRequestState {
  const normalizedAnswer = answer.trim();
  return normalizedAnswer
    ? { status: 'SUCCESS', prompt, intentId, answer: normalizedAnswer }
    : { status: 'EMPTY', prompt, intentId };
}

export function failCopilotRequest(
  prompt: string,
  intentId: CopilotIntentId = 'CUSTOM',
  message = 'Copilot could not answer this request. Your workspace data was not changed.',
): CopilotRequestState {
  return {
    status: 'ERROR',
    prompt,
    intentId,
    message,
  };
}
