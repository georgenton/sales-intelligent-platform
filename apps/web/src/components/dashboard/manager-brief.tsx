'use client';

import { Bot, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { csrfToken } from '@/lib/utils';

export function ManagerBrief() {
  const [summary, setSummary] = useState(
    'Generate a deterministic executive readout from current KPIs and priority risks.',
  );
  const [loading, setLoading] = useState(false);
  return (
    <Card className="overflow-hidden bg-[#0b2a32] text-white">
      <CardHeader className="flex-row items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-cyan-300/15 text-cyan-200">
          <Bot className="size-5" />
        </span>
        <div>
          <CardTitle>Manager brief</CardTitle>
          <p className="text-xs text-slate-400">Advisory · deterministic mock provider</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="min-h-16 text-sm leading-6 text-slate-200">{summary}</p>
        <Button
          className="mt-5 bg-cyan-300 text-[#08242c] hover:bg-cyan-200"
          size="sm"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch('/backend/ai/manager-brief', {
                method: 'POST',
                headers: { 'x-csrf-token': csrfToken() },
              });
              if (!response.ok) throw new Error('Brief generation failed');
              const data = (await response.json()) as { summary: string };
              setSummary(data.summary);
            } catch {
              setSummary('The brief could not be generated. Review the risk panel and try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating…' : 'Generate brief'}
        </Button>
      </CardContent>
    </Card>
  );
}
