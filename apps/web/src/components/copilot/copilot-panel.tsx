'use client';

import { Bot, ChevronLeft, ChevronRight, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AppLocale } from '@/i18n/config';
import { useManagerBriefMutation } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCopilotPanelOpen } from '@/store/ui-slice';
import {
  completeCopilotRequest,
  failCopilotRequest,
  startCopilotRequest,
  type CopilotIntentId,
  type CopilotRequestState,
} from './copilot-contracts';

const prompts: Array<{ id: Exclude<CopilotIntentId, 'CUSTOM'>; key: string }> = [
  { id: 'RISK', key: 'risk' },
  { id: 'COMMIT', key: 'commit' },
  { id: 'MISSING', key: 'missing' },
  { id: 'MEETING', key: 'meeting' },
  { id: 'FOLLOW_UP', key: 'followUp' },
];

export function CopilotPanel({ compactByDefault = false }: { compactByDefault?: boolean }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('copilot');
  const tNavigation = useTranslations('navigation');
  const tAction = useTranslations('common.action');
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.productUi.copilotPanelOpen);
  const context = useAppSelector((state) => state.productUi.copilotContext);
  const [prompt, setPrompt] = useState('');
  const [request, setRequest] = useState<CopilotRequestState>({ status: 'IDLE' });
  const [modal, setModal] = useState(false);
  const [managerBrief] = useManagerBriefMutation();
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (compactByDefault) return;
    const desktop = window.matchMedia('(min-width: 1280px)');
    const synchronize = () => dispatch(setCopilotPanelOpen(desktop.matches));
    synchronize();
    desktop.addEventListener('change', synchronize);
    return () => desktop.removeEventListener('change', synchronize);
  }, [compactByDefault, dispatch]);

  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 1279px)');
    const synchronize = () => setModal(viewport.matches);
    synchronize();
    viewport.addEventListener('change', synchronize);
    return () => viewport.removeEventListener('change', synchronize);
  }, []);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body) {
        previousFocusRef.current = active;
        window.requestAnimationFrame(() => {
          panelRef.current?.querySelector<HTMLElement>('[data-copilot-initial-focus]')?.focus();
        });
      }
    }
    if (!open && wasOpenRef.current) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      dispatch(setCopilotPanelOpen(false));
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [dispatch, open]);

  const closePanel = () => dispatch(setCopilotPanelOpen(false));

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !modal) return;
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const ask = async (
    selection: { prompt: string; intentId: CopilotIntentId } = {
      prompt,
      intentId: 'CUSTOM',
    },
  ) => {
    const loading = startCopilotRequest(selection.prompt, selection.intentId);
    if (!loading || loading.status !== 'LOADING') return;
    setRequest(loading);
    if (context.opportunityId) {
      setRequest(
        completeCopilotRequest(
          loading.prompt,
          `${loading.prompt} ${t('localAnswer')}`,
          loading.intentId,
        ),
      );
      setPrompt('');
    } else {
      try {
        const result = await managerBrief({ locale, intentId: loading.intentId }).unwrap();
        setRequest(completeCopilotRequest(loading.prompt, result.summary, loading.intentId));
        setPrompt('');
      } catch {
        setRequest(failCopilotRequest(loading.prompt, loading.intentId, t('error')));
        setPrompt(loading.prompt);
      }
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        aria-controls="contextual-copilot-panel"
        aria-expanded="false"
        aria-label={tNavigation('openCopilot')}
        onClick={() => dispatch(setCopilotPanelOpen(true))}
        className="fixed right-4 bottom-20 z-40 grid size-12 place-items-center rounded-full bg-copilot text-sidebar-foreground shadow-[var(--shadow-overlay)] lg:bottom-5"
      >
        <Bot className="size-5" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={t('close')}
        tabIndex={-1}
        onClick={closePanel}
        className="fixed inset-0 z-[55] bg-foreground/30 backdrop-blur-[1px] xl:hidden"
      />
      <aside
        id="contextual-copilot-panel"
        ref={panelRef}
        role={modal ? 'dialog' : 'region'}
        aria-modal={modal || undefined}
        onKeyDown={handlePanelKeyDown}
        className="fixed inset-y-0 right-0 z-[60] flex w-full shrink-0 flex-col border-l bg-copilot text-sidebar-foreground shadow-[var(--shadow-overlay)] sm:w-[min(420px,94vw)] xl:static xl:z-auto xl:w-[330px] xl:shadow-none"
        aria-label={t('title')}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-foreground/10 px-4">
          <span className="grid size-8 place-items-center rounded-lg bg-sidebar-foreground/10 text-copilot-accent">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t('title')}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">
              {context.opportunityId
                ? t('opportunityContext', { id: context.opportunityId })
                : t('workspaceContext')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-foreground/10"
            aria-label={t('collapse')}
            aria-controls="contextual-copilot-panel"
            aria-expanded="true"
            data-copilot-initial-focus
            onClick={closePanel}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-2xl border border-sidebar-foreground/10 bg-sidebar-foreground/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-copilot-accent">
              {t('context')}
            </p>
            <p className="mt-2 text-sm leading-6 text-sidebar-foreground/75">
              {context.opportunityId ? t('dealContext') : t('workspaceDescription')}
            </p>
          </div>
          <div className="space-y-2">
            {prompts.slice(0, context.opportunityId ? 5 : 3).map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center justify-between rounded-xl border border-sidebar-foreground/10 px-3 py-2.5 text-left text-xs text-sidebar-foreground/75 hover:bg-sidebar-foreground/10"
                disabled={request.status === 'LOADING'}
                onClick={() => ask({ prompt: t(`prompts.${item.key}`), intentId: item.id })}
              >
                {t(`prompts.${item.key}`)}
                <ChevronLeft className="size-3 rotate-180" />
              </button>
            ))}
          </div>
          {request.status === 'LOADING' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-sidebar-foreground px-4 py-4 text-sm leading-6 text-copilot"
            >
              {t('working')}
            </div>
          )}
          {request.status === 'SUCCESS' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-sidebar-foreground px-4 py-4 text-sm leading-6 text-copilot"
            >
              {request.answer}
            </div>
          )}
          {request.status === 'EMPTY' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-sidebar-foreground/15 p-4 text-sm leading-6"
            >
              <p>{t('empty')}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-sidebar-foreground hover:bg-sidebar-foreground/10"
                onClick={() => ask({ prompt: request.prompt, intentId: request.intentId })}
              >
                <RefreshCw className="size-3.5" /> {tAction('retry')}
              </Button>
            </div>
          )}
          {request.status === 'ERROR' && (
            <div
              role="alert"
              className="rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm leading-6"
            >
              <p>{request.message}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-sidebar-foreground hover:bg-sidebar-foreground/10"
                onClick={() => ask({ prompt: request.prompt, intentId: request.intentId })}
              >
                <RefreshCw className="size-3.5" /> {t('retryQuestion')}
              </Button>
            </div>
          )}
        </div>
        <form
          className="border-t border-sidebar-foreground/10 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void ask();
          }}
        >
          <label className="sr-only" htmlFor="copilot-prompt">
            {t('askLabel')}
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-foreground p-2 text-copilot">
            <input
              id="copilot-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={request.status === 'LOADING'}
              placeholder={t('placeholder')}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label={t('send')}
              disabled={request.status === 'LOADING' || !prompt.trim()}
              className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
