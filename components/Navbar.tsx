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

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </motion.svg>
);

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "The Studio", href: "/studio" },
    {
      name: "Projects",
      href: "/project",
      subLinks: [
        { name: "Residential", href: "/project?category=residential" },
        { name: "Commercial", href: "/project?category=commercial" },
        { name: "Interior", href: "/project?category=interior" },
        { name: "Landscape", href: "/project?category=landscape" }
      ]
    },
    { name: "Gallery", href: "/gallery" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <>
      {/* Hover Trigger Zone */}
      <div
        className="fixed top-0 left-0 w-full h-16 z-[90] pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed top-0 left-0 w-full z-[100] transition-all duration-700 py-4 md:py-6 px-6 md:px-12 flex justify-between items-center",
          (isScrolled || isHovered)
            ? "bg-brand-background/95 backdrop-blur-md border-b border-brand-border py-3 md:py-4 opacity-100 translate-y-0 pointer-events-auto"
            : "bg-transparent opacity-0 -translate-y-full pointer-events-none"
        )}>

        <Link href="/" className="flex items-center gap-1 md:gap-2 cursor-none group">
          <div className="w-fit h-fit flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className='bg-transparent' style={{ height: 'auto' }} />
          </div>
          <span className="font-display font-bold uppercase tracking-[0.2em] text-[7px] md:text-[10px] leading-tight flex flex-col">
            <span className='text-brand-green'>Rushikesh Sutar</span>
            <span className="">& Associates</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-4 text-[10px] uppercase tracking-[0.3em] font-medium text-brand-text/60">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="relative group/nav"
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link
                href={link.href}
                className="hover:text-brand-green transition-colors cursor-none px-2 py-4 block"
              >
                {link.name}
              </Link>

              {link.subLinks && (
                <AnimatePresence>
                  {hoveredLink === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48"
                    >
                      <div className="bg-brand-background border border-brand-border rounded-2xl shadow-xl overflow-hidden px-2 py-2 backdrop-blur-xl">
                        {link.subLinks.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-6 py-4 text-[9px] uppercase tracking-widest font-bold hover:bg-brand-green hover:text-white transition-all cursor-none"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center justify-center p-3 rounded-full bg-brand-text text-white hover:bg-brand-green transition-all cursor-none"
        >
          <ScaleIcon isOpen={isMenuOpen} />
        </button>

      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-0 right-0 bg-black z-[200] flex flex-col md:w-[500px] shadow-left p-12 md:p-24 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-16 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Navigation</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-brand-green transition-colors cursor-none"
              >
                <ScaleIcon isOpen={true} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-4xl md:text-6xl font-display font-bold text-white hover:text-brand-green transition-all tracking-tighter"
                    >
                      {link.name}
                    </Link>
                    {link.subLinks && (
                      <button
                        onClick={() => setOpenMobileDropdown(openMobileDropdown === link.name ? null : link.name)}
                        className="text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-none"
                      >
                        <ChevronIcon isOpen={openMobileDropdown === link.name} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {link.subLinks && openMobileDropdown === link.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 pl-2">
                          {link.subLinks.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="text-lg font-display font-medium text-white/40 hover:text-brand-green transition-all tracking-tight uppercase block py-2"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
    </>
  );
};