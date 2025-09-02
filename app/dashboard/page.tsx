"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PhotoStore, Photo, Category } from "@/lib/photo-store";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AddMediaForm } from "@/components/dashboard/AddMediaForm";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ImageGrid } from "@/components/dashboard/ImageGrid";
import { VideoGrid } from "@/components/dashboard/VideoGrid";
import { DeleteConfirmationToast } from "@/components/dashboard/DeleteConfirmationToast";
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { UploadProgressBar } from "@/components/ui/upload-progress";
import { UploadService } from "@/lib/upload-service";
import { useDeleteProgress } from "@/hooks/use-delete-progress";
import { DeleteProgressBar } from "@/components/ui/delete-progress";
import { PageLoadingFallback } from "@/components/LoadingFallback";

interface Video {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const { loading, user, isAdmin } = useAuth();
  
  // Upload progress tracking
  const photoUpload = useUploadProgress();
  const videoUpload = useUploadProgress();
  const uploadService = UploadService.getInstance();
  
  // Delete progress tracking
  const deleteProgress = useDeleteProgress();
  const [newPhoto, setNewPhoto] = useState<{
    category_id: string;
    files: File[];
  }>({
    category_id: "",
    files: [],
  });
  const [newVideo, setNewVideo] = useState<{
    category_id: string;
    files: File[];
  }>({
    category_id: "",
    files: [],
  });
  const [confirmToast, setConfirmToast] = useState<{
    show: boolean;
    photoId: string;
    isDeletingVideo: boolean;
    isBulkDelete: boolean;
    itemIds: string[];
  }>({
    show: false,
    photoId: "",
    isDeletingVideo: false,
    isBulkDelete: false,
    itemIds: [],
  });
  const [dragActive, setDragActive] = useState(false);

  const photoStore = PhotoStore.getInstance(supabase);

  const fetchVideos = useCallback(async () => {
    try {
      const { data: folders, error: folderError } = await supabase.storage
        .from("videos")
        .list("", {
          search: "",
        });

      if (folderError) {
        console.error("Error listing folders:", folderError);
        return;
      }

      const videoPromises = folders
        .filter((folder) => !folder.name.startsWith(".")) // Filter out system files like .emptyFolderPlaceholder
        .map(async (folder) => {
          const { data, error } = await supabase.storage
            .from("videos")
            .list(folder.name);
          if (error) {
            console.error(`Error listing videos in ${folder.name}:`, error);
            return [];
          }
          return data.map((file) => {
            const { data: publicUrlData } = supabase.storage
              .from("videos")
              .getPublicUrl(`${folder.name}/${file.name}`);
            return {
              id: file.id,
              name: `${folder.name}/${file.name}`,
              publicUrl: publicUrlData.publicUrl,
              created_at: file.created_at,
            };
          });
        });

      const videosByFolder = await Promise.all(videoPromises);
      const allVideos = videosByFolder.flat();
      setVideos(allVideos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  }, []);

  // Effect for handling authentication and redirection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  // Effect for fetching data and setting up subscriptions
  useEffect(() => {
    if (user) {
      const initializeDashboardData = async () => {
        setDashboardLoading(true);
        try {
          await photoStore.fetchCategories();
          await photoStore.fetchPhotos();
          await fetchVideos();
        } catch (error) {
          console.error("Error initializing dashboard data:", error);
          toast.error("Failed to load dashboard data.");
        } finally {
          setDashboardLoading(false);
        }
      };

      initializeDashboardData();

      const unsubscribePhotos = photoStore.subscribe(() => {
        setPhotos(photoStore.getPhotos());
      });
      const unsubscribeCategories = photoStore.subscribeToCategories(() => {
        setCategories(photoStore.getCategories());
        if (photoStore.getCategories().length > 0) {
          if (!newPhoto.category_id) {
            setNewPhoto((prev) => ({
              ...prev,
              category_id: photoStore.getCategories()[0].id,
            }));
          }
          if (!newVideo.category_id) {
            setNewVideo((prev) => ({
              ...prev,
              category_id: photoStore.getCategories()[0].id,
            }));
          }
        }
      });

      return () => {
        unsubscribePhotos();
        unsubscribeCategories();
      };
    }
  }, [user, fetchVideos]);

  const handleFileSelect = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      setNewPhoto((prev) => ({ ...prev, files: imageFiles }));
    } else {
      toast.error("Please select at least one image file");
    }
  };

