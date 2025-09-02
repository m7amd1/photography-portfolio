import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhotoStore, Photo } from "@/lib/photo-store";
import { BulkActionsBar } from "@/components/ui/bulk-actions-bar";
import { useMultiSelect } from "@/hooks/use-multi-select";
import { Trash2, MoreVertical } from "lucide-react";

interface ImageGridProps {
  photos: Photo[];
  onDeletePhoto: (id: string) => void;
  onBulkDeletePhotos?: (ids: string[]) => void;
}

export function ImageGrid({ photos, onDeletePhoto, onBulkDeletePhotos }: ImageGridProps) {
  const photoStore = PhotoStore.getInstance();
  const multiSelect = useMultiSelect<Photo>();

  const handleBulkDelete = () => {
    const selectedIds = multiSelect.getSelectedIds();
    if (selectedIds.length > 0 && onBulkDeletePhotos) {
      onBulkDeletePhotos(selectedIds);
      multiSelect.exitSelectionMode();
    }
  };

  const handleItemClick = (photo: Photo, event: React.MouseEvent) => {
    if (multiSelect.isSelectionMode) {
      event.preventDefault();
      multiSelect.toggleSelection(photo.id);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Images</CardTitle>
            <CardDescription>Manage your image collection</CardDescription>
          </div>
          {!multiSelect.isSelectionMode && photos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={multiSelect.enterSelectionMode}
              className="flex items-center gap-2"
            >
              <MoreVertical className="w-4 h-4" />
              Select
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {multiSelect.isSelectionMode && (
          <BulkActionsBar
            selectedCount={multiSelect.selectedCount}
            totalCount={photos.length}
            onSelectAll={() => multiSelect.selectAll(photos)}
            onSelectNone={multiSelect.selectNone}
            onBulkDelete={handleBulkDelete}
            onExitSelection={multiSelect.exitSelectionMode}
            className="mb-6"
          />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className={`group relative cursor-pointer ${
                multiSelect.isSelectionMode ? 'select-none' : ''
              }`}
              onClick={(e) => handleItemClick(photo, e)}
            >
              <div className={`aspect-square overflow-hidden rounded-lg bg-gray-100 relative transition-all duration-200 ${
                multiSelect.isSelected(photo.id) ? 'ring-4 ring-blue-500 ring-opacity-75' : ''
              }`}>
                <Image
                  src={photoStore.getPublicPhotoUrl(photo.storage_path)}
                  alt={"Photo"}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Selection checkbox */}
                {multiSelect.isSelectionMode && (
                  <div className="absolute top-2 left-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      multiSelect.isSelected(photo.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}>
                      {multiSelect.isSelected(photo.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Single delete button - only show when not in selection mode */}
              {!multiSelect.isSelectionMode && (
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(photo.id);
                    }}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
