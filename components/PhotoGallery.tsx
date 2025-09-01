"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import PhotoCard from "@/components/PhotoCard";
import { PhotoStore, Photo } from "@/lib/photo-store";

type PhotoGalleryProps = {
  photoStore: PhotoStore; // Pass photoStore instance
};

export default function PhotoGallery({ photoStore }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [gridImages, setGridImages] = useState<Photo[]>([]);

  const filteredPhotos = gridImages; // On home page, all displayed photos are "filtered" to be the top 20

  // Function to get random 20 photos from all photos
  const getRandomPhotos = (photos: Photo[], count: number): Photo[] => {
    if (!photos || photos.length === 0) return [];

    // If we have 20 or fewer photos, return all
    if (photos.length <= count) return photos;

    // Create a copy of the array to avoid modifying the original
    const shuffled = [...photos];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const initializeGalleryData = async () => {
      // Ensure categories are fetched first for photo category names
      await photoStore.fetchCategories();
      // Then fetch photos
      await photoStore.fetchPhotos();
      const allPhotos = photoStore.getPhotos();
      const randomPhotos = getRandomPhotos(allPhotos, 20);
      setGridImages(randomPhotos);
    };

    initializeGalleryData();

    const unsubscribe = photoStore.subscribe(() => {
      const allPhotos = photoStore.getPhotos();
      const randomPhotos = getRandomPhotos(allPhotos, 20);
      setGridImages(randomPhotos);
    });

    return () => {
      unsubscribe();
    };
  }, [photoStore]); // Depend on photoStore

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  }, [filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          nextPhoto();
          break;
        case "ArrowLeft":
          prevPhoto();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextPhoto, prevPhoto]);

  return (
    <>
      <section className="pb-32 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
          {gridImages.length > 0 ? (
            gridImages.map((image, index) => (
              <PhotoCard
                key={image.id}
                photo={image}
                index={index}
                photoStore={photoStore}
                openLightbox={openLightbox}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 text-xl py-20">
              No Photos To View
            </div>
          )}
        </div>

        {/* Simple CTA */}
        <div className="text-center pt-16 max-w-6xl mx-auto">
          <div className="space-y-8">
            <Link
              href="/gallery"
              className="px-8 py-3 text-base font-light border border-black hover:bg-black/70 transition-all duration-300 bg-black text-white rounded-lg cursor-pointer"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && filteredPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Close lightbox"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Previous photo"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Next photo"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <div className="relative max-w-full max-h-full">
              <Image
                src={photoStore.getPublicPhotoUrl(
                  filteredPhotos[currentPhotoIndex]?.storage_path || ""
                )}
                alt={filteredPhotos[currentPhotoIndex]?.title || "Photo"}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />

              {/* image title and category, length */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                {/* <h3 className="text-white text-xl font-serif font-light mb-2">
                  {filteredPhotos[currentPhotoIndex]?.title}
                </h3> */}
                <div className="flex justify-between items-center">
                  <p className="text-white/60 text-sm font-light">
                    {/* {filteredPhotos[currentPhotoIndex]?.category_name} */}
                  </p>
                  <p className="text-white/60 text-sm font-light">
                    {currentPhotoIndex + 1} of {filteredPhotos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-black/90 -z-10 cursor-pointer"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          ></div>
        </div>
      )}
    </>
  );
}
