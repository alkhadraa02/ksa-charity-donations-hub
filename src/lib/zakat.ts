export const GOLD_NISAB_GRAMS = 85;
export const SILVER_NISAB_GRAMS = 595;
export const ZAKAT_RATE = 0.025;

export type NisabBasis = "silver" | "gold";

export interface ZakatInput {
  cash: number;
  goldGrams: number;
  goldPricePerGram: number;
  silverGrams: number;
  silverPricePerGram: number;
  tradeGoods: number;
  receivables: number;
  debts: number;
  nisabBasis: NisabBasis;
}

export interface ZakatResult {
  totalAssets: number;
  netWealth: number;
  nisab: number;
  /** True when the price needed for the chosen nisab basis is missing. */
  missingPrice: boolean;
  nisabMet: boolean;
  zakatDue: number;
}

function clean(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const goldValue = clean(input.goldGrams) * clean(input.goldPricePerGram);
  const silverValue = clean(input.silverGrams) * clean(input.silverPricePerGram);
  const totalAssets = round2(
    clean(input.cash) + goldValue + silverValue + clean(input.tradeGoods) + clean(input.receivables),
  );
  const netWealth = round2(Math.max(0, totalAssets - clean(input.debts)));

  const price =
    input.nisabBasis === "gold" ? clean(input.goldPricePerGram) : clean(input.silverPricePerGram);
  const grams = input.nisabBasis === "gold" ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS;
  const missingPrice = price === 0;
  const nisab = round2(grams * price);
  const nisabMet = !missingPrice && netWealth >= nisab;

  return {
    totalAssets,
    netWealth,
    nisab,
    missingPrice,
    nisabMet,
    zakatDue: nisabMet ? round2(netWealth * ZAKAT_RATE) : 0,
  };
}
