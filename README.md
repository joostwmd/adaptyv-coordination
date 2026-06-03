# adaptyv-coordination

Coordination workspace for Adaptyv lab operations: scope client experiments, configure runs, queue and batch work on the planning board, assign technicians on a daily kanban, and hand scheduled units off to LabOS execution.

The app is a TypeScript monorepo (React + TanStack Router on the web, Hono + tRPC on the server) built from [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack). Much of the product UI still runs on prototype seed data in the browser; the architecture is shaped so domain logic stays pure and testable while stores and hooks wire it into React.

## Workflow at a glance

1. **Experiments** — Client projects, workflow templates, and run revisions.
2. **Run creation** — A wizard turns a selected workflow into configured planning tasks.
3. **Planning board** — Queue ready tasks, group work units, resolve blockers, drag-assign tickets to the day roster.
4. **Tickets / LabOS** — Scheduled units become technician-facing execution work.

## Reference implementations

Two vertical slices set the bar for how new features should be structured: **planning board** and **run creation wizard** (experiment run → planning tasks). Both split **pure domain** from **feature UI** and **integration hooks/stores**, and both are covered by Vitest suites that are regularly hardened with [Stryker](https://stryker-mutator.io/) mutation testing (`pnpm mutate` in `apps/web`).

### Planning board

**Design.** Read paths flow through small, composable domain modules; write paths go through a Zustand store that delegates side-effectful experiment/run creation to injectable store actions. Drag-and-drop is intentionally thin in React: `PlanningDndProvider` reads drop targets, but `resolvePlanningDrop` / `applyPlanningDropAction` in domain code decide what actually happens. View hooks (`usePlanningBoard`, `usePlanningDayBoard`) memoize selector output so zones stay presentational.

| Layer | Role | Key paths |
| --- | --- | --- |
| **Domain** | Queue classification, sorting, kanban roster, overflow/display helpers, DnD policy, date stepping | `apps/web/src/domain/planning/*` |
| **Store** | Canonical `tasks` / `workUnits` / `tickets` state and mutations | `apps/web/src/stores/planning/usePlanningBoardStore.ts`, `experiment-run-actions.ts`, `planning-board-selectors.ts`, `usePlanningPreferencesStore.ts` |
| **Hooks** | Derived board views and stable action bundles for DnD | `apps/web/src/hooks/usePlanningBoard.ts`, `usePlanningDayBoard.ts`, `usePlanningBoardActions.ts`, `usePlanningTask.ts`, `useTicketExecution.ts` |
| **Features** | Layout zones, cards, DnD primitives, priority UI | `apps/web/src/features/planning/board/*`, `cards/*`, `priority/*`, `screens/planning-screen.tsx` |

**Why it works well.**

- **Pure selectors** — Functions like `classifyReadyTasks`, `getTicketsByPersonForDay`, and `getKanbanRoster` take plain data and return typed structures; no React or Zustand inside the domain.
- **Explicit DnD contract** — `PlanningDragData` / `PlanningDropData` types and `dnd-policy.ts` keep drag rules in one testable place instead of scattered `onDragEnd` handlers.
- **Store boundaries** — The store orchestrates work-unit and ticket lifecycle; experiment/run creation is extracted to `experiment-run-actions.ts` with injectable deps for testing.
- **UI composition** — `PlanningBoard` only arranges resizable zones (`QueueZone`, `UnitsZone`, `DailyKanbanZone`); cards and drop targets reuse shared shell/draggable components.

### Run creation wizard (task creation)

**Design.** A two-step stepper wizard (“name & select” → “configure”) drives experiment runs into the planning queue. All business rules for workflow resolution, step selection, draft shape, validation, and task building live under `domain/run-creation`. `useRunCreationWizardState` owns wizard navigation and calls `validateRunCreationPayload` before `createExperimentRunFromWizard` on the planning store. Presentational pieces live under `features/experiments/detail/run-creation`.

| Layer | Role | Key paths |
| --- | --- | --- |
| **Domain** | Workflow steps, drafts, validation, run/task assembly | `apps/web/src/domain/run-creation/workflow-steps.ts`, `draft.ts`, `validation.ts`, `create-run.ts`, `types.ts` |
| **Store bridge** | Persists new run + tasks into planning state | `apps/web/src/stores/planning/experiment-run-actions.ts` (`createExperimentRunFromWizard`) |
| **Hooks** | Wizard state machine, toasts, store invocation | `apps/web/src/hooks/useRunCreationWizardState.ts` |
| **Features** | Stepper shell, step pickers, per-task config forms | `apps/web/src/features/experiments/detail/run-creation/run-creation-wizard.tsx`, `run-creation-step-select.tsx`, `run-creation-configure-panel.tsx`, `run-creation-task-config-form.tsx`, `constants.ts` |

**Why it works well.**

- **Result types end-to-end** — `validateRunCreationPayload` and `buildRunCreationResult` return discriminated unions (`ok` / `incompleteStepKeys` / reasons) so the hook and store cannot silently proceed with invalid drafts.
- **Draft model separated from UI** — `RunCreationDraft` and `buildInitialDrafts` / `updateTaskDraft` keep configuration state serializable and easy to test without mounting forms.
- **Workflow as data** — `resolveWorkflowForExperiment` and `buildSelectableRunSteps` map experiment metadata to selectable steps; the wizard does not hard-code protocol lists.
- **Thin feature layer** — `RunCreationWizard` wires the shared Stepper to hook outputs; field components (`run-creation-param-field`, plate stock picker) stay dumb and driven by `SelectableRunStep` + draft slices.

### Testing and mutation quality

Both slices maintain broad **Vitest** coverage at the domain and integration layers (stores, hooks, and policy modules). **Stryker** mutates all of `apps/web/src/domain/**/*.ts` (see `apps/web/stryker.config.mjs`); surviving mutants are reviewed via `.stryker-output/survivors.md`. That loop keeps assertions meaningful—especially for queue classification, DnD actions, draft completeness, and run-creation validation—rather than only checking happy paths.

Representative test locations:

- Planning: `domain/planning/*.test.ts`, `stores/planning/usePlanningBoardStore.test.ts`, `stores/planning/experiment-run-actions.test.ts`, `hooks/usePlanningDayBoard.test.tsx`
- Run creation: `domain/run-creation/*.test.ts`, `hooks/useRunCreationWizardState.test.tsx`

Run unit tests from `apps/web` with `pnpm test`; run mutation testing with `pnpm mutate`.

---

## Stack features

- **TypeScript** — Type safety across the monorepo
- **TanStack Router** — File-based routing with full type safety
- **TailwindCSS** — Utility-first styling
- **Shared UI package** — shadcn/ui primitives in `packages/ui`
- **Hono** — Lightweight server framework
- **tRPC** — End-to-end type-safe APIs
- **Drizzle** — TypeScript-first ORM
- **PostgreSQL** — Database engine
- **Oxlint** — Linting and formatting (Oxfmt)
- **Turborepo** — Monorepo builds

## Getting Started

Install dependencies:

```bash
pnpm install
```

### Database setup

PostgreSQL with Drizzle ORM:

1. Set up a PostgreSQL database.
2. Configure `apps/server/.env` with connection details.
3. Apply the schema:

```bash
pnpm run db:push
```

Start development:

```bash
pnpm run dev
```

- Web: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)

