import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

export const Contact = () => {
  return (
    <section id="contact" className="relative py-24 md:py-40 px-6 md:px-24 border-t border-brand-border z-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
        <div>
           <div className="flex items-center gap-4 mb-8">
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">Contact</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h2 className="text-4xl md:text-8xl font-display font-medium mb-12 md:mb-16 leading-[0.9] tracking-tighter">
            START YOUR <br/><span className="text-brand-sage italic serif">JOURNEY</span> WITH US.
          </h2>
          
          <div className="space-y-12 md:space-y-16">
            <div className="flex gap-6 md:gap-10 items-start group">
              <div className="w-12 h-12 md:w-14 md:h-14 glass flex items-center justify-center shrink-0 rounded-xl md:rounded-2xl group-hover:bg-brand-green transition-all duration-500">
                <MapPin className="text-brand-green group-hover:text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 md:mb-3 opacity-40">Office Address</h4>
                <p className="text-brand-text/60 text-sm md:text-lg leading-relaxed">
                  Oracle Business Park, 301, Wagle Estate,<br/>
                  Thane West, Maharashtra - 400604
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 md:gap-10 items-start group">
              <div className="w-12 h-12 md:w-14 md:h-14 glass flex items-center justify-center shrink-0 rounded-xl md:rounded-2xl group-hover:bg-brand-green transition-all duration-500">
                <Phone className="text-brand-green group-hover:text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 md:mb-3 opacity-40">Let's Talk</h4>
                <p className="text-brand-text/60 text-sm md:text-lg">022-69309273</p>
              </div>
            </div>

            <div className="flex gap-6 md:gap-10 items-start group">
              <div className="w-12 h-12 md:w-14 md:h-14 glass flex items-center justify-center shrink-0 rounded-xl md:rounded-2xl group-hover:bg-brand-green transition-all duration-500">
                <Mail className="text-brand-green group-hover:text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 md:mb-3 opacity-40">Email Us</h4>
                <p className="text-brand-text/60 text-sm md:text-lg break-all">rushikesh@rsandassociates.co.in</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-8 md:p-16 rounded-[40px] relative overflow-hidden flex flex-col justify-center mt-12 lg:mt-0">
           <div className="relative z-10">
             <h3 className="text-3xl font-display font-medium tracking-tight mb-10">Quick Inquiry</h3>
             <form className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-brand-green">Full Name</label>
                   <input type="text" className="w-full bg-transparent border-b border-brand-border py-4 focus:border-brand-green outline-none transition-colors cursor-none" placeholder="architectural vision" />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-brand-green">Email ID</label>
                   <input type="email" className="w-full bg-transparent border-b border-brand-border py-4 focus:border-brand-green outline-none transition-colors cursor-none" placeholder="digital mail" />
                 </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-green">Project Type</label>
                  <select className="w-full bg-transparent border-b border-brand-border py-4 focus:border-brand-green outline-none transition-colors appearance-none cursor-none text-brand-text">
                    <option className="bg-brand-background">Residential</option>
                    <option className="bg-brand-background">Commercial</option>
                    <option className="bg-brand-background">Interiors</option>
                    <option className="bg-brand-background">Others</option>
                  </select>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-brand-green">Message</label>
                 <textarea rows={4} className="w-full bg-transparent border-b border-brand-border py-4 focus:border-brand-green outline-none transition-colors cursor-none resize-none" placeholder="Tell us about the space..."></textarea>
               </div>
               <button className="group w-full bg-brand-green text-white font-display font-medium uppercase tracking-[0.3em] text-xs py-7 rounded-full flex items-center justify-center gap-4 hover:bg-brand-text transition-all duration-700 cursor-none shadow-xl">
                 Submit Enquiry <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
               </button>
             </form>
           </div>
           
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </div>
    </section>
  );
};
