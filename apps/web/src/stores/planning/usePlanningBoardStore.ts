import { create } from "zustand";

import { buildPlanningSeedData } from "@/data/prototype-mock-data";
import { getDefaultPlanningDay } from "@/domain/planning/constants";
import { DEFAULT_PRIORITY_WEIGHTS } from "@/domain/priority";
import {
  clampPlanningDay,
  stepPlanningDay as stepPlanningDayByDelta,
} from "@/domain/planning/planning-dates";
import type { Ticket } from "@/domain/ticket/types";
import {
  attachTasksToWorkUnits,
  createWorkUnitFromTasks,
  groupIntoDraftWorkUnits,
  suggestSplit,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import { createRerunTasks } from "@/domain/task";
import type { Task } from "@/types";
import { buildExperimentsById } from "@/hooks/useExperimentsById";

import {
  createExperimentRunFromWizard as runCreateExperimentRunFromWizard,
  createStandalonePlanningTask,
  scaffoldFromExperiment as runScaffoldFromExperiment,
  syncTaskReadiness,
} from "./experiment-run-actions";
import {
  getTasksByExperiment as selectTasksByExperiment,
  getTasksByWorkUnit as selectTasksByWorkUnit,
  getTicketByWorkUnitId as selectTicketByWorkUnitId,
  getUnscheduledWorkUnits as selectUnscheduledWorkUnits,
  getWorkUnitPriority as selectWorkUnitPriority,
} from "./planning-board-selectors";
import { usePlanningPreferencesStore } from "./usePlanningPreferencesStore";
import { usePrototypeStore } from "../usePrototypeStore";
import type { RunCreationDraft } from "@/domain/run-creation/draft";
import type { SelectableRunStep } from "@/domain/run-creation/types";
import type { StandaloneTaskContext } from "@/domain/task/scaffold";
import type { ExperimentRunSummary } from "@/types/experiment";

const initialSeed = buildPlanningSeedData();

function experimentRunDeps() {
  return {
    getPrototypeState: () => usePrototypeStore.getState(),
    appendTasks: (tasks: Task[]) => {
      usePlanningBoardStore.setState((state) => ({
        tasks: syncTaskReadiness([...state.tasks, ...tasks]),
      }));
    },
  };
}

interface PlanningBoardState {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
  currentDay: string;

  addTask: (task: Omit<Task, "id"> & { id?: string }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  scaffoldFromExperiment: (experimentId: string) => Task[];
  createExperimentRunFromWizard: (payload: {
    experimentId: string;
    runName: string;
    selectedSteps: SelectableRunStep[];
    drafts: RunCreationDraft;
  }) => { run: ExperimentRunSummary; tasks: Task[] } | null;
  createStandaloneTask: (
    taskTemplateId: string,
    params?: Record<string, unknown>,
    context?: StandaloneTaskContext,
  ) => Task;
  createRerunFromTasks: (taskIds: string[]) => Task[];

  groupReadyIntoWorkUnits: () => WorkUnit[];
  createWorkUnitFromReadyTasks: (taskIds: string[]) => WorkUnit | null;
  createSplitUnitsFromReadyTasks: (
    taskIds: string[],
  ) => { primary: WorkUnit; secondary: WorkUnit } | null;
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
  unscheduleTicket: (ticketId: string) => void;
  revertTicketToQueue: (ticketId: string) => void;
  dissolveWorkUnit: (workUnitId: string) => void;

  updateWorkUnit: (workUnitId: string, updates: Partial<WorkUnit>) => void;

  setCurrentDay: (day: string) => void;
  stepPlanningDay: (delta: number) => void;

  markTaskInLabos: (taskId: string) => void;

  sendTicketToLabOs: (workUnitId: string) => void;
  completeWorkUnitTasks: (workUnitId: string) => void;
  failWorkUnitTasks: (workUnitId: string) => void;

  getTasksByExperiment: (experimentId: string) => Task[];
  getTasksByWorkUnit: (workUnitId: string) => Task[];
  getTicketByWorkUnitId: (workUnitId: string) => Ticket | undefined;
  getUnscheduledWorkUnits: () => WorkUnit[];
  getWorkUnitPriority: (
    workUnitId: string,
  ) => ReturnType<typeof selectWorkUnitPriority>;

  resetToSeed: () => void;
}

export const usePlanningBoardStore = create<PlanningBoardState>((set, get) => ({
  tasks: initialSeed.tasks,
  workUnits: initialSeed.workUnits,
  tickets: initialSeed.tickets,
  currentDay: getDefaultPlanningDay(),

  addTask: (taskData) =>
    set((state) => {
      const task: Task = {
        ...taskData,
        id: taskData.id ?? `task-${Date.now()}`,
        createdAt: taskData.createdAt ?? new Date().toISOString(),
      };
      return { tasks: syncTaskReadiness([...state.tasks, task]) };
    }),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: syncTaskReadiness(
        state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      workUnits: state.workUnits.map((workUnit) => ({
        ...workUnit,
        taskIds: workUnit.taskIds.filter((taskId) => taskId !== id),
      })),
    })),

  scaffoldFromExperiment: (experimentId) =>
    runScaffoldFromExperiment(experimentId, experimentRunDeps()),

  createExperimentRunFromWizard: (payload) =>
    runCreateExperimentRunFromWizard(payload, experimentRunDeps()),

  createStandaloneTask: (taskTemplateId, params = {}, context = {}) => {
    const task = createStandalonePlanningTask(taskTemplateId, params, context);
    set((state) => ({
      tasks: syncTaskReadiness([...state.tasks, task]),
    }));
    return task;
  },

  createRerunFromTasks: (taskIds) => {
    const state = get();
    const sources = state.tasks.filter((task) => taskIds.includes(task.id));
    const reruns = createRerunTasks(sources);
    set({ tasks: syncTaskReadiness([...state.tasks, ...reruns]) });
    return reruns;
  },

  groupReadyIntoWorkUnits: () => {
    const state = get();
    const unbatched = state.tasks.filter(
      (task) => task.readiness === "ready" && !task.workUnitId,
    );
    const newWorkUnits = groupIntoDraftWorkUnits(unbatched);
    const workUnits = [...state.workUnits, ...newWorkUnits];
    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return newWorkUnits;
  },

  createWorkUnitFromReadyTasks: (taskIds) => {
    const state = get();
    const selected = state.tasks.filter((task) => taskIds.includes(task.id));
    if (selected.length === 0) return null;

    const newWorkUnit = createWorkUnitFromTasks(selected);
    const workUnits = [...state.workUnits, newWorkUnit];
    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return newWorkUnit;
  },

  createSplitUnitsFromReadyTasks: (taskIds) => {
    const state = get();
    const selected = state.tasks.filter((task) => taskIds.includes(task.id));
    if (selected.length === 0) return null;

    const experimentsById = buildExperimentsById(
      usePrototypeStore.getState().experiments,
    );
    const weights = usePlanningPreferencesStore.getState().weights;
    const { primary, secondary } = suggestSplit(
      selected,
      experimentsById,
      weights,
      state.currentDay,
    );
    if (secondary.length === 0) return null;

    const primaryWorkUnit = createWorkUnitFromTasks(primary);
    const secondaryWorkUnit = createWorkUnitFromTasks(secondary);
    const workUnits = [...state.workUnits, primaryWorkUnit, secondaryWorkUnit];
    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return { primary: primaryWorkUnit, secondary: secondaryWorkUnit };
  },

  addTaskToWorkUnit: (taskId, workUnitId) =>
    set((state) => {
      const workUnits = state.workUnits.map((workUnit) =>
        workUnit.id === workUnitId
          ? { ...workUnit, taskIds: [...new Set([...workUnit.taskIds, taskId])] }
          : workUnit,
      );
      const tasks = attachTasksToWorkUnits(
        state.tasks.map((task) =>
          task.id === taskId ? { ...task, workUnitId, readiness: "batched" } : task,
        ),
        workUnits,
      );
      return { workUnits, tasks };
    }),

  removeTaskFromWorkUnit: (taskId) =>
    set((state) => {
      const workUnits = state.workUnits.map((workUnit) => ({
        ...workUnit,
        taskIds: workUnit.taskIds.filter((id) => id !== taskId),
      }));
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const { workUnitId: _workUnitId, ...rest } = task;
        return { ...rest, readiness: "ready" as const };
      });
      return {
        workUnits,
        tasks: syncTaskReadiness(tasks),
      };
    }),

  splitWorkUnit: (workUnitId) => {
    const state = get();
    const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
    if (!workUnit) return null;

    const memberTasks = state.tasks.filter((task) => workUnit.taskIds.includes(task.id));
    const experimentsById = buildExperimentsById(
      usePrototypeStore.getState().experiments,
    );
    const weights = usePlanningPreferencesStore.getState().weights;

    const { primary, secondary } = suggestSplit(
      memberTasks,
      experimentsById,
      weights,
      state.currentDay,
    );
    if (secondary.length === 0) return null;

    const primaryWorkUnit = createWorkUnitFromTasks(primary, { id: workUnitId });
    const secondaryWorkUnit = createWorkUnitFromTasks(secondary);

    const workUnits = state.workUnits.map((unit) =>
      unit.id === workUnitId ? primaryWorkUnit : unit,
    );
    workUnits.push(secondaryWorkUnit);

    const tasks = attachTasksToWorkUnits(state.tasks, workUnits);
    set({ workUnits, tasks });
    return { primary: primaryWorkUnit, secondary: secondaryWorkUnit };
  },

  createTicket: (workUnitId, assigneeId, scheduledDay) => {
    const state = get();
    const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
    if (!workUnit) return null;

    const existing = state.tickets.find((ticket) => ticket.workUnitId === workUnitId);
    if (existing) {
      const updated: Ticket = {
        ...existing,
        assigneeId,
        scheduledDay,
        status: "scheduled",
      };
      set({
        tickets: state.tickets.map((ticket) =>
          ticket.id === existing.id ? updated : ticket,
        ),
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
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket,
      ),
    })),

  deleteTicket: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== ticketId),
    })),

  unscheduleTicket: (ticketId) => {
    get().deleteTicket(ticketId);
  },

  revertTicketToQueue: (ticketId) =>
    set((state) => {
      const ticket = state.tickets.find((entry) => entry.id === ticketId);
      if (!ticket) return state;

      const workUnit = state.workUnits.find((unit) => unit.id === ticket.workUnitId);
      if (!workUnit) {
        return { tickets: state.tickets.filter((entry) => entry.id !== ticketId) };
      }

      const taskIds = new Set(workUnit.taskIds);
      return {
        tickets: state.tickets.filter((entry) => entry.id !== ticketId),
        workUnits: state.workUnits.filter((unit) => unit.id !== workUnit.id),
        tasks: syncTaskReadiness(
          state.tasks.map((task) => {
            if (!taskIds.has(task.id)) return task;
            const { workUnitId: _removed, ...rest } = task;
            return { ...rest, readiness: "ready" as const };
          }),
        ),
      };
    }),

  dissolveWorkUnit: (workUnitId) =>
    set((state) => {
      const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
      if (!workUnit) return state;

      const isScheduled = state.tickets.some((ticket) => ticket.workUnitId === workUnitId);
      if (isScheduled) return state;

      const taskIds = new Set(workUnit.taskIds);
      return {
        workUnits: state.workUnits.filter((unit) => unit.id !== workUnitId),
        tasks: syncTaskReadiness(
          state.tasks.map((task) => {
            if (!taskIds.has(task.id)) return task;
            const { workUnitId: _removed, ...rest } = task;
            return { ...rest, readiness: "ready" as const };
          }),
        ),
      };
    }),

  updateWorkUnit: (workUnitId, updates) =>
    set((state) => ({
      workUnits: state.workUnits.map((unit) =>
        unit.id === workUnitId ? { ...unit, ...updates } : unit,
      ),
    })),

  setCurrentDay: (day) => set({ currentDay: clampPlanningDay(day) }),

  stepPlanningDay: (delta) =>
    set((state) => ({
      currentDay: stepPlanningDayByDelta(state.currentDay, delta),
    })),

  markTaskInLabos: (taskId) =>
    set((state) => ({
      tasks: syncTaskReadiness(
        state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, readiness: "in_labos", workUnitId: undefined }
            : task,
        ),
      ),
    })),

  sendTicketToLabOs: (workUnitId) =>
    set((state) => {
      const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
      if (!workUnit) return state;

      const taskIds = new Set(workUnit.taskIds);
      const ticket = state.tickets.find((entry) => entry.workUnitId === workUnitId);

      return {
        tasks: syncTaskReadiness(
          state.tasks.map((task) =>
            taskIds.has(task.id)
              ? { ...task, readiness: "in_labos" as const, status: "in_progress" as const }
              : task,
          ),
        ),
        tickets: ticket
          ? state.tickets.map((entry) =>
              entry.id === ticket.id ? { ...entry, status: "sent" as const } : entry,
            )
          : state.tickets,
      };
    }),

  completeWorkUnitTasks: (workUnitId) =>
    set((state) => {
      const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
      if (!workUnit) return state;

      const taskIds = new Set(workUnit.taskIds);
      return {
        tasks: syncTaskReadiness(
          state.tasks.map((task) =>
            taskIds.has(task.id) ? { ...task, status: "completed" as const } : task,
          ),
        ),
      };
    }),

  failWorkUnitTasks: (workUnitId) =>
    set((state) => {
      const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
      if (!workUnit) return state;

      const taskIds = new Set(workUnit.taskIds);
      return {
        tasks: syncTaskReadiness(
          state.tasks.map((task) =>
            taskIds.has(task.id) ? { ...task, status: "failed" as const } : task,
          ),
        ),
      };
    }),

  getTasksByExperiment: (experimentId) =>
    selectTasksByExperiment(get().tasks, experimentId),

  getTasksByWorkUnit: (workUnitId) =>
    selectTasksByWorkUnit(get().tasks, get().workUnits, workUnitId),

  getTicketByWorkUnitId: (workUnitId) =>
    selectTicketByWorkUnitId(get().tickets, workUnitId),

  getUnscheduledWorkUnits: () =>
    selectUnscheduledWorkUnits(get().workUnits, get().tickets),

  getWorkUnitPriority: (workUnitId) => {
    const state = get();
    const experimentsById = buildExperimentsById(
      usePrototypeStore.getState().experiments,
    );
    return selectWorkUnitPriority(
      workUnitId,
      {
        workUnits: state.workUnits,
        tasks: state.tasks,
        weights: usePlanningPreferencesStore.getState().weights,
        currentDay: state.currentDay,
      },
      experimentsById,
    );
  },

  resetToSeed: () => {
    const seed = buildPlanningSeedData();
    set({
      tasks: seed.tasks,
      workUnits: seed.workUnits,
      tickets: seed.tickets,
      currentDay: getDefaultPlanningDay(),
    });
    usePlanningPreferencesStore.setState({ weights: DEFAULT_PRIORITY_WEIGHTS });
  },
}));

export const usePlanningTasks = () => usePlanningBoardStore((state) => state.tasks);
export const usePlanningWorkUnits = () => usePlanningBoardStore((state) => state.workUnits);
export const usePlanningTickets = () => usePlanningBoardStore((state) => state.tickets);
export const usePlanningCurrentDay = () => usePlanningBoardStore((state) => state.currentDay);
