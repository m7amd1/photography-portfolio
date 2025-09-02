"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { PhotoStore, Photo, Category } from "@/lib/photo-store";
import PhotoCard from "@/components/PhotoCard";

export default function GalleryPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const photoStore = PhotoStore.getInstance(supabase);

  // Filter photos based on selected category
  const filteredPhotos =
    selectedCategory === "All"
      ? photos
      : photos.filter((photo) => photo.category_name === selectedCategory);

  // Load photos and categories on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (hasFetchedData) return; // Prevent duplicate fetching

      try {
        setIsLoadingCategories(true);
        setIsLoadingPhotos(true);

        // Fetch categories first, then photos
        await photoStore.fetchCategories();
        setCategories(photoStore.getCategories());
        setIsLoadingCategories(false);

        await photoStore.fetchPhotos();
        setPhotos(photoStore.getPhotos());
        setIsLoadingPhotos(false);
        setHasFetchedData(true); // Mark data as fetched
      } catch (error) {
        console.error("Error initializing gallery data:", error);
        setIsLoadingCategories(false); // Ensure loading is false even on error
        setIsLoadingPhotos(false); // Ensure loading is false even on error
        setHasFetchedData(true); // Mark data as fetched even on error to prevent retries
      }
    };

    // Initialize data
    initializeData();

    // Set up subscriptions for real-time updates
    const unsubscribePhotos = photoStore.subscribe(() => {
      setPhotos(photoStore.getPhotos());
    });

    const unsubscribeCategories = photoStore.subscribeToCategories(() => {
      setCategories(photoStore.getCategories());
    });

    // Set up scroll listener for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    // Trigger loaded animation after a short delay
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      unsubscribePhotos();
      unsubscribeCategories();
    };
  }, []);

  // Reset current photo index when category changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    if (lightboxOpen && filteredPhotos.length === 0) {
      closeLightbox();
    }
  }, [selectedCategory, lightboxOpen, filteredPhotos.length]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
    if (filteredPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % filteredPhotos.length);
    }
  }, [filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    if (filteredPhotos.length > 0) {
      setCurrentPhotoIndex(
        (prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length
      );
    }
  }, [filteredPhotos.length]);

  // Handle keyboard navigation
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

  // Get photo count for each category
  const getPhotosCountForCategory = (categoryName: string) => {
    return photos.filter((photo) => photo.category_name === categoryName)
      .length;
  };

  const isLoading = isLoadingPhotos || isLoadingCategories;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-tight">
              Gallery
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
              A collection of moments that matter
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter Buttons */}
          <div
            className={`flex flex-wrap justify-center gap-2 mb-20 transition-all duration-1000 delay-200 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* All Categories Button */}
            <button
              key="All"
              onClick={() => setSelectedCategory("All")}
              disabled={isLoading}
              className={`px-6 py-2 text-sm font-light tracking-wide transition-all duration-300 border-b-2 cursor-pointer disabled:opacity-50 ${
                selectedCategory === "All"
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All {!isLoading && `(${photos.length})`}
            </button>

            {/* Individual Category Buttons */}
            {categories.map((category) => {
              const photoCount = getPhotosCountForCategory(category.name);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  disabled={isLoading}
                  className={`px-6 py-2 text-sm font-light tracking-wide transition-all duration-300 border-b-2 cursor-pointer disabled:opacity-50 ${
                    selectedCategory === category.name
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {category.name} {!isLoading && `(${photoCount})`}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600 text-lg font-light">
                Loading gallery...
              </span>
            </div>
          )}

          {/* Photo Grid */}
          {!isLoading && (
            <>
              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPhotos.map((photo, index) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      index={index}
                      photoStore={photoStore}
                      openLightbox={openLightbox}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-xl py-20">
                  {selectedCategory === "All"
                    ? "No photos to display"
                    : `No photos found in "${selectedCategory}" category`}
                </div>
              )}
            </>
          )}

          {/* Lightbox Modal */}
          {lightboxOpen &&
            filteredPhotos.length > 0 &&
            filteredPhotos[currentPhotoIndex] && (
              <div className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4">
                <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                  {/* Close Button */}
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

                  {/* Previous Button */}
                  {filteredPhotos.length > 1 && (
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
                  )}

                  {/* Next Button */}
                  {filteredPhotos.length > 1 && (
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
                  )}

                  {/* Main Image */}
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

                    {/* Image Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                      {filteredPhotos[currentPhotoIndex]?.title && (
                        <h3 className="text-white text-xl font-serif font-light mb-2">
                          {filteredPhotos[currentPhotoIndex].title}
                        </h3>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-white/70 text-sm font-light">
                          Category:{" "}
                          {filteredPhotos[currentPhotoIndex]?.category_name}
                        </p>
                        <p className="text-white/70 text-sm font-light">
                          {currentPhotoIndex + 1} of {filteredPhotos.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Overlay */}
                <div
                  className="absolute inset-0 bg-black/90 -z-10 cursor-pointer"
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                ></div>
              </div>
            )}

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-black/85 hover:bg-black text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
              aria-label="Scroll to top"
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
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .lightbox-overlay {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(5px);
        }
      `}</style>
    </div>
  );
}
