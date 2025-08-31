"use client";

import { useState, useEffect } from "react";
import { PhotoStore } from "@/lib/photo-store";
import HeroSection from "@/components/HeroSection";
import QuoteSection from "@/components/QuoteSection";
import PhotoGallery from "@/components/PhotoGallery";
import ContactSection from "@/components/ContactSection";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const photoStore = PhotoStore.getInstance();

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection isLoaded={isLoaded} />

      <QuoteSection />

      {/* Photo Gallery Section */}
      <PhotoGallery photoStore={photoStore} />

      {/* Contact section  */}
      <ContactSection />

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
  );
}
