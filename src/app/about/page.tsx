import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BlockRenderer } from '@/components/blocks/public-blocks';
import { getAboutBlocks } from '@/lib/actions';

export default async function AboutPage() {
  const blocks = await getAboutBlocks();

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />

      <main className="flex-1">
        {blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} title="About" />
        ) : (
          <section className="container mx-auto px-4 py-24 md:py-32 text-center">
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4">
              About
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              Your about page is empty. Visit{' '}
              <span className="font-mono text-sm">/admin/about</span> to start
              building it.
            </p>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
