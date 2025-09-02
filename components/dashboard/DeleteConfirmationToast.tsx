import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DeleteConfirmationToastProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isBulkDelete?: boolean;
  itemCount?: number;
  itemType?: string;
}

export function DeleteConfirmationToast({
  show,
  onConfirm,
  onCancel,
  isBulkDelete = false,
  itemCount = 1,
  itemType = "item",
}: DeleteConfirmationToastProps) {
  if (!show) return null;

  const getTitle = () => {
    if (isBulkDelete) {
      return `Delete ${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}`;
    }
    return "Confirm Deletion";
  };

  const getDescription = () => {
    if (isBulkDelete) {
      return `Are you sure you want to delete ${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}? This action cannot be undone.`;
    }
    return "Are you sure you want to delete this item? This action cannot be undone.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1 cursor-pointer"
            >
              {isBulkDelete ? `Delete ${itemCount}` : 'Delete'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
