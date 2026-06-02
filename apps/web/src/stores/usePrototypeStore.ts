import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import type { 
  StaffMember, 
  ExperimentDetail, 
  Task, 
  ClientRef,
  ExperimentRunSummary,
  TaskNote 
} from "@/types";
import type { ContextItem } from "@/components/context/types";
import { 
  seedClients, 
  seedStaff, 
  seedExperiments, 
  seedTasks, 
  seedContextItems,
  getExperimentById as seedGetExperimentById,
  getTasksByExperiment as seedGetTasksByExperiment,
  getTasksByAssignee as seedGetTasksByAssignee,
  getExperimentsByClient as seedGetExperimentsByClient
} from "@/data/seedData";

interface PrototypeState {
  // Data (initialized with seeds)
  clients: ClientRef[];
  staff: StaffMember[];
  experiments: ExperimentDetail[];
  tasks: Task[];
  contextItems: ContextItem[];
  
  // Client actions
  addClient: (client: Omit<ClientRef, 'id'>) => void;
  updateClient: (id: string, updates: Partial<ClientRef>) => void;
  deleteClient: (id: string) => void;
  
  // Staff actions
  addStaff: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  
  // Experiment actions
  addExperiment: (experiment: Omit<ExperimentDetail, 'id'>) => void;
  updateExperiment: (id: string, updates: Partial<ExperimentDetail>) => void;
  deleteExperiment: (id: string) => void;
  addExperimentRun: (experimentId: string, run: Omit<ExperimentRunSummary, 'id' | 'experimentId'>) => void;
  updateExperimentRun: (experimentId: string, runId: string, updates: Partial<ExperimentRunSummary>) => void;
  deleteExperimentRun: (experimentId: string, runId: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskNote: (taskId: string, note: Omit<TaskNote, 'id'>) => void;
  updateTaskNote: (taskId: string, noteId: string, updates: Partial<TaskNote>) => void;
  deleteTaskNote: (taskId: string, noteId: string) => void;
  
  // Context actions
  addContextItem: (item: Omit<ContextItem, 'id'>) => void;
  updateContextItem: (id: string, updates: Partial<ContextItem>) => void;
  deleteContextItem: (id: string) => void;
  
  // Query helpers (similar to existing mock functions)
  getExperimentById: (id: string) => ExperimentDetail | undefined;
  getTasksByExperiment: (experimentId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getExperimentsByClient: (clientId: string) => ExperimentDetail[];
  getContextItemsByType: (type: ContextItem['type']) => ContextItem[];
  
  // Utility actions
  resetToSeeds: () => void;
}

export const usePrototypeStore = create<PrototypeState>((set, get) => ({
  // Initialize with seed data
  clients: seedClients,
  staff: seedStaff,
  experiments: seedExperiments,
  tasks: seedTasks,
  contextItems: seedContextItems,
  
  // Client actions
  addClient: (clientData) =>
    set((state) => ({
      clients: [
        ...state.clients,
        { ...clientData, id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
      ],
    })),
  
  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
      // Update experiments that reference this client
      experiments: state.experiments.map((exp) =>
        exp.client.id === id ? { ...exp, client: { ...exp.client, ...updates } } : exp
      ),
    })),
  
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
      // Note: In a real app, you'd handle cascading deletes differently
      experiments: state.experiments.filter((exp) => exp.client.id !== id),
    })),
  
  // Staff actions
  addStaff: (staffData) =>
    set((state) => ({
      staff: [
        ...state.staff,
        { ...staffData, id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
      ],
    })),
  
  updateStaff: (id, updates) =>
    set((state) => ({
      staff: state.staff.map((member) =>
        member.id === id ? { ...member, ...updates } : member
      ),
      // Update tasks that reference this staff member
      tasks: state.tasks.map((task) =>
        task.assignee.id === id ? { ...task, assignee: { ...task.assignee, ...updates } } : task
      ),
    })),
  
  deleteStaff: (id) =>
    set((state) => ({
      staff: state.staff.filter((member) => member.id !== id),
      // Unassign tasks from deleted staff member (set to first available staff)
      tasks: state.tasks.map((task) =>
        task.assignee.id === id ? { ...task, assignee: state.staff[0] || { id: 'unassigned', name: 'Unassigned' } } : task
      ),
    })),
  
  // Experiment actions
  addExperiment: (experimentData) =>
    set((state) => {
      const newId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        experiments: [
          ...state.experiments,
          { ...experimentData, id: newId },
        ],
      };
    }),
  
  updateExperiment: (id, updates) =>
    set((state) => ({
      experiments: state.experiments.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
      // Update tasks that reference this experiment
      tasks: state.tasks.map((task) =>
        task.experiment.id === id 
          ? { ...task, experiment: { ...task.experiment, ...updates } }
          : task
      ),
    })),
  
  deleteExperiment: (id) =>
    set((state) => ({
      experiments: state.experiments.filter((exp) => exp.id !== id),
      // Delete associated tasks
      tasks: state.tasks.filter((task) => task.experiment.id !== id),
    })),
  
  addExperimentRun: (experimentId, runData) =>
    set((state) => ({
      experiments: state.experiments.map((exp) =>
        exp.id === experimentId
          ? {
              ...exp,
              runs: [
                ...exp.runs,
                {
                  ...runData,
                  id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  experimentId,
                },
              ],
            }
          : exp
      ),
    })),
  
  updateExperimentRun: (experimentId, runId, updates) =>
    set((state) => ({
      experiments: state.experiments.map((exp) =>
        exp.id === experimentId
          ? {
              ...exp,
              runs: exp.runs.map((run) =>
                run.id === runId ? { ...run, ...updates } : run
              ),
            }
          : exp
      ),
      // Update tasks that reference this run
      tasks: state.tasks.map((task) =>
        task.run.id === runId ? { ...task, run: { ...task.run, ...updates } } : task
      ),
    })),
  
  deleteExperimentRun: (experimentId, runId) =>
    set((state) => ({
      experiments: state.experiments.map((exp) =>
        exp.id === experimentId
          ? { ...exp, runs: exp.runs.filter((run) => run.id !== runId) }
          : exp
      ),
      // Delete tasks associated with this run
      tasks: state.tasks.filter((task) => task.run.id !== runId),
    })),
  
  // Task actions
  addTask: (taskData) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { 
          ...taskData, 
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          notes: taskData.notes || [],
        },
      ],
    })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  
  addTaskNote: (taskId, noteData) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              notes: [
                ...task.notes,
                {
                  ...noteData,
                  id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  createdAt: noteData.createdAt || new Date().toISOString(),
                },
              ],
            }
          : task
      ),
    })),
  
  updateTaskNote: (taskId, noteId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              notes: task.notes.map((note) =>
                note.id === noteId ? { ...note, ...updates } : note
              ),
            }
          : task
      ),
    })),
  
  deleteTaskNote: (taskId, noteId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, notes: task.notes.filter((note) => note.id !== noteId) }
          : task
      ),
    })),
  
  // Context actions
  addContextItem: (itemData) =>
    set((state) => ({
      contextItems: [
        ...state.contextItems,
        { 
          ...itemData, 
          id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          addedAt: itemData.addedAt || new Date().toISOString(),
        } as ContextItem,
      ],
    })),
  
  updateContextItem: (id, updates) =>
    set((state) => ({
      contextItems: state.contextItems.map((item) =>
        item.id === id ? { ...item, ...updates } as ContextItem : item
      ),
    })),
  
  deleteContextItem: (id) =>
    set((state) => ({
      contextItems: state.contextItems.filter((item) => item.id !== id),
    })),
  
  // Query helpers
  getExperimentById: (id) => {
    const state = get();
    return state.experiments.find((exp) => exp.id === id);
  },
  
  getTasksByExperiment: (experimentId) => {
    const state = get();
    return state.tasks.filter((task) => task.experiment.id === experimentId);
  },
  
  getTasksByAssignee: (assigneeId) => {
    const state = get();
    return state.tasks.filter((task) => task.assignee.id === assigneeId);
  },
  
  getExperimentsByClient: (clientId) => {
    const state = get();
    return state.experiments.filter((exp) => exp.client.id === clientId);
  },
  
  getContextItemsByType: (type) => {
    const state = get();
    return state.contextItems.filter((item) => item.type === type);
  },
  
  // Utility actions
  resetToSeeds: () =>
    set({
      clients: seedClients,
      staff: seedStaff,
      experiments: seedExperiments,
      tasks: seedTasks,
      contextItems: seedContextItems,
    }),
}));

