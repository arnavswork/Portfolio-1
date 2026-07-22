import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ProjectCard } from '@/components/project-card';
import { searchProjects } from '@/lib/data';

interface PageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q;

  let results: Awaited<ReturnType<typeof searchProjects>> = [];

  if (query) {
    results = await searchProjects(query);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 md:py-24">

          {!query ? (
            <div className="text-center py-12">
              <p className="text-lg text-neutral-500">
                Please enter a search term.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-headline text-4xl md:text-6xl font-bold mb-2 text-center">
                Search Results
              </h1>

              <p className="text-center text-neutral-500 mb-12">
                Found {results.length} {results.length === 1 ? 'project' : 'projects'} for "{query}"
              </p>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                  {results.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-neutral-500">
                    No projects match your search.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}