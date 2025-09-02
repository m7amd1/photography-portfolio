import { useState, useCallback } from 'react';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadProgress {
  items: UploadItem[];
  totalProgress: number;
  isUploading: boolean;
  completedCount: number;
  errorCount: number;
}

export function useUploadProgress() {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    items: [],
    totalProgress: 0,
    isUploading: false,
    completedCount: 0,
    errorCount: 0,
  });

  const initializeUpload = useCallback((files: File[]) => {
    const items: UploadItem[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploadState({
      items,
      totalProgress: 0,
      isUploading: true,
      completedCount: 0,
      errorCount: 0,
    });

    return items.map(item => item.id);
  }, []);

  const updateItemProgress = useCallback((id: string, progress: number) => {
    setUploadState(prev => {
      const newItems = prev.items.map(item =>
        item.id === id
          ? { ...item, progress, status: 'uploading' as const }
          : item
      );

      const totalProgress = newItems.reduce((sum, item) => sum + item.progress, 0) / newItems.length;

      return {
        ...prev,
        items: newItems,
        totalProgress,
      };
    });
  }, []);

  const markItemCompleted = useCallback((id: string) => {
    setUploadState(prev => {
      const newItems = prev.items.map(item =>
        item.id === id
          ? { ...item, progress: 100, status: 'completed' as const }
          : item
      );

      const completedCount = newItems.filter(item => item.status === 'completed').length;
      const errorCount = newItems.filter(item => item.status === 'error').length;
      const totalProgress = newItems.reduce((sum, item) => sum + item.progress, 0) / newItems.length;
      const isUploading = completedCount + errorCount < newItems.length;

      return {
        ...prev,
        items: newItems,
        totalProgress,
        completedCount,
        errorCount,
        isUploading,
      };
    });
  }, []);

  const markItemError = useCallback((id: string, error: string) => {
    setUploadState(prev => {
      const newItems = prev.items.map(item =>
        item.id === id
          ? { ...item, status: 'error' as const, error }
          : item
      );

      const completedCount = newItems.filter(item => item.status === 'completed').length;
      const errorCount = newItems.filter(item => item.status === 'error').length;
      const totalProgress = newItems.reduce((sum, item) => sum + item.progress, 0) / newItems.length;
      const isUploading = completedCount + errorCount < newItems.length;

      return {
        ...prev,
        items: newItems,
        totalProgress,
        completedCount,
        errorCount,
        isUploading,
      };
    });
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      items: [],
      totalProgress: 0,
      isUploading: false,
      completedCount: 0,
      errorCount: 0,
    });
  }, []);

  return {
    uploadState,
    initializeUpload,
    updateItemProgress,
    markItemCompleted,
    markItemError,
    resetUpload,
  };
}
