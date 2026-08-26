import { describe, expect, it } from 'vitest';
import {
  completeCopilotRequest,
  failCopilotRequest,
  startCopilotRequest,
} from './copilot-contracts';

describe('Copilot request contract', () => {
  it('does not start an empty request', () => {
    expect(startCopilotRequest('   ')).toBeNull();
  });

  it('preserves the normalized prompt through loading and errors for retry', () => {
    const loading = startCopilotRequest('  Is Commit justified?  ');
    const failed = failCopilotRequest('Is Commit justified?');

    expect(loading).toEqual({ status: 'LOADING', prompt: 'Is Commit justified?' });
    expect(failed).toEqual({
      status: 'ERROR',
      prompt: 'Is Commit justified?',
      message: 'Copilot could not answer this request. Your workspace data was not changed.',
    });
  });

  it('distinguishes an empty provider response from a successful response', () => {
    expect(completeCopilotRequest('Prepare next meeting', '   ')).toEqual({
      status: 'EMPTY',
      prompt: 'Prepare next meeting',
    });
    expect(completeCopilotRequest('Prepare next meeting', 'Use verified evidence.')).toEqual({
      status: 'SUCCESS',
      prompt: 'Prepare next meeting',
      answer: 'Use verified evidence.',
    });
  });
});
