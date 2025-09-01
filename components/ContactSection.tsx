import Link from "next/link";

export default function ContactSection() {
  return (
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
            Whether it's a portrait session, wedding day, or special event, I'm
            here to capture your most precious moments.
          </p>

          <div className="pt-8">
            <Link
              href="/contact"
              className="px-12 py-4 text-base font-light border border-black hover:bg-black/70 transition-all duration-300 bg-black text-white rounded-lg cursor-pointer"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
