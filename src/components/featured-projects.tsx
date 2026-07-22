'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, slugify } from '@/lib/utils';

type Project = {
  id: string;
  title: string;
  coverImageUrl: string;
  presentationImageUrl?: string | null;
};

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (projects && projects.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [projects]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? projects.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-500">
        No featured projects to display.
      </div>
    );
  }

  const currentProject = projects[currentIndex];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'
          )}
        >
          <Image
            src={
              project.presentationImageUrl ||
              project.coverImageUrl ||
              'https://picsum.photos/seed/1/1200/800'
            }
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 z-20">
        <h2 className="font-headline text-4xl md:text-6xl font-bold">
          {currentProject.title}
        </h2>

        <Link
          href={`/project/${slugify(currentProject.title)}`}
          className="mt-6 inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          View Project
        </Link>
      </div>

      {projects.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 text-white bg-black/20 hover:bg-black/40 border-none hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 text-white bg-black/20 hover:bg-black/40 border-none hover:text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}