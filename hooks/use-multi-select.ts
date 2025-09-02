import { useState, useCallback } from 'react';

export function useMultiSelect<T extends { id: string }>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, []);

  const selectNone = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedItems);
  }, [selectedItems]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const selectedCount = selectedItems.size;

  return {
    selectedItems,
    selectedCount,
    isSelectionMode,
    toggleSelection,
    selectAll,
    selectNone,
    isSelected,
    getSelectedIds,
    enterSelectionMode,
    exitSelectionMode,
  };
}