// Export selector hooks for common queries to optimize re-renders
export const useExperiments = () => usePrototypeStore(state => state.experiments);
export const useTasks = () => usePrototypeStore(state => state.tasks);
export const useStaff = () => usePrototypeStore(state => state.staff);
export const useClients = () => usePrototypeStore(state => state.clients);
export const useContextItems = () => usePrototypeStore(state => state.contextItems);

// Computed selectors
export const useExperimentById = (id: string) => 
  usePrototypeStore((state) => state.experiments.find(exp => exp.id === id));

export const useTasksByExperiment = (experimentId: string) =>
  usePrototypeStore((state) => state.tasks.filter(task => task.experiment.id === experimentId));

export const useTasksByAssignee = (assigneeId: string) =>
  usePrototypeStore((state) => state.tasks.filter(task => task.assignee.id === assigneeId));

export const useExperimentsByClient = (clientId: string) =>
  usePrototypeStore((state) => state.experiments.filter(exp => exp.client.id === clientId));

export const useContextItemsByType = (type: ContextItem['type']) =>
  usePrototypeStore((state) => state.contextItems.filter(item => item.type === type));

// Use individual selectors to avoid object recreation
export const useExperimentCount = () => usePrototypeStore(state => state.experiments.length);
export const useTaskCount = () => usePrototypeStore(state => state.tasks.length);
export const useStaffCount = () => usePrototypeStore(state => state.staff.length);
export const useContextItemCount = () => usePrototypeStore(state => state.contextItems.length);
// Individual status count selectors to avoid object recreation
export const usePendingTaskCount = () => usePrototypeStore(state => 
  state.tasks.filter(task => task.status === 'pending').length
);
export const useSuccessTaskCount = () => usePrototypeStore(state => 
  state.tasks.filter(task => task.status === 'success').length
);
export const useFailedTaskCount = () => usePrototypeStore(state => 
  state.tasks.filter(task => task.status === 'failed').length
);