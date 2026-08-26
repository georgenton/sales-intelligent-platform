'use client';

import { AlertTriangle, Bot, BriefcaseBusiness, Plus, Search, Target, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOpportunitiesQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectOpportunity,
  setCommandPaletteOpen,
  setCopilotPanelOpen,
  setExperienceMode,
} from '@/store/ui-slice';

interface PaletteAction {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.productUi.commandPaletteOpen);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const { data } = useOpportunitiesQuery(query.length > 1 ? { search: query } : undefined, {
    skip: !open || query.length < 2,
  });

  const close = () => {
    setQuery('');
    setActive(0);
    dispatch(setCommandPaletteOpen(false));
  };
  const actions = useMemo<PaletteAction[]>(
    () => [
      {
        id: 'opportunities',
        label: 'Find opportunity or customer',
        hint: 'Start typing a name',
        icon: Search,
        run: () => setQuery(''),
      },
      {
        id: 'create',
        label: 'Create opportunity',
        hint: 'Portfolio',
        icon: Plus,
        run: () => router.push('/app/opportunities/new'),
      },
      {
        id: 'risk',
        label: 'View at-risk opportunities',
        hint: 'Risk alerts',
        icon: AlertTriangle,
        run: () => router.push('/app/alerts'),
      },
      {
        id: 'review',
        label: 'Open forecast review',
        hint: 'Review mode',
        icon: Target,
        run: () => {
          dispatch(setExperienceMode('REVIEW'));
          router.push('/app/dashboard');
        },
      },
      {
        id: 'copilot',
        label: 'Ask Copilot',
        hint: 'Current context only',
        icon: Bot,
        run: () => dispatch(setCopilotPanelOpen(true)),
      },
    ],
    [dispatch, router],
  );
  const results: PaletteAction[] = [
    ...actions.filter((item) =>
      `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()),
    ),
    ...(data?.items.slice(0, 6).map((opportunity) => ({
      id: opportunity.id,
      label: opportunity.title,
      hint: `${opportunity.customer.name} · ${opportunity.stage.name}`,
      icon: BriefcaseBusiness,
      run: () => {
        dispatch(selectOpportunity(opportunity.id));
        router.push('/app/opportunities');
      },
    })) ?? []),
  ];

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dispatch(setCommandPaletteOpen(!open));
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [dispatch, open]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => previousFocus.current?.focus();
  }, [open]);

  if (!open) return null;

  const run = (item: PaletteAction | undefined) => {
    if (!item) return;
    item.run();
    if (item.id !== 'opportunities') close();
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-start bg-foreground/35 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-overlay)]"
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((value) => Math.min(results.length - 1, value + 1));
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((value) => Math.max(0, value - 1));
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            run(results[active]);
          }
          if (event.key === 'Tab') {
            const controls = event.currentTarget.querySelectorAll<HTMLElement>(
              'input, button, [href], [tabindex]:not([tabindex="-1"])',
            );
            if (!controls.length) return;
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            placeholder="Find or run a command…"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
          />
          <button
            aria-label="Close command palette"
            className="rounded-lg p-2 hover:bg-muted"
            onClick={close}
          >
            <X className="size-4" />
          </button>
        </div>
        <div id="command-results" role="listbox" className="max-h-[460px] overflow-y-auto p-2">
          {results.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                id={`command-${item.id}`}
                role="option"
                aria-selected={index === active}
                key={item.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => run(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${index === active ? 'bg-secondary' : 'hover:bg-muted'}`}
              >
                <span className="grid size-9 place-items-center rounded-lg border bg-card text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
              </button>
            );
          })}
          {!results.length && (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              No matching commands.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 border-t bg-muted/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
