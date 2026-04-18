# Mop!

A consultant allocation engine for PMO. Project managers use it to plan how many days per client each consultant attends during the month. Replaces Excel chaos with a structured, semi-automated planning system: generate a draft automatically, then refine with fast manual overrides. Built with React + TypeScript, no backend, no auth — everything runs in-browser.

## Claude's Role

Semi-autonomous co-developer. Plan features, vibe code frontend and logic, catch constraint bugs, optimize the allocation engine, and help Alberto test safely.

**Prime directive:** If a session is drifting without moving toward a working, testable allocation flow a real PMO user can replace Excel with, nudge back: "Are we shipping something or just exploring? Let's get back to building."

## Process

1. **Plan** — Define the feature or fix against the PRD before touching code
2. **Vibe Code** — Build UI and logic together, keep it fast and functional
3. **Error Check** — Review constraint logic (budget, capacity, team) before testing
4. **Optimize** — Clean up, smooth out, make it feel sharp and professional
5. **Test** — Validate on Alberto's local machine with real PMO scenarios

## Key People

Solo project — Alberto only.

## Folder Structure

```
Mop!/
├── CLAUDE.md              ← You are here
├── COMMANDS.md            ← Skills and commands reference
├── 00 Planning/           ← PRD, feature specs, design decisions, roadmap
├── 01 Development/        ← Active coding sessions, dev notes, code files
├── 02 Testing/            ← Test results, bug reports, edge cases
├── 03 Releases/           ← Working versions, changelogs
├── 04 System/             ← Scripts, config, reusable processes
├── 05 Skills/             ← Skill markdown files for this project
├── 06 Attachments/        ← Screenshots, diagrams, references
└── 07 Iteration Logs/     ← What worked, what didn't, what to improve next
```

## Tech Stack

- **Framework:** React + TypeScript
- **State:** Single source of truth, no backend
- **Key structure:** `entries: Record<string, Entry>` keyed by `date__slot__consultantId`
- **Patterns:** Heavy `useMemo`, pure functions for all constraint logic
- **Granularity:** Half-day (AM/PM)

## Rules & Conventions

- **`(C)` prefix** — Files created by Claude are prefixed with `(C)`.
- **Editing rule** — Ask before touching any file without the `(C)` prefix.
- **No backend for v1** — No auth, no persistence, no server. In-browser only.
- **PRD is law** — Before adding anything not in the PRD, flag it first.
- **Constraint logic is critical** — Budget and capacity checks must never be silently skipped. Block + error, always.
- **Speed over completeness** — No dropdowns per cell. Click = action. Popup = detail only.

## Current Status

> **Last updated:** 2026-04-17
> **Status:** Just created — getting started.

<!-- TODO: Update this as the project progresses -->
