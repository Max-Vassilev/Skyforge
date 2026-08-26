const currencyFmt = new Intl.NumberFormat('bg-BG', {
  style: 'currency',
  currency: 'EUR',
});

const dateFmt = new Intl.DateTimeFormat('bg-BG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** Format a numeric amount as EUR currency (Bulgarian locale), e.g. 1299.5 -> "1299,50 €". */
export function formatCurrency(amount: number): string {
  return currencyFmt.format(Number.isFinite(amount) ? amount : 0);
}

/** Format an ISO date string as a readable Bulgarian date. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}
