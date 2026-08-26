'use client';

import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAppearanceMode, type AppearanceMode } from '@/store/ui-slice';

const APPEARANCE_KEY = 'sip-appearance';

function resolveTheme(mode: AppearanceMode): 'light' | 'dark' {
  if (mode === 'SYSTEM') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode.toLowerCase() as 'light' | 'dark';
}

export function applyAppearance(mode: AppearanceMode) {
  const theme = resolveTheme(mode);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(APPEARANCE_KEY, mode);
}

function AppearanceSynchronizer() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.productUi.appearanceMode);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const stored = localStorage.getItem(APPEARANCE_KEY) as AppearanceMode | null;
      if (stored && ['LIGHT', 'DARK', 'SYSTEM'].includes(stored) && stored !== mode) {
        queueMicrotask(() => dispatch(setAppearanceMode(stored)));
        return;
      }
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyAppearance(mode);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [dispatch, mode]);

  return null;
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <AppearanceSynchronizer />
      {children}
    </Provider>
  );
}
