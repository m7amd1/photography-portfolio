"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-lg text-gray-600 mb-4 font-light tracking-wide">
              About Me
            </p>
            <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-tight">
              Photography
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
              I capture stories through light and shadow.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div
              className={`transition-all duration-1000 delay-200 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
                <Image
                  src="/hero.png"
                  alt="yourname - Professional Photographer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-400 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-8 pt-8">
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed font-light">
                  <p>
                    Photography found me in 2014, and since then, it has been my
                    way of understanding the world. What began as curiosity
                    became passion, and passion became purpose.
                  </p>
                  <p>
                    I believe every photograph should tell a story worth
                    remembering. Whether it's the quiet intimacy of a portrait
                    or the grand celebration of a wedding, I seek the authentic
                    moments that reveal who we truly are.
                  </p>
                  <p>
                    My approach is simple: listen first, observe deeply, and
                    capture honestly. The best photographs happen when people
                    forget the camera exists.
                  </p>
                </div>
                {/* 
                <div className="pt-8">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p className="text-3xl font-serif font-light text-gray-900">
                        500+
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Stories Captured
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-light text-gray-900">
                        10+
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Years Experience
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-600 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-gray-900 mb-16">
              What Guides Me
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "Authenticity",
                  description: "Real moments over posed perfection",
                },
                {
                  title: "Simplicity",
                  description: "Finding beauty in the understated",
                },
                {
                  title: "Connection",
                  description: "Building trust before lifting the camera",
                },
              ].map((value, index) => (
                <div
                  key={value.title}
                  className={`transition-all duration-1000 ${
                    isLoaded
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 200 + 800}ms` }}
                >
                  <h3 className="font-serif text-2xl font-light text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
  );
}