  const handleVideoFileSelect = (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));
    if (videoFiles.length > 0) {
      setNewVideo((prev) => ({ ...prev, files: videoFiles }));
      console.log(
        "Video files selected:",
        videoFiles.map((f) => f.name)
      );
    } else {
      toast.error("Please select at least one video file");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const videoFiles = files.filter((file) => file.type.startsWith("video/"));

      if (imageFiles.length > 0) {
        handleFileSelect(imageFiles);
      } else if (videoFiles.length > 0) {
        handleVideoFileSelect(videoFiles);
      } else {
        toast.error("Please drop image(s) or video file(s)");
      }
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.category_id || newPhoto.files.length === 0) {
      toast.error("Please fill in all fields and select at least one file");
      return;
    }

    // Initialize upload progress tracking
    const itemIds = photoUpload.initializeUpload(newPhoto.files);

    try {
      // Upload each file with progress tracking
      const uploadPromises = newPhoto.files.map(async (file, index) => {
        const itemId = itemIds[index];
        
        try {
          await uploadService.uploadPhotoWithSimulatedProgress(
            newPhoto.category_id,
            file,
            {
              onProgress: (progress) => {
                photoUpload.updateItemProgress(itemId, progress);
              },
              onComplete: () => {
                photoUpload.markItemCompleted(itemId);
              },
              onError: (error) => {
                photoUpload.markItemError(itemId, error.message);
              },
            }
          );
        } catch (error) {
          photoUpload.markItemError(itemId, (error as Error).message);
          throw error;
        }
      });

      await Promise.all(uploadPromises);

      // Reset form and refresh data
      setNewPhoto({
        category_id: categories[0]?.id || "",
        files: [],
      });
      setShowAddForm(false);
      toast.success(`${newPhoto.files.length} photo(s) added successfully!`);
      await photoStore.fetchPhotos();

      // Reset upload progress after a delay
      setTimeout(() => {
        photoUpload.resetUpload();
      }, 2000);
    } catch (error) {
      console.error("Error adding photo:", error);
      toast.error("Failed to add some photos. Please try again.");
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.category_id || newVideo.files.length === 0) {
      toast.error("Please select a category and at least one video file");
      return;
    }

    // Initialize upload progress tracking
    const uploadIds = videoUpload.initializeUpload(newVideo.files);
    
    try {
      // Upload files with progress tracking
      const uploadPromises = newVideo.files.map(async (file, index) => {
        const uploadId = uploadIds[index];
        
        try {
          await uploadService.uploadVideoWithSimulatedProgress(
            newVideo.category_id,
            file,
            {
              onProgress: (progress) => {
                videoUpload.updateItemProgress(uploadId, progress);
              },
              onComplete: () => {
                videoUpload.markItemCompleted(uploadId);
              },
              onError: (error) => {
                videoUpload.markItemError(uploadId, error.message);
              },
            }
          );
        } catch (error) {
          videoUpload.markItemError(uploadId, (error as Error).message);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      
      // Reset form and refresh data
      setNewVideo({
        category_id: categories[0]?.id || "",
        files: [],
      });
      setShowAddForm(false);
      toast.success(`${newVideo.files.length} video(s) added successfully!`);
      await fetchVideos();
      
      // Reset upload progress after a delay
      setTimeout(() => {
        videoUpload.resetUpload();
      }, 2000);
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("Failed to add some videos. Please check the progress and try again.");
    }
  };

  const handleDeletePhoto = (id: string) => {
    setConfirmToast({ 
      show: true, 
      photoId: id, 
      isDeletingVideo: false, 
      isBulkDelete: false, 
      itemIds: [] 
    });
  };

  const handleDeleteVideo = (name: string) => {
    setConfirmToast({ 
      show: true, 
      photoId: name, 
      isDeletingVideo: true, 
      isBulkDelete: false, 
      itemIds: [] 
    });
  };

  const handleBulkDeletePhotos = (ids: string[]) => {
    setConfirmToast({
      show: true,
      photoId: "",
      isDeletingVideo: false,
      isBulkDelete: true,
      itemIds: ids,
    });
  };

  const handleBulkDeleteVideos = (names: string[]) => {
    setConfirmToast({
      show: true,
      photoId: "",
      isDeletingVideo: true,
      isBulkDelete: true,
      itemIds: names,
    });
  };

  const handleConfirmDelete = async () => {
  if (confirmToast.isBulkDelete) {
    // Initialize delete progress for bulk operations
    const deleteItems = confirmToast.itemIds.map((id, index) => ({
      id,
      name: confirmToast.isDeletingVideo 
        ? videos.find(v => v.name === id)?.name || `Video ${index + 1}`
        : photos.find(p => p.id === id)?.storage_path || `Photo ${index + 1}`,
      type: confirmToast.isDeletingVideo ? 'video' as const : 'photo' as const,
    }));
    
    deleteProgress.initializeDelete(deleteItems);

    if (confirmToast.isDeletingVideo) {
      // Bulk delete videos with progress
      try {
        for (const videoName of confirmToast.itemIds) {
          deleteProgress.markItemDeleting(videoName);
          
          try {
            const { error } = await supabase.storage
              .from("videos")
              .remove([videoName]);

            if (error) {
              deleteProgress.markItemError(videoName, error.message);
            } else {
              deleteProgress.markItemCompleted(videoName);
            }
          } catch (error) {
            deleteProgress.markItemError(videoName, (error as Error).message);
          }
        }

        await fetchVideos();
        const completedCount = deleteProgress.deleteState.completedCount;
        const errorCount = deleteProgress.deleteState.errorCount;
        
        if (completedCount > 0) {
          toast.success(`${completedCount} video(s) deleted successfully!`);
        }
        if (errorCount > 0) {
          toast.error(`Failed to delete ${errorCount} video(s)`);
        }
      } catch (error) {
        console.error("Failed to delete videos:", error);
        toast.error("Failed to delete videos. Please try again.");
      }
    } else {
      // Bulk delete photos with progress
      try {
        for (const photoId of confirmToast.itemIds) {
          deleteProgress.markItemDeleting(photoId);
          
          try {
            const success = await photoStore.deletePhoto(photoId);
            if (success) {
              deleteProgress.markItemCompleted(photoId);
            } else {
              deleteProgress.markItemError(photoId, "Failed to delete from database");
            }
          } catch (error) {
            deleteProgress.markItemError(photoId, (error as Error).message);
          }
        }
        
        await photoStore.fetchPhotos();
        const completedCount = deleteProgress.deleteState.completedCount;
        const errorCount = deleteProgress.deleteState.errorCount;
        
        if (completedCount > 0) {
          toast.success(`${completedCount} photo(s) deleted successfully!`);
        }
        if (errorCount > 0) {
          toast.error(`Failed to delete ${errorCount} photo(s)`);
        }
      } catch (error) {
        console.error("Error deleting photos:", error);
        toast.error("Failed to delete photos. Please try again.");
      }
    }
    
    // Reset delete progress after a delay
    setTimeout(() => {
      deleteProgress.resetDelete();
    }, 3000);
  } else {
    // Handle single deletion with progress
    const itemName = confirmToast.isDeletingVideo 
      ? videos.find(v => v.name === confirmToast.photoId)?.name || confirmToast.photoId
      : photos.find(p => p.id === confirmToast.photoId)?.storage_path || confirmToast.photoId;
      
    const deleteItems = [{
      id: confirmToast.photoId,
      name: itemName,
      type: confirmToast.isDeletingVideo ? 'video' as const : 'photo' as const,
    }];
    
    deleteProgress.initializeDelete(deleteItems);
    deleteProgress.markItemDeleting(confirmToast.photoId);

    if (confirmToast.isDeletingVideo) {
      try {
        const { error } = await supabase.storage
          .from("videos")
          .remove([confirmToast.photoId]);

        if (error) {
          deleteProgress.markItemError(confirmToast.photoId, error.message);
          toast.error("Failed to delete video.");
        } else {
          deleteProgress.markItemCompleted(confirmToast.photoId);
          await fetchVideos();
          toast.success("Video deleted successfully!");
        }
      } catch (error) {
        deleteProgress.markItemError(confirmToast.photoId, (error as Error).message);
        toast.error("Failed to delete video. Please try again.");
      }
    } else {
      try {
        const success = await photoStore.deletePhoto(confirmToast.photoId);
        if (success) {
          deleteProgress.markItemCompleted(confirmToast.photoId);
          toast.success("Photo deleted successfully!");
          await photoStore.fetchPhotos();
        } else {
          deleteProgress.markItemError(confirmToast.photoId, "Failed to delete from database");
          toast.error("Failed to delete photo");
        }
      } catch (error) {
        deleteProgress.markItemError(confirmToast.photoId, (error as Error).message);
        toast.error("Failed to delete photo. Please try again.");
      }
    }
    
    // Reset delete progress after a delay
    setTimeout(() => {
      deleteProgress.resetDelete();
    }, 2000);
  }
  
  setConfirmToast({ 
    show: false, 
    photoId: "", 
    isDeletingVideo: false, 
    isBulkDelete: false, 
    itemIds: [] 
  });
};

  const handleCancelDelete = () => {
    setConfirmToast({ 
      show: false, 
      photoId: "", 
      isDeletingVideo: false, 
      isBulkDelete: false, 
      itemIds: [] 
    });
  };

  const handleCancelUpload = () => {
    photoUpload.resetUpload();
    videoUpload.resetUpload();
    toast.info("Upload cancelled");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading || dashboardLoading) {
    return <PageLoadingFallback />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardHeader
            isAdmin={isAdmin}
            showAddForm={showAddForm}
            onToggleAddForm={() => setShowAddForm(!showAddForm)}
            onLogout={handleLogout}
          />

          <AddMediaForm
            showAddForm={showAddForm}
            dragActive={dragActive}
            newPhoto={newPhoto}
            newVideo={newVideo}
            categories={categories}
            photoUploadState={photoUpload.uploadState}
            videoUploadState={videoUpload.uploadState}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onVideoFileSelect={handleVideoFileSelect}
            onAddPhoto={handleAddPhoto}
            onAddVideo={handleAddVideo}
            onSetNewPhoto={setNewPhoto}
            onSetNewVideo={setNewVideo}
            onCloseForm={() => setShowAddForm(false)}
            onCancelUpload={handleCancelUpload}
          />

          <DashboardStats
            photos={photos}
            videos={videos}
            categories={categories}
          />

          {/* Delete Progress Bar */}
          {deleteProgress.deleteState.items.length > 0 && (
            <div className="mb-6">
              <DeleteProgressBar deleteState={deleteProgress.deleteState} />
            </div>
          )}

          <ImageGrid
            key={`image-grid-${photos.length}`}
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
            onBulkDeletePhotos={handleBulkDeletePhotos}
          />

          <VideoGrid
            key={`video-grid-${videos.length}`}
            videos={videos}
            onDeleteVideo={handleDeleteVideo}
            onBulkDeleteVideos={handleBulkDeleteVideos}
          />
        </div>
      </div>

      <DeleteConfirmationToast
        show={confirmToast.show}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isBulkDelete={confirmToast.isBulkDelete}
        itemCount={confirmToast.itemIds.length}
        itemType={confirmToast.isDeletingVideo ? "video" : "photo"}
      />
    </>
  );
}
