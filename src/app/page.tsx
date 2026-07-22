import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FeaturedProjects } from '@/components/featured-projects';
import { WorkSection } from '@/components/work-section';
import { Mail, MapPin } from 'lucide-react';
import { getProjects, getFeaturedProjects } from '@/lib/data';

const contactInfo = [
  {
    city: 'Delhi',
    address:
      '301-A, World Trade Tower, Adjacent to Hotel Intercontinental Grand, Barakhamba Lane, Connaught Place, New Delhi, Delhi, India - 110001.',
    email: 'prateeqkumar@gmail.com',
  },
];

export default async function Home() {
  const projects = await getProjects();
  const featured = await getFeaturedProjects();

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO / FEATURED */}
        <section id="home" className="relative w-full h-[calc(100vh-4rem)]">
          <FeaturedProjects projects={featured} />
        </section>

        {/* ABOUT */}
        <section id="about" className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 text-left">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              We design everything for everyone.
            </h2>
            <p className="max-w-3xl text-muted-foreground md:text-xl mb-12">
              StudioFlux is a multi-disciplinary design studio. Our collective
              of designers, writers, and strategists create work with purpose
              and impact. We believe in the power of design to connect people,
              create understanding, and shape a better future.
            </p>
          </div>
        </section>

        {/* WORK */}
        <WorkSection projects={projects} showMoreButton />

        {/* CONTACT */}
        <section id="contact" className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-left mb-12">
              Get in Touch
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((office) => (
                <div key={office.city}>
                  <h3 className="font-headline text-xl font-bold mb-4">
                    {office.city}
                  </h3>

                  <div className="space-y-3 text-muted-foreground">
                    <p className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                      <span>{office.address}</span>
                    </p>

                    <p className="flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-primary shrink-0" />
                      <a
                        href={`mailto:${office.email}`}
                        className="hover:text-primary hover:underline"
                      >
                        {office.email}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}