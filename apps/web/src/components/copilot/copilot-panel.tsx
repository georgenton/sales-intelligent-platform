'use client';

import { Bot, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useManagerBriefMutation } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCopilotPanelOpen } from '@/store/ui-slice';

const prompts = [
  'Why is this deal at risk?',
  'Is Commit justified?',
  'What information is missing?',
  'Prepare next meeting',
  'Draft follow-up',
];

export function CopilotPanel({ compactByDefault = false }: { compactByDefault?: boolean }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.productUi.copilotPanelOpen);
  const context = useAppSelector((state) => state.productUi.copilotContext);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [managerBrief, briefState] = useManagerBriefMutation();

  useEffect(() => {
    if (!compactByDefault) dispatch(setCopilotPanelOpen(true));
  }, [compactByDefault, dispatch]);

  const ask = async (selectedPrompt = prompt) => {
    if (!selectedPrompt.trim()) return;
    if (context.opportunityId) {
      setAnswer(
        `${selectedPrompt} Review the active risk signals, stage evidence and last customer activity for this opportunity before changing its forecast category.`,
      );
    } else {
      try {
        const result = await managerBrief().unwrap();
        setAnswer(result.summary);
      } catch {
        setAnswer(
          'Copilot could not generate a brief. The current workspace data remains available.',
        );
      }
    }
    setPrompt('');
  };

  if (!open) {
    return (
      <button
        aria-label="Open contextual Copilot"
        onClick={() => dispatch(setCopilotPanelOpen(true))}
        className="fixed right-4 bottom-20 z-40 grid size-12 place-items-center rounded-full bg-copilot text-white shadow-[var(--shadow-overlay)] lg:bottom-5"
      >
        <Bot className="size-5" />
      </button>
    );
  }

  return (
    <aside
      className="hidden w-[330px] shrink-0 border-l bg-copilot text-sidebar-foreground xl:flex xl:flex-col"
      aria-label="Contextual Copilot"
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-copilot-accent">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Sales Copilot</p>
          <p className="truncate text-[11px] text-white/55">
            {context.opportunityId ? `Opportunity ${context.opportunityId}` : 'Workspace context'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Collapse Copilot"
          onClick={() => dispatch(setCopilotPanelOpen(false))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-copilot-accent">
            Context
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {context.opportunityId
              ? 'Reason about this deal using verified commercial evidence.'
              : 'Ask for a deterministic view of the current revenue position.'}
          </p>
        </div>
        <div className="space-y-2">
          {prompts.slice(0, context.opportunityId ? 5 : 3).map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/75 hover:bg-white/10"
              onClick={() => ask(item)}
            >
              {item}
              <ChevronLeft className="size-3 rotate-180" />
            </button>
          ))}
        </div>
        {(answer || briefState.isLoading) && (
          <div
            role="status"
            className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-copilot"
          >
            {briefState.isLoading ? 'Analyzing the current commercial position…' : answer}
          </div>
        )}
      </div>
      <form
        className="border-t border-white/10 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <label className="sr-only" htmlFor="copilot-prompt">
          Ask Sales Copilot
        </label>
        <div className="flex items-center gap-2 rounded-xl bg-white p-2 text-copilot">
          <input
            id="copilot-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask about this context…"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          />
          <button
            type="submit"
            aria-label="Send to Copilot"
            className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
