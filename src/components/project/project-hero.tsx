import Image from 'next/image';

interface ProjectHeroProps {
  src: string;
  alt: string;
}

export function ProjectHero({ src, alt }: ProjectHeroProps) {
  return (
    <div className="px-3 md:px-6 pt-3 md:pt-6">
      <div className="relative w-full h-[68vh] md:h-[85vh] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
