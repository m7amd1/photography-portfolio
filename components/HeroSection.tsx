import Image from "next/image";
import TypewriterEffect from "@/components/TypewriterEffect";

type HeroSectionProps = {
  isLoaded: boolean;
};

export default function HeroSection({ isLoaded }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white transform skew-x-12 origin-top-right"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-white transform -skew-x-6"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            className={`transition-all duration-1500 delay-300 ${
              isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto">
              <Image
                src="/hero.JPG"
                alt="Photographer image"
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
              <div className="text-2xl sm:text-3xl text-gray-700 font-light min-h-[40px]">
                <TypewriterEffect
                  phrases={[
                    "Where Light Meets Emotion",
                    "Your Story Through Our Lens",
                  ]}
                  typingSpeed={100}
                  deletingSpeed={70}
                />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-5xl font-bold leading-tight">
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
  );
}
