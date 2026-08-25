export interface FiscalPeriod {
  label: string;
  start: Date;
  end: Date;
}

export function currentFiscalQuarter(now: Date, fiscalYearStartMonth: number): FiscalPeriod {
  if (fiscalYearStartMonth < 1 || fiscalYearStartMonth > 12) {
    throw new RangeError('fiscalYearStartMonth must be between 1 and 12');
  }
  const month = now.getUTCMonth();
  const fiscalStart = fiscalYearStartMonth - 1;
  const fiscalMonth = (month - fiscalStart + 12) % 12;
  const quarter = Math.floor(fiscalMonth / 3);
  const fiscalYearStart = month < fiscalStart ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
  const start = new Date(Date.UTC(fiscalYearStart, fiscalStart + quarter * 3, 1));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 0));
  const fiscalYearEnd = fiscalYearStart + 1;
  return { label: `FY${fiscalYearEnd} Q${quarter + 1}`, start, end };
}
