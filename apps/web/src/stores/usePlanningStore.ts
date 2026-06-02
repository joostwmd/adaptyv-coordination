import { create } from "zustand";
import type { BlockedReason } from "@/domain/blocked-reason";
import {
  computeBatchPriority,
  createBatchFromTickets,
  groupIntoDraftBatches,
  suggestSplit,
} from "@/domain/batch";
import type { Batch, BatchNote } from "@/domain/batch/types";
import { buildPlanningSeedData } from "@/domain/seed";
import {
  DEFAULT_PRIORITY_WEIGHTS,
  PRIORITY_WEIGHT_PRESETS,
  type PriorityWeights,
} from "@/domain/priority";
import {
  createRerunTickets,
  createStandaloneTicket,
  refreshAllTicketReadiness,
  scaffoldTickets,
} from "@/domain/ticket";
import type { Ticket } from "@/domain/ticket/types";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { StaffMember } from "@/types";
import { usePrototypeStore } from "./usePrototypeStore";

const initialSeed = buildPlanningSeedData();

interface PlanningState {
  tickets: Ticket[];
  batches: Batch[];
  weights: PriorityWeights;

  addTicket: (ticket: Omit<Ticket, "id"> & { id?: string }) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;

  scaffoldFromExperiment: (experimentId: string) => Ticket[];
  createStandaloneTicket: (
    taskTemplateId: string,
    params?: Record<string, unknown>,
    experimentIds?: string[],
  ) => Ticket;
  createRerunFromTickets: (ticketIds: string[]) => Ticket[];

  groupReadyIntoBatches: () => Batch[];
  addTicketToBatch: (ticketId: string, batchId: string) => void;
  removeTicketFromBatch: (ticketId: string) => void;
  splitBatch: (batchId: string) => { primary: Batch; secondary: Batch } | null;

  assignBatch: (batchId: string, assigneeIds: string[]) => void;
  scheduleBatch: (batchId: string, scheduledDay: string) => void;
  addBatchNote: (batchId: string, note: Omit<BatchNote, "id">) => void;
  updateBatch: (batchId: string, updates: Partial<Batch>) => void;

  setWeights: (weights: PriorityWeights) => void;
  applyWeightPreset: (presetName: keyof typeof PRIORITY_WEIGHT_PRESETS) => void;

  markTicketInLabos: (ticketId: string) => void;

  getTicketsByExperiment: (experimentId: string) => Ticket[];
  getTicketsByBatch: (batchId: string) => Ticket[];
  getBatchPriority: (batchId: string) => ReturnType<typeof computeBatchPriority>;

  resetToSeed: () => void;
}

function syncReadiness(tickets: Ticket[]): Ticket[] {
  return refreshAllTicketReadiness(tickets);
}

