import { Project, TeamMember } from '../types/home.type';

export const projects: Project[] = [
  { id: 1, title: "Modernist Villa", category: "Residential", location: "Thane", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" },
  { id: 2, title: "Corporate Hub", category: "Commercial", location: "Mumbai", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" },
  { id: 3, title: "Zen Garden Suites", category: "Landscape", location: "Pune", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200" },
  { id: 4, title: "Urban Loft", category: "Interiors", location: "Nashik", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" },
  { id: 5, title: "Sustainable Plaza", category: "Architecture", location: "Navi Mumbai", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" },
  { id: 6, title: "Skyline Residence", category: "Residential", location: "Thane", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200" },
  { id: 7, title: "Minimalist Retreat", category: "Residential", location: "Lonavala", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200" },
  { id: 8, title: "Glass House", category: "Architecture", location: "Alibaug", image: "https://images.unsplash.com/photo-1449156003053-c304209c11ee?auto=format&fit=crop&q=80&w=1200" },
];

export const teamData: TeamMember[] = [
  { name: "Rushikesh Sutar", role: "Founder & Principal Architect", image: "/rushikesh.png", description: "B.Arch from L T institute of architecture, Associated since 2018. specializes in architecture, interiors, landscape and planning." },
  { name: "Grishma Sutar", role: "Co-Founder", image: "/grishma.png", description: "M.Arch from CEPT, associated since 2020. specializes in Urban Design & Planning." },
  { name: "Harshal Sutar", role: "Associate / Interior Designer", image: "/harshal.png", description: "Associated since 2018. specializes in interior design and site execution." },
  { name: "Dipesh Kotekar", role: "Designer", image: "/dipesh.png", description: "Civil Engineering & Interior Design specialist. Bridges precision with aesthetic detailing." },
  { name: "Mamta", role: "Interior Designer", image: "/mamta.png", description: "Specializes in space planning and functional interior environments." },
  { name: "Ruchika Bhurke", role: "Admin & Operations", image: "/ruchika.png", description: "MBA in Sales/Marketing with 30+ years of administrative leadership." },
];
