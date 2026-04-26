import { motion } from 'motion/react';

export const Stats = () => {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-24 border-y border-brand-border bg-white/5 backdrop-blur-[2px] z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
        <div className="flex flex-col items-center text-center">
          <span className="text-brand-green font-display text-6xl md:text-8xl font-light tracking-tighter mb-4 italic">08+</span>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Years of Experience</span>
        </div>
        <div className="flex flex-col items-center text-center md:border-x md:border-brand-border">
          <span className="text-brand-text font-display text-6xl md:text-8xl font-light tracking-tighter mb-4 italic">01M+</span>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Total Built-up Area</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-brand-sage font-display text-6xl md:text-8xl font-light tracking-tighter mb-4 italic">100+</span>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Total Number of Clients</span>
        </div>
      </div>
    </section>
  );
};

export const Clients = () => {
  const clients = ['Larsen & Toubro', 'Godrej Properties', 'Lodha Group', 'Shapoorji Pallonji', 'Tata Housing', 'Hiranandani'];
  
  return (
    <section className="py-20 border-b border-brand-border bg-white overflow-hidden">
      <div className="flex overflow-hidden grayscale opacity-30 hover:opacity-100 transition-opacity duration-1000">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-32 whitespace-nowrap py-4"
        >
          {[...clients, ...clients].map((client, i) => (
            <div key={i} className="text-2xl font-display font-medium tracking-tight uppercase">
              {client}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
