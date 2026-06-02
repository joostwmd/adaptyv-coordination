import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { usePrototypeStore, useContextItems as useContextItemsStore, useContextItemsByType } from '@/stores/usePrototypeStore';
import type { ContextItem } from '@/components/context/types';

// Main context items hook with actions
export const useContextItems = () => {
  const contextItems = useContextItemsStore();
  const addContextItem = usePrototypeStore(state => state.addContextItem);
  const updateContextItem = usePrototypeStore(state => state.updateContextItem);
  const deleteContextItem = usePrototypeStore(state => state.deleteContextItem);
  
  return useMemo(() => ({
    contextItems,
    addContextItem,
    updateContextItem,
    deleteContextItem,
  }), [contextItems, addContextItem, updateContextItem, deleteContextItem]);
};

// Get single context item by ID
export const useContextItem = (id: string) => {
  const contextItem = usePrototypeStore((state) => 
    state.contextItems.find(item => item.id === id)
  );
  const updateContextItem = usePrototypeStore((state) => state.updateContextItem);
  const deleteContextItem = usePrototypeStore((state) => state.deleteContextItem);
  
  return {
    contextItem,
    updateContextItem: (updates: Partial<ContextItem>) => updateContextItem(id, updates),
    deleteContextItem: () => deleteContextItem(id),
  };
};

// Context items filtered by type
export { useContextItemsByType };

// Context items filtered by who added them
export const useContextItemsByAuthor = (authorName: string) => {
  const contextItems = useContextItemsStore();
  
  return useMemo(
    () => contextItems.filter((item) => item.addedBy === authorName),
    [contextItems, authorName]
  );
};

// Context items sorted by date (most recent first)
export const useContextItemsByDate = (ascending = false) => {
  const contextItems = useContextItemsStore();
  
  return useMemo(() => {
    return [...contextItems].sort((a, b) => {
      const dateA = new Date(a.addedAt).getTime();
      const dateB = new Date(b.addedAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }, [contextItems, ascending]);
};

// Get recent context items
export const useRecentContextItems = (limit = 10) => {
  const contextItemsByDate = useContextItemsByDate();
  
  return useMemo(() => {
    return contextItemsByDate.slice(0, limit);
  }, [contextItemsByDate, limit]);
};

// Get context items grouped by type
export const useContextItemsGroupedByType = () => {
  const contextItems = useContextItemsStore();
  
  return useMemo(() => {
    const grouped: Record<ContextItem['type'], ContextItem[]> = {
      platform: [],
      client: [],
      note: [],
      supplier: [],
      paper: [],
    };
    
    contextItems.forEach((item) => {
      grouped[item.type].push(item);
    });
    
    // Sort each group by date (most recent first)
    Object.keys(grouped).forEach((type) => {
      grouped[type as ContextItem['type']].sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    });
    
    return grouped;
  }, [contextItems]);
};

// Get all unique authors from context items
export const useContextAuthors = () => {
  const contextItems = useContextItemsStore();
  
  return useMemo(() => {
    const authors = new Set<string>();
    contextItems.forEach((item) => {
      authors.add(item.addedBy);
    });
    return Array.from(authors).sort();
  }, [contextItems]);
};

// Context items statistics
export const useContextItemStats = () => {
  const contextItems = useContextItemsStore();
  
  return useMemo(() => {
    const stats = {
      total: contextItems.length,
      byType: {} as Record<ContextItem['type'], number>,
      byAuthor: {} as Record<string, number>,
      recentCount: 0, // Added in last 7 days
    };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    contextItems.forEach((item) => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      
      // Count by author
      stats.byAuthor[item.addedBy] = (stats.byAuthor[item.addedBy] || 0) + 1;
      
      // Count recent items
      if (new Date(item.addedAt) > sevenDaysAgo) {
        stats.recentCount++;
      }
    });
    
    return stats;
  }, [contextItems]);
};

// Search context items by title, annotation, or content
export const useContextItemSearch = (query: string) => {
  const contextItems = useContextItemsStore();
  
  return useMemo(() => {
    if (!query.trim()) return contextItems;
    
    const lowercaseQuery = query.toLowerCase();
    
    return contextItems.filter((item) => {
      // Search in common fields
      if (item.annotation?.toLowerCase().includes(lowercaseQuery)) return true;
      if (item.addedBy.toLowerCase().includes(lowercaseQuery)) return true;
      
      // Search in type-specific fields
      switch (item.type) {
        case 'platform':
          return (
            item.title?.toLowerCase().includes(lowercaseQuery) ||
            item.outcome?.toLowerCase().includes(lowercaseQuery) ||
            item.owner?.toLowerCase().includes(lowercaseQuery)
          );
          
        case 'client':
          return (
            item.title?.toLowerCase().includes(lowercaseQuery) ||
            item.clientName?.toLowerCase().includes(lowercaseQuery) ||
            item.excerpt?.toLowerCase().includes(lowercaseQuery) ||
            (item.channel === 'email' && (
              item.from?.toLowerCase().includes(lowercaseQuery) ||
              item.to?.toLowerCase().includes(lowercaseQuery)
            ))
          );
          
        case 'note':
          return (
            item.title?.toLowerCase().includes(lowercaseQuery) ||
            item.bodyPreview?.toLowerCase().includes(lowercaseQuery) ||
            item.body?.toLowerCase().includes(lowercaseQuery)
          );
          
        case 'supplier':
          return (
            item.supplierName?.toLowerCase().includes(lowercaseQuery) ||
            item.materialName?.toLowerCase().includes(lowercaseQuery) ||
            item.docType?.toLowerCase().includes(lowercaseQuery)
          );
          
        case 'paper':
          return (
            item.title?.toLowerCase().includes(lowercaseQuery) ||
            item.authors?.toLowerCase().includes(lowercaseQuery) ||
            item.venue?.toLowerCase().includes(lowercaseQuery) ||
            item.abstract?.toLowerCase().includes(lowercaseQuery) ||
            item.takeaway?.toLowerCase().includes(lowercaseQuery)
          );
          
        default:
          return false;
      }
    });
  }, [contextItems, query]);
};

// Get context items that might be relevant to an experiment
export const useContextItemsForExperiment = (experimentId: string) => {
  const contextItems = useContextItemsStore();
  const experiment = usePrototypeStore((state) => 
    state.experiments.find(exp => exp.id === experimentId)
  );
  
  return useMemo(() => {
    if (!experiment) return [];
    
    const relevantItems = contextItems.filter((item) => {
      // Check if context item mentions the experiment code
      const searchableText = [
        item.annotation,
        // Type-specific searchable content
        ...(item.type === 'platform' ? [item.title, item.outcome] : []),
        ...(item.type === 'client' ? [item.title, item.excerpt] : []),
        ...(item.type === 'note' ? [item.title, item.bodyPreview, item.body] : []),
        ...(item.type === 'paper' ? [item.title, item.abstract, item.takeaway] : []),
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(experiment.code.toLowerCase()) ||
             searchableText.includes(experiment.name.toLowerCase()) ||
             searchableText.includes(experiment.client.name.toLowerCase());
    });
    
    return relevantItems.sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [contextItems, experiment]);
};