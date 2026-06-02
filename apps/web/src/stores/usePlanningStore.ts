import { create } from "zustand";
import type { BlockedReason } from "@/domain/blocked-reason";
import { buildPlanningSeedData } from "@/domain/seed";
import {
  DEFAULT_PRIORITY_WEIGHTS,
  PRIORITY_WEIGHT_PRESETS,
  type PriorityWeights,
} from "@/domain/priority";
import type { Ticket } from "@/domain/ticket/types";
import {
  computeWorkUnitPriority,
  createWorkUnitFromTasks,
  groupIntoDraftWorkUnits,
  suggestSplit,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import {
  createRerunTasks,
  createStandaloneTask,
  refreshAllTaskReadiness,
  scaffoldTasks,
} from "@/domain/task";
import type { Task } from "@/domain/task/types";
import { getWorkflowTemplate } from "@/domain/workflow";
import { usePrototypeStore } from "./usePrototypeStore";

const initialSeed = buildPlanningSeedData();

interface PlanningState {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
  weights: PriorityWeights;

  addTask: (task: Omit<Task, "id"> & { id?: string }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  scaffoldFromExperiment: (experimentId: string) => Task[];
  createStandaloneTask: (
    taskTemplateId: string,
    params?: Record<string, unknown>,
    experimentIds?: string[],
  ) => Task;
  createRerunFromTasks: (taskIds: string[]) => Task[];

  groupReadyIntoWorkUnits: () => WorkUnit[];
  addTaskToWorkUnit: (taskId: string, workUnitId: string) => void;
  removeTaskFromWorkUnit: (taskId: string) => void;
  splitWorkUnit: (workUnitId: string) => { primary: WorkUnit; secondary: WorkUnit } | null;

  createTicket: (
    workUnitId: string,
    assigneeId: string,
    scheduledDay: string,
  ) => Ticket | null;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  deleteTicket: (ticketId: string) => void;

  updateWorkUnit: (workUnitId: string, updates: Partial<WorkUnit>) => void;

  setWeights: (weights: PriorityWeights) => void;
  applyWeightPreset: (presetName: keyof typeof PRIORITY_WEIGHT_PRESETS) => void;

  markTaskInLabos: (taskId: string) => void;

  getTasksByExperiment: (experimentId: string) => Task[];
  getTasksByWorkUnit: (workUnitId: string) => Task[];
  getTicketByWorkUnitId: (workUnitId: string) => Ticket | undefined;
  getUnscheduledWorkUnits: () => WorkUnit[];
  getWorkUnitPriority: (workUnitId: string) => ReturnType<typeof computeWorkUnitPriority>;

  resetToSeed: () => void;
}

function syncReadiness(tasks: Task[]): Task[] {
  return refreshAllTaskReadiness(tasks);
}

function attachTasksToWorkUnits(tasks: Task[], workUnits: WorkUnit[]): Task[] {
  const workUnitByTask = new Map<string, string>();
  for (const workUnit of workUnits) {
    for (const taskId of workUnit.taskIds) {
      workUnitByTask.set(taskId, workUnit.id);
    }
  }
  return syncReadiness(
    tasks.map((t) => {
      const workUnitId = workUnitByTask.get(t.id);
      if (workUnitId) {
        return { ...t, workUnitId, readiness: "batched" };
      }
      if (t.readiness === "batched" && !workUnitId) {
        const { workUnitId: _removed, ...rest } = t;
        return refreshAllTaskReadiness([{ ...rest, readiness: "ready" }])[0]!;
      }
      return t;
    }),
  );
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  tasks: initialSeed.tasks,
  workUnits: initialSeed.workUnits,
  tickets: initialSeed.tickets,
  weights: DEFAULT_PRIORITY_WEIGHTS,

  addTask: (taskData) =>
    set((state) => {
      const task: Task = {
        ...taskData,
        id: taskData.id ?? `task-${Date.now()}`,
        createdAt: taskData.createdAt ?? new Date().toISOString(),
      };
      return { tasks: syncReadiness([...state.tasks, task]) };
    }),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: syncReadiness(
        state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      workUnits: state.workUnits.map((wu) => ({
        ...wu,
        taskIds: wu.taskIds.filter((tid) => tid !== id),
      })),
    })),

  scaffoldFromExperiment: (experimentId) => {
    const experiment = usePrototypeStore
      .getState()
      .experiments.find((e) => e.id === experimentId);
    if (!experiment) return [];

    const { runs: _runs, ...summary } = experiment;
    const wf =
      getWorkflowTemplate(experiment.type, experiment.methodName) ??
      getWorkflowTemplate(experiment.type);
    if (!wf) return [];

    const newTasks = scaffoldTasks(summary, wf);
    set((state) => ({
      tasks: syncReadiness([...state.tasks, ...newTasks]),
    }));
    return newTasks;
  },

  createStandaloneTask: (taskTemplateId, params = {}, experimentIds = []) => {
    const task = createStandaloneTask(taskTemplateId, params, experimentIds);
    set((state) => ({
      tasks: syncReadiness([...state.tasks, task]),
    }));
    return task;
  },

  createRerunFromTasks: (taskIds) => {
    const state = get();
    const sources = state.tasks.filter((t) => taskIds.includes(t.id));
    const reruns = createRerunTasks(sources);
    set({ tasks: syncReadiness([...state.tasks, ...reruns]) });
    return reruns;
  },

  groupReadyIntoWorkUnits: () => {
    const state = get();
    const unbatched = state.tasks.filter(
      (t) => t.readiness === "ready" && !t.workUnitId,
    );
    const newWorkUnits = groupIntoDraftWorkUnits(unbatched);
    const workUnits = [...state.workUnits, ...newWorkUnits];
    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return newWorkUnits;
  },

  addTaskToWorkUnit: (taskId, workUnitId) =>
    set((state) => {
      const workUnits = state.workUnits.map((wu) =>
        wu.id === workUnitId
          ? { ...wu, taskIds: [...new Set([...wu.taskIds, taskId])] }
          : wu,
      );
      const tasks = attachTasksToWorkUnits(
        state.tasks.map((t) =>
          t.id === taskId ? { ...t, workUnitId, readiness: "batched" } : t,
        ),
        workUnits,
      );
      return { workUnits, tasks };
    }),

  removeTaskFromWorkUnit: (taskId) =>
    set((state) => {
      const workUnits = state.workUnits.map((wu) => ({
        ...wu,
        taskIds: wu.taskIds.filter((id) => id !== taskId),
      }));
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const { workUnitId: _w, ...rest } = t;
        return { ...rest, readiness: "ready" as const };
      });
      return {
        workUnits,
        tasks: syncReadiness(tasks),
      };
    }),

  splitWorkUnit: (workUnitId) => {
    const state = get();
    const workUnit = state.workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return null;

    const memberTasks = state.tasks.filter((t) => workUnit.taskIds.includes(t.id));
    const experiments = usePrototypeStore.getState().experiments;
    const experimentsById = Object.fromEntries(experiments.map((e) => [e.id, e]));

    const { primary, secondary } = suggestSplit(
      memberTasks,
      experimentsById,
      state.weights,
    );
    if (secondary.length === 0) return null;

    const primaryWorkUnit = createWorkUnitFromTasks(primary, { id: workUnitId });
    const secondaryWorkUnit = createWorkUnitFromTasks(secondary);

    const workUnits = state.workUnits.map((wu) =>
      wu.id === workUnitId ? primaryWorkUnit : wu,
    );
    workUnits.push(secondaryWorkUnit);

    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return { primary: primaryWorkUnit, secondary: secondaryWorkUnit };
  },

  createTicket: (workUnitId, assigneeId, scheduledDay) => {
    const state = get();
    const workUnit = state.workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return null;

    const existing = state.tickets.find((t) => t.workUnitId === workUnitId);
    if (existing) {
      const updated: Ticket = {
        ...existing,
        assigneeId,
        scheduledDay,
        status: "scheduled",
      };
      set({
        tickets: state.tickets.map((t) => (t.id === existing.id ? updated : t)),
      });
      return updated;
    }

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      workUnitId,
      assigneeId,
      scheduledDay,
      status: "scheduled",
    };
    set({ tickets: [...state.tickets, ticket] });
    return ticket;
  },

  updateTicket: (ticketId, updates) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId ? { ...t, ...updates } : t,
      ),
    })),

  deleteTicket: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
    })),

  updateWorkUnit: (workUnitId, updates) =>
    set((state) => ({
      workUnits: state.workUnits.map((wu) =>
        wu.id === workUnitId ? { ...wu, ...updates } : wu,
      ),
    })),

  setWeights: (weights) => set({ weights }),

  applyWeightPreset: (presetName) =>
    set({
      weights: PRIORITY_WEIGHT_PRESETS[presetName] ?? DEFAULT_PRIORITY_WEIGHTS,
    }),

  markTaskInLabos: (taskId) =>
    set((state) => ({
      tasks: syncReadiness(
        state.tasks.map((t) =>
          t.id === taskId ? { ...t, readiness: "in_labos", workUnitId: undefined } : t,
        ),
      ),
    })),

  getTasksByExperiment: (experimentId) =>
    get().tasks.filter((t) => t.experimentIds.includes(experimentId)),

  getTasksByWorkUnit: (workUnitId) => {
    const workUnit = get().workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return [];
    return get().tasks.filter((t) => workUnit.taskIds.includes(t.id));
  },

  getTicketByWorkUnitId: (workUnitId) =>
    get().tickets.find((t) => t.workUnitId === workUnitId),

  getUnscheduledWorkUnits: () => {
    const state = get();
    const scheduledIds = new Set(state.tickets.map((t) => t.workUnitId));
    return state.workUnits.filter((wu) => !scheduledIds.has(wu.id));
  },

  getWorkUnitPriority: (workUnitId) => {
    const state = get();
    const workUnit = state.workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return null;
    const experiments = usePrototypeStore.getState().experiments;
    const experimentsById = Object.fromEntries(
      experiments.map((e) => {
        const { runs: _r, ...s } = e;
        return [e.id, s];
      }),
    );
    return computeWorkUnitPriority(
      workUnit,
      state.tasks,
      experimentsById,
      state.weights,
    );
  },

  resetToSeed: () => {
    const seed = buildPlanningSeedData();
    set({
      tasks: seed.tasks,
      workUnits: seed.workUnits,
      tickets: seed.tickets,
      weights: DEFAULT_PRIORITY_WEIGHTS,
    });
  },
}));

export const usePlanningTasks = () => usePlanningStore((s) => s.tasks);
export const usePlanningWorkUnits = () => usePlanningStore((s) => s.workUnits);
export const usePlanningTickets = () => usePlanningStore((s) => s.tickets);
export const usePlanningWeights = () => usePlanningStore((s) => s.weights);

export type { BlockedReason };
