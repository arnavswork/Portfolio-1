
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WorkSection } from '@/components/work-section';
import { getProjects } from '@/lib/data';

export default async function ArchivePage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-12 text-center">
                Archive
            </h1>
        </div>
        <WorkSection projects={projects} />
      </main>
      <SiteFooter />
    </div>
  );
}
