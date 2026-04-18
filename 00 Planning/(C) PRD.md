# Mop! — Product Requirements Document

## 1. Overview

**Product Name:** Mop! (Master of Planning)

**Goal:** Build a resource allocation system for PMO that:
- Generates a monthly draft plan automatically
- Allows fast manual overrides
- Manages budget, capacity, and team constraints

**Core Concept:** "From Excel chaos → structured, semi-automated planning system"

---

## 2. Problem Statement

PMO today:
- Uses Excel
- Manually allocates consultants
- Has no control on: budget consumption, consultant capacity, team constraints (senior + junior)
- Wastes time building first draft

---

## 3. Target User

- **Primary:** PMO / Project Manager (multi-project environment)
- **Secondary:** Partner / Senior Manager (oversight)

---

## 4. Core Principles

- Planning = draft first, refine later
- Client drives everything
- Team logic must be automatic
- Manual override must be frictionless
- Half-day granularity (AM/PM)

---

## 5. Data Model

### 5.1 Consultant
```ts
Consultant {
  id: string
  name: string
  level: 'trainee' | 'junior' | 'middle' | 'senior' | 'partner'
  monthlyCapacityDays: number
}
```

### 5.2 Client
```ts
Client {
  id: string
  name: string
  isActive: boolean
  priority: number
  preferredWeekday: number // 1–5

  monthlyBudgets: Record<month, number> // € budget
  rates: Record<seniority, number> // €/day

  team: {
    memberIds: string[]
  }

  color: string
}
```

### 5.3 Planning Entry
```ts
Entry {
  date: string
  slot: 'AM' | 'PM'
  consultantId: string
  clientId: string

  withWhom: string
  what: string

  mode: 'Di persona' | 'Da remoto'
  status: 'Pianificato' | 'Accettato'

  source: 'manual' | 'team' | 'draft' | 'brush'
}
```

---

## 6. Core Features

### 6.1 Setup View

**Layout:** 2 columns — Left: Clients / Right: Consultants / Bottom: Rates table

**Clients** — each client: collapsible card with budgets (3 months), active toggle, priority, preferred weekday, team editor, color editor

**Consultants** — each consultant: editable name, level, capacity

**Rates Table** — matrix: client × seniority. Editable only in "Edit mode ON"

---

## 7. Planning View

**Grid:**
- Rows → Days
- Sub-rows → AM / PM
- Columns → Consultants
- Sticky: consultant header, day column, AM/PM column

**Cell States:**

| State | Description |
|-------|-------------|
| Empty | "libero" |
| Filled | client + icon + color |
| Blocked | weekend / holiday |

**Visual Rules:**
- Client color = dot + left border
- Status: Pianificato → ocra / Accettato → azzurro
- Mode: icon only (🏢 / 💻)

---

## 8. Allocation Logic

### 8.1 Half-day vs Full-day

| Action | Result |
|--------|--------|
| Click AM (empty) | full day default |
| Click PM | half day |
| Other slot already filled | half day |

### 8.2 Sync Rules

If same client on same day OR status = Accettato → apply to both AM + PM. Mode syncs across day.

### 8.3 Team Propagation

When allocating: base consultant = anchor → system retrieves `client.team` → replicate allocation to all team members.

### 8.4 Manual Override

User can: add extra consultants, remove allocations (brush delete), override team logic.

---

## 9. Brush Tool (Excel-style)

**Modes:** Assign client / Delete allocation

**Behavior:** Click = apply allocation. Auto applies: team logic, full/half-day logic.

**Delete logic:** Full day same client → delete both slots. Half day → delete only one.

---

## 10. Budget Logic

```
cost_per_half_day = rate[consultant.level] / 2
```

Before allocation: check consultant capacity + check client budget. If violation → block + error.

---

## 11. Capacity Logic

```
used_days += 0.5 per slot
Constraint: used_days <= monthlyCapacityDays
```

---

## 12. Auto-Generation (Core Engine)

**Trigger:** "Generate Draft"

**Algorithm:**
1. For each active client (sorted by priority)
2. Loop weeks in month
3. For each week: pick best day (closest to preferred weekday, not weekend/holiday, all team available)
4. Allocate: full day, entire team

**Output:** 1 day per week per client, consistent weekday.

---

## 13. Holidays

- Weekends auto-blocked
- Manual toggle: click day → becomes blocked

---

## 14. UX Rules

- No dropdown per cell → too slow
- Click = action
- Popup = detailed edit only
- Speed > completeness

---

## 15. Non-Goals (v1)

- No backend
- No auth
- No persistence
- No optimization engine (greedy only)

---

## 16. Future Enhancements

- Drag & drop
- Locking allocations
- Scenario comparison
- AI optimization engine
- Export to Excel
- CRM integration

---

## 17. Key Insight

This is NOT a calendar. This IS a constraint-based resource allocation engine.

---

## 18. Implementation Notes

- React + TypeScript
- State = single source (no backend)
- Key structure: `entries: Record<string, Entry>` keyed by `date__slot__consultantId`
- Heavy use of: `useMemo`, pure functions

---

## 19. Success Metrics

- Time to create monthly plan ↓ 70%
- Manual edits after draft ↓
- Budget overruns → 0
- Capacity overruns → 0
