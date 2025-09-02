import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BulkActionsBar } from "@/components/ui/bulk-actions-bar";
import { useMultiSelect } from "@/hooks/use-multi-select";
import { Trash2, MoreVertical } from "lucide-react";

interface Video {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
}

interface VideoGridProps {
  videos: Video[];
  onDeleteVideo: (name: string) => void;
  onBulkDeleteVideos?: (names: string[]) => void;
}

export function VideoGrid({ videos, onDeleteVideo, onBulkDeleteVideos }: VideoGridProps) {
  const multiSelect = useMultiSelect<Video>();

  const handleBulkDelete = () => {
    const selectedIds = multiSelect.getSelectedIds();
    if (selectedIds.length > 0 && onBulkDeleteVideos) {
      // For videos, we need to get the names instead of IDs
      const selectedNames = videos
        .filter(video => selectedIds.includes(video.id))
        .map(video => video.name);
      onBulkDeleteVideos(selectedNames);
      multiSelect.exitSelectionMode();
    }
  };

  const handleItemClick = (video: Video, event: React.MouseEvent) => {
    if (multiSelect.isSelectionMode) {
      event.preventDefault();
      multiSelect.toggleSelection(video.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Videos</CardTitle>
            <CardDescription>Manage your video collection</CardDescription>
          </div>
          {!multiSelect.isSelectionMode && videos.length > 0 && (
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
            totalCount={videos.length}
            onSelectAll={() => multiSelect.selectAll(videos)}
            onSelectNone={multiSelect.selectNone}
            onBulkDelete={handleBulkDelete}
            onExitSelection={multiSelect.exitSelectionMode}
            className="mb-6"
          />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className={`group relative cursor-pointer ${
                multiSelect.isSelectionMode ? 'select-none' : ''
              }`}
              onClick={(e) => handleItemClick(video, e)}
            >
              <div className={`aspect-square overflow-hidden rounded-lg bg-gray-100 relative transition-all duration-200 ${
                multiSelect.isSelected(video.id) ? 'ring-4 ring-blue-500 ring-opacity-75' : ''
              }`}>
                <video
                  src={video.publicUrl}
                  controls
                  autoPlay={true}
                  muted={true}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
                />
                
                {/* Selection checkbox */}
                {multiSelect.isSelectionMode && (
                  <div className="absolute top-2 left-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      multiSelect.isSelected(video.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}>
                      {multiSelect.isSelected(video.id) && (
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
                      onDeleteVideo(video.name);
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
