'use server';

import { prisma } from './prisma';
import {
  uploadToR2,
  deleteFromR2,
  extractKeyFromUrl,
  getPresignedPutUrl,
} from './s3';
import { revalidatePath } from 'next/cache';
import {
  Block,
  MediaItem,
  isDataUrl,
  extractImageUrls,
  readBlocks,
} from './blocks';

async function persistBlock(
  projectId: string,
  block: Block
): Promise<Block> {
  const upload = (src: string, suffix: string) =>
    uploadToR2(src, `projects/${projectId}/${block.id}-${suffix}.jpg`);

  const persistMediaItem = async (
    item: MediaItem,
    suffix: string
  ): Promise<MediaItem> => {
    if (!item.src || !isDataUrl(item.src)) return item;
    if (item.kind === 'video' && item.provider !== 'direct') return item;
    const url = await upload(item.src, suffix);
    return { ...item, src: url };
  };

  switch (block.type) {
    case 'hero': {
      if (!isDataUrl(block.data.src)) return block;
      const url = await upload(block.data.src, 'hero');
      return { ...block, data: { ...block.data, src: url } };
    }
    case 'image': {
      if (!isDataUrl(block.data.src)) return block;
      const url = await upload(block.data.src, 'image');
      return { ...block, data: { ...block.data, src: url } };
    }
    case 'split': {
      if (!isDataUrl(block.data.src)) return block;
      const url = await upload(block.data.src, 'split');
      return { ...block, data: { ...block.data, src: url } };
    }
    case 'imageGrid': {
      const images = await Promise.all(
        block.data.images.map(async (img, i) => {
          if (!isDataUrl(img.src)) return img;
          const url = await upload(img.src, `grid-${i}`);
          return { ...img, src: url };
        })
      );
      return { ...block, data: { ...block.data, images } };
    }
    case 'video': {
      if (block.data.provider !== 'direct' || !isDataUrl(block.data.src)) {
        return block;
      }
      const url = await upload(block.data.src, 'video');
      return { ...block, data: { ...block.data, src: url } };
    }
    case 'twoUp': {
      const [left, right] = await Promise.all([
        persistMediaItem(block.data.left, 'twoUp-left'),
        persistMediaItem(block.data.right, 'twoUp-right'),
      ]);
      return { ...block, data: { ...block.data, left, right } };
    }
    case 'threeUp': {
      const items = (await Promise.all(
        block.data.items.map((it, i) =>
          persistMediaItem(it, `threeUp-${i}`)
        )
      )) as [MediaItem, MediaItem, MediaItem];
      return { ...block, data: { ...block.data, items } };
    }
    case 'text':
    case 'quote':
    case 'caption':
    case 'spacer':
      return block;
  }
}

async function persistBlocks(
  projectId: string,
  incoming: Block[],
  existing: Block[]
): Promise<Block[]> {
  const incomingPersistedUrls = new Set(
    incoming
      .flatMap((b) => extractImageUrls(b))
      .filter((s) => !isDataUrl(s))
  );

  for (const block of existing) {
    for (const url of extractImageUrls(block)) {
      if (!isDataUrl(url) && !incomingPersistedUrls.has(url)) {
        try {
          const key = extractKeyFromUrl(url);
          await deleteFromR2(key);
        } catch (err) {
          console.error('Failed to delete orphan image', url, err);
        }
      }
    }
  }

  return Promise.all(incoming.map((b) => persistBlock(projectId, b)));
}

// ----------------------
// PRESIGNED VIDEO UPLOAD
// ----------------------

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
]);

export async function getVideoUploadUrl(params: {
  filename: string;
  contentType: string;
  size: number;
}) {
  if (!ALLOWED_VIDEO_TYPES.has(params.contentType)) {
    throw new Error(`Unsupported video type: ${params.contentType}`);
  }
  if (params.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `Video is too large (max ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB)`
    );
  }
  const ext = params.filename.split('.').pop()?.toLowerCase() ?? 'mp4';
  const key = `uploads/videos/${crypto.randomUUID()}.${ext}`;
  return getPresignedPutUrl(key, params.contentType);
}

