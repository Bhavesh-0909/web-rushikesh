"use client";

import React, { useEffect, useState } from "react";
import { logoData } from "./LogoData";
import "./transition.css";

const AnimatedText = ({ text, x, y, fontSize, fontWeight, letterSpacing, delayBase, color, isActive, textAnchor = "start" }: any) => {
  return (
    <text 
      x={x} 
      y={y} 
      textAnchor={textAnchor}
      style={{ 
        fill: color, 
        fontSize, 
        fontWeight, 
        letterSpacing, 
        fontFamily: 'var(--font-montserrat), sans-serif' 
      }}
    >
      {text.split('').map((char: string, i: number) => {
        // Deterministic "random" delay
        const rnd = (Math.abs(Math.sin(i * 123.456)) * 0.8);
        return (
          <tspan
            key={i}
            className={`char ${isActive ? 'active' : ''}`}
            style={{ 
              animationDelay: `${delayBase + rnd}s` 
            } as React.CSSProperties}
          >
            {char === ' ' ? '\u00A0' : char}
          </tspan>
        );
      })}
    </text>
  );
};

const AnimatedLogo = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full max-w-5xl mx-auto py-12 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="logo-container">
        <svg
          viewBox="0 0 2327.25 696"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="matrix(0.749758, 0, 0, 0.749758, 0, 0.112132)">
            {/* Symbol Group: Symbol + Guides (Slides to left at 3s) */}
            <g className={`symbol-group ${isActive ? "active" : ""}`}>
              {/* symbol (0-3s) with 360-degree clock mask */}
              <g className={isActive ? "symbol-mask" : ""}>
                <image
                  href="/final logo1 (1).png"
                  x="20"
                  y="0"
                  width="900"
                  height="900"
                  className={`logo-image ${isActive ? "active" : ""}`}
                />
              </g>
            </g>

            {/* 2. Main Logo Rest (3s-6s) - Unique Character Reveal */}
            <g>
              <AnimatedText 
                text="RUSHIKESH SUTAR"
                x="1000"
                y="310"
                fontSize="180px"
                fontWeight={700}
                letterSpacing="0.05em"
                delayBase={3.0}
                color="#28917B"
                isActive={isActive}
              />
              <AnimatedText 
                text="& ASSOCIATES"
                x="1000"
                y="510"
                fontSize="180px"
                fontWeight={700}
                letterSpacing="0.05em"
                delayBase={3.5}
                color="#1A1A1A"
                isActive={isActive}
              />
              <AnimatedText 
                text="ARCHITECTS"
                x="1000"
                y="710"
                fontSize="140px"
                fontWeight={400}
                letterSpacing="0.65em"
                delayBase={4.0}
                color="#28917B"
                isActive={isActive}
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedLogo;
