import { useState, useCallback } from 'react';

export interface DeleteItem {
  id: string;
  name: string;
  type: 'photo' | 'video';
  status: 'pending' | 'deleting' | 'completed' | 'error';
  error?: string;
}

export interface DeleteProgress {
  items: DeleteItem[];
  isDeleting: boolean;
  completedCount: number;
  errorCount: number;
  totalCount: number;
}

export function useDeleteProgress() {
  const [deleteState, setDeleteState] = useState<DeleteProgress>({
    items: [],
    isDeleting: false,
    completedCount: 0,
    errorCount: 0,
    totalCount: 0,
  });

  const initializeDelete = useCallback((items: Array<{ id: string; name: string; type: 'photo' | 'video' }>) => {
    const deleteItems: DeleteItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      status: 'pending',
    }));

    setDeleteState({
      items: deleteItems,
      isDeleting: true,
      completedCount: 0,
      errorCount: 0,
      totalCount: deleteItems.length,
    });

    return deleteItems.map(item => item.id);
  }, []);

  const markItemDeleting = useCallback((id: string) => {
    setDeleteState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id
          ? { ...item, status: 'deleting' as const }
          : item
      ),
    }));
  }, []);

  const markItemCompleted = useCallback((id: string) => {
    setDeleteState(prev => {
      const newItems = prev.items.map(item =>
        item.id === id
          ? { ...item, status: 'completed' as const }
          : item
      );

      const completedCount = newItems.filter(item => item.status === 'completed').length;
      const errorCount = newItems.filter(item => item.status === 'error').length;
      const isDeleting = completedCount + errorCount < newItems.length;

      return {
        ...prev,
        items: newItems,
        completedCount,
        errorCount,
        isDeleting,
      };
    });
  }, []);

  const markItemError = useCallback((id: string, error: string) => {
    setDeleteState(prev => {
      const newItems = prev.items.map(item =>
        item.id === id
          ? { ...item, status: 'error' as const, error }
          : item
      );

      const completedCount = newItems.filter(item => item.status === 'completed').length;
      const errorCount = newItems.filter(item => item.status === 'error').length;
      const isDeleting = completedCount + errorCount < newItems.length;

      return {
        ...prev,
        items: newItems,
        completedCount,
        errorCount,
        isDeleting,
      };
    });
  }, []);

  const resetDelete = useCallback(() => {
    setDeleteState({
      items: [],
      isDeleting: false,
      completedCount: 0,
      errorCount: 0,
      totalCount: 0,
    });
  }, []);

  return {
    deleteState,
    initializeDelete,
    markItemDeleting,
    markItemCompleted,
    markItemError,
    resetDelete,
  };
}
