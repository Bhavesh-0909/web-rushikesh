import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, Award, Users } from 'lucide-react';
import { projects } from '../app/data/home.data';
import { cn } from '@/lib/utils';

export const Projects = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="projects" className="relative py-40 bg-white/[0.02] backdrop-blur-[1px] text-brand-text z-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
         <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] text-brand-green"
        >
          <Briefcase size={120} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-[15%] text-brand-green"
        >
          <Award size={160} />
        </motion.div>
      </div>

      <div className="relative mb-24 flex flex-col items-center text-center gap-12 px-6 md:px-24">
        <div className="max-w-3xl">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">Portfolio</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h2 className="text-5xl md:text-8xl font-display font-medium tracking-tighter mb-12">HIGHLIGHT <span className="text-brand-green italic serif">WORKS</span></h2>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          {['All', 'Residential', 'Commercial', 'Liaisoning'].map(cat => (
            <button key={cat} className="text-[9px] uppercase font-bold tracking-[0.2em] px-10 py-4 glass rounded-full hover:bg-brand-green hover:text-white transition-all cursor-none">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-24 columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
        {projects.slice(0, !showAll ? 3 : projects.length).map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="group cursor-none break-inside-avoid bg-brand-background border border-brand-border/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700"
          >
            <div className={cn(
              "overflow-hidden relative",
              idx % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
            )}>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand-green scale-50 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
            <div className="p-8">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                 <span className="text-[10px] uppercase tracking-widest text-brand-green font-bold px-3 py-1 bg-brand-green/5 rounded-full">{project.category}</span>
               </div>
               <p className="text-[10px] uppercase tracking-widest opacity-30">{project.location}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {!showAll && (
        <div className="mt-16 flex justify-center px-6 md:px-12">
          <button 
            onClick={() => setShowAll(true)}
            className="w-full md:w-auto md:px-16 py-6 glass rounded-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-green hover:text-white transition-all cursor-none"
          >
            View All Projects
          </button>
        </div>
      )}
    </section>
  );
};
