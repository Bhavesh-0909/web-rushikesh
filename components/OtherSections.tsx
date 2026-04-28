import { motion } from 'motion/react';
import Image from 'next/image';
export const Stats = () => {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-24 border-y border-brand-border bg-brand-background z-40">
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
  const clients = [
    {
      id: 1,
      logo: "/clients/TMC.png",
      name: "TMC"
    },
    {
      id: 2,
      logo: "/clients/MGL.jpg",
      name: "MGL"
    },
    {
      id: 3,
      logo: "/clients/Shrusti.png",
      name: "Shrusti Nx"
    },
    {
      id: 4,
      name: "Realtors"
    },
    {
      id: 5,
      name: "Shree Ram"
    },
    {
      id: 6,
      name: "Vijaya Construction company"
    },
    {
      id: 7,
      logo: "/clients/Solitaire.jpg",
      name: "Solitaire developer"
    },
    {
      id: 8,
      logo: "/clients/MIDC.png",
      name: "MIDC"
    },
    {
      id: 9,
      name: "SHREE VARDHAMAN STHANAKVASI JAIN SHRAVAK SANGHA SADRI RAJASTHAN"
    }
  ];


  return (
    <section className="relative py-20 border-b border-brand-border bg-brand-text overflow-hidden z-40">
      <div className="flex overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-1000">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-32 whitespace-nowrap py-4"
        >
          {[...clients, ...clients].map((client, i) => (
            <div key={i} className="flex items-center gap-4">
              {client.logo ? <Image
                src={client.logo}
                alt={client.name}
                width={100}
                height={100}
                className="object-contain"
              /> : <span></span>}
              <span className="text-2xl font-display font-medium tracking-tight uppercase text-white/70 group-hover:text-white transition-colors">
                {client.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export const Awards = () => {
  const awards = [
    { id: 1, name: "Vrukshavalli 2021" },
    { id: 2, name: "Vrukshavalli 2022" },
    { id: 3, name: "Vrukshavalli 2023" }
  ];

  return (
    <section className="relative py-12 border-b border-brand-border bg-brand-text overflow-hidden z-40">
      <div className="flex overflow-hidden opacity-100 transition-opacity duration-1000">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-40 whitespace-nowrap py-2"
        >
          {[...awards, ...awards, ...awards].map((award, i) => (
            <div key={i} className="flex items-center gap-6 group">
              <div className="w-8 h-8 rounded-full border border-brand-green/30 flex items-center justify-center group-hover:scale-125 transition-transform">
                <span className="text-brand-green text-lg">★</span>
              </div>
              <span className="text-3xl md:text-4xl font-display font-light tracking-[0.1em] uppercase text-white/80 group-hover:text-brand-green transition-colors italic">
                {award.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
