import type { Client, Consultant, Entry } from '../types'

export interface BudgetSummary {
  clientId: string
  name: string
  color: string
  allocated: number
  budget: number
}

/** Cost allocated to a client in € */
export function getClientCost(
  clientId: string,
  entries: Record<string, Entry>,
  consultants: Consultant[],
  client: Client
): number {
  return Object.values(entries)
    .filter(e => e.clientId === clientId)
    .reduce((sum, e) => {
      const consultant = consultants.find(c => c.id === e.consultantId)
      if (!consultant) return sum
      return sum + (client.rates[consultant.level] ?? 0) / 2  // per half-day
    }, 0)
}

/** Budget summaries for all clients */
export function getBudgetSummaries(
  clients: Client[],
  entries: Record<string, Entry>,
  consultants: Consultant[]
): BudgetSummary[] {
  return clients.map(client => ({
    clientId: client.id,
    name: client.name,
    color: client.color,
    allocated: getClientCost(client.id, entries, consultants, client),
    budget: client.monthlyBudget,
  }))
}
