import { create } from "zustand";
import type { BlockedReason } from "@/domain/blocked-reason";
import {
  computeWorkUnitPriority,
  createWorkUnitFromTasks,
  groupIntoDraftWorkUnits,
  suggestSplit,
} from "@/domain/work-unit";
import type { WorkUnit, WorkUnitNote } from "@/domain/work-unit/types";
import { buildPlanningSeedData } from "@/domain/seed";
import {
  DEFAULT_PRIORITY_WEIGHTS,
  PRIORITY_WEIGHT_PRESETS,
  type PriorityWeights,
} from "@/domain/priority";
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

  assignWorkUnit: (workUnitId: string, assigneeIds: string[]) => void;
  scheduleWorkUnit: (workUnitId: string, scheduledDay: string) => void;
  addWorkUnitNote: (workUnitId: string, note: Omit<WorkUnitNote, "id">) => void;
  updateWorkUnit: (workUnitId: string, updates: Partial<WorkUnit>) => void;

  setWeights: (weights: PriorityWeights) => void;
  applyWeightPreset: (presetName: keyof typeof PRIORITY_WEIGHT_PRESETS) => void;

  markTaskInLabos: (taskId: string) => void;

  getTasksByExperiment: (experimentId: string) => Task[];
  getTasksByWorkUnit: (workUnitId: string) => Task[];
  getWorkUnitPriority: (workUnitId: string) => ReturnType<typeof computeWorkUnitPriority>;

  resetToSeed: () => void;
}

function syncReadiness(tasks: Task[]): Task[] {
  return refreshAllTaskReadiness(tasks);
}

function attachTasksToWorkUnits(tasks: Task[], workUnits: WorkUnit[]): Task[] {
  const workUnitByTask = new Map<string, string>();
  for (const workUnit of workUnits) {
    for (const tid of workUnit.taskIds) {
      workUnitByTask.set(tid, workUnit.id);
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

  assignWorkUnit: (workUnitId, assigneeIds) =>
    set((state) => ({
      workUnits: state.workUnits.map((wu) =>
        wu.id === workUnitId ? { ...wu, assigneeIds } : wu,
      ),
    })),

  scheduleWorkUnit: (workUnitId, scheduledDay) =>
    set((state) => ({
      workUnits: state.workUnits.map((wu) =>
        wu.id === workUnitId ? { ...wu, scheduledDay, status: "ready" } : wu,
      ),
    })),

  addWorkUnitNote: (workUnitId, noteData) =>
    set((state) => ({
      workUnits: state.workUnits.map((wu) =>
        wu.id === workUnitId
          ? {
              ...wu,
              notes: [
                ...wu.notes,
                {
                  ...noteData,
                  id: `work-unit-note-${Date.now()}`,
                  createdAt: noteData.createdAt ?? new Date().toISOString(),
                },
              ],
            }
          : wu,
      ),
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
      weights: DEFAULT_PRIORITY_WEIGHTS,
    });
  },
}));

export const usePlanningTasks = () => usePlanningStore((s) => s.tasks);
export const usePlanningWorkUnits = () => usePlanningStore((s) => s.workUnits);
export const usePlanningWeights = () => usePlanningStore((s) => s.weights);

export type { BlockedReason };
