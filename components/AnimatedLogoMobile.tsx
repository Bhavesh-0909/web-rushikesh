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

const AnimatedLogoMobile = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full max-w-sm mx-auto transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <svg
        viewBox="0 0 1000 1400"
        className="w-full h-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. Symbol (Top) - Centered */}
        <g transform="matrix(0.8, 0, 0, 0.8, 140, 150)">
          <g className={isActive ? "symbol-mask active" : ""}>
            <image
              href="/final logo1 (1).png"
              x="0"
              y="0"
              width="900"
              height="900"
              className={`logo-image ${isActive ? "active" : ""}`}
            />
          </g>
        </g>

        {/* 2. Text Content (Bottom) - Centered */}
        <g transform="matrix(0.4, 0, 0, 0.4, 100, 1040)">
          <AnimatedText 
            text="RUSHIKESH SUTAR"
            x="1000"
            y="200"
            textAnchor="middle"
            fontSize="240px"
            fontWeight={700}
            letterSpacing="0.05em"
            delayBase={3.0}
            color="#28917B"
            isActive={isActive}
          />
          <AnimatedText 
            text="& ASSOCIATES"
            x="1000"
            y="450"
            textAnchor="middle"
            fontSize="240px"
            fontWeight={700}
            letterSpacing="0.05em"
            delayBase={3.5}
            color="#1A1A1A"
            isActive={isActive}
          />
          <AnimatedText 
            text="ARCHITECTS"
            x="1000"
            y="750"
            textAnchor="middle"
            fontSize="180px"
            fontWeight={400}
            letterSpacing="0.65em"
            delayBase={4.0}
            color="#28917B"
            isActive={isActive}
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogoMobile;
