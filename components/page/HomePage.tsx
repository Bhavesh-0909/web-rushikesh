"use client";

import { useEffect, useState } from 'react';
import { Hero } from '../Hero';
import { About } from '../About';
import { Projects } from '../Projects';
import { Team } from '../Team';
import { Testimonials } from '../Testimonials';
import { Instagram } from '../Instagram';
import { Contact } from '../Contact';
import { Stats, Clients, Awards } from '../OtherSections';
import Experience3D from '../Experience3D';
import Mobile3D from '../Mobile3d';

interface HomePageProps {
  projects?: any[];
  testimonials?: any[];
  teamMembers?: any[];
}

export default function HomePage({ projects, testimonials, teamMembers }: HomePageProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    // Check initially
    handleResize(); 
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main>
      {isMobile ? <Mobile3D /> : <Experience3D />}
      <Hero />
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.07] z-[-1]" 
        style={{ 
          backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', 
          backgroundSize: '100px 100px' 
        }} 
      />
      <Stats />
      <Clients />
      <Awards />
      <About />
      <Projects initialProjects={projects} />
      <Testimonials initialTestimonials={testimonials} />
      <Team initialTeamMembers={teamMembers} />
      <Instagram />
    </main>
  );
}