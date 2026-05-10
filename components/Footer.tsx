'use client';
import MapComponent from "./MapComponent";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/contact" && pathname !== "/youcantseeme" && <div className="px-6 md:px-24 mb-12">
        <div className="border border-brand-border/40 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tighter leading-[1.0] mb-6">
              Start your <span className="text-brand-green italic">project</span> with us.
            </h2>
            <p className="text-brand-text/30 text-sm font-light max-w-sm mx-auto mb-10">
              Our team responds within 24–48 hours. Share your brief and let's explore what we can create together.
            </p>
            <a href="/contact" className="inline-flex items-center gap-3 bg-brand-green text-brand-background text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-full hover:bg-brand-green/80 transition-all duration-500">
              Start Your Project
            </a>
          </div>
        </div>
      </div>}
      <footer className="relative px-6 md:px-24 py-16 md:py-24 bg-brand-text text-white z-30 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24 relative z-10">
          <div className="max-w-md">
            <div className="flex items-center gap-4 mb-10 group cursor-none">
              <div className="w-fit h-fit flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={50} height={50} className='bg-transparent' style={{ height: 'auto' }} />
              </div>
              <span className="font-display font-bold uppercase tracking-widest text-lg md:text-xl text-brand-green text-left">
                Rushikesh Sutar <br />
                <span className="text-white">& Associates</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-12 font-light">
              Crafting architecture that resonates with its environment and serves its community. Premium design solutions for modern living.
            </p>
            <div className="grid grid-cols-2 gap-x-16 gap-y-12 text-[10px] uppercase tracking-[0.3em] text-white/30">
              <div className="flex flex-col gap-4">
                <span className="text-brand-green font-black mb-2 opacity-100">Navigation</span>
                <a href="#about" className="hover:text-white transition-colors cursor-none">Studio</a>
                <a href="/gallery" className="hover:text-white transition-colors cursor-none">Gallery</a>
                <a href="/project" className="hover:text-white transition-colors cursor-none">Projects</a>
                <a href="/team" className="hover:text-white transition-colors cursor-none">Collective</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-brand-green font-black mb-2 opacity-100">Connect</span>
                <a href="#" className="hover:text-white transition-colors cursor-none">Instagram</a>
                <a href="#" className="hover:text-white transition-colors cursor-none">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors cursor-none">Behance</a>
              </div>
            </div>
          </div>
          <div className="md:text-right w-full h-[250px] md:h-[300px] flex flex-col justify-end pt-12 md:pt-0">
            <MapComponent />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] uppercase tracking-[0.4em] font-medium text-white/20 pt-12 border-t border-white/5 relative z-10">
          <p>© 2026 RUSHIKESH SUTAR & ASSOCIATES. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors cursor-none">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors cursor-none term-link">Terms of use</a>
          </div>
        </div>

        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-green/10 blur-[150px] rounded-full pointer-events-none" />
      </footer>
    </>
  );
};
