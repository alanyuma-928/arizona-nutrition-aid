import standards from "@/data/clinicalStandards.json";

export const SSoT = standards;

export type Sex = "male" | "female";

/** Hamwi Method IBW (lb) — SSoT: clinicalStandards.json#hamwi */
export function hamwiIbwLb(sex: Sex, heightIn: number): number {
  const { baseHeightIn, male, female } = SSoT.hamwi;
  if (heightIn < baseHeightIn) return 0;
  const over = heightIn - baseHeightIn;
  const r = sex === "male" ? male : female;
  return r.baseLb + r.lbPerInchOver * over;
}

/** DGA fiber recommendation (g/day) — SSoT: clinicalStandards.json#fiber */
export function recommendedFiberG(kcal: number): number {
  return (kcal / 1000) * SSoT.fiber.gramsPer1000Kcal;
}

export function ibwCategory(pctIBW: number): string {
  if (!pctIBW) return "—";
  for (const c of SSoT.hamwi.categories) {
    if (c.maxPct === null || pctIBW < c.maxPct) return c.label;
  }
  return "—";
}

export function isFiberAdequate(actualG: number, recommendedG: number): boolean {
  return recommendedG > 0 && actualG >= recommendedG * (SSoT.fiber.adequacyThresholdPct / 100);
}
