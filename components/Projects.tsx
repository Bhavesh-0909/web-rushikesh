import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, Award } from 'lucide-react';
import { supabase, type Project } from '@/lib/supabase';
import { cn, createSlug } from '@/lib/utils';
import AdminEditControls from './admin-edit-controls';
import Link from 'next/link';
import { getRecentProjects } from '@/app/project/actions';

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true);
    }

    const fetchProjects = async () => {
      try {
        const data = await getRecentProjects(3);
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(FALLBACK_PROJECTS.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects(FALLBACK_PROJECTS.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const displayedProjects = filteredProjects;

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
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">Projects</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h2 className="text-5xl md:text-8xl font-display font-medium tracking-tighter mb-12">HIGHLIGHT <span className="text-brand-green italic serif">WORKS</span></h2>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          {['All', 'Residential', 'Commercial', 'Liaisoning'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "text-[9px] uppercase font-bold tracking-[0.2em] px-10 py-4 glass rounded-full transition-all cursor-none",
                activeCategory === cat ? "bg-brand-green text-white" : "hover:bg-brand-green hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-24 columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
        {displayedProjects.map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="group cursor-none break-inside-avoid bg-brand-background border border-brand-border/30 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 relative"
          >
            {isAdmin && (
              <AdminEditControls 
                isVisible={true} 
                itemId={project.id} 
                itemType="project"
                onDelete={() => setProjects(prev => prev.filter(p => p.id !== project.id))}
              />
            )}
            
            <Link href={`/project/${createSlug(project.title)}`}>
              <div className={cn(
                "overflow-hidden relative",
                idx % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
              )}>
                <img 
                  src={project.hero_image || "/default-preview.png"} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand-green scale-50 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
              <div className="p-8">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-display font-medium tracking-tight uppercase">{project.title}</h3>
                   <span className="text-[10px] uppercase tracking-widest text-brand-green font-bold px-3 py-1 bg-brand-green/5 rounded-full">{project.category}</span>
                 </div>
                 <p className="text-[10px] uppercase tracking-widest opacity-30">{project.location}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex justify-center px-6 md:px-12">
        <Link 
          href="/project"
          className="w-full md:w-auto md:px-16 py-6 glass rounded-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-green hover:text-white transition-all cursor-none text-center"
        >
          View All Projects
        </Link>
      </div>
    </section>
  );
};
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'THE CRYSTAL RESIDENCE',
    subtitle: 'Luxury Living',
    category: 'Residential',
    location: 'Mumbai, India',
    year: '2024',
    architect: 'Rushikesh Sutar',
    status: 'Completed',
    hero_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
    description: 'A masterpiece of contemporary residential architecture...',
    images: [],
    content: [],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'SKY GARDEN TOWER',
    subtitle: 'Sustainable Office',
    category: 'Commercial',
    location: 'Bangalore, India',
    year: '2023',
    architect: 'Rushikesh Sutar',
    status: 'In Progress',
    hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000',
    description: 'An eco-friendly commercial tower featuring vertical gardens...',
    images: [],
    content: [],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'ZEN INTERIOR',
    subtitle: 'Minimalist Design',
    category: 'Interior',
    location: 'Pune, India',
    year: '2024',
    architect: 'Rushikesh Sutar',
    status: 'Completed',
    hero_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000',
    description: 'A minimalist interior project focusing on peace and harmony...',
    images: [],
    content: [],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
