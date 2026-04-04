const RATES: Record<string, number> = { DZD: 1, EUR: 0.007, USD: 0.0075, GBP: 0.006 };
const SYMBOLS: Record<string, string> = { DZD: 'DA', EUR: '€', USD: '$', GBP: '£' };

export function formatPrice(priceDZD: number, currency: string = 'DZD'): string {
  const rate = RATES[currency] || 1;
  const converted = priceDZD * rate;
  const symbol = SYMBOLS[currency] || 'DA';
  if (currency === 'DZD') return `${Math.round(converted).toLocaleString('fr-DZ')} ${symbol}`;
  return `${converted.toFixed(2).replace('.', ',')} ${symbol}`;
}

export function safeJSONParse<T>(str: string, fallback: T): T {
  try { return JSON.parse(str); } catch { return fallback; }
}
