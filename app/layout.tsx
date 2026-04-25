import type { Metadata } from "next";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CustomCursor } from "./components/CustomCursor";
import { SmoothScroll } from "./components/SmoothScroll";

// 1. Configure your custom fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} antialiased`}>
      <body className="relative min-h-screen flex flex-col text-brand-text overflow-x-hidden selection:bg-brand-green selection:text-white bg-brand-background">
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