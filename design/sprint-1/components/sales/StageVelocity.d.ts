import type { HTMLAttributes } from 'react';

export interface StageVelocityProps extends HTMLAttributes<HTMLDivElement> {
  stage: string;
  daysInStage: number;
  /** Tenant benchmark for this stage; drawn as the tick at 66% of the track. */
  benchmarkDays?: number;
}

export function StageVelocity(props: StageVelocityProps): JSX.Element;
