import React from 'react';
import { DeleteItem, DeleteProgress } from '@/hooks/use-delete-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';

interface DeleteProgressBarProps {
  deleteState: DeleteProgress;
  className?: string;
}

export function DeleteProgressBar({ 
  deleteState, 
  className = '' 
}: DeleteProgressBarProps) {
  if (deleteState.items.length === 0) return null;

  const { items, completedCount, errorCount, totalCount, isDeleting } = deleteState;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Progress
          </CardTitle>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {completedCount} of {totalCount} items deleted
              {errorCount > 0 && ` (${errorCount} failed)`}
            </span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map((item) => (
            <DeleteItemRow
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DeleteItemRowProps {
  item: DeleteItem;
}

function DeleteItemRow({ item }: DeleteItemRowProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'deleting':
        return <Loader2 className="w-4 h-4 text-red-600 animate-spin" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'deleting':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'completed':
        return 'Deleted';
      case 'error':
        return item.error || 'Failed';
      case 'deleting':
        return 'Deleting...';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
      {getStatusIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </span>
          <span className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 capitalize">
          {item.type}
        </div>
      </div>
    </div>
  );
}

interface CompactDeleteProgressProps {
  deleteState: DeleteProgress;
  className?: string;
}

export function CompactDeleteProgress({ 
  deleteState, 
  className = '' 
}: CompactDeleteProgressProps) {
  if (deleteState.items.length === 0) return null;

  const { completedCount, errorCount, totalCount } = deleteState;

  return (
    <div className={`flex items-center gap-2 p-2 bg-red-50 rounded-lg ${className}`}>
      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
      <span className="text-sm text-red-800">
        Deleting {completedCount}/{totalCount} items
        {errorCount > 0 && ` - ${errorCount} failed`}
      </span>
    </div>
  );
}