function attachTicketsToBatches(tickets: Ticket[], batches: Batch[]): Ticket[] {
  const batchByTicket = new Map<string, string>();
  for (const batch of batches) {
    for (const tid of batch.ticketIds) {
      batchByTicket.set(tid, batch.id);
    }
  }
  return syncReadiness(
    tickets.map((t) => {
      const batchId = batchByTicket.get(t.id);
      if (batchId) {
        return { ...t, batchId, readiness: "batched" };
      }
      if (t.readiness === "batched" && !batchId) {
        const { batchId: _removed, ...rest } = t;
        return refreshAllTicketReadiness([{ ...rest, readiness: "ready" }])[0]!;
      }
      return t;
    }),
  );
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  tickets: initialSeed.tickets,
  batches: initialSeed.batches,
  weights: DEFAULT_PRIORITY_WEIGHTS,

  addTicket: (ticketData) =>
    set((state) => {
      const ticket: Ticket = {
        ...ticketData,
        id: ticketData.id ?? `ticket-${Date.now()}`,
        createdAt: ticketData.createdAt ?? new Date().toISOString(),
      };
      return { tickets: syncReadiness([...state.tickets, ticket]) };
    }),

  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: syncReadiness(
        state.tickets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      ),
    })),

  deleteTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
      batches: state.batches.map((b) => ({
        ...b,
        ticketIds: b.ticketIds.filter((tid) => tid !== id),
      })),
    })),

  scaffoldFromExperiment: (experimentId) => {
    const experiment = usePrototypeStore.getState().experiments.find(
      (e) => e.id === experimentId,
    );
    if (!experiment) return [];

    const { runs: _runs, ...summary } = experiment;
    const wf =
      getWorkflowTemplate(experiment.type, experiment.methodName) ??
      getWorkflowTemplate(experiment.type);
    if (!wf) return [];

    const newTickets = scaffoldTickets(summary, wf);
    set((state) => ({
      tickets: syncReadiness([...state.tickets, ...newTickets]),
    }));
    return newTickets;
  },

  createStandaloneTicket: (taskTemplateId, params = {}, experimentIds = []) => {
    const ticket = createStandaloneTicket(taskTemplateId, params, experimentIds);
    set((state) => ({
      tickets: syncReadiness([...state.tickets, ticket]),
    }));
    return ticket;
  },

  createRerunFromTickets: (ticketIds) => {
    const state = get();
    const sources = state.tickets.filter((t) => ticketIds.includes(t.id));
    const reruns = createRerunTickets(sources);
    set({ tickets: syncReadiness([...state.tickets, ...reruns]) });
    return reruns;
  },

  groupReadyIntoBatches: () => {
    const state = get();
    const unbatched = state.tickets.filter(
      (t) => t.readiness === "ready" && !t.batchId,
    );
    const newBatches = groupIntoDraftBatches(unbatched);
    const batches = [...state.batches, ...newBatches];
    const tickets = attachTicketsToBatches(state.tickets, batches);
    set({ batches, tickets });
    return newBatches;
  },

  addTicketToBatch: (ticketId, batchId) =>
    set((state) => {
      const batches = state.batches.map((b) =>
        b.id === batchId
          ? { ...b, ticketIds: [...new Set([...b.ticketIds, ticketId])] }
          : b,
      );
      const tickets = attachTicketsToBatches(
        state.tickets.map((t) =>
          t.id === ticketId ? { ...t, batchId, readiness: "batched" } : t,
        ),
        batches,
      );
      return { batches, tickets };
    }),

  removeTicketFromBatch: (ticketId) =>
    set((state) => {
      const batches = state.batches.map((b) => ({
        ...b,
        ticketIds: b.ticketIds.filter((id) => id !== ticketId),
      }));
      const tickets = state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const { batchId: _b, ...rest } = t;
        return { ...rest, readiness: "ready" as const };
      });
      return {
        batches,
        tickets: syncReadiness(tickets),
      };
    }),

  splitBatch: (batchId) => {
    const state = get();
    const batch = state.batches.find((b) => b.id === batchId);
    if (!batch) return null;

    const memberTickets = state.tickets.filter((t) =>
      batch.ticketIds.includes(t.id),
    );
    const experiments = usePrototypeStore.getState().experiments;
    const experimentsById = Object.fromEntries(experiments.map((e) => [e.id, e]));

    const { primary, secondary } = suggestSplit(
      memberTickets,
      experimentsById,
      state.weights,
    );
    if (secondary.length === 0) return null;

    const primaryBatch = createBatchFromTickets(primary, { id: batchId });
    const secondaryBatch = createBatchFromTickets(secondary);

    const batches = state.batches.map((b) =>
      b.id === batchId ? primaryBatch : b,
    );
    batches.push(secondaryBatch);

    const tickets = attachTicketsToBatches(state.tickets, batches);
    set({ batches, tickets });
    return { primary: primaryBatch, secondary: secondaryBatch };
  },

  assignBatch: (batchId, assigneeIds) =>
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId ? { ...b, assigneeIds } : b,
      ),
    })),

  scheduleBatch: (batchId, scheduledDay) =>
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId ? { ...b, scheduledDay, status: "ready" } : b,
      ),
    })),

  addBatchNote: (batchId, noteData) =>
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId
          ? {
              ...b,
              notes: [
                ...b.notes,
                {
                  ...noteData,
                  id: `batch-note-${Date.now()}`,
                  createdAt: noteData.createdAt ?? new Date().toISOString(),
                },
              ],
            }
          : b,
      ),
    })),

  updateBatch: (batchId, updates) =>
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId ? { ...b, ...updates } : b,
      ),
    })),

  setWeights: (weights) => set({ weights }),

  applyWeightPreset: (presetName) =>
    set({
      weights: PRIORITY_WEIGHT_PRESETS[presetName] ?? DEFAULT_PRIORITY_WEIGHTS,
    }),

  markTicketInLabos: (ticketId) =>
    set((state) => ({
      tickets: syncReadiness(
        state.tickets.map((t) =>
          t.id === ticketId ? { ...t, readiness: "in_labos", batchId: undefined } : t,
        ),
      ),
    })),

  getTicketsByExperiment: (experimentId) =>
    get().tickets.filter((t) => t.experimentIds.includes(experimentId)),

  getTicketsByBatch: (batchId) => {
    const batch = get().batches.find((b) => b.id === batchId);
    if (!batch) return [];
    return get().tickets.filter((t) => batch.ticketIds.includes(t.id));
  },

  getBatchPriority: (batchId) => {
    const state = get();
    const batch = state.batches.find((b) => b.id === batchId);
    if (!batch) return null;
    const experiments = usePrototypeStore.getState().experiments;
    const experimentsById = Object.fromEntries(
      experiments.map((e) => {
        const { runs: _r, ...s } = e;
        return [e.id, s];
      }),
    );
    return computeBatchPriority(
      batch,
      state.tickets,
      experimentsById,
      state.weights,
    );
  },

  resetToSeed: () => {
    const seed = buildPlanningSeedData();
    set({
      tickets: seed.tickets,
      batches: seed.batches,
      weights: DEFAULT_PRIORITY_WEIGHTS,
    });
  },
}));

export const usePlanningTickets = () => usePlanningStore((s) => s.tickets);
export const usePlanningBatches = () => usePlanningStore((s) => s.batches);
export const usePlanningWeights = () => usePlanningStore((s) => s.weights);

export type { BlockedReason };
