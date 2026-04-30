import { getJobById } from '../actions'
import { notFound } from 'next/navigation'
import { GridPattern } from '@/components/ui/grid-pattern'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface JobPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: JobPageProps) {
  const { id } = await params
  const job = await getJobById(id)
  if (!job) return { title: 'Not Found | Careers' }
  
  return {
    title: `${job.title} | Careers | Rushikesh`,
    description: job.description.substring(0, 160),
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

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

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link 
          href="/careers" 
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-brand-text/50 hover:text-brand-green transition-colors duration-300 mb-12 animate-in fade-in slide-in-from-left-4 duration-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transform rotate-180">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Careers
        </Link>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tighter leading-[1.1] mb-8">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-light text-brand-text/50 border-b border-brand-border/50 pb-8 mb-12">
            {job.department && (
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="text-brand-green font-bold">Department:</span> {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="text-brand-green font-bold">Location:</span> {job.location}
              </span>
            )}
            {job.type && (
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="text-brand-green font-bold">Type:</span> {job.type}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            <section>
              <h2 className="text-brand-green text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-4">
                <div className="h-[1px] w-8 bg-brand-green" />
                About the Role
              </h2>
              <div className="text-brand-text/80 font-light leading-relaxed space-y-4 text-sm md:text-base whitespace-pre-wrap">
                {job.description}
              </div>
            </section>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <section>
                <h2 className="text-brand-green text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-brand-green" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-4">
                  {job.responsibilities.map((req, idx) => (
                    <li key={idx} className="flex gap-4 text-brand-text/80 font-light leading-relaxed text-sm md:text-base">
                      <span className="text-brand-green mt-1.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <section>
                <h2 className="text-brand-green text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-brand-green" />
                  Requirements
                </h2>
                <ul className="space-y-4">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex gap-4 text-brand-text/80 font-light leading-relaxed text-sm md:text-base">
                      <span className="text-brand-green mt-1.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="md:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
            <div className="sticky top-32 p-8 border border-brand-border bg-brand-background/50">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-4">Apply Now</h3>
              <p className="text-sm font-light text-brand-text/50 mb-8 leading-relaxed">
                Ready to join our team? Send your resume and portfolio referencing this position.
              </p>
              <a 
                href={`mailto:careers@example.com?subject=Application for ${job.title}`}
                className="w-full inline-flex justify-center items-center gap-4 py-4 px-8 bg-brand-text text-brand-background text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-green transition-colors duration-500 group"
              >
                Send Application
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500">
                  <path d="M5 19L19 5M19 5H10M19 5V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