// ----------------------
// FETCH
// ----------------------

export async function getProjects() {
  return await prisma.project.findMany({
    include: { discipline: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFeaturedProjects() {
  return await prisma.project.findMany({
    where: { featured: true },
    include: { discipline: true },
  });
}

export async function getProject(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: { discipline: true },
  });
}

export async function getDisciplines() {
  return await prisma.discipline.findMany({
    orderBy: { name: 'asc' },
  });
}

// ----------------------
// CREATE PROJECT
// ----------------------

export async function createProject(formData: any) {
  if (!formData.title || !formData.year || !formData.discipline) {
    throw new Error('Missing required fields');
  }

  const projectId = crypto.randomUUID();

  // COVER
  const coverUrl = formData.coverImageUrl
    ? await uploadToR2(
        formData.coverImageUrl,
        `projects/${projectId}/cover.jpg`
      )
    : '';

  // PRESENTATION (slideshow image, different aspect ratio than cover)
  const presentationUrl = formData.presentationImageUrl
    ? await uploadToR2(
        formData.presentationImageUrl,
        `projects/${projectId}/presentation.jpg`
      )
    : null;

  // GALLERY
  const galleryUrls = formData.imageUrls?.length
    ? await Promise.all(
        formData.imageUrls.map((img: string, i: number) =>
          uploadToR2(
            img,
            `projects/${projectId}/gallery-${i}.jpg`
          )
        )
      )
    : [];

  const galleryLayouts = (formData.imageLayouts ?? [])
    .slice(0, galleryUrls.length)
    .map((l: string) => (l === 'half' ? 'half' : 'full'));
  while (galleryLayouts.length < galleryUrls.length) galleryLayouts.push('full');

  const incomingBlocks = readBlocks(formData.blocks);
  const persistedBlocks = await persistBlocks(projectId, incomingBlocks, []);

  const discipline = await prisma.discipline.findFirst({
    where: { name: formData.discipline },
  });

  if (!discipline) throw new Error('Discipline not found');

  const project = await prisma.project.create({
    data: {
      id: projectId,
      title: formData.title,
      year: parseInt(formData.year),
      description: formData.description || '',
      featured: formData.featured || false,
      coverImageUrl: coverUrl,
      presentationImageUrl: presentationUrl,
      imageUrls: galleryUrls,
      imageLayouts: galleryLayouts,
      blocks: persistedBlocks as unknown as object,
      layoutMode: formData.layoutMode === 'canvas' ? 'canvas' : 'stack',
      disciplineId: discipline.id,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');

  return project;
}

// ----------------------
// UPDATE PROJECT
// ----------------------

export async function updateProject(id: string, formData: any) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) throw new Error('Project not found');

  let coverUrl = existing.coverImageUrl;
  let presentationUrl = existing.presentationImageUrl;
  let galleryUrls = existing.imageUrls;

  // ❗ DELETE OLD COVER
  if (formData.coverImageUrl && existing.coverImageUrl) {
    const key = extractKeyFromUrl(existing.coverImageUrl);
    await deleteFromR2(key);

    coverUrl = await uploadToR2(
      formData.coverImageUrl,
      `projects/${id}/cover.jpg`
    );
  }

  // ❗ DELETE OLD PRESENTATION (only when a new one is provided)
  if (formData.presentationImageUrl) {
    if (existing.presentationImageUrl) {
      try {
        const key = extractKeyFromUrl(existing.presentationImageUrl);
        await deleteFromR2(key);
      } catch (err) {
        console.error('Failed to delete old presentation image', err);
      }
    }
    presentationUrl = await uploadToR2(
      formData.presentationImageUrl,
      `projects/${id}/presentation.jpg`
    );
  }

  // ❗ DELETE OLD GALLERY
  if (formData.imageUrls?.length) {
    for (const url of existing.imageUrls) {
      const key = extractKeyFromUrl(url);
      await deleteFromR2(key);
    }

    galleryUrls = await Promise.all(
      formData.imageUrls.map((img: string, i: number) =>
        uploadToR2(
          img,
          `projects/${id}/gallery-${i}.jpg`
        )
      )
    );
  }

  const galleryLayouts = (formData.imageLayouts ?? [])
    .slice(0, galleryUrls.length)
    .map((l: string) => (l === 'half' ? 'half' : 'full'));
  while (galleryLayouts.length < galleryUrls.length) galleryLayouts.push('full');

  const incomingBlocks = readBlocks(formData.blocks);
  const existingBlocks = readBlocks(existing.blocks);
  const persistedBlocks = await persistBlocks(id, incomingBlocks, existingBlocks);

  const discipline = await prisma.discipline.findFirst({
    where: { name: formData.discipline },
  });

  if (!discipline) throw new Error('Discipline not found');

  const updated = await prisma.project.update({
    where: { id },
    data: {
      title: formData.title,
      year: parseInt(formData.year),
      description: formData.description,
      featured: formData.featured,
      coverImageUrl: coverUrl,
      presentationImageUrl: presentationUrl,
      imageUrls: galleryUrls,
      imageLayouts: galleryLayouts,
      blocks: persistedBlocks as unknown as object,
      layoutMode: formData.layoutMode === 'canvas' ? 'canvas' : 'stack',
      disciplineId: discipline.id,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');

  return updated;
}

// ----------------------
// DELETE PROJECT
// ----------------------

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) return;

  // ❗ DELETE COVER
  if (project.coverImageUrl) {
    const key = extractKeyFromUrl(project.coverImageUrl);
    await deleteFromR2(key);
  }

  // ❗ DELETE PRESENTATION
  if (project.presentationImageUrl) {
    try {
      const key = extractKeyFromUrl(project.presentationImageUrl);
      await deleteFromR2(key);
    } catch (err) {
      console.error('Failed to delete presentation image', err);
    }
  }

  // ❗ DELETE GALLERY
  for (const url of project.imageUrls) {
    const key = extractKeyFromUrl(url);
    await deleteFromR2(key);
  }

  // ❗ DELETE BLOCK IMAGES
  for (const block of readBlocks(project.blocks)) {
    for (const url of extractImageUrls(block)) {
      if (!isDataUrl(url)) {
        try {
          const key = extractKeyFromUrl(url);
          await deleteFromR2(key);
        } catch (err) {
          console.error('Failed to delete block image', url, err);
        }
      }
    }
  }

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

// ----------------------
// DISCIPLINES
// ----------------------

// ----------------------
// ABOUT PAGE (singleton)
// ----------------------

const ABOUT_ID = 'singleton';

export async function getAboutBlocks(): Promise<Block[]> {
  const row = await prisma.aboutPage.findUnique({ where: { id: ABOUT_ID } });
  return readBlocks(row?.blocks);
}

export async function updateAboutBlocks(formData: { blocks: unknown }) {
  const incoming = readBlocks(formData.blocks);

  const existingRow = await prisma.aboutPage.findUnique({
    where: { id: ABOUT_ID },
  });
  const existingBlocks = readBlocks(existingRow?.blocks);

  const persisted = await persistBlocks(`about/${ABOUT_ID}`, incoming, existingBlocks);

  await prisma.aboutPage.upsert({
    where: { id: ABOUT_ID },
    create: { id: ABOUT_ID, blocks: persisted as unknown as object },
    update: { blocks: persisted as unknown as object },
  });

  revalidatePath('/about');
  revalidatePath('/admin/about');
}

export async function addDiscipline(name: string) {
  if (!name) throw new Error('Name required');

  await prisma.discipline.create({
    data: { name },
  });

  revalidatePath('/admin/disciplines');
}

export async function deleteDiscipline(id: string) {
  await prisma.discipline.delete({
    where: { id },
  });

  revalidatePath('/admin/disciplines');
}