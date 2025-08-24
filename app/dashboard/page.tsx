"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PhotoStore, Photo, Category } from "@/lib/photo-store";
import { supabase } from "../../lib/supabaseClient";
import { AdminBadge, AdminOnly } from "@/components/AdminBadge";
import { useAuth } from "@/components/AuthProvider";
export default function dashboardPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // State for categories
  const [showAddForm, setShowAddForm] = useState(false);
  const { loading, user, isAdmin } = useAuth();
  const [newPhoto, setNewPhoto] = useState({
    category_id: "",
    file: null as File | null,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmToast, setConfirmToast] = useState<{
    show: boolean;
    photoId: string;
  }>({
    show: false,
    photoId: "",
  });
  const [dragActive, setDragActive] = useState(false);

  const photoStore = PhotoStore.getInstance();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    // async function checkAuth() {
    //   const {
    //     data: { session },
    //   } = await supabase.auth.getSession();
    //   if (!session) {
    //     router.push("/auth");
    //     console.log("not logged in");
    //     setAuth(false);
    //   }
    //   if (session) {
    //     console.log(session);
    //     setAuth(true);
    //   }
    // }
    // checkAuth();
    const unsubscribePhotos = photoStore.subscribe(() => {
      setPhotos(photoStore.getPhotos());
    });
    const unsubscribeCategories = photoStore.subscribeToCategories(() => {
      setCategories(photoStore.getCategories());
      // Set default category if not already set and categories are loaded
      if (photoStore.getCategories().length > 0 && !newPhoto.category_id) {
        setNewPhoto((prev) => ({
          ...prev,
          category_id: photoStore.getCategories()[0].id,
        }));
      }
    });

    photoStore.fetchPhotos();
    photoStore.fetchCategories();

    return () => {
      unsubscribePhotos();
      unsubscribeCategories();
    };
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      setNewPhoto((prev) => ({ ...prev, file }));
    } else {
      showToast("Please select an image or video file", "error");
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
      handleFileSelect(files[0]);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.category_id || !newPhoto.file) {
      showToast("Please fill in all fields and select a file", "error");
      return;
    }

    try {
      await photoStore.addPhoto(newPhoto.category_id, newPhoto.file);
      setNewPhoto({
        category_id: categories[0]?.id || "",
        file: null,
      }); // Reset form
      setShowAddForm(false);
      showToast("Photo added successfully!", "success");
    } catch (error) {
      console.error("Error adding photo:", error);
      showToast("Failed to add photo. Please try again.", "error");
    }
  };

  const handleDeletePhoto = (id: string) => {
    setConfirmToast({ show: true, photoId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      const success = await photoStore.deletePhoto(confirmToast.photoId);
      if (success) {
        showToast(`Photo has been deleted`, "success");
      } else {
        showToast("Failed to delete photo", "error");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      showToast("Failed to delete photo. Please try again.", "error");
    } finally {
      setConfirmToast({ show: false, photoId: "" });
    }
  };

  const handleCancelDelete = () => {
    setConfirmToast({ show: false, photoId: "" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  Photo Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your photography portfolio
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {isAdmin && <AdminBadge />}
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gray-900 hover:bg-gray-800 cursor-pointer"
                >
                  {showAddForm ? "Cancel" : "Add Photo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Add Photo Form */}
          {showAddForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Photo/Video</CardTitle>
                <CardDescription>
                  Upload a new photo or video to your gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPhoto} className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-gray-400 bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {newPhoto.file ? (
                      <div className="space-y-4">
                        <div className="w-32 h-32 mx-auto relative rounded-lg overflow-hidden">
                          {newPhoto.file.type.startsWith("image/") ? (
                            <Image
                              src={
                                URL.createObjectURL(newPhoto.file) ||
                                "/placeholder.svg"
                              }
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {newPhoto.file.name}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setNewPhoto((prev) => ({ ...prev, file: null }))
                          }
                          className="cursor-pointer"
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop files here or click to upload
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports images and videos
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileSelect(e.target.files[0])
                          }
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer bg-transparent"
                            asChild
                          >
                            <span>Choose File</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      value={newPhoto.category_id}
                      onChange={(e) =>
                        setNewPhoto({
                          ...newPhoto,
                          category_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 cursor-pointer"
                    >
                      Add Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">
                  {photos.length}
                </div>
                <p className="text-gray-600">Total Photos</p>
              </CardContent>
            </Card>
            {(() => {
              const categoriesWithPhotos = categories
                .map((category) => ({
                  name: category.name,
                  count: photos.filter(
                    (photo) => photo.category_id === category.id
                  ).length,
                }))
                .sort((a, b) => b.count - a.count) // Sort by count descending
                .slice(0, 3); // Take top 3

              return categoriesWithPhotos.map((category) => (
                <Card key={category.name}>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-gray-900">
                      {category.count}
                    </div>
                    <p className="text-gray-600">{category.name}</p>
                  </CardContent>
                </Card>
              ));
            })()}
          </div>

          {/* Photos Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Photos</CardTitle>
              <CardDescription>Manage your photo collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={photoStore.getPublicPhotoUrl(photo.storage_path)}
                        alt={"Photo"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        {photo.category_name}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Toast for Delete Action */}
      {confirmToast.show && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Photo
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this photo? This action cannot
                be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  className="flex-1 cursor-pointer bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="flex-1 cursor-pointer"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
