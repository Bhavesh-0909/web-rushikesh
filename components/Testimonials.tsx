import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type Testimonial } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import AdminEditControls from './admin-edit-controls';

export const Testimonials = ({ initialTestimonials }: { initialTestimonials?: Testimonial[] }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!initialTestimonials || initialTestimonials.length === 0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true);
    }

    const fetchTestimonials = async () => {
      if (initialTestimonials && initialTestimonials.length > 0) {
        setLoading(false);
        return;
      }
      if (!supabase) {
        setTestimonials(FALLBACK_TESTIMONIALS);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        setTestimonials(FALLBACK_TESTIMONIALS);
      }
      setLoading(false);
    };

    fetchTestimonials();
  }, [initialTestimonials]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (loading && testimonials.length === 0) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden ">
      <div className="px-6 md:px-24">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">Reviews</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 leading-[0.9] uppercase tracking-tighter">
            Client <span className="text-brand-green italic">Stories</span>
          </h2>
        </div>

        <div className="relative max-w-7xl mx-auto">

          <div className={cn(
            "grid gap-8 relative z-10",
            Math.min(testimonials.length, 3) === 1 ? "grid-cols-1 max-w-2xl mx-auto" :
              Math.min(testimonials.length, 3) === 2 ? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {[...Array(Math.min(3, testimonials.length))].map((_, i) => {
              const idx = (currentIndex + i) % testimonials.length;
              const testimonial = testimonials[idx];
              return (
                <motion.div
                  key={`${testimonial.id}-${currentIndex}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="relative bg-white/40 backdrop-blur-md border border-brand-border p-6 md:p-10 rounded-3xl shadow-sm group hover:shadow-xl transition-all duration-700"
                >
                  {isAdmin && (
                    <AdminEditControls
                      isVisible={true}
                      itemId={testimonial.id}
                      itemType="testimonials"
                      onDelete={() => setTestimonials(prev => prev.filter(t => t.id !== testimonial.id))}
                    />
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={cn(
                            i < testimonial.rating ? "fill-brand-green text-brand-green" : "text-brand-border"
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-lg md:text-xl font-display font-light leading-snug tracking-tight mb-6 italic text-brand-text">
                      "{testimonial.text}"
                    </p>

                    <div className="flex flex-col items-center">
                      {testimonial.image && (
                        <div className="w-12 h-12 rounded-full overflow-hidden mb-3 border-2 border-brand-green/20">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="text-base font-display font-bold uppercase tracking-widest">{testimonial.name}</h4>
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold mt-1">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {testimonials.length > 3 && (
            <div className="flex justify-center items-center gap-4 mt-12 relative z-10">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white hover:border-brand-green transition-all"
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white hover:border-brand-green transition-all"
                aria-label="Next testimonials"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Vikram Mehta',
    role: 'CEO',
    company: 'Skyline Group',
    text: 'Working with Rushikesh was a fantastic experience. His attention to detail and ability to translate complex requirements into beautiful designs is unmatched.',
    rating: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Anjali Sharma',
    role: 'Founder',
    company: 'Studio A',
    text: 'The architectural vision brought to our project was truly inspiring. The space feels alive and perfectly serves our community goals.',
    rating: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Anjali Sharma',
    role: 'Founder',
    company: 'Studio A',
    text: 'The architectural vision brought to our project was truly inspiring. The space feels alive and perfectly serves our community goals.',
    rating: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Anjali Sharma',
    role: 'Founder',
    company: 'Studio A',
    text: 'The architectural vision brought to our project was truly inspiring. The space feels alive and perfectly serves our community goals.',
    rating: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Anjali Sharma',
    role: 'Founder',
    company: 'Studio A',
    text: 'The architectural vision brought to our project was truly inspiring. The space feels alive and perfectly serves our community goals.',
    rating: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

];
