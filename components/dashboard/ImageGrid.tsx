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

interface ImageGridProps {
  photos: Photo[];
  onDeletePhoto: (id: string) => void;
}

export function ImageGrid({ photos, onDeletePhoto }: ImageGridProps) {
  const photoStore = PhotoStore.getInstance();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>All Images</CardTitle>
        <CardDescription>Manage your image collection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
                <Image
                  src={photoStore.getPublicPhotoUrl(photo.storage_path)}
                  alt={"Photo"}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>

              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeletePhoto(photo.id)}
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
  );
}
