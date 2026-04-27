"use client";

import { motion } from 'motion/react';
import { teamData } from '../data/home.data';

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-24 relative overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex justify-center items-center gap-4 mb-4 md:mb-6">
            <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.3em] font-bold">The Collective</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-[80px] font-display font-medium tracking-tighter leading-[0.9] mb-4 md:mb-6">
            OUR <br className="md:hidden" />
            <span className="text-brand-green italic serif uppercase">TEAM</span>
          </h1>
          <p className="text-[10px] text-center md:text-xs font-light text-brand-text/50 leading-relaxed max-w-2xl">
            A diverse group of visionaries, architects, and designers working collaboratively to shape the future of spaces. We bring together varied expertise to approach every project holistically.
          </p>
        </motion.div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-x-16 lg:gap-y-32">
          {teamData.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 3) * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="group cursor-none flex flex-col h-full"
            >
              <div className="aspect-[3/4] bg-brand-background rounded-[2rem] overflow-hidden mb-8 relative border border-brand-border group-hover:border-brand-green transition-colors duration-700 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-green/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none mix-blend-overlay"></div>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-3xl font-display font-medium tracking-tight mb-2 group-hover:text-brand-green transition-colors duration-500">{member.name}</h3>
                <p className="text-brand-green text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-6">{member.role}</p>
                <div className="w-full h-[1px] bg-brand-border/40 mb-6 group-hover:bg-brand-green/40 transition-colors duration-500 scale-x-0 group-hover:scale-x-100 origin-left" />
                <p className="text-sm md:text-base text-brand-text/50 leading-relaxed font-light">{member.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}