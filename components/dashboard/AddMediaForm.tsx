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
import { Category } from "@/lib/photo-store";

interface AddMediaFormProps {
  showAddForm: boolean;
  dragActive: boolean;
  newPhoto: { category_id: string; files: File[] };
  newVideo: { category_id: string; files: File[] };
  categories: Category[];
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: File[]) => void;
  onVideoFileSelect: (files: File[]) => void;
  onAddPhoto: (e: React.FormEvent) => Promise<void>;
  onAddVideo: (e: React.FormEvent) => Promise<void>;
  onSetNewPhoto: (
    updater: (prev: { category_id: string; files: File[] }) => {
      category_id: string;
      files: File[];
    }
  ) => void;
  onSetNewVideo: (
    updater: (prev: { category_id: string; files: File[] }) => {
      category_id: string;
      files: File[];
    }
  ) => void;
  onCloseForm: () => void;
}

export function AddMediaForm({
  showAddForm,
  dragActive,
  newPhoto,
  newVideo,
  categories,
  onDrag,
  onDrop,
  onFileSelect,
  onVideoFileSelect,
  onAddPhoto,
  onAddVideo,
  onSetNewPhoto,
  onSetNewVideo,
  onCloseForm,
}: AddMediaFormProps) {
  if (!showAddForm) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Add Photo Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Photo</CardTitle>
          <CardDescription>Upload a new photo to your gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddPhoto} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
            >
              {newPhoto.files.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-4">
                    {newPhoto.files.map((file, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 relative rounded-lg overflow-hidden"
                      >
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
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
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {newPhoto.files.length} file(s) selected
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onSetNewPhoto((prev) => ({ ...prev, files: [] }))
                    }
                    className="cursor-pointer"
                  >
                    Remove All Files
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
                      Drop image(s) here or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports image files only
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={true}
                    onChange={(e) =>
                      e.target.files && onFileSelect(Array.from(e.target.files))
                    }
                    className="hidden"
                    id="image-file-upload"
                  />
                  <label htmlFor="image-file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-transparent"
                      asChild
                    >
                      <span>Choose Image(s)</span>
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
                  onSetNewPhoto((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
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
                onClick={onCloseForm}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Video Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Video</CardTitle>
          <CardDescription>Upload a new video to your gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddVideo} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
            >
              {newVideo.files.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-4">
                    {newVideo.files.map((file, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 relative rounded-lg overflow-hidden"
                      >
                        {file.type.startsWith("video/") ? (
                          <video
                            src={URL.createObjectURL(file)}
                            controls
                            className="w-full h-full object-cover"
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
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {newVideo.files.length} file(s) selected
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onSetNewVideo((prev) => ({ ...prev, files: [] }))
                    }
                    className="cursor-pointer"
                  >
                    Remove All Files
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
                      Drop video(s) here or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports video files only
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    multiple={true}
                    onChange={(e) =>
                      e.target.files &&
                      onVideoFileSelect(Array.from(e.target.files))
                    }
                    className="hidden"
                    id="video-file-upload"
                  />
                  <label htmlFor="video-file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-transparent"
                      asChild
                    >
                      <span>Choose Video(s)</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="video-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="video-category"
                value={newVideo.category_id}
                onChange={(e) =>
                  onSetNewVideo((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
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
                Add Video
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCloseForm}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
