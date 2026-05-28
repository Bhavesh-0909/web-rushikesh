import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import AnimatedLogoMobile from "./AnimatedLogoMobile";

export function Hero() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white font-sans text-black p-8 sm:p-16 overflow-hidden">
      <main className="flex flex-col items-center w-full max-w-5xl mx-auto layout-shift mt-[15vh] md:mt-14">
        {/* Logo Section */}
        <div className="w-full hidden md:block">
          <AnimatedLogo />
        </div>
        <div className="w-full max-w-sm block md:hidden">
          <AnimatedLogoMobile />
        </div>

        {/* Tagline Section */}
        <div className="mt-4 tagline-appear text-center">
          <p className="text-sm sm:text-xl tracking-[0.4em] uppercase font-light italic text-gray-400">
            from concept to cornerstone
          </p>
        </div>

        {/* Services Section */}
        <div className="mt-4 services-appear text-center">
          <p className="text-xs sm:text-sm tracking-[0.4em] uppercase font-light text-gray-400">
            Architecture &nbsp;|&nbsp; Interior &nbsp;|&nbsp; Urban Design &nbsp;|&nbsp; Landscape
          </p>
        </div>

        {/* Buttons Section - Fades in slowly after transition ends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 10, duration: 1.5, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row gap-4 md:gap-8 pointer-events-auto"
        >
          <motion.a
            href="/project"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center justify-center gap-3 text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-black cursor-pointer bg-[#28977b] text-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-[0_15px_40px_rgba(40,151,123,0.15)] border border-[#28977b]/20"
          >
            Explore Projects
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </motion.a>

          <motion.a
            href="/contact"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center justify-center gap-3 text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-black cursor-pointer bg-black text-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl border border-white/10"
          >
            Start A Project
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-[#28977b]" />
          </motion.a>
        </motion.div>
      </main>
    </div>
  );
}
