import { useMemo } from 'react';
import { usePrototypeStore, useTasks as useTasksStore } from '@/stores/usePrototypeStore';
import type { Task, TaskStatus } from '@/types';
import { getTaskDisplayName } from '@/types/task';

const EMPTY_TASKS: Task[] = [];

/** Stable task list for a run — avoids Zustand getSnapshot returning a new array every read. */
export function useTasksByRun(runId: string): Task[] {
  const tasks = useTasksStore();
  return useMemo(() => {
    const filtered = tasks.filter((task) => task.runId === runId);
    return filtered.length > 0 ? filtered : EMPTY_TASKS;
  }, [tasks, runId]);
}

export function useTasksByExperiment(experimentId: string): Task[] {
  const tasks = useTasksStore();
  return useMemo(() => {
    const filtered = tasks.filter((task) => task.experimentId === experimentId);
    return filtered.length > 0 ? filtered : EMPTY_TASKS;
  }, [tasks, experimentId]);
}

export function useTasksByAssignee(assigneeId: string): Task[] {
  const tasks = useTasksStore();
  return useMemo(() => {
    const filtered = tasks.filter((task) => task.assignee?.id === assigneeId);
    return filtered.length > 0 ? filtered : EMPTY_TASKS;
  }, [tasks, assigneeId]);
}

// Main tasks hook with actions  
export const useTasks = () => {
  const tasks = useTasksStore();
  const addTask = usePrototypeStore(state => state.addTask);
  const updateTask = usePrototypeStore(state => state.updateTask);
  const deleteTask = usePrototypeStore(state => state.deleteTask);
  
  return useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
  }), [tasks, addTask, updateTask, deleteTask]);
};

// Get single task by ID
export const useTask = (id: string) => {
  const task = usePrototypeStore((state) => state.tasks.find(t => t.id === id));
  const updateTask = usePrototypeStore((state) => state.updateTask);
  const deleteTask = usePrototypeStore((state) => state.deleteTask);
  
  return {
    task,
    updateTask: (updates: Partial<Task>) => updateTask(id, updates),
    deleteTask: () => deleteTask(id),
  };
};

// Tasks filtered by status
export const useTasksByStatus = (status: TaskStatus) => {
  const tasks = useTasksStore();
  
  return useMemo(
    () => tasks.filter((task) => task.status === status),
    [tasks, status]
  );
};

// Tasks filtered by multiple statuses
export const useTasksByStatuses = (statuses: TaskStatus[]) => {
  const tasks = useTasksStore();
  
  return useMemo(
    () => tasks.filter((task) => statuses.includes(task.status)),
    [tasks, statuses]
  );
};

// Get pending tasks for a specific assignee
export const usePendingTasksByAssignee = (assigneeId: string) => {
  const tasks = useTasksStore();
  
  return useMemo(
    () => tasks.filter((task) => 
      task.assignee?.id === assigneeId && task.status === 'pending'
    ),
    [tasks, assigneeId]
  );
};

// Get all assignees from tasks
export const useAssigneesFromTasks = () => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    const assigneeMap = new Map();
    tasks.forEach((task) => {
      if (task.assignee) {
        assigneeMap.set(task.assignee.id, task.assignee);
      }
    });
    return Array.from(assigneeMap.values());
  }, [tasks]);
};

// Task statistics
export const useTaskStats = () => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    const stats = {
      total: tasks.length,
      byStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        failed: 0,
        blocked: 0,
        cancelled: 0,
      } satisfies Record<TaskStatus, number>,
      byAssignee: {} as Record<string, number>,
      completionRate: 0,
    };
    
    tasks.forEach((task) => {
      stats.byStatus[task.status]++;
      if (task.assignee) {
        stats.byAssignee[task.assignee.name] =
          (stats.byAssignee[task.assignee.name] || 0) + 1;
      }
    });
    
    stats.completionRate = stats.total > 0
      ? Math.round((stats.byStatus.completed / stats.total) * 100)
      : 0;
    
    return stats;
  }, [tasks]);
};

// Get overdue or high priority tasks (mock logic for priority)
export const useHighPriorityTasks = () => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    // In a real app, you'd have due dates or priority fields
    // For now, we'll consider failed tasks as high priority
    return tasks.filter((task) => task.status === 'failed');
  }, [tasks]);
};

// Search tasks by name, assignee, or experiment
export const useTaskSearch = (query: string) => {
  const tasks = useTasksStore();
  const experiments = usePrototypeStore((state) => state.experiments);

  return useMemo(() => {
    if (!query.trim()) return tasks;

    const lowercaseQuery = query.toLowerCase();
    const experimentsById = Object.fromEntries(
      experiments.map((experiment) => [experiment.id, experiment]),
    );

    return tasks.filter((task) => {
      const experiment = task.experimentId
        ? experimentsById[task.experimentId]
        : undefined;
      return (
        getTaskDisplayName(task).toLowerCase().includes(lowercaseQuery) ||
        (task.assignee?.name.toLowerCase().includes(lowercaseQuery) ?? false) ||
        (experiment?.name.toLowerCase().includes(lowercaseQuery) ?? false) ||
        (experiment?.code.toLowerCase().includes(lowercaseQuery) ?? false)
      );
    });
  }, [tasks, query, experiments]);
};

// Get tasks that need attention (failed status)
export const useTasksNeedingAttention = () => {
  const tasks = useTasksStore();

  return useMemo(() => tasks.filter((task) => task.status === "failed"), [tasks]);
};

// Bulk task operations
export const useBulkTaskOperations = () => {
  const updateTask = usePrototypeStore((state) => state.updateTask);
  const deleteTask = usePrototypeStore((state) => state.deleteTask);
  
  return {
    bulkUpdateStatus: (taskIds: string[], status: TaskStatus) => {
      taskIds.forEach((id) => updateTask(id, { status }));
    },
    bulkReassign: (taskIds: string[], assignee: Task['assignee']) => {
      taskIds.forEach((id) => updateTask(id, { assignee }));
    },
    bulkDelete: (taskIds: string[]) => {
      taskIds.forEach((id) => deleteTask(id));
    },
  };
};