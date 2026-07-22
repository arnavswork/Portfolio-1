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
  SpacerBlockData,
  MediaItem,
  FontFamily,
  FontWeight,
  TextAlign,
  TextColor,
  TextMaxWidth,
  TextSize,
  ImageWidth,
  AspectRatio,
  ImageAlignment,
  BackgroundShade,
  SpacerSize,
} from '@/lib/blocks';

// ----------------------------------------------------------------
// SHARED STYLE MAPS
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

const maxWidthClass: Record<TextMaxWidth, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
};

const sizeClass: Record<TextSize, string> = {
  display: 'text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight',
  lead: 'text-2xl md:text-3xl lg:text-4xl leading-[1.25] tracking-tight',
  body: 'text-lg md:text-xl leading-[1.6]',
  small: 'text-sm md:text-base leading-relaxed',
  caption: 'text-xs md:text-sm leading-snug uppercase tracking-[0.15em]',
};

const imageWidthClass: Record<ImageWidth, string> = {
  narrow: 'max-w-3xl mx-auto px-3 md:px-6',
  wide: 'max-w-6xl mx-auto px-3 md:px-6',
  full: 'w-full px-3 md:px-6',
  edge: 'w-full',
};

const aspectClass: Record<AspectRatio, string> = {
  auto: '',
  '16/9': 'aspect-[16/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '21/9': 'aspect-[21/9]',
  '9/16': 'aspect-[9/16]',
};

const bgClass: Record<BackgroundShade, string> = {
  none: '',
  muted: 'bg-muted',
  accent: 'bg-primary/10',
  dark: 'bg-neutral-900',
};

const itemAlignClass: Record<ImageAlignment, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
};

const spacerClass: Record<SpacerSize, string> = {
  sm: 'h-8 md:h-12',
  md: 'h-16 md:h-24',
  lg: 'h-24 md:h-40',
  xl: 'h-32 md:h-56',
};

// ----------------------------------------------------------------
// MAIN RENDERER
// ----------------------------------------------------------------

export function BlockRenderer({
  blocks,
  title,
}: {
  blocks: Block[];
  title: string;
}) {
  return (
    <>
      {blocks.map((block, idx) => (
        <RenderedBlock
          key={block.id}
          block={block}
          title={title}
          isFirst={idx === 0}
        />
      ))}
    </>
  );
}

function RenderedBlock({
  block,
  title,
  isFirst,
}: {
  block: Block;
  title: string;
  isFirst: boolean;
}) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data} title={title} priority={isFirst} />;
    case 'text':
      return <TextBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} title={title} priority={isFirst} />;
    case 'imageGrid':
      return <ImageGridBlock data={block.data} title={title} />;
    case 'split':
      return <SplitBlock data={block.data} title={title} />;
    case 'video':
      return <VideoBlock data={block.data} title={title} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'caption':
      return <CaptionBlock data={block.data} />;
    case 'twoUp':
      return <TwoUpBlock data={block.data} title={title} />;
    case 'threeUp':
      return <ThreeUpBlock data={block.data} title={title} />;
    case 'spacer':
      return <SpacerBlock data={block.data} />;
  }
}

// ----------------------------------------------------------------
// HERO
// ----------------------------------------------------------------

function HeroBlock({
  data,
  title,
  priority,
}: {
  data: HeroBlockData;
  title: string;
  priority: boolean;
}) {
  if (!data.src) return null;
  const ratio = data.aspectRatio ?? 'auto';
  return (
    <section className="w-full">
      <div
        className={cn(
          'relative w-full overflow-hidden bg-muted',
          ratio === 'auto' ? 'h-[68vh] md:h-[85vh]' : aspectClass[ratio]
        )}
      >
        <Image
          src={data.src}
          alt={data.alt ?? title}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// TEXT
// ----------------------------------------------------------------

function TextBlock({ data }: { data: TextBlockData }) {
  const align = data.align ?? 'left';
  const font = data.font ?? 'sans';
  const weight = data.weight ?? (data.size === 'display' ? 'bold' : 'regular');
  const color = data.color ?? 'default';
  const maxW = data.maxWidth ?? 'medium';

  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 md:py-20">
      <div
        className={cn(
          'whitespace-pre-wrap',
          sizeClass[data.size],
          fontClass[font],
          weightClass[weight],
          alignClass[align],
          colorClass[color],
          maxWidthClass[maxW],
          align === 'center'
            ? 'mx-auto'
            : align === 'right'
            ? 'ml-auto'
            : 'mr-auto'
        )}
      >
        {data.content}
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// IMAGE
// ----------------------------------------------------------------

function ImageBlock({
  data,
  title,
  priority,
}: {
  data: ImageBlockData;
  title: string;
  priority: boolean;
}) {
  if (!data.src) return null;
  const ratio = data.aspectRatio ?? 'auto';
  const alignment = data.alignment ?? 'center';
  const bg = data.background ?? 'none';
  const sizes =
    data.width === 'narrow'
      ? '(min-width: 768px) 768px, 100vw'
      : data.width === 'wide'
      ? '(min-width: 1024px) 1024px, 100vw'
      : '100vw';

  return (
    <section className="py-6 md:py-12">
      <div className={cn(imageWidthClass[data.width], itemAlignClass[alignment])}>
        <figure className={cn(bg !== 'none' && cn(bgClass[bg], 'p-6 md:p-12'))}>
          <div
            className={cn(
              'relative w-full overflow-hidden',
              ratio === 'auto' ? 'aspect-[16/10]' : aspectClass[ratio],
              bg === 'none' && 'bg-muted'
            )}
          >
            <Image
              src={data.src}
              alt={data.alt ?? title}
              fill
              priority={priority}
              sizes={sizes}
              loading={priority ? 'eager' : 'lazy'}
              className={cn(ratio === 'auto' ? 'object-cover' : 'object-contain')}
            />
          </div>
          {data.caption && (
            <figcaption className="mt-3 text-xs md:text-sm text-muted-foreground">
              {data.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// IMAGE GRID
// ----------------------------------------------------------------

function ImageGridBlock({
  data,
  title,
}: {
  data: ImageGridBlockData;
  title: string;
}) {
  const visible = data.images.filter((i) => i.src);
  if (visible.length === 0) return null;

  const colClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[data.columns];

  const sizes =
    data.columns === 2
      ? '(min-width: 768px) 50vw, 100vw'
      : data.columns === 3
      ? '(min-width: 768px) 33vw, 100vw'
      : '(min-width: 768px) 25vw, 100vw';

  return (
    <section className="px-3 md:px-6 py-3 md:py-6">
      <div className={cn('grid grid-cols-1 gap-3 md:gap-6', colClasses)}>
        {visible.map((img, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden bg-muted"
          >
            <Image
              src={img.src}
              alt={img.alt ?? `${title} — image ${i + 1}`}
              fill
              sizes={sizes}
              loading="lazy"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {data.caption && (
        <p className="mt-3 text-xs md:text-sm text-muted-foreground text-center">
          {data.caption}
        </p>
      )}
    </section>
  );
}

// ----------------------------------------------------------------
// SPLIT
// ----------------------------------------------------------------

function SplitBlock({
  data,
  title,
}: {
  data: SplitBlockData;
  title: string;
}) {
  const isImageRight = data.imageSide === 'right';
  const font = data.font ?? 'sans';
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 md:py-20 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
        {data.src && (
          <div
            className={cn(
              'relative aspect-[4/5] overflow-hidden bg-muted',
              isImageRight && 'md:order-2'
            )}
          >
            <Image
              src={data.src}
              alt={data.alt ?? title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        )}
        {data.text && (
          <div
            className={cn(
              'text-lg md:text-xl leading-[1.6] font-light text-foreground/85 whitespace-pre-wrap',
              fontClass[font]
            )}
          >
            {data.text}
          </div>
        )}
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// VIDEO
// ----------------------------------------------------------------

function VideoBlock({
  data,
  title,
}: {
  data: VideoBlockData;
  title: string;
}) {
  if (!data.src) return null;
  const ratio = data.aspectRatio ?? '16/9';
  const alignment = data.alignment ?? 'center';
  const bg = data.background ?? 'none';

  return (
    <section className="py-6 md:py-12">
      <div className={cn(imageWidthClass[data.width], itemAlignClass[alignment])}>
        <figure className={cn(bg !== 'none' && cn(bgClass[bg], 'p-6 md:p-12'))}>
          <div
            className={cn(
              'relative w-full overflow-hidden bg-black',
              aspectClass[ratio]
            )}
          >
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
          {data.caption && (
            <figcaption className="mt-3 text-xs md:text-sm text-muted-foreground">
              {data.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
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
    const id = extractVimeoId(src);
    if (!id) return src;
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  const id = extractYouTubeId(src);
  if (!id) return src;
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function extractVimeoId(src: string): string | null {
  const m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

function extractYouTubeId(src: string): string | null {
  const m = src.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return m?.[1] ?? null;
}

// ----------------------------------------------------------------
// QUOTE
// ----------------------------------------------------------------

function QuoteBlock({ data }: { data: QuoteBlockData }) {
  if (!data.content) return null;
  const align = data.align ?? 'center';
  const font = data.font ?? 'serif';
  return (
    <section className="px-6 md:px-12 lg:px-16 py-16 md:py-24">
      <blockquote
        className={cn(
          'max-w-4xl mx-auto',
          alignClass[align],
          fontClass[font]
        )}
      >
        <p className="text-3xl md:text-5xl leading-[1.15] tracking-tight font-light">
          &ldquo;{data.content}&rdquo;
        </p>
        {data.attribution && (
          <footer className="mt-6 text-sm md:text-base text-muted-foreground">
            — {data.attribution}
          </footer>
        )}
      </blockquote>
    </section>
  );
}

// ----------------------------------------------------------------
// CAPTION
// ----------------------------------------------------------------

function CaptionBlock({ data }: { data: CaptionBlockData }) {
  if (!data.content) return null;
  const align = data.align ?? 'center';
  return (
    <section className="px-6 md:px-12 lg:px-16 -mt-4 md:-mt-8 pb-6 md:pb-10">
      <p
        className={cn(
          'max-w-3xl mx-auto text-xs md:text-sm text-muted-foreground',
          alignClass[align]
        )}
      >
        {data.content}
      </p>
    </section>
  );
}

// ----------------------------------------------------------------
// TWO-UP / THREE-UP
// ----------------------------------------------------------------

function MediaTile({
  item,
  ratio,
  title,
  index,
}: {
  item: MediaItem;
  ratio: AspectRatio;
  title: string;
  index: number;
}) {
  if (!item.src) {
    return <div className={cn('bg-muted', aspectClass[ratio])} />;
  }
  if (item.kind === 'video') {
    const provider = item.provider ?? 'direct';
    return (
      <div className={cn('relative overflow-hidden bg-black', aspectClass[ratio])}>
        {provider === 'direct' ? (
          <video
            src={item.src}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={embedUrl(item.src, provider, { autoplay: false, muted: true })}
            title={`${title} — clip ${index + 1}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }
  return (
    <div className={cn('relative overflow-hidden bg-muted', aspectClass[ratio])}>
      <Image
        src={item.src}
        alt={item.alt ?? `${title} — ${index + 1}`}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}

function TwoUpBlock({
  data,
  title,
}: {
  data: TwoUpBlockData;
  title: string;
}) {
  const ratio = data.aspectRatio ?? '4/3';
  const ratioCols = {
    '1/1': 'md:grid-cols-2',
    '2/1': 'md:grid-cols-[2fr_1fr]',
    '1/2': 'md:grid-cols-[1fr_2fr]',
  }[data.ratio ?? '1/1'];

  return (
    <section className="px-3 md:px-6 py-3 md:py-6">
      <div className={cn('grid grid-cols-1 gap-3 md:gap-6', ratioCols)}>
        <MediaTile item={data.left} ratio={ratio} title={title} index={0} />
        <MediaTile item={data.right} ratio={ratio} title={title} index={1} />
      </div>
      {data.caption && (
        <p className="mt-3 text-xs md:text-sm text-muted-foreground text-center">
          {data.caption}
        </p>
      )}
    </section>
  );
}

function ThreeUpBlock({
  data,
  title,
}: {
  data: ThreeUpBlockData;
  title: string;
}) {
  const ratio = data.aspectRatio ?? '4/3';
  return (
    <section className="px-3 md:px-6 py-3 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {data.items.map((item, i) => (
          <MediaTile
            key={i}
            item={item}
            ratio={ratio}
            title={title}
            index={i}
          />
        ))}
      </div>
      {data.caption && (
        <p className="mt-3 text-xs md:text-sm text-muted-foreground text-center">
          {data.caption}
        </p>
      )}
    </section>
  );
}

// ----------------------------------------------------------------
// SPACER
// ----------------------------------------------------------------

function SpacerBlock({ data }: { data: SpacerBlockData }) {
  return <div className={spacerClass[data.size]} aria-hidden />;
}
