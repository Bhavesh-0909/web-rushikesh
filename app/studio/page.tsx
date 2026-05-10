"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export type GalleryImage = {
    src?: string;
    label: string;
    sublabel?: string;
    aspect: "tall" | "wide" | "square";
};

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const CULTURE_PILLARS = [
    {
        num: "01",
        title: "Strong Collaboration",
        body: "Our team works closely across all stages — from concept development to execution — ensuring attention to detail and clarity in every project.",
    },
    {
        num: "02",
        title: "Dynamic Environment",
        body: "The studio fosters an open and dynamic work environment where creativity, technical expertise, and practical problem-solving come together seamlessly.",
    },
    {
        num: "03",
        title: "Holistic Approach",
        body: "Architecture, interiors, landscape, and planning integrated under one roof. We balance design innovation with practical execution.",
    },
];

const STUDIO_FACTS = [
    { value: "8+", label: "Years of practice across architecture, interiors & landscape." },
    { value: "4", label: "Core disciplines under one roof." },
    { value: "301", label: "Oracle Business Park, our home base in Thane West." },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */


function Eyebrow({ index, label }: { index: string; label: string }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">
                {index} — {label}
            </span>
            <div className="h-[1px] flex-1 bg-brand-border/30" />
        </div>
    );
}

function Divider() {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-24">
            <div className="h-[1px] w-full bg-brand-border/20" />
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION 1 — HERO (full-bleed editorial)
───────────────────────────────────────────── */
function HeroSection() {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className="relative flex flex-col items-center justify-center overflow-hidden">
            {/* Headline */}
            <div className="relative z-10 flex flex-col items-center text-center">

                <motion.div
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-brand-border" />
                        <span className="text-brand-green text-[10px] uppercase tracking-[0.6em] font-bold">Behind the scenes</span>
                        <div className="h-[1px] w-12 bg-brand-border" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-medium tracking-tighter leading-[0.9] mb-6 uppercase">
                        A STUDIO <br className="md:hidden" />
                        <span className="text-brand-green italic serif">BUILT FOR</span><br />
                        THOUGHTFUL DESIGN.
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs md:text-sm font-light text-brand-text/50 leading-relaxed max-w-2xl mb-10"
                >
                    Where ideas are explored, designs are refined, and projects come to life — one considered detail at a time.
                </motion.p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ROW COMPONENT — alternating image + text
───────────────────────────────────────────── */
type RowProps = {
    index: string;
    eyebrow: string;
    heading: React.ReactNode;
    body: React.ReactNode;
    imageSrc?: string;
    imagePlaceholder?: string;
    imageAspect?: "portrait" | "landscape";
    reverse?: boolean;
    accentLine?: string;
};

function StudioRow({
    index,
    eyebrow,
    heading,
    body,
    imageSrc,
    imagePlaceholder,
    imageAspect = "portrait",
    reverse = false,
    accentLine,
}: RowProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <section ref={ref} className="max-w-7xl mx-auto py-10">
            <div
                className={cn(
                    "flex flex-col gap-12 md:gap-0 md:grid md:items-center",
                    imageAspect === "portrait"
                        ? "md:grid-cols-[42%_1fr]"
                        : "md:grid-cols-[55%_1fr]",
                    reverse && "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
                )}
            >
                {/* ── IMAGE PANEL ── */}
                <motion.div
                    initial={{ opacity: 0, x: reverse ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: "-80px" }}
                    className={cn(
                        "relative rounded-2xl overflow-hidden border border-brand-border/20 group",
                        imageAspect === "portrait" ? "aspect-[3/4]" : "aspect-[16/10]",
                        reverse ? "md:ml-16" : "md:mr-16"
                    )}
                >
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={eyebrow}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                        />
                    ) : (
                        <div className="w-full h-full bg-brand-border/5 group-hover:bg-brand-green/5 transition-colors duration-700 flex items-end p-8">
                            <span className="text-brand-text/10 text-[10px] uppercase tracking-[0.3em]">
                                {imagePlaceholder}
                            </span>
                        </div>
                    )}

                    {/* Corner index badge */}
                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full border border-brand-border/30 bg-brand-background/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-brand-green text-[10px] font-bold">{index}</span>
                    </div>

                    {/* Bottom green bar on hover */}
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-green origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
                    />
                </motion.div>

                {/* ── TEXT PANEL ── */}
                <motion.div
                    initial={{ opacity: 0, x: reverse ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="flex flex-col justify-center"
                >
                    <Eyebrow index={index} label={eyebrow} />

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tighter leading-[1.06] mb-6 text-brand-text">
                        {heading}
                    </h2>

                    {accentLine && (
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[1px] w-6 bg-brand-green/40" />
                            <span className="text-brand-green/60 text-xs italic font-light">{accentLine}</span>
                        </div>
                    )}

                    <div className="text-brand-text/45 text-sm md:text-base font-light leading-relaxed space-y-4">
                        {body}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   SECTION — MARQUEE DIVIDER
───────────────────────────────────────────── */
function MarqueeSection() {
    const words = ["Architecture", "Interiors", "Landscape", "Planning"];
    return (
        <div className="border-y border-brand-border/15 py-5 overflow-hidden">
            <motion.div
                animate={{ x: [0, "-50%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex gap-10 whitespace-nowrap w-max"
            >
                {[...words, ...words, ...words, ...words].map((w, i) => (
                    <span key={i} className="flex items-center gap-10">
                        <span className={cn("text-xl md:text-2xl font-display font-medium tracking-tighter",
                            i % 2 === 0 ? "text-brand-text/15" : "text-brand-green/40 italic"
                        )}>
                            {w}
                        </span>
                        <span className="text-brand-border/30 text-base">◆</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION — CULTURE PILLARS (inline text row)
───────────────────────────────────────────── */
function CultureSection() {
    return (
        <section className="max-w-7xl mx-auto py-20 md:py-28">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                viewport={{ once: true }}
                className="mb-14"
            >
                <Eyebrow index="04" label="Work Culture" />
                <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tighter leading-[1.05]">
                    How we work,<br />
                    <span className="text-brand-green italic">every day</span>.
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border/15 border border-brand-border/15 rounded-2xl overflow-hidden">
                {CULTURE_PILLARS.map((pillar, i) => (
                    <motion.div
                        key={pillar.num}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-brand-background px-8 py-10 group hover:bg-brand-green/5 transition-colors duration-500"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <span className="text-brand-green/20 font-display text-5xl font-medium tracking-tighter group-hover:text-brand-green/40 transition-colors duration-500">
                                {pillar.num}
                            </span>
                            <div className="h-[1px] w-8 bg-brand-border/30 mt-4" />
                        </div>
                        <h3 className="text-brand-text font-display font-medium text-lg mb-3 tracking-tight">
                            {pillar.title}
                        </h3>
                        <p className="text-brand-text/35 text-sm font-light leading-relaxed">
                            {pillar.body}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   SECTION — STUDIO FACTS (stat row)
───────────────────────────────────────────── */
function FactsSection() {
    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STUDIO_FACTS.map((fact, i) => (
                    <motion.div
                        key={fact.value}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group border border-brand-border/20 rounded-xl px-8 py-8 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all duration-500"
                    >
                        <span className="text-5xl font-display font-medium tracking-tighter text-brand-text group-hover:text-brand-green transition-colors duration-500 block mb-3">
                            {fact.value}
                        </span>
                        <p className="text-brand-text/35 text-sm font-light leading-snug">{fact.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION — CONTACT FOOTER ROW
───────────────────────────────────────────── */
function ContactRow() {
    return (
        <section className="max-w-7xl mx-auto py-20 md:py-28">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    viewport={{ once: true }}
                >
                    <Eyebrow index="05" label="Get In Touch" />
                    <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tighter leading-[0.95]">
                        Let's build<br />
                        <span className="text-brand-green italic">something</span><br />
                        together.
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-3"
                >
                    <a
                        href="tel:02269309273"
                        className="group flex items-center gap-4 border border-brand-border/20 rounded-xl px-7 py-5 hover:border-brand-green/40 hover:bg-brand-green/5 transition-all duration-500"
                    >
                        <div>
                            <span className="text-brand-text/25 text-[9px] uppercase tracking-[0.25em] font-medium block mb-0.5">Phone</span>
                            <span className="text-brand-text/60 text-sm font-light group-hover:text-brand-green transition-colors duration-400">
                                022-69309273
                            </span>
                        </div>
                        <span className="ml-auto text-brand-border/30 group-hover:text-brand-green/50 text-lg transition-colors duration-400">↗</span>
                    </a>

                    <a
                        href="mailto:rushikesh@rsandassociates.co.in"
                        className="group flex items-center gap-4 border border-brand-border/20 rounded-xl px-7 py-5 hover:border-brand-green/40 hover:bg-brand-green/5 transition-all duration-500"
                    >
                        <div>
                            <span className="text-brand-text/25 text-[9px] uppercase tracking-[0.25em] font-medium block mb-0.5">Email</span>
                            <span className="text-brand-text/60 text-sm font-light group-hover:text-brand-green transition-colors duration-400">
                                rushikesh@rsandassociates.co.in
                            </span>
                        </div>
                        <span className="ml-auto text-brand-border/30 group-hover:text-brand-green/50 text-lg transition-colors duration-400">↗</span>
                    </a>

                    <div className="border border-brand-border/20 rounded-xl px-7 py-5">
                        <span className="text-brand-text/25 text-[9px] uppercase tracking-[0.25em] font-medium block mb-0.5">Address</span>
                        <p className="text-brand-text/45 text-sm font-light leading-relaxed">
                            Oracle Business Park, 301<br />
                            Wagle Industrial Estate<br />
                            Thane West – 400604
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────── */
export default function StudioPage() {
    return (
        <div className="min-h-screen pt-24 pb-6 px-6 md:px-24 relative bg-brand-background">
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
                {/* ── HERO ── */}
                <HeroSection />

                <StudioRow
                    index="01"
                    eyebrow="The Studio"
                    heading={<>Where design<br /><span className="text-brand-green italic">happens</span>.</>}
                    accentLine="Oracle Business Park, Thane West"
                    body={
                        <>
                            <p>
                                Our studio is more than a workspace — it is a living environment shaped
                                by the same principles we bring to every project: simplicity,
                                functionality, and thoughtful curation.
                            </p>
                            <p>
                                Every corner is purposefully designed for the work it hosts. Drawing
                                tables, model-making zones, and client review spaces each carry their own
                                character while reading as one cohesive whole.
                            </p>
                        </>
                    }
                    imageSrc="/design-studio.png"
                    imagePlaceholder="Design Studio Interior"
                    imageAspect="portrait"
                    reverse={false}
                />


                {/* ── ROW 2: The Philosophy — text left, image right ── */}
                <StudioRow
                    index="02"
                    eyebrow="Our Philosophy"
                    heading={<>Simple. Functional.<br /><span className="text-brand-green italic">Thoughtfully curated.</span></>}
                    accentLine="Context-driven design at every scale"
                    body={
                        <>
                            <p>
                                We believe the studio should be as much a source of inspiration as it
                                is a place of production. The environment shapes the thinking. The
                                thinking shapes the work.
                            </p>
                            <p>
                                Architecture, interiors, landscape, and planning converge here — not as
                                separate disciplines, but as dimensions of a single, holistic practice.
                            </p>
                            <blockquote className="border-l-2 border-brand-green/40 pl-5 mt-2 text-brand-text/30 italic text-xs">
                                "The studio is a reflection of our design philosophy — simple, functional, and thoughtfully curated."
                            </blockquote>
                        </>
                    }
                    imageSrc="/meeting-room.png"
                    imagePlaceholder="Meeting Room"
                    imageAspect="portrait"
                    reverse={true}
                />


                {/* ── ROW 3: Collaboration Zone — image left, text right ── */}
                <StudioRow
                    index="03"
                    eyebrow="How We Work"
                    heading={<>Built around<br /><span className="text-brand-green italic">collaboration</span>,<br />not hierarchy.</>}
                    body={
                        <>
                            <p>
                                The open-plan studio is designed to dissolve silos. Architects, interior
                                designers, landscape planners, and project managers share the same floor,
                                the same light, and the same creative energy.
                            </p>
                            <p>
                                Review pinboards line the walls. Physical models occupy the tables.
                                Ideas are tested, questioned, and refined in the open — not behind
                                closed doors.
                            </p>
                        </>
                    }
                    imageSrc="/review-space.png"
                    imagePlaceholder="Collaboration & Review Space"
                    imageAspect="landscape"
                    reverse={false}
                />




                {/* ── ROW 4: Client Experience — image right, text left ── */}
                <StudioRow
                    index="04"
                    eyebrow="Client Experience"
                    heading={<>A space where<br />clients feel<br /><span className="text-brand-green italic">at home</span>.</>}
                    accentLine="Designed for dialogue, not just presentation"
                    body={
                        <>
                            <p>
                                The client lounge and meeting spaces are crafted as extensions of our
                                design philosophy — warm, considered, and free of clutter. Conversations
                                here feel natural, not formal.
                            </p>
                            <p>
                                Every project begins with listening. Our reception and review areas are
                                set up for exactly that: unhurried conversation, material exploration,
                                and collaborative decision-making.
                            </p>
                        </>
                    }
                    imageSrc="/client-lounge.png"
                    imagePlaceholder="Client Lounge"
                    imageAspect="portrait"
                    reverse={true}
                />
            </div>
        </div>
    );
}