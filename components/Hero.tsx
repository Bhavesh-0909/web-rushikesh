import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 800], [1, 0]);
  const y = useTransform(scrollY, [0, 800], [0, -120]);
  const evolutionOpacity = useTransform(scrollY, [0, 400], [0.5, 0]);

  return (
    <section className="hero-section relative min-h-[300vh] w-full z-10">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center px-6 max-w-7xl pt-16 md:pt-10 pb-32 md:pb-0"
        >
          <motion.div
            style={{ opacity, y }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-6 mb-6 md:mb-10">
              <span className="text-[16px] md:text-[18px] italic font-semibold text-brand-green">&ldquo;from concept to cornerstone&rdquo;</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-display font-black leading-tight md:leading-[0.85] tracking-tighter mb-8 md:mb-10 uppercase pointer-events-auto drop-shadow-2xl">
              RUSHIKESH SUTAR <br />
              <span className="text-brand-green italic md:not-italic">& ASSOCIATES</span>
            </h1>

            <div className="bg-brand-text/5 backdrop-blur-md px-6 md:px-10 py-4 md:py-6 rounded-2xl mb-8 md:mb-10 border border-white/10 shadow-xl max-w-[95vw]">
              <p className="text-[10px] sm:text-xs md:text-sm font-display font-black max-w-3xl text-brand-text/80 leading-relaxed tracking-widest uppercase text-center">
                Architecture | Interior | Urban Design | Landscape
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 pointer-events-auto mb-10 md:mb-0">
              <motion.a
                href="#projects"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-4 text-[10px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-black cursor-pointer bg-brand-green text-brand-background px-8 md:px-12 py-4 md:py-6 rounded-full shadow-[0_15px_40px_rgba(37,211,102,0.15)] border border-brand-green/20"
              >
                Explore Projects
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </motion.a>

              <motion.a
                href="#contact"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-4 text-[10px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-black cursor-pointer bg-brand-text text-white px-8 md:px-12 py-4 md:py-6 rounded-full shadow-xl border border-white/10"
              >
                Start A Project
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-brand-green" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
