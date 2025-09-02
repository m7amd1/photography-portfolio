import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkDelete: () => void;
  onExitSelection: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onSelectNone,
  onBulkDelete,
  onExitSelection,
  className = '',
}: BulkActionsBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className={`flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} of {totalCount} selected
        </span>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onSelectNone : onSelectAll}
            className="h-8 px-3 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
          >
            {allSelected ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-1" />
                Select All
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={selectedCount === 0}
          className="h-8 px-3"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete ({selectedCount})
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExitSelection}
          className="h-8 px-3 text-gray-600 hover:text-gray-900"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
