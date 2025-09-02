import React from 'react';
import { UploadItem, UploadProgress } from '@/hooks/use-upload-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface UploadProgressBarProps {
  uploadState: UploadProgress;
  onCancel?: () => void;
  onRetry?: (itemId: string) => void;
  className?: string;
}

export function UploadProgressBar({ 
  uploadState, 
  onCancel, 
  onRetry,
  className = '' 
}: UploadProgressBarProps) {
  if (uploadState.items.length === 0) return null;

  const { items, totalProgress, isUploading, completedCount, errorCount } = uploadState;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Progress
          </CardTitle>
          {onCancel && isUploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {completedCount} of {items.length} files completed
              {errorCount > 0 && ` (${errorCount} failed)`}
            </span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map((item) => (
            <UploadItemRow
              key={item.id}
              item={item}
              onRetry={onRetry}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface UploadItemRowProps {
  item: UploadItem;
  onRetry?: (itemId: string) => void;
}

function UploadItemRow({ item, onRetry }: UploadItemRowProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'uploading':
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
      {getStatusIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {item.file.name}
          </span>
          <span className="text-xs text-gray-500">
            {(item.file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        
        {item.status === 'error' ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-600">{item.error}</span>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(item.id)}
                className="h-6 px-2 text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface CompactUploadProgressProps {
  uploadState: UploadProgress;
  className?: string;
}

export function CompactUploadProgress({ 
  uploadState, 
  className = '' 
}: CompactUploadProgressProps) {
  if (uploadState.items.length === 0) return null;

  const { totalProgress, completedCount, errorCount, items } = uploadState;

  return (
    <div className={`flex items-center gap-2 p-2 bg-blue-50 rounded-lg ${className}`}>
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-blue-800">
        Uploading {completedCount}/{items.length} files ({Math.round(totalProgress)}%)
        {errorCount > 0 && ` - ${errorCount} failed`}
      </span>
    </div>
  );
}
