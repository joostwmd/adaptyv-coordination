import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { usePrototypeStore, useExperiments as useExperimentsStore, useExperimentById } from '@/stores/usePrototypeStore';
import type { ExperimentDetail, ExperimentSummary, ExperimentRunSummary } from '@/types';

// Main experiments hook with actions - split into separate selectors to avoid object recreation
export const useExperiments = () => {
  const experiments = useExperimentsStore();
  const addExperiment = usePrototypeStore(state => state.addExperiment);
  const updateExperiment = usePrototypeStore(state => state.updateExperiment);  
  const deleteExperiment = usePrototypeStore(state => state.deleteExperiment);
  
  return useMemo(() => ({
    experiments,
    addExperiment,
    updateExperiment,
    deleteExperiment,
  }), [experiments, addExperiment, updateExperiment, deleteExperiment]);
};

// Get single experiment by ID
export const useExperiment = (id: string) => {
  const experiment = useExperimentById(id);
  const updateExperiment = usePrototypeStore((state) => state.updateExperiment);
  const deleteExperiment = usePrototypeStore((state) => state.deleteExperiment);
  
  return {
    experiment,
    updateExperiment: (updates: Partial<ExperimentDetail>) => updateExperiment(id, updates),
    deleteExperiment: () => deleteExperiment(id),
  };
};

// Experiments filtered by client
export const useExperimentsByClient = (clientId: string) => {
  const experiments = useExperimentsStore();
  
  return useMemo(
    () => experiments.filter((exp) => exp.client.id === clientId),
    [experiments, clientId]
  );
};

// Experiments filtered by category
export const useExperimentsByCategory = (category: 'rd' | 'production') => {
  const experiments = useExperimentsStore();
  
  return useMemo(
    () => experiments.filter((exp) => exp.category === category),
    [experiments, category]
  );
};

// Experiments filtered by type
export const useExperimentsByType = (type: ExperimentDetail['type']) => {
  const experiments = useExperimentsStore();
  
  return useMemo(
    () => experiments.filter((exp) => exp.type === type),
    [experiments, type]
  );
};

// Experiments filtered by status
export const useExperimentsByStatus = (statusName: string) => {
  const experiments = useExperimentsStore();
  
  return useMemo(
    () => experiments.filter((exp) => exp.status.name === statusName),
    [experiments, statusName]
  );
};

// Get all unique clients from experiments
export const useClientsFromExperiments = () => {
  const experiments = useExperimentsStore();
  
  return useMemo(() => {
    const clientMap = new Map();
    experiments.forEach((exp) => {
      clientMap.set(exp.client.id, exp.client);
    });
    return Array.from(clientMap.values());
  }, [experiments]);
};

// Get experiments sorted by priority
export const useExperimentsByPriority = (ascending = false) => {
  const experiments = useExperimentsStore();
  
  return useMemo(() => {
    return [...experiments].sort((a, b) => 
      ascending ? a.priority - b.priority : b.priority - a.priority
    );
  }, [experiments, ascending]);
};

// Experiment runs management
export const useExperimentRuns = (experimentId: string) => {
  const experiment = useExperimentById(experimentId);
  const addExperimentRun = usePrototypeStore((state) => state.addExperimentRun);
  const updateExperimentRun = usePrototypeStore((state) => state.updateExperimentRun);
  const deleteExperimentRun = usePrototypeStore((state) => state.deleteExperimentRun);
  
  return {
    runs: experiment?.runs || [],
    addRun: (run: Omit<ExperimentRunSummary, 'id' | 'experimentId'>) => 
      addExperimentRun(experimentId, run),
    updateRun: (runId: string, updates: Partial<ExperimentRunSummary>) => 
      updateExperimentRun(experimentId, runId, updates),
    deleteRun: (runId: string) => 
      deleteExperimentRun(experimentId, runId),
  };
};

// Statistics for experiments
export const useExperimentStats = () => {
  const experiments = useExperimentsStore();
  
  return useMemo(() => {
    const stats = {
      total: experiments.length,
      byCategory: { rd: 0, production: 0 },
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalRuns: 0,
    };
    
    experiments.forEach((exp) => {
      stats.byCategory[exp.category]++;
      stats.byType[exp.type] = (stats.byType[exp.type] || 0) + 1;
      stats.byStatus[exp.status.name] = (stats.byStatus[exp.status.name] || 0) + 1;
      stats.totalRuns += exp.runs.length;
    });
    
    return stats;
  }, [experiments]);
};

// Search experiments by name or code
export const useExperimentSearch = (query: string) => {
  const experiments = useExperimentsStore();
  
  return useMemo(() => {
    if (!query.trim()) return experiments;
    
    const lowercaseQuery = query.toLowerCase();
    return experiments.filter((exp) => 
      exp.name.toLowerCase().includes(lowercaseQuery) ||
      exp.code.toLowerCase().includes(lowercaseQuery) ||
      exp.methodName?.toLowerCase().includes(lowercaseQuery)
    );
  }, [experiments, query]);
};