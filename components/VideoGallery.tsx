"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import VideoCard from "@/components/VideoCard";
import { Category } from "@/lib/photo-store";

interface Video {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
  category_name: string;
}

export default function VideoGallery() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: folders, error: folderError } = await supabase.storage
        .from("videos")
        .list("", { search: "" });

      if (folderError) {
        console.error("Error listing folders:", folderError);
        return;
      }

      const videoPromises = folders
        .filter((folder) => !folder.name.startsWith("."))
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
              category_name: folder.name
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            };
          });
        });

      const videosByFolder = await Promise.all(videoPromises);
      const allVideos = videosByFolder.flat();
      setVideos(allVideos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchCategories();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchVideos, fetchCategories]);

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter((video) => video.category_name === selectedCategory);

  const openLightbox = (index: number) => {
    setCurrentVideoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const nextVideo = useCallback(() => {
    if (filteredVideos.length > 0) {
      setCurrentVideoIndex((prev) => (prev + 1) % filteredVideos.length);
    }
  }, [filteredVideos.length]);

  const prevVideo = useCallback(() => {
    if (filteredVideos.length > 0) {
      setCurrentVideoIndex(
        (prev) => (prev - 1 + filteredVideos.length) % filteredVideos.length
      );
    }
  }, [filteredVideos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          nextVideo();
          break;
        case "ArrowLeft":
          prevVideo();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextVideo, prevVideo]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
              Videos
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
              A collection of moments in motion
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
              All {!isLoading && `(${videos.length})`}
            </button>

            {categories.map((category) => {
              const videoCount = videos.filter(
                (v) => v.category_name === category.name
              ).length;
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
                  {category.name} {!isLoading && `(${videoCount})`}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600 text-lg font-light">
                Loading videos...
              </span>
            </div>
          )}

          {!isLoading && (
            <>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredVideos.map((video, index) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      index={index}
                      openLightbox={openLightbox}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-xl py-20">
                  {selectedCategory === "All"
                    ? "No videos to display"
                    : `No videos found in "${selectedCategory}" category`}
                </div>
              )}
            </>
          )}

          {lightboxOpen &&
            filteredVideos.length > 0 &&
            filteredVideos[currentVideoIndex] && (
              <div className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4">
                <div className="relative max-w-3xl max-h-full w-full h-full flex items-center justify-center">
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

                  {filteredVideos.length > 1 && (
                    <button
                      onClick={prevVideo}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
                      aria-label="Previous video"
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

                  {filteredVideos.length > 1 && (
                    <button
                      onClick={nextVideo}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
                      aria-label="Next video"
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

                  <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                    <video
                      src={filteredVideos[currentVideoIndex].publicUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                </div>

                <div
                  className="absolute inset-0 bg-black/90 -z-10 cursor-pointer"
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                ></div>
              </div>
            )}

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
