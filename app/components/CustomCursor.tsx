"use client";
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react'; // Requires: npm install @gsap/react
import { cn } from '../lib/utils';

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useGSAP(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0 });
      gsap.to(ringRef.current, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest('button, a, .group');
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    };
  }); // useGSAP handles all the animation cleanup automatically!

  return (
    <>
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-brand-green rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      <div 
        ref={ringRef}
        className={cn(
          "fixed top-0 left-0 w-10 h-10 border border-brand-green rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 hidden md:block",
          isHovering ? "scale-150 bg-brand-green/10" : "scale-100"
        )}
      />
    </>
  );
};