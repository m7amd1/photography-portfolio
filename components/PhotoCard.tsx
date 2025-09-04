"use client";

import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { Photo, PhotoStore } from "@/lib/photo-store";
import { supabase } from "@/lib/supabaseClient";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  photoStore: PhotoStore;
  openLightbox: (index: number) => void;
}

export default function PhotoCard({
  photo,
  index,
  photoStore,
  openLightbox,
}: PhotoCardProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  photoStore = PhotoStore.getInstance(supabase);

  return (
    <div
      key={photo.id}
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "group cursor-pointer transition-all duration-700 ease-out",
        isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}
      style={{ transitionDelay: `${index * 75}ms` }}
      onClick={() => {
        // console.log("PhotoCard clicked - Index:", index, "Photo ID:", photo.id, "Photo title:", photo.title);
        openLightbox(index);
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-none bg-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-500">
        <Image
          src={photoStore.getPublicPhotoUrl(photo.storage_path)}
          alt={photo.title || "Photo"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg"; // Fallback image
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}
