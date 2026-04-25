import { useState } from 'react';
import { motion } from 'motion/react';
import { teamData } from '../data/home.data';

export const Team = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="team" className="relative py-24 md:py-40 px-6 md:px-24 border-y border-brand-border/30 z-20">
      <div className="flex flex-col items-center text-center mb-32 group">
        <div className="max-w-4xl">
           <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">The Collective</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h2 className="text-5xl md:text-[120px] font-display font-medium tracking-tighter leading-[0.8] mb-12">
            LIVING THE <br/>
            <span className="text-brand-green italic serif uppercase">DESIGN</span>
          </h2>
          <p className="text-base md:text-xl font-light text-brand-text/40 leading-relaxed max-w-2xl mx-auto mt-12">
            Our team brings together diverse expertise across architecture, urban design, and engineering to approach projects holistically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-y-32">
        {teamData.slice(0, !showAll ? 3 : teamData.length).map((member, idx) => (
          <motion.div 
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="group cursor-none"
          >
            <div className="aspect-[4/5] bg-brand-background rounded-3xl overflow-hidden mb-8 relative border border-brand-border group-hover:border-brand-green transition-colors duration-700">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="text-2xl font-display font-medium tracking-tight mb-2 group-hover:text-brand-green transition-colors">{member.name}</h3>
            <p className="text-brand-green text-[10px] uppercase tracking-widest font-bold mb-6">{member.role}</p>
            <p className="text-xs md:text-sm text-brand-text/40 max-w-xs leading-relaxed lowercase">{member.description}</p>
          </motion.div>
        ))}
      </div>

      {!showAll && (
        <div className="mt-20 flex justify-center px-6 md:px-0">
          <button 
            onClick={() => setShowAll(true)}
            className="w-full md:w-auto md:px-16 py-6 glass rounded-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-green hover:text-white transition-all cursor-none"
          >
            Meet The Full Team
          </button>
        </div>
      )}
    </section>
  );
};
