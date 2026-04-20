import type { Consultant, Client } from '../types'

export const SEED_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Marco Rossi',    level: 'senior',  monthlyCapacityDays: 20 },
  { id: 'c2', name: 'Sofia Bianchi',  level: 'trainee', monthlyCapacityDays: 20 },
  { id: 'c3', name: 'Luca Ferrari',   level: 'middle',  monthlyCapacityDays: 20 },
  { id: 'c4', name: 'Elena Russo',    level: 'junior',  monthlyCapacityDays: 18 },
  { id: 'c5', name: 'Paolo Conti',    level: 'partner', monthlyCapacityDays: 15 },
]

const DEFAULT_RATES = {
  trainee: 300,
  junior:  450,
  middle:  600,
  senior:  800,
  partner: 1200,
}

export const SEED_CLIENTS: Client[] = [
  // ── A-class ──────────────────────────────────────────────────────────────
  {
    id: 'cl4',
    name: 'Delta Logistics',
    isActive: true,
    priority: 1,
    preferredWeekday: 2,     // Tuesday
    monthlyBudget: 20000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c1', 'c4'] },  // Marco (senior) + Elena (junior)
    color: '#8b5cf6',                   // violet
    priorityAssessment: { revenueSize: 5, growthPotential: 4, marginQuality: 5, relationshipFreshness: 5, strategicValue: 3 },
    priorityScore: 86,
    priorityClass: 'A',
  },
  {
    id: 'cl1',
    name: 'Acme Corp',
    isActive: true,
    priority: 2,
    preferredWeekday: 1,     // Monday
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c1', 'c2'] },  // Marco (senior) + Sofia (trainee)
    color: '#3b82f6',                   // blue
    priorityAssessment: { revenueSize: 4, growthPotential: 5, marginQuality: 4, relationshipFreshness: 3, strategicValue: 5 },
    priorityScore: 81,
    priorityClass: 'A',
  },

  // ── B-class ──────────────────────────────────────────────────────────────
  {
    id: 'cl5',
    name: 'Epsilon Tech',
    isActive: true,
    priority: 3,
    preferredWeekday: 1,     // Monday — conflicts with Acme on Luca
    monthlyBudget: 8000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c3', 'c4'] },  // Luca (middle) + Elena (junior)
    color: '#06b6d4',                   // cyan
    priorityAssessment: { revenueSize: 3, growthPotential: 4, marginQuality: 3, relationshipFreshness: 4, strategicValue: 2 },
    priorityScore: 56,
    priorityClass: 'B',
  },
  {
    id: 'cl3',
    name: 'Gamma SA',
    isActive: true,
    priority: 4,
    preferredWeekday: 4,     // Thursday — shares Marco with Delta/Acme, Luca with Epsilon
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c1', 'c3'] },  // Marco (senior) + Luca (middle)
    color: '#f97316',                   // orange
    priorityAssessment: { revenueSize: 3, growthPotential: 3, marginQuality: 3, relationshipFreshness: 2, strategicValue: 2 },
    priorityScore: 43,
    priorityClass: 'B',
  },
  {
    id: 'cl2',
    name: 'Beta Industries',
    isActive: true,
    priority: 5,
    preferredWeekday: 3,     // Wednesday — Luca only, no assessment → manual priority fallback
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c3'] },        // Luca (middle) — intentionally unassessed
    color: '#22c55e',                   // green
  },

  // ── C-class ──────────────────────────────────────────────────────────────
  {
    id: 'cl6',
    name: 'Zeta Finance',
    isActive: true,
    priority: 6,
    preferredWeekday: 5,     // Friday
    monthlyBudget: 5000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c2', 'c5'] },  // Sofia (trainee) + Paolo (partner)
    color: '#f43f5e',                   // rose
    priorityAssessment: { revenueSize: 2, growthPotential: 1, marginQuality: 2, relationshipFreshness: 1, strategicValue: 2 },
    priorityScore: 15,
    priorityClass: 'C',
  },
]
