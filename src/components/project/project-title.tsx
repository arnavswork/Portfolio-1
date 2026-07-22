interface ProjectTitleProps {
  title: string;
  discipline: string;
  year: number;
}

export function ProjectTitle({ title, discipline, year }: ProjectTitleProps) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 md:py-32 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10 items-end">
        <h1 className="col-span-12 md:col-span-8 font-headline text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-bold leading-[0.95] tracking-tight">
          {title}
        </h1>

        <dl className="col-span-12 md:col-span-3 md:col-start-10 grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-8 md:pb-3">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Discipline
            </dt>
            <dd className="text-base font-medium">{discipline}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Year
            </dt>
            <dd className="text-base font-medium tabular-nums">{year}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
