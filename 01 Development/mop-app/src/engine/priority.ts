import type { PriorityAssessment } from '../types'

/**
 * Weights must sum to 1.
 * Revenue size   25%  — budget significance in portfolio
 * Growth pot.    25%  — room to expand scope / budget
 * Margin quality 20%  — billing rates vs cost base
 * Rel. freshness 15%  — new/developing clients need more attention (inverted maturity)
 * Strategic val. 15%  — referrals, prestige, sector influence
 */
const WEIGHTS: Record<keyof PriorityAssessment, number> = {
  revenueSize:           0.25,
  growthPotential:       0.25,
  marginQuality:         0.20,
  relationshipFreshness: 0.15,
  strategicValue:        0.15,
}

/**
 * Returns a score in [0, 100].
 * Each dimension is 1–5; the weighted average is normalized to 0–100.
 */
export function computePriorityScore(a: PriorityAssessment): number {
  const raw =
    a.revenueSize           * WEIGHTS.revenueSize +
    a.growthPotential       * WEIGHTS.growthPotential +
    a.marginQuality         * WEIGHTS.marginQuality +
    a.relationshipFreshness * WEIGHTS.relationshipFreshness +
    a.strategicValue        * WEIGHTS.strategicValue
  // raw ∈ [1, 5] → normalize to [0, 100]
  return Math.round((raw - 1) / 4 * 100)
}

/** A ≥ 70 | B 40–69 | C < 40 */
export function computePriorityClass(score: number): 'A' | 'B' | 'C' {
  if (score >= 70) return 'A'
  if (score >= 40) return 'B'
  return 'C'
}

export const CLASS_COLOR: Record<'A' | 'B' | 'C', string> = {
  A: '#22c55e',
  B: '#f59e0b',
  C: '#64748b',
}
