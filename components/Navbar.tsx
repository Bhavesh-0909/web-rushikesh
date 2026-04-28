"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ScaleIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="6" y1="12" x2="6" y2="16" />
    <line x1="10" y1="12" x2="10" y2="14" />
    <line x1="14" y1="12" x2="14" y2="16" />
    <line x1="18" y1="12" x2="18" y2="14" />
  </motion.svg>
);

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "The Studio", href: isHomePage ? "#about" : "/about" },
    { name: "Projects", href: "/project" },
    { name: "Gallery", href: "/gallery" },
    { name: "Team", href: isHomePage ? "#team" : "/team" },
    { name: "Contact", href: isHomePage ? "#contact" : "/contact" }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[100] transition-all duration-700 py-4 md:py-6 px-6 md:px-12 flex justify-between items-center",
      isScrolled 
        ? "bg-brand-background border-b border-brand-border py-3 md:py-4 opacity-100 translate-y-0" 
        : "bg-transparent opacity-0 -translate-y-full pointer-events-none"
    )}>
      <Link href="/" className="flex items-center gap-1 md:gap-2 cursor-none group">
        <div className="w-fit h-fit flex items-center justify-center">
          <Image src="/logo.png" alt="Logo" width={50} height={50} className='bg-transparent' style={{ height: 'auto' }} />
        </div>
        <span className="font-display font-bold uppercase tracking-[0.2em] text-[7px] md:text-[10px] leading-tight flex flex-col">
          <span>Rushikesh Sutar</span>
          <span className="text-brand-green">& Associates</span>
        </span>
      </Link>

      <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-medium text-brand-text/60">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="hover:text-brand-green transition-colors cursor-none"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden flex items-center justify-center p-3 rounded-full bg-brand-text text-white hover:bg-brand-green transition-all cursor-none"
      >
        <ScaleIcon isOpen={isMenuOpen} />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-0 right-0 bg-brand-text z-[200] flex flex-col md:w-[500px] shadow-left p-12 md:p-24"
          >
            <div className="flex justify-between items-center mb-24">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Navigation</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-brand-green transition-colors cursor-none"
              >
                <ScaleIcon isOpen={true} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl md:text-6xl font-display font-bold text-white hover:text-brand-green transition-all tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-12 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-green mb-6">Connect</p>
              <div className="flex flex-col gap-4 text-white/50 text-sm">
                <a href="mailto:rushikesh@rsandassociates.co.in" className="hover:text-white transition-colors">rushikesh@rsandassociates.co.in</a>
                <p>Oracle Business Park, Thane West</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] md:hidden"
        />
      )}
    </nav>
  );
};