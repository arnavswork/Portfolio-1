import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ProjectHero } from '@/components/project/project-hero';
import { ProjectTitle } from '@/components/project/project-title';
import { ProjectDescription } from '@/components/project/project-description';
import { ProjectGallery } from '@/components/project/project-gallery';
import { ProjectFooterNav } from '@/components/project/project-footer-nav';
import { BlockRenderer } from '@/components/blocks/public-blocks';
import { CanvasRenderer } from '@/components/blocks/canvas-renderer';
import { getProjects } from '@/lib/data';
import { slugify } from '@/lib/utils';
import { readBlocks } from '@/lib/blocks';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getProjects();
  const currentIndex = projects.findIndex((p) => slugify(p.title) === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const project = projects[currentIndex];
  const nextProject =
    projects.length > 1
      ? projects[(currentIndex + 1) % projects.length]
      : null;

  const blocks = readBlocks(project.blocks);
  const hasBlocks = blocks.length > 0;
  const isCanvas =
    (project as { layoutMode?: string }).layoutMode === 'canvas';

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />

      <main className="flex-1">
        {hasBlocks ? (
          <>
            <ProjectTitle
              title={project.title}
              discipline={project.discipline.name}
              year={project.year}
            />
            {isCanvas ? (
              <CanvasRenderer blocks={blocks} title={project.title} />
            ) : (
              <BlockRenderer blocks={blocks} title={project.title} />
            )}
          </>
        ) : (
          <>
            <ProjectHero src={project.coverImageUrl} alt={project.title} />
            <ProjectTitle
              title={project.title}
              discipline={project.discipline.name}
              year={project.year}
            />
            {project.description && (
              <ProjectDescription description={project.description} />
            )}
            {project.imageUrls && project.imageUrls.length > 0 && (
              <ProjectGallery
                images={project.imageUrls}
                layouts={project.imageLayouts ?? []}
                title={project.title}
              />
            )}
          </>
        )}

        <ProjectFooterNav next={nextProject} />
      </main>

      <SiteFooter />
    </div>
  );
}
