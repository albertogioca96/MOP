---
version: 0.1.0
date: 2026-04-20
status: working
commit: 2a3c868
---

# Mop! v0.1.0 — MVP Checkpoint

## What's working

- **Setup view** — add/edit/delete consultants and clients, rates per level, team assignment, inactive client section
- **Priority Assessment Wizard** — 5-dimension scoring (revenue, growth, margin, freshness, strategic value) → 0–100 score → ABC class
- **Planner grid** — full month view, AM/PM half-day rows, sticky headers, sync scrollbar, compact weekend columns, day labels (holiday/strategy/event)
- **Brush tool** — click to assign/erase, team propagation, assign/delete modes with trash cursor
- **Generate Draft** — greedy scheduler sorted by priority score (ABC), 1 day/week per client, team allocated together
- **Conflict detection** — logs when a client is bumped from preferred day or skipped due to shared consultant; visible in collapsible bar post-generate
- **Consultant header** — live per-client day breakdown (colored dot + name + Xd)
- **Log view** — date-grouped entry table, inline edit (mode, status P/A/E, notes), focus mode from planner cell click
- **Dashboard** — utilization bars per consultant, budget summary per client
- **NavBar** — month tracker (12 pills + year navigation), 4-tab routing
- **History / rollback** — up to 10 snapshots, rollback to any point
- **Capacity warnings** — soft warning toast when consultant exceeds monthly days

## Seed data (test scenario)

5 consultants: Marco (senior), Sofia (trainee), Luca (middle), Elena (junior), Paolo (partner)

6 clients with priority conflicts:
- Delta Logistics — A·86 — Marco + Elena
- Acme Corp — A·81 — Marco + Sofia
- Epsilon Tech — B·56 — Luca + Elena
- Gamma SA — B·43 — Marco + Luca
- Beta Industries — unassessed — Luca only
- Zeta Finance — C·15 — Sofia + Paolo

## Known limitations / next steps

- No data persistence (in-memory only, refresh = reset)
- Draft generates 1 day/week max per client — no budget-maximizing multi-day allocation yet
- No export (PDF, Excel)
- No multi-month planning
