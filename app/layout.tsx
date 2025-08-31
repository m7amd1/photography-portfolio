import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description:
    "Professional photography portfolio showcasing stunning visual stories",
  icons: {
    icon: "/favicon.png",
  },
  keywords: ["photography", "portfolio", "professional", "visual stories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body
        className="font-sans antialiased min-h-screen flex flex-col"
        cz-shortcut-listen="true"
      >
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
