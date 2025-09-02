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
  }>({
    show: false,
    photoId: "",
    isDeletingVideo: false,
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

    setDashboardLoading(true);
    try {
      for (const file of newPhoto.files) {
        await photoStore.addPhoto(newPhoto.category_id, file);
      }
      setNewPhoto({
        category_id: categories[0]?.id || "",
        files: [],
      }); // Reset form
      setShowAddForm(false);
      toast.success(`${newPhoto.files.length} photo(s) added successfully!`);
      await photoStore.fetchPhotos();
    } catch (error) {
      console.error("Error adding photo:", error);
      toast.error("Failed to add photo. Please try again.");
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.category_id || newVideo.files.length === 0) {
      toast.error("Please select a category and at least one video file");
      return;
    }

    const category = categories.find((c) => c.id === newVideo.category_id);
    if (!category) {
      toast.error("Selected category not found.");
      return;
    }
    const categoryName = category.name.toLowerCase().replace(/\s+/g, "-");

    try {
      for (const file of newVideo.files) {
        const fileExtension = file.name.split(".").pop();
        const timestamp = Date.now();
        const storagePath = `${categoryName}/${timestamp}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading video:", uploadError);
          toast.error(`Failed to upload video ${file.name}. Please try again.`);
          continue;
        }
      }

      setNewVideo({
        category_id: categories[0]?.id || "",
        files: [],
      });
      setShowAddForm(false);
      toast.success(`${newVideo.files.length} video(s) added successfully!`);
      await fetchVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("Failed to add video. Please try again.");
    }
  };

  const handleDeletePhoto = (id: string) => {
    setConfirmToast({ show: true, photoId: id, isDeletingVideo: false });
  };

  const handleDeleteVideo = (name: string) => {
    setConfirmToast({ show: true, photoId: name, isDeletingVideo: true });
  };

  const handleConfirmDelete = async () => {
    setDashboardLoading(true);
    if (confirmToast.isDeletingVideo) {
      try {
        const { error } = await supabase.storage
          .from("videos")
          .remove([confirmToast.photoId]);

        if (error) {
          console.error("Error deleting video from storage:", error);
          toast.error("Failed to delete video.", {
            description: `There was an error deleting the video from storage: ${error.message}`,
          });
          return;
        }

        // Re-fetch videos to ensure state is in sync with Supabase
        await fetchVideos();

        toast.success("Video deleted successfully!", {
          description: "The video has been removed from your gallery.",
        });
      } catch (error) {
        console.error("Failed to delete video:", error);
        toast.error("Failed to delete video. Please try again.", {
          description: "An unexpected error occurred during video deletion.",
        });
      } finally {
        setConfirmToast({ show: false, photoId: "", isDeletingVideo: false });
        setDashboardLoading(false);
      }
    } else {
      try {
        const success = await photoStore.deletePhoto(confirmToast.photoId);
        if (success) {
          toast.success(`Photo has been deleted`, {
            description: "The photo has been removed from your gallery.",
          });
          await photoStore.fetchPhotos();
        } else {
          toast.error("Failed to delete photo", {
            description:
              "There was an error deleting the photo from the database.",
          });
        }
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast.error("Failed to delete photo. Please try again.", {
          description: "An unexpected error occurred during photo deletion.",
        });
      } finally {
        setConfirmToast({ show: false, photoId: "", isDeletingVideo: false });
        setDashboardLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmToast({ show: false, photoId: "", isDeletingVideo: false });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
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
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onVideoFileSelect={handleVideoFileSelect}
            onAddPhoto={handleAddPhoto}
            onAddVideo={handleAddVideo}
            onSetNewPhoto={setNewPhoto}
            onSetNewVideo={setNewVideo}
            onCloseForm={() => setShowAddForm(false)}
          />

          <DashboardStats
            photos={photos}
            videos={videos}
            categories={categories}
          />

          <ImageGrid
            key={`image-grid-${photos.length}`}
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
          />

          <VideoGrid
            key={`video-grid-${videos.length}`}
            videos={videos}
            onDeleteVideo={handleDeleteVideo}
          />
        </div>
      </div>

      <DeleteConfirmationToast
        show={confirmToast.show}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
