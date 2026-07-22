import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getProjects, deleteProject } from '@/lib/actions';
import Link from 'next/link';
import { LogoutButton } from '@/components/admin/logout-button';

export default async function AdminPage() {
  // ✅ Middleware handles auth

  const projects = await getProjects();

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="flex gap-3">
            <Link
              href="/admin/about"
              className="px-4 py-2 border rounded hover:bg-muted transition-colors"
            >
              Edit About
            </Link>
            <Link
              href="/admin/disciplines"
              className="px-4 py-2 border rounded hover:bg-muted transition-colors"
            >
              Disciplines
            </Link>
            <Link
              href="/admin/projects/new"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              + New Project
            </Link>

            {/* ✅ LOGOUT BUTTON */}
            <LogoutButton />
          </div>
        </div>

        {/* PROJECT LIST */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex justify-between items-center border p-4 rounded"
            >
              <div>
                <h2 className="font-semibold">{project.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {project.discipline.name} • {project.year}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="text-blue-500"
                >
                  Edit
                </Link>

                <form
                  action={async () => {
                    "use server";
                    await deleteProject(project.id);
                  }}
                >
                  <button className="text-red-500">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="text-center text-muted-foreground">
              No projects found.
            </p>
          )}
        </div>

      </main>

    </div>
  );
}