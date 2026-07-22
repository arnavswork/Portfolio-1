import Image from 'next/image';

interface ProjectGalleryProps {
  images: string[];
  layouts?: string[];
  title: string;
}

type Block =
  | { type: 'full'; src: string }
  | { type: 'pair'; left: string; right: string };

function buildBlocks(images: string[], layouts: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < images.length) {
    const layout = layouts[i] === 'half' ? 'half' : 'full';
    const next = layouts[i + 1] === 'half' ? 'half' : 'full';

    if (layout === 'half' && next === 'half' && images[i + 1]) {
      blocks.push({ type: 'pair', left: images[i], right: images[i + 1] });
      i += 2;
    } else {
      blocks.push({ type: 'full', src: images[i] });
      i += 1;
    }
  }

  return blocks;
}

export function ProjectGallery({ images, layouts, title }: ProjectGalleryProps) {
  if (!images || images.length === 0) return null;

  const blocks = buildBlocks(images, layouts ?? []);

  return (
    <section className="px-3 md:px-6 space-y-3 md:space-y-6">
      {blocks.map((block, idx) =>
        block.type === 'full' ? (
          <FullBleed
            key={idx}
            src={block.src}
            alt={`${title} — image ${idx + 1}`}
          />
        ) : (
          <Pair
            key={idx}
            left={block.left}
            right={block.right}
            alt={`${title} — image ${idx + 1}`}
          />
        )
      )}
    </section>
  );
}

function FullBleed({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}

function Pair({ left, right, alt }: { left: string; right: string; alt: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={left}
          alt={`${alt}A`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={right}
          alt={`${alt}B`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
    </div>
  );
}
