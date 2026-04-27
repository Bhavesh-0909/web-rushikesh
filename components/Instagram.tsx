import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera as InstaIcon, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase, type InstagramPost } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import AdminEditControls from './admin-edit-controls';

export const Instagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true);
    }

    const fetchPosts = async () => {
      if (!supabase) {
        setPosts(FALLBACK_POSTS);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('instagram_posts').select('*').order('post_date', { ascending: false });
      if (data && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(FALLBACK_POSTS);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading && posts.length === 0) return null;
  if (posts.length === 0) return null;

  return (
    <section id="instagram" className="py-24 md:py-32 bg-white text-brand-text relative overflow-hidden border-t border-brand-border">
      <div className="px-6 md:px-24 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-8 bg-brand-green" />
              <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">Social</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-display font-medium tracking-tighter uppercase">
              Follow Our <span className="text-brand-green italic">Journey</span>
            </h2>
          </div>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-green hover:opacity-70 transition-opacity pb-2 border-b border-brand-green/20"
          >
            <InstaIcon size={14} /> @rushikesh_sutar
          </a>
        </div>
      </div>

      <div className="flex gap-4 px-6 md:px-24 overflow-x-auto no-scrollbar pb-12 snap-x">
        {posts.map((post, idx) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex-shrink-0 w-[280px] md:w-[350px] aspect-square rounded-[24px] overflow-hidden group snap-start"
          >
            {isAdmin && (
              <AdminEditControls 
                isVisible={true} 
                itemId={post.id} 
                itemType="instagram_posts"
                onDelete={() => setPosts(prev => prev.filter(p => p.id !== post.id))}
              />
            )}
            <img 
              src={post.image} 
              alt={post.caption || "Instagram post"} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
              <div className="flex gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <Heart size={20} fill="white" />
                  <span className="font-bold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} fill="white" />
                  <span className="font-bold">{post.comments}</span>
                </div>
              </div>
              {post.post_link && (
                <a 
                  href={post.post_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600607687940-4e5a994e5373?auto=format&fit=crop&q=80&w=1000',
    likes: 124,
    comments: 12,
    post_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=1000',
    likes: 89,
    comments: 5,
    post_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    likes: 210,
    comments: 18,
    post_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
