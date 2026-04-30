import { getJobs } from './actions'
import { GridPattern } from '@/components/ui/grid-pattern'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const metadata = {
  title: 'Careers | Rushikesh',
  description: 'Join our team of visionary architects and designers.',
}

export default async function CareersPage() {
  const jobs = await getJobs()

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-24 relative bg-brand-background">
      <GridPattern 
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
        ]}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white_80%,transparent)]",
          "fixed inset-0 z-0 w-screen h-screen opacity-50 pointer-events-none"
        )} 
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex justify-center">
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center items-center gap-4 mb-4 md:mb-6">
              <div className="h-[1px] w-8 md:w-16 bg-brand-border" />
              <span className="text-brand-green text-[10px] uppercase tracking-[0.3em] font-bold">Join Us</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-[80px] font-display font-medium tracking-tighter leading-[0.9] mb-4 md:mb-6">
              OUR <br className="md:hidden" />
              <span className="text-brand-green italic serif uppercase">CAREERS</span>
            </h1>
            <p className="text-[10px] text-center md:text-xs font-light text-brand-text/50 leading-relaxed max-w-2xl">
              We are always looking for talented individuals to join our team. Explore our current open positions and discover how you can contribute to shaping the future of spaces.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job, idx) => (
                <Link 
                  href={`/careers/${job.id}`} 
                  key={job.id}
                  className="block group"
                >
                  <div className="p-8 border border-brand-border bg-brand-background/50 hover:bg-brand-background hover:border-brand-green transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group-hover:shadow-xl group-hover:shadow-brand-green/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-display font-medium tracking-tight mb-2 group-hover:text-brand-green transition-colors duration-500">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-xs font-light text-brand-text/50">
                        {job.department && (
                          <span className="flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-brand-green" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-brand-green" />
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-brand-green" />
                            {job.type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm uppercase tracking-widest text-brand-green font-bold shrink-0">
                      View Position
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-2 transition-transform duration-500">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-brand-border bg-brand-background/50 animate-in fade-in duration-1000">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-4 text-brand-text/70">No Open Positions</h3>
              <p className="text-sm font-light text-brand-text/50 max-w-md mx-auto">
                We don't have any open positions at the moment, but we're always eager to connect with talented individuals. Feel free to send your portfolio to our email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