## UI customization

Shared shadcn/ui lives in `packages/ui`.

- Design tokens: `packages/ui/src/styles/globals.css`
- Primitives: `packages/ui/src/components/*`
- Config: `packages/ui/components.json`, `apps/web/components.json`

Add shared components from the repo root:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

```tsx
import { Button } from "@adaptyv-coordination/ui/components/button";
```

App-specific blocks: run the shadcn CLI from `apps/web`.

## Git hooks and formatting

```bash
pnpm run check
```

## Project structure

```
adaptyv-coordination/
├── apps/
│   ├── web/         # React + TanStack Router (planning, experiments, tickets)
│   └── server/      # Hono + tRPC API
├── packages/
│   ├── ui/          # Shared shadcn/ui
│   ├── api/         # API / business logic
│   └── db/          # Schema and queries
```

Within `apps/web/src`, prefer this layout for new product areas:

- `domain/<area>/` — Pure functions, types, policies (mutation-tested)
- `features/<area>/` — Screens and components
- `hooks/` — React integration and derived state
- `stores/` — Zustand (or similar) persistence and orchestration

## Available scripts

- `pnpm run dev` — All apps in development
- `pnpm run build` — Build all applications
- `pnpm run dev:web` — Web only
- `pnpm run dev:server` — Server only
- `pnpm run check-types` — Typecheck across apps
- `pnpm run db:push` — Push schema to database
- `pnpm run db:generate` — Generate DB client/types
- `pnpm run db:migrate` — Run migrations
- `pnpm run db:studio` — Drizzle Studio
- `pnpm run check` — Oxlint + Oxfmt

From `apps/web`:

- `pnpm test` — Vitest unit tests
- `pnpm mutate` — Stryker mutation testing on domain code
