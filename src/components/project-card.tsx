
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { slugify } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    coverImageUrl: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${slugify(project.title)}`}>
      <Card className="overflow-hidden group w-full transition-shadow duration-300 hover:shadow-xl rounded-none">
        <CardContent className="p-0">
          <div
            className="relative overflow-hidden aspect-square"
          >
            <Image
              src={project.coverImageUrl || 'https://picsum.photos/seed/1/600/600'}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
          <div className="p-4 bg-card">
            <h3 className="font-headline font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
