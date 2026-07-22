import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface ProjectFooterNavProps {
  next: { title: string } | null;
}

export function ProjectFooterNav({ next }: ProjectFooterNavProps) {
  return (
    <section className="border-t border-border/40 mt-24 md:mt-40">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <Link
          href="/#work"
          className="group px-6 md:px-12 lg:px-16 py-12 md:py-20 transition-colors hover:bg-foreground/[0.025]"
        >
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Back
          </div>
          <div className="font-headline text-2xl md:text-3xl font-medium inline-flex items-center gap-3 transition-transform group-hover:-translate-x-1">
            <span aria-hidden>←</span>
            All projects
          </div>
        </Link>

        {next && (
          <Link
            href={`/project/${slugify(next.title)}`}
            className="group px-6 md:px-12 lg:px-16 py-12 md:py-20 transition-colors hover:bg-foreground/[0.025] text-right border-t md:border-t-0 md:border-l border-border/40"
          >
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Next project
            </div>
            <div className="font-headline text-2xl md:text-3xl font-medium inline-flex items-center gap-3 transition-transform group-hover:translate-x-1">
              {next.title}
              <span aria-hidden>→</span>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
