import type { Consultant, Client } from '../types'

export const SEED_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Marco Rossi',   level: 'senior',  monthlyCapacityDays: 20 },
  { id: 'c2', name: 'Sofia Bianchi', level: 'trainee', monthlyCapacityDays: 20 },
  { id: 'c3', name: 'Luca Ferrari',  level: 'middle',  monthlyCapacityDays: 20 },
]

const DEFAULT_RATES = {
  trainee: 300,
  junior:  450,
  middle:  600,
  senior:  800,
  partner: 1200,
}

export const SEED_CLIENTS: Client[] = [
  {
    id: 'cl1',
    name: 'Acme Corp',
    isActive: true,
    priority: 1,
    preferredWeekday: 1,      // Monday
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c1', 'c2'] },  // Marco (senior) + Sofia (trainee) — PM+Trainee pair
    color: '#3b82f6',                   // blue-500
  },
  {
    id: 'cl2',
    name: 'Beta Industries',
    isActive: true,
    priority: 2,
    preferredWeekday: 3,      // Wednesday
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c3'] },        // Luca (middle)
    color: '#22c55e',                   // green-500
  },
  {
    id: 'cl3',
    name: 'Gamma SA',
    isActive: true,
    priority: 3,
    preferredWeekday: 4,      // Thursday
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: ['c1', 'c3'] },  // Marco (senior) + Luca (middle)
    color: '#f97316',                   // orange-500
  },
]
