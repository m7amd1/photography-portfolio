"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [gridImages] = useState(() => {
    const photos: any[] = [];
    let id = 1;
    const categories = [
      "Events",
      "Wedding",
      "Portrait",
      "Commercial",
      "Food",
      "Cities",
    ];

    for (let i = 0; i < 20; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      photos.push({
        id: id++,
        title: `Gallery Image ${i + 1}`,
        url_m: `/24.png`,
        url_l: `/24.png`,
        tags: category.toLowerCase(),
        category: category,
        fallback: "/placeholder.svg",
      });
    }
    return photos;
  });

  const filteredPhotos = gridImages;

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white transform skew-x-12 origin-top-right"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-white transform -skew-x-6"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div
              className={`transition-all duration-1500 delay-300 ${
                isLoaded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="relative aspect-[3/4] max-w-md mx-auto">
                <Image
                  src="/hero.png"
                  alt="Photographer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
            <div
              className={`space-y-8 transition-all duration-1500 ${
                isLoaded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div className="space-y-4">
                <div className="text-2xl sm:text-3xl text-gray-700 font-light">
                  Where Light Meets Emotion
                </div>
                <div className="space-y-2">
                  <h1 className="font-serif text-5xl sm:text-6xl lg:text-5xl font-bold">
                    <span className="text-yellow-500 tracking-tight pr-2">
                      Photography
                    </span>
                    that speaks louder than words.
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-32">
        <div className="max-w-4xl mx-auto text-left px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="space-y-2">
              <div className="text-black text-2xl sm:text-3xl lg:text-4xl font-light italic">
                All <span className="font-serif font-bold">Good</span>
              </div>
              <div className="text-black text-2xl sm:text-3xl lg:text-4xl font-light italic">
                things start with the letter{" "}
                <span className="text-5xl sm:text-6xl font-serif">'P'</span>
              </div>
            </div>

            <div className="pt-5">
              <div className="text-black text-3xl sm:text-4xl italic font-serif">
                Photography
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-32 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
          {gridImages.map((image, index) => {
            const [ref, isIntersecting] = useIntersectionObserver({
              threshold: 0.1,
            });

            return (
              <div
                key={image.id}
                ref={ref as React.RefObject<HTMLDivElement>}
                className={cn(
                  "group cursor-pointer transition-all duration-700 ease-out",
                  isIntersecting
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90"
                )}
                style={{ transitionDelay: `${index * 75}ms` }}
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square overflow-hidden cursor-pointer shadow-sm group-hover:shadow-lg transition-all duration-500">
                  <Image
                    src={image.url_m}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = image.fallback;
                    }}
                  />
                  {/* Black overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500"></div>
                  {/* Optional: Add a subtle border effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 transition-all duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple CTA */}
        <div className="text-center pt-16 max-w-6xl mx-auto">
          <div className="space-y-8">
            <Link
              href="/gallery"
              className="px-8 py-3 text-base font-light border border-gray-900 hover:bg-gray-800 transition-all duration-500 bg-black text-white rounded-md cursor-pointer"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Contact section  */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="w-12 h-px bg-gray-400 mx-auto"></div>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-black leading-relaxed">
                Let's create something
                <br />
                <em className="font-medium">beautiful together</em>
              </h2>
              <div className="w-12 h-px bg-gray-400 mx-auto"></div>
            </div>

            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Whether it's a portrait session, wedding day, or special event,
              I'm here to capture your most precious moments.
            </p>

            <div className="pt-8">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-12 py-4 text-base text-white font-light bg-gray-900 hover:bg-gray-800 transition-all duration-500 rounded-md cursor-pointer"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                src={
                  filteredPhotos[currentPhotoIndex]?.url_l ||
                  filteredPhotos[currentPhotoIndex]?.url_m
                }
                alt={filteredPhotos[currentPhotoIndex]?.title || ""}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    filteredPhotos[currentPhotoIndex]?.fallback || "/hero.png";
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
    </div>
  );
}
