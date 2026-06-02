import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { usePrototypeStore, useTasks as useTasksStore, useTasksByExperiment, useTasksByAssignee } from '@/stores/usePrototypeStore';
import type { Task, TaskNote, TaskStatus } from '@/types';

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

// Tasks filtered by experiment
export { useTasksByExperiment };

// Tasks filtered by assignee
export { useTasksByAssignee };

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
      task.assignee.id === assigneeId && task.status === 'pending'
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
      assigneeMap.set(task.assignee.id, task.assignee);
    });
    return Array.from(assigneeMap.values());
  }, [tasks]);
};

// Task notes management
export const useTaskNotes = (taskId: string) => {
  const task = usePrototypeStore((state) => state.tasks.find(t => t.id === taskId));
  const addTaskNote = usePrototypeStore((state) => state.addTaskNote);
  const updateTaskNote = usePrototypeStore((state) => state.updateTaskNote);
  const deleteTaskNote = usePrototypeStore((state) => state.deleteTaskNote);
  
  return {
    notes: task?.notes || [],
    addNote: (note: Omit<TaskNote, 'id'>) => addTaskNote(taskId, note),
    updateNote: (noteId: string, updates: Partial<TaskNote>) => 
      updateTaskNote(taskId, noteId, updates),
    deleteNote: (noteId: string) => deleteTaskNote(taskId, noteId),
  };
};

// Get recent notes across all tasks
export const useRecentTaskNotes = (limit = 10) => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    const allNotes = tasks.flatMap((task) => 
      task.notes.map((note) => ({ 
        ...note, 
        taskId: task.id, 
        taskTitle: task.title 
      }))
    );
    
    return allNotes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [tasks, limit]);
};

// Task statistics
export const useTaskStats = () => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    const stats = {
      total: tasks.length,
      byStatus: { pending: 0, success: 0, failed: 0 } as Record<TaskStatus, number>,
      byAssignee: {} as Record<string, number>,
      totalNotes: 0,
      completionRate: 0,
    };
    
    tasks.forEach((task) => {
      stats.byStatus[task.status]++;
      stats.byAssignee[task.assignee.name] = (stats.byAssignee[task.assignee.name] || 0) + 1;
      stats.totalNotes += task.notes.length;
    });
    
    stats.completionRate = stats.total > 0 
      ? Math.round((stats.byStatus.success / stats.total) * 100)
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
    return tasks.filter((task) => 
      task.status === 'failed' || 
      task.notes.length > 3 // Tasks with many notes might need attention
    );
  }, [tasks]);
};

// Search tasks by title or notes content
export const useTaskSearch = (query: string) => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    if (!query.trim()) return tasks;
    
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter((task) => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.assignee.name.toLowerCase().includes(lowercaseQuery) ||
      task.experiment.name.toLowerCase().includes(lowercaseQuery) ||
      task.experiment.code.toLowerCase().includes(lowercaseQuery) ||
      task.notes.some(note => 
        note.body.toLowerCase().includes(lowercaseQuery) ||
        note.author.name.toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [tasks, query]);
};

// Get tasks that need attention (pending with old notes or failed status)
export const useTasksNeedingAttention = () => {
  const tasks = useTasksStore();
  
  return useMemo(() => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
    
    return tasks.filter((task) => {
      if (task.status === 'failed') return true;
      
      if (task.status === 'pending' && task.notes.length > 0) {
        const lastNoteDate = new Date(task.notes[task.notes.length - 1].createdAt);
        return lastNoteDate < twoDaysAgo;
      }
      
      return false;
    });
  }, [tasks]);
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