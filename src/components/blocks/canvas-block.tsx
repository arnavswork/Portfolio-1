import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Block,
  HeroBlockData,
  TextBlockData,
  ImageBlockData,
  ImageGridBlockData,
  SplitBlockData,
  VideoBlockData,
  QuoteBlockData,
  CaptionBlockData,
  TwoUpBlockData,
  ThreeUpBlockData,
  MediaItem,
  FontFamily,
  FontWeight,
  TextAlign,
  TextColor,
  TextSize,
} from '@/lib/blocks';

// ----------------------------------------------------------------
// Canvas tiles fill their parent box (no section/container).
// They're used in admin canvas tiles AND the public canvas page.
// ----------------------------------------------------------------

const fontClass: Record<FontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  display: 'font-display',
};

const weightClass: Record<FontWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
};

const alignClass: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const colorClass: Record<TextColor, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-primary',
  inverse: 'text-background bg-foreground',
};

const sizeClass: Record<TextSize, string> = {
  display: 'text-3xl md:text-5xl leading-[1.05] tracking-tight',
  lead: 'text-xl md:text-2xl leading-[1.4]',
  body: 'text-base md:text-lg leading-[1.6]',
  small: 'text-sm leading-[1.5]',
  caption: 'text-xs uppercase tracking-[0.15em]',
};

const justifyClass: Record<TextAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function CanvasBlock({
  block,
  title,
  priority = false,
}: {
  block: Block;
  title: string;
  priority?: boolean;
}) {
  switch (block.type) {
    case 'hero':
      return <CanvasImage data={heroToImage(block.data)} title={title} priority={priority} />;
    case 'image':
      return <CanvasImage data={block.data} title={title} priority={priority} />;
    case 'text':
      return <CanvasText data={block.data} />;
    case 'imageGrid':
      return <CanvasImageGrid data={block.data} title={title} />;
    case 'split':
      return <CanvasSplit data={block.data} title={title} />;
    case 'video':
      return <CanvasVideo data={block.data} title={title} />;
    case 'quote':
      return <CanvasQuote data={block.data} />;
    case 'caption':
      return <CanvasCaption data={block.data} />;
    case 'twoUp':
      return <CanvasTwoUp data={block.data} title={title} />;
    case 'threeUp':
      return <CanvasThreeUp data={block.data} title={title} />;
    case 'spacer':
      return <div className="w-full h-full" />;
  }
}

function heroToImage(data: HeroBlockData): ImageBlockData {
  return {
    src: data.src,
    alt: data.alt,
    width: 'edge',
    aspectRatio: data.aspectRatio,
    alignment: 'center',
    background: 'none',
  };
}

// ---------- IMAGE ----------

function CanvasImage({
  data,
  title,
  priority,
}: {
  data: ImageBlockData;
  title: string;
  priority: boolean;
}) {
  if (!data.src) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
        No image
      </div>
    );
  }
  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      <Image
        src={data.src}
        alt={data.alt ?? title}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      {data.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs md:text-sm p-3">
          {data.caption}
        </div>
      )}
    </div>
  );
}

// ---------- TEXT ----------

function CanvasText({ data }: { data: TextBlockData }) {
  const align = data.align ?? 'left';
  const font = data.font ?? 'sans';
  const weight = data.weight ?? (data.size === 'display' ? 'bold' : 'regular');
  const color = data.color ?? 'default';

  return (
    <div className={cn('w-full h-full flex p-4 md:p-6 overflow-hidden', justifyClass[align])}>
      <div
        className={cn(
          'whitespace-pre-wrap w-full',
          sizeClass[data.size],
          fontClass[font],
          weightClass[weight],
          alignClass[align],
          colorClass[color]
        )}
      >
        {data.content}
      </div>
    </div>
  );
}

// ---------- IMAGE GRID ----------

function CanvasImageGrid({
  data,
  title,
}: {
  data: ImageGridBlockData;
  title: string;
}) {
  const visible = data.images.filter((i) => i.src);
  if (visible.length === 0) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
        No images
      </div>
    );
  }

  const cols = data.columns;
  return (
    <div
      className="w-full h-full grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {visible.map((img, i) => (
        <div key={i} className="relative w-full h-full overflow-hidden bg-muted">
          <Image
            src={img.src}
            alt={img.alt ?? `${title} — image ${i + 1}`}
            fill
            sizes="33vw"
            loading="lazy"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

// ---------- SPLIT ----------

function CanvasSplit({
  data,
  title,
}: {
  data: SplitBlockData;
  title: string;
}) {
  const isImageRight = data.imageSide === 'right';
  const font = data.font ?? 'sans';
  return (
    <div className="w-full h-full grid grid-cols-2 gap-3 md:gap-4 overflow-hidden">
      {data.src && (
        <div
          className={cn(
            'relative w-full h-full overflow-hidden bg-muted',
            isImageRight && 'order-2'
          )}
        >
          <Image
            src={data.src}
            alt={data.alt ?? title}
            fill
            sizes="50vw"
            loading="lazy"
            className="object-cover"
          />
        </div>
      )}
      {data.text && (
        <div className={cn('text-sm md:text-base leading-[1.5] p-3 md:p-4 overflow-auto', fontClass[font])}>
          {data.text}
        </div>
      )}
    </div>
  );
}

// ---------- VIDEO ----------

function CanvasVideo({
  data,
  title,
}: {
  data: VideoBlockData;
  title: string;
}) {
  if (!data.src) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-xs text-white/60">
        No video
      </div>
    );
  }
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {data.provider === 'direct' ? (
        <video
          src={data.src}
          autoPlay={data.autoplay}
          loop={data.loop}
          muted={data.muted}
          controls={data.controls ?? true}
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <iframe
          src={embedUrl(data.src, data.provider, {
            autoplay: data.autoplay,
            loop: data.loop,
            muted: data.muted,
          })}
          title={data.caption ?? title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

function embedUrl(
  src: string,
  provider: 'vimeo' | 'youtube',
  opts: { autoplay?: boolean; loop?: boolean; muted?: boolean }
): string {
  const params = new URLSearchParams();
  if (opts.autoplay) params.set('autoplay', '1');
  if (opts.loop) params.set('loop', '1');
  if (opts.muted) params.set(provider === 'youtube' ? 'mute' : 'muted', '1');

  if (provider === 'vimeo') {
    const m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}?${params.toString()}` : src;
  }
  const m = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?${params.toString()}` : src;
}

// ---------- QUOTE ----------

function CanvasQuote({ data }: { data: QuoteBlockData }) {
  if (!data.content) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
        Empty quote
      </div>
    );
  }
  const align = data.align ?? 'center';
  const font = data.font ?? 'serif';
  return (
    <blockquote
      className={cn(
        'w-full h-full flex flex-col justify-center p-4 md:p-6 overflow-hidden',
        alignClass[align],
        fontClass[font]
      )}
    >
      <p className="text-xl md:text-3xl leading-[1.2] font-light">
        &ldquo;{data.content}&rdquo;
      </p>
      {data.attribution && (
        <footer className="mt-3 text-xs md:text-sm text-muted-foreground">
          — {data.attribution}
        </footer>
      )}
    </blockquote>
  );
}

// ---------- CAPTION ----------

function CanvasCaption({ data }: { data: CaptionBlockData }) {
  if (!data.content) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
        Empty caption
      </div>
    );
  }
  const align = data.align ?? 'center';
  return (
    <div className={cn('w-full h-full flex items-center p-3 md:p-4', justifyClass[align])}>
      <p className={cn('text-xs md:text-sm text-muted-foreground', alignClass[align])}>
        {data.content}
      </p>
    </div>
  );
}

// ---------- TWO-UP / THREE-UP ----------

function MediaTile({ item, title, index }: { item: MediaItem; title: string; index: number }) {
  if (!item.src) {
    return <div className="w-full h-full bg-muted" />;
  }
  if (item.kind === 'video') {
    const provider = item.provider ?? 'direct';
    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        {provider === 'direct' ? (
          <video
            src={item.src}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={embedUrl(item.src, provider, { muted: true })}
            title={`${title} — media ${index + 1}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }
  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      <Image
        src={item.src}
        alt={item.alt ?? `${title} — media ${index + 1}`}
        fill
        sizes="33vw"
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}

function CanvasTwoUp({ data, title }: { data: TwoUpBlockData; title: string }) {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-2">
      <MediaTile item={data.left} title={title} index={0} />
      <MediaTile item={data.right} title={title} index={1} />
    </div>
  );
}

function CanvasThreeUp({ data, title }: { data: ThreeUpBlockData; title: string }) {
  return (
    <div className="w-full h-full grid grid-cols-3 gap-2">
      {data.items.map((it, i) => (
        <MediaTile key={i} item={it} title={title} index={i} />
      ))}
    </div>
  );
}
