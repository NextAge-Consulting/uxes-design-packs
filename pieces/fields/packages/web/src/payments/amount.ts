/** A typed amount — "10", "10.5", "$1,000" — in cents; null when it is not an amount at all. */
export function parseAmount(typed: string): number | null {
  const clean = typed.replace(/[$,\s]/g, '')
  if (!clean) return null
  if (!/^\d+(\.\d{0,2})?$/.test(clean) && !/^\.\d{1,2}$/.test(clean)) return null
  return Math.round(Number.parseFloat(clean) * 100)
}

/** Cents as an amount to type over: "1,234.50". */
export const tidyAmount = (cents: number) => (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * A typed amount as it reads once the box is left: "50" becomes "50.00", "1234.5" becomes
 * "1,234.50". Text that is not an amount is left as typed, so its message still shows.
 */
export function tidyTypedAmount(typed: string): string {
  const cents = parseAmount(typed)
  return cents === null ? typed : tidyAmount(cents)
}
