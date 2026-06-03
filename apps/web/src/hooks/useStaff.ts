import { useMemo } from 'react';
import { usePrototypeStore, useStaff as useStaffStore } from '@/stores/usePrototypeStore';
import type { StaffMember } from '@/types';

// Main staff hook with actions
export const useStaff = () => {
  return usePrototypeStore(state => ({
    staff: state.staff,
    addStaff: state.addStaff,
    updateStaff: state.updateStaff,
    deleteStaff: state.deleteStaff,
  }));
};

// Get single staff member by ID
export const useStaffMember = (id: string) => {
  const staffMember = usePrototypeStore((state) => 
    state.staff.find(member => member.id === id)
  );
  const updateStaff = usePrototypeStore((state) => state.updateStaff);
  const deleteStaff = usePrototypeStore((state) => state.deleteStaff);
  
  return {
    staffMember,
    updateStaff: (updates: Partial<StaffMember>) => updateStaff(id, updates),
    deleteStaff: () => deleteStaff(id),
  };
};

// Get staff member workload (number of assigned tasks)
export const useStaffWorkload = () => {
  const staff = useStaffStore();
  const tasks = usePrototypeStore((state) => state.tasks);
  
  return useMemo(() => {
    const workload = new Map<string, {
      member: StaffMember;
      totalTasks: number;
      pendingTasks: number;
      successTasks: number;
      failedTasks: number;
    }>();
    
    // Initialize workload for all staff
    staff.forEach((member) => {
      workload.set(member.id, {
        member,
        totalTasks: 0,
        pendingTasks: 0,
        successTasks: 0,
        failedTasks: 0,
      });
    });
    
    // Count tasks for each staff member
    tasks.forEach((task) => {
      if (!task.assignee) return;
      const memberWorkload = workload.get(task.assignee.id);
      if (memberWorkload) {
        memberWorkload.totalTasks++;
        switch (task.status) {
          case 'pending':
            memberWorkload.pendingTasks++;
            break;
          case 'completed':
            memberWorkload.successTasks++;
            break;
          case 'failed':
            memberWorkload.failedTasks++;
            break;
        }
      }
    });
    
    return Array.from(workload.values());
  }, [staff, tasks]);
};

// Get staff members sorted by workload
export const useStaffByWorkload = (ascending = false) => {
  const workload = useStaffWorkload();
  
  return useMemo(() => {
    return [...workload].sort((a, b) => 
      ascending 
        ? a.totalTasks - b.totalTasks 
        : b.totalTasks - a.totalTasks
    );
  }, [workload, ascending]);
};

// Get available staff (those with less workload)
export const useAvailableStaff = (maxPendingTasks = 3) => {
  const workload = useStaffWorkload();
  
  return useMemo(() => {
    return workload.filter((item) => item.pendingTasks <= maxPendingTasks);
  }, [workload, maxPendingTasks]);
};

// Get staff performance metrics
export const useStaffPerformance = () => {
  const workload = useStaffWorkload();
  
  return useMemo(() => {
    return workload.map((item) => ({
      ...item,
      completionRate: item.totalTasks > 0 
        ? Math.round((item.successTasks / item.totalTasks) * 100)
        : 0,
      failureRate: item.totalTasks > 0 
        ? Math.round((item.failedTasks / item.totalTasks) * 100)
        : 0,
    }));
  }, [workload]);
};

// Recent tasks assigned to this staff member
export const useStaffActivity = (staffId: string, limit = 10) => {
  const tasks = usePrototypeStore((state) => state.tasks);
  const experiments = usePrototypeStore((state) => state.experiments);

  return useMemo(() => {
    const experimentsById = Object.fromEntries(
      experiments.map((experiment) => [experiment.id, experiment]),
    );

    return tasks
      .filter((task) => task.assignee?.id === staffId)
      .map((task) => ({
        id: task.id,
        createdAt: task.createdAt,
        taskId: task.id,
        taskTitle: task.name ?? task.taskTemplateId,
        experimentCode:
          task.experimentId != null
            ? (experimentsById[task.experimentId]?.code ?? "")
            : "",
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [tasks, experiments, staffId, limit]);
};

// Search staff by name
export const useStaffSearch = (query: string) => {
  const staff = useStaffStore();
  
  return useMemo(() => {
    if (!query.trim()) return staff;
    
    const lowercaseQuery = query.toLowerCase();
    return staff.filter((member) => 
      member.name.toLowerCase().includes(lowercaseQuery)
    );
  }, [staff, query]);
};

// Get staff statistics
export const useStaffStats = () => {
  const workload = useStaffWorkload();
  
  return useMemo(() => {
    const stats = {
      totalStaff: workload.length,
      totalAssignedTasks: 0,
      averageTasksPerPerson: 0,
      mostProductiveStaff: null as string | null,
      leastBusyStaff: null as string | null,
    };
    
    let maxTasks = -1;
    let minTasks = Infinity;
    
    workload.forEach((item) => {
      stats.totalAssignedTasks += item.totalTasks;
      
      if (item.totalTasks > maxTasks) {
        maxTasks = item.totalTasks;
        stats.mostProductiveStaff = item.member.name;
      }
      
      if (item.totalTasks < minTasks) {
        minTasks = item.totalTasks;
        stats.leastBusyStaff = item.member.name;
      }
    });
    
    stats.averageTasksPerPerson = stats.totalStaff > 0 
      ? Math.round((stats.totalAssignedTasks / stats.totalStaff) * 10) / 10
      : 0;
    
    return stats;
  }, [workload]);
};

// Get suggested assignee for new tasks (staff member with least pending tasks)
export const useSuggestedAssignee = () => {
  const workload = useStaffWorkload();
  
  return useMemo(() => {
    if (workload.length === 0) return null;
    
    return workload.reduce((least, current) => 
      current.pendingTasks < least.pendingTasks ? current : least
    ).member;
  }, [workload]);
};