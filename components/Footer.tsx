import MapComponent from "./MapComponent";
import Image from "next/image";
export const Footer = () => {
  return (
    <footer className="relative px-6 md:px-24 py-20 md:py-32 bg-brand-text text-white z-30 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-4 mb-10 group cursor-none">
            <div className="w-fit h-fit flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={50} height={50} className='bg-transparent' style={{ height: 'auto' }} />
            </div>
            <span className="font-display font-bold uppercase tracking-widest text-lg md:text-xl text-left">
              Rushikesh Sutar <br />
              <span className="text-brand-green">& Associates</span>
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
  );
};
