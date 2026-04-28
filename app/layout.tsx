import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CustomCursor } from "../components/CustomCursor";
import { SmoothScroll } from "../components/SmoothScroll";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

// 1. Configure your custom fonts
const arial = localFont({
  src: "../public/fonts/Arial-Bold.ttf",
  variable: "--font-arial-bold",
});


export const metadata: Metadata = {
  title: "Rushikesh Sutar & Associates",
  description: "Architecture and Design Studio Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", arial.variable, "font-arial-bold")}>
      <body className="relative min-h-screen flex flex-col text-brand-text overflow-x-hidden selection:bg-brand-green selection:text-white bg-brand-background">
        <Toaster position="top-center" richColors />
        <SmoothScroll>
          <CustomCursor />
          <Navbar />

          <main className="grow">
            {children}
          </main>

          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}