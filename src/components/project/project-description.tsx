interface ProjectDescriptionProps {
  description: string;
}

export function ProjectDescription({ description }: ProjectDescriptionProps) {
  return (
    <section className="px-6 md:px-12 lg:px-16 pb-20 md:pb-32 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-12 gap-x-6">
        <p className="col-span-12 md:col-span-7 md:col-start-3 text-lg md:text-xl lg:text-2xl leading-[1.55] font-light text-foreground/80 whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </section>
  );
}
