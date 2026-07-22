import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ----------------------
// DISCIPLINES
// ----------------------

export async function getDisciplines() {
  return await prisma.discipline.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getDisciplineByName(name: string) {
  return await prisma.discipline.findUnique({
    where: { name },
    include: { projects: true },
  });
}

// ----------------------
// PROJECTS
// ----------------------

export async function getProjects() {
  return await prisma.project.findMany({
    include: { discipline: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProjects() {
  return await prisma.project.findMany({
    where: { featured: true },
    include: { discipline: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: { discipline: true },
  });
}

export async function getProjectBySlug(slug: string) {
  const projects = await prisma.project.findMany({
    include: { discipline: true },
  });
  return projects.find((p) => slugify(p.title) === slug) ?? null;
}

export async function getProjectsByDiscipline(disciplineName: string) {
  return await prisma.project.findMany({
    where: {
      discipline: {
        name: disciplineName,
      },
    },
    include: { discipline: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function searchProjects(query: string) {
  return await prisma.project.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { discipline: true },
  });
}