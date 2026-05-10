"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { employees } from "@prisma/client";

/* ─────────────────────────────────────────────
   STATIC DATA  (achievements, timeline, services)
───────────────────────────────────────────── */

const ACHIEVEMENTS = [
  { value: "8+", label: "Years of Experience", suffix: "" },
  { value: "200+", label: "Projects Delivered", suffix: "" },
  { value: "150+", label: "Happy Clients", suffix: "" },
  { value: "7", label: "Expert Team Members", suffix: "" },
];

const SERVICES = [
  {
    icon: "◻",
    title: "Architecture",
    description:
      "Contextual design solutions that balance aesthetics, function, and constructibility — from schematic concept through to built form.",
  },
  {
    icon: "⬡",
    title: "Interiors",
    description:
      "Thoughtful interior environments crafted with spatial precision, material sensitivity, and attention to the way people inhabit space.",
  },
  {
    icon: "◈",
    title: "Landscape",
    description:
      "Outdoor and transitional spaces designed with ecological awareness, integrating planting, hardscape, and human experience.",
  },
  {
    icon: "◻",
    title: "Planning",
    description:
      "Urban and site-level planning strategies that respond to context, regulatory frameworks, and long-term development goals.",
  },
  {
    icon: "⬡",
    title: "Liaisoning",
    description:
      "Expert coordination with municipal and statutory bodies to navigate approvals, permissions, and compliance with clarity.",
  },
];

const TIMELINE = [
  {
    year: "2016",
    event: "Firm Founded",
    detail:
      "Rushikesh Sutar establishes the practice with a focus on context-driven residential architecture.",
  },
  {
    year: "2018",
    event: "Studio Expansion",
    detail:
      "Harshal Sutar and Ruchika Bhurke join; the team begins taking on commercial and interior commissions.",
  },
  {
    year: "2020",
    event: "Urban Design Wing",
    detail:
      "Grishma Sutar co-founds the firm, bringing urban-scale planning capability and CEPT-trained expertise.",
  },
  {
    year: "2022",
    event: "Interior Studio",
    detail:
      "Dedicated interiors team formed; Pratiksha Lokhande joins to lead space-planning and execution support.",
  },
  {
    year: "2024",
    event: "Team Strengthened",
    detail:
      "Dipesh Kotekar and Mamta Tiwari join, expanding design visualisation and operational capacity.",
  },
];

const PHILOSOPHY_PILLARS = [
  {
    num: "01",
    title: "Context First",
    body: "Every site carries a history. We read it before drawing a single line.",
  },
  {
    num: "02",
    title: "Functional Beauty",
    body: "Elegance must be earned through use. We never trade performance for aesthetics.",
  },
  {
    num: "03",
    title: "Collaborative Process",
    body: "Client, consultant, and contractor work as one team from day one.",
  },
  {
    num: "04",
    title: "Detail as Design",
    body: "The quality of a space is decided in its smallest junctions and thresholds.",
  },
];

