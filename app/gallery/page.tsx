"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Events",
  "Wedding",
  "Portrait",
  "Commercial",
  "Food",
  "Cities",
];

// Generate 50 sample photos with categories
const generatePhotos = () => {
  const categoryImages = {
    Events: 8,
    Wedding: 10,
    Portrait: 12,
    Commercial: 7,
    Food: 6,
    Cities: 7,
  };

  const photos: any[] = [];
  let id = 1;

  Object.entries(categoryImages).forEach(([category, count]) => {
    for (let i = 0; i < count; i++) {
      photos.push({
        id: id++,
        title: `${category} Photo ${i + 1}`, // Keep dynamic title for gallery
        url_m: `/24.png`,
        url_l: `/24.png`,
        tags: category.toLowerCase(),
        category: category,
        fallback: "/24.png"
      });
    }
  });

  return photos;
};

export default function GalleryPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos] = useState(generatePhotos());
  const [showScrollTop, setShowScrollTop] = useState(false);

  const filteredPhotos =
    selectedCategory === "All"
      ? photos
      : photos.filter(photo => photo.category === selectedCategory);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-white">
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
          <div
            className={`flex flex-wrap justify-center gap-2 mb-20 transition-all duration-1000 delay-200 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 text-sm font-light tracking-wide transition-all duration-300 border-b-2 cursor-pointer ${
                  selectedCategory === category
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {category} {category !== "All" && `(${photos.filter(p => p.category === category).length})`}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo, index) => {
              const [ref, isIntersecting] = useIntersectionObserver({
                threshold: 0.1,
              });

              const isVisible = selectedCategory === "All" || photo.category === selectedCategory;

              return (
                <div
                  key={photo.id}
                  ref={ref as React.RefObject<HTMLDivElement>}
                  className={cn(
                    "group cursor-pointer transition-all duration-700 ease-out",
                    isIntersecting && isVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90",
                    !isVisible && "hidden" // Hide if not in selected category
                  )}
                  style={{ transitionDelay: `${index * 75}ms` }}
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-500">
                    <Image
                      src={photo.url_m}
                      alt="Photo"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = photo.fallback;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Lightbox Modal */}
          {lightboxOpen && (
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
                    src={filteredPhotos[currentPhotoIndex]?.url_l || filteredPhotos[currentPhotoIndex]?.url_m}
                    alt={filteredPhotos[currentPhotoIndex]?.title || ""}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = filteredPhotos[currentPhotoIndex]?.fallback || "/hero.png";
                    }}
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                    <h3 className="text-white text-xl font-serif font-light mb-2">
                      {filteredPhotos[currentPhotoIndex]?.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-white/60 text-sm font-light">
                        {filteredPhotos[currentPhotoIndex]?.category}
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

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
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
