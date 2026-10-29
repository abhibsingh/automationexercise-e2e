/** "Rs. 1,500" -> 1500 */
export function parseRupees(text: string | null | undefined): number {
  const match = (text ?? '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No amount found in "${text}"`);
  return Number(match[1]);
}

export interface Invoice {
  customer: string;
  amount: number;
}

/** "Hi QA Auto, Your total purchase amount is 1400. Thank you" */
export function parseInvoice(text: string): Invoice {
  const match = text.match(/Hi\s+(.+?),\s*Your total purchase amount is\s+([\d,.]+)/i);
  if (!match) throw new Error(`Unexpected invoice format: "${text.slice(0, 120)}"`);
  return { customer: match[1].trim(), amount: Number(match[2].replace(/,/g, '')) };
}