/* ─────────────────────────────────────────────
   SECTION LABEL — reusable header eyebrow
───────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
      <span className="text-brand-green text-[10px] uppercase tracking-[0.3em] font-bold">
        {text}
      </span>
      <div className="h-[1px] flex-1 bg-brand-border/30" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function HeroSection() {
  return (
    <div className="max-w-7xl mx-auto mb-12 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div className="flex justify-center items-center gap-4 mb-4 md:mb-6">
          <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
          <span className="text-brand-green text-[10px] uppercase tracking-[0.3em] font-bold">
            The Collective
          </span>
          <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-[90px] font-display font-medium tracking-tighter leading-[0.9] mb-6">
          ABOUT <br className="md:hidden" />
          <span className="text-brand-green italic serif uppercase"> US</span>
        </h1>

        <p className="text-xs md:text-sm font-light text-brand-text/50 leading-relaxed max-w-2xl mb-10">
          An architecture and design practice committed to creating functional,
          aesthetic, and context-driven spaces — where every decision is
          intentional and every detail deliberate.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-brand-green" />
          <div className="h-[1px] w-24 bg-brand-border" />
          <div className="w-1 h-1 rounded-full bg-brand-green/40" />
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACHIEVEMENTS
───────────────────────────────────────────── */
function AchievementsSection() {
  return (
    <section className="max-w-7xl mx-auto mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionLabel text="By The Numbers" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-border/30 border border-brand-border/30 rounded-2xl overflow-hidden">
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-transparent px-8 py-10 group hover:bg-brand-green/5 transition-colors duration-500 flex flex-col justify-between"
            >
              <span className="text-5xl md:text-6xl font-display font-medium tracking-tighter text-brand-text group-hover:text-brand-green transition-colors duration-500">
                {a.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 mt-4 font-medium">
                {a.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ABOUT / PHILOSOPHY
───────────────────────────────────────────── */
function AboutSection() {
  return (
    <section className="max-w-7xl mx-auto mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Left — narrative */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionLabel text="Our Belief" />
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tighter leading-[1.05] mb-8">
            Architecture is{" "}
            <span className="text-brand-green italic">more than</span>
            <br />
            construction.
          </h2>
          <div className="space-y-5 text-brand-text/60 text-sm md:text-base leading-relaxed font-light">
            <p>
              At Rushikesh Sutar &amp; Associates, we believe great spaces
              emerge from deep listening — to the site, the client, and the
              community that will inhabit the work.
            </p>
            <p>
              Our approach fuses thoughtful planning, efficient use of space,
              and meticulous attention to detail. We work across residential,
              commercial, interior, and landscape projects, integrating design
              sensibility with technical rigour to deliver outcomes that are
              both beautiful and enduring.
            </p>
            <p>
              Founded on the principle that design innovation and practical
              execution are inseparable, every project we take on reflects that
              conviction — from the first sketch to the final punch list.
            </p>
          </div>
        </motion.div>

        {/* Right — philosophy pillars */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <SectionLabel text="Design Philosophy" />
          {PHILOSOPHY_PILLARS.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              viewport={{ once: true }}
              className="group flex gap-6 items-start border-b border-brand-border/30 pb-6 last:border-0 hover:border-brand-green/30 transition-colors duration-500"
            >
              <span className="text-brand-green/30 font-display text-2xl font-medium tracking-tighter group-hover:text-brand-green/60 transition-colors duration-500 flex-shrink-0 pt-0.5">
                {p.num}
              </span>
              <div>
                <h3 className="text-brand-text font-display font-medium tracking-tight text-lg mb-1 group-hover:text-brand-green transition-colors duration-500">
                  {p.title}
                </h3>
                <p className="text-brand-text/50 text-sm leading-relaxed font-light">
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SERVICES
───────────────────────────────────────────── */
function ServicesSection() {
  return (
    <section className="max-w-7xl mx-auto mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionLabel text="What We Do" />
        <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tighter leading-[1.05] mb-12">
          Full-spectrum{" "}
          <span className="text-brand-green italic">design services</span>.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-brand-border/30 border border-brand-border/30 rounded-2xl overflow-hidden">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-transparent p-8 group hover:bg-brand-green/5 transition-colors duration-500 flex flex-col gap-4"
          >
            <span className="text-brand-green/30 text-3xl font-light group-hover:text-brand-green transition-colors duration-500">
              {s.icon}
            </span>
            <h3 className="text-brand-text font-display font-medium tracking-tight text-xl group-hover:text-brand-green transition-colors duration-500">
              {s.title}
            </h3>
            <p className="text-brand-text/40 text-xs leading-relaxed font-light">
              {s.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE
───────────────────────────────────────────── */
// function TimelineSection() {
//   return (
//     <section className="max-w-7xl mx-auto mb-16">
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         viewport={{ once: true, margin: "-80px" }}
//         className="mb-12"
//       >
//         <SectionLabel text="Our Journey" />
//         <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tighter leading-[1.05]">
//           A decade in{" "}
//           <span className="text-brand-green italic">the making</span>.
//         </h2>
//       </motion.div>

//       <div className="relative">
//         {/* Vertical line */}
//         <div className="absolute left-[18px] top-0 bottom-0 w-[1px] bg-brand-border/40 md:left-1/2" />

//         <div className="space-y-0">
//           {TIMELINE.map((t, i) => (
//             <motion.div
//               key={t.year}
//               initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//               viewport={{ once: true, margin: "-50px" }}
//               className={cn(
//                 "relative flex items-start gap-8 pb-12 md:pb-16",
//                 "md:w-1/2",
//                 i % 2 === 0
//                   ? "md:ml-auto md:pl-16 md:pr-0 pl-12"
//                   : "md:pr-16 md:text-right pl-12 md:pl-0"
//               )}
//             >
//               {/* Dot */}
//               <div
//                 className={cn(
//                   "absolute w-3 h-3 rounded-full bg-brand-background border-2 border-brand-green top-1",
//                   "left-[13px] md:top-1",
//                   i % 2 === 0
//                     ? "md:left-[-6px]"
//                     : "md:right-[-6px] md:left-auto"
//                 )}
//               />
//               <div>
//                 <span className="text-brand-green text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">
//                   {t.year}
//                 </span>
//                 <h3 className="text-brand-text font-display font-medium text-xl tracking-tight mb-2">
//                   {t.event}
//                 </h3>
//                 <p className="text-brand-text/40 text-sm leading-relaxed font-light max-w-xs">
//                   {t.detail}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

/* ─────────────────────────────────────────────
   TEAM
───────────────────────────────────────────── */
function TeamSection({ teamData }: { teamData: employees[] }) {
  const [active, setActive] = useState<number | null>(null);

  const members = teamData;

  return (
    <section className="max-w-7xl mx-auto mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-80px" }}
        className="mb-12"
      >
        <SectionLabel text="The Collective" />
        <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tighter leading-[1.05]">
          People behind{" "}
          <span className="text-brand-green italic">the work</span>.
        </h2>
        <p className="text-brand-text/40 text-sm font-light mt-4 max-w-lg leading-relaxed">
          Diverse expertise across architecture, urban design, engineering,
          interiors, and operations — each voice distinct, every project
          cohesive.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-12 lg:gap-y-16">
        {members.map((member, idx) => (
          <motion.div
            key={Number(member.id)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: (idx % 3) * 0.15,
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={{ once: true, margin: "-50px" }}
            className="group cursor-none flex flex-col h-full"
            onMouseEnter={() => setActive(idx)}
            onMouseLeave={() => setActive(null)}
          >
            {/* Photo */}
            <div className="aspect-[4/5] bg-transparent rounded-[2rem] overflow-hidden mb-6 relative border border-brand-border group-hover:border-brand-green transition-colors duration-700 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-green/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none mix-blend-overlay" />
              {member.imageurl ? (
                <img
                  src={member.imageurl}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
              ) : (
                /* Placeholder when no image */
                <div className="w-full h-full flex flex-col items-center justify-center bg-brand-border/10">
                  <span className="text-5xl font-display font-medium text-brand-text/10 group-hover:text-brand-green/20 transition-colors duration-700 tracking-tighter">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </span>
                </div>
              )}
              {/* Number badge */}
              <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-brand-border/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-brand-background/80 backdrop-blur-sm">
                <span className="text-[10px] text-brand-green font-bold">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-grow">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-1 group-hover:text-brand-green transition-colors duration-500">
                {member.name}
              </h3>
              <p className="text-brand-green text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold mb-4 line-clamp-1">
                {member.role}
              </p>
              <div className="w-full h-[1px] bg-brand-border/40 mb-4 group-hover:bg-brand-green/40 transition-colors duration-500 scale-x-0 group-hover:scale-x-100 origin-left" />
              <p className="text-xs md:text-sm text-brand-text/50 leading-relaxed font-light line-clamp-3 min-h-[60px]">
                {member.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Consultants note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-24 border border-brand-border/30 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start"
      >
        <div className="flex-shrink-0">
          <SectionLabel text="External Expertise" />
          <h3 className="text-2xl font-display font-medium tracking-tight">
            Specialist{" "}
            <span className="text-brand-green italic">Consultants</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">
          {[
            {
              title: "Structural Consultant",
              body: "Works closely with the design team to ensure all projects are structurally sound, efficient, and compliant with engineering standards — contributing to safety and longevity.",
            },
            {
              title: "MEP Consultant",
              body: "Responsible for the integration of mechanical, electrical, and plumbing systems, ensuring services are efficiently incorporated while maintaining performance and coordination.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="border-l border-brand-green/40 pl-6"
            >
              <p className="text-brand-text font-medium text-sm mb-2">
                {c.title}
              </p>
              <p className="text-brand-text/40 text-xs leading-relaxed font-light">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}



/* ─────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────── */
export default function ClientAboutPage({
  teamData,
}: {
  teamData: employees[];
}) {
  return (
    <div className="min-h-screen pt-32 pb-6 px-6 md:px-24 relative bg-transparent">
      {/* Background pattern */}
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
          [15, 10], [10, 15], [15, 10],
        ]}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white_80%,transparent)]",
          "fixed inset-0 z-0 w-screen h-screen opacity-50 pointer-events-none"
        )}
      />

      <div className="relative z-10">
        <HeroSection />
        <AchievementsSection />
        <AboutSection />
        <ServicesSection />
        {/*<TimelineSection />*/}
        <TeamSection teamData={teamData} />
      </div>
    </div>
  );
}