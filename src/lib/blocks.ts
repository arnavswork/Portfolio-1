// ----------------------------------------------------------------
// BLOCK MODEL
//
// Each project's `blocks` JSON column stores an array of these.
// New optional fields default at render time so existing rows keep working.
// ----------------------------------------------------------------

export type BlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'imageGrid'
  | 'split'
  | 'video'
  | 'quote'
  | 'caption'
  | 'twoUp'
  | 'threeUp'
  | 'spacer';

// ----------------------------------------------------------------
// SHARED ENUMS
// ----------------------------------------------------------------

export type FontFamily = 'sans' | 'serif' | 'mono' | 'display';
export type FontWeight = 'light' | 'regular' | 'medium' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';
export type TextColor = 'default' | 'muted' | 'accent' | 'inverse';
export type TextMaxWidth = 'narrow' | 'medium' | 'wide' | 'full';
export type TextSize = 'display' | 'lead' | 'body' | 'small' | 'caption';

export type ImageWidth = 'narrow' | 'wide' | 'full' | 'edge';
export type AspectRatio =
  | 'auto'
  | '16/9'
  | '4/3'
  | '1/1'
  | '3/4'
  | '21/9'
  | '9/16';
export type ImageAlignment = 'left' | 'center' | 'right';
export type BackgroundShade = 'none' | 'muted' | 'accent' | 'dark';

export type VideoProvider = 'vimeo' | 'youtube' | 'direct';

export type SpacerSize = 'sm' | 'md' | 'lg' | 'xl';

// Canvas layout — all values in pixels, relative to a fixed canvas width.
// Used only when project.layoutMode === 'canvas'.
export type CanvasPosition = { x: number; y: number; w: number; h: number };

// ----------------------------------------------------------------
// BLOCK DATA SHAPES
// ----------------------------------------------------------------

export type HeroBlockData = {
  src: string;
  alt?: string;
  aspectRatio?: AspectRatio;
};

export type TextBlockData = {
  content: string;
  size: TextSize;
  font?: FontFamily;
  weight?: FontWeight;
  align?: TextAlign;
  color?: TextColor;
  maxWidth?: TextMaxWidth;
};

export type ImageBlockData = {
  src: string;
  alt?: string;
  width: ImageWidth;
  aspectRatio?: AspectRatio;
  alignment?: ImageAlignment;
  caption?: string;
  background?: BackgroundShade;
};

export type ImageGridImage = { src: string; alt?: string };
export type ImageGridBlockData = {
  images: ImageGridImage[];
  columns: 2 | 3 | 4;
  caption?: string;
};

export type SplitBlockData = {
  src: string;
  alt?: string;
  text: string;
  imageSide: 'left' | 'right';
  font?: FontFamily;
};

export type VideoBlockData = {
  src: string;
  provider: VideoProvider;
  width: ImageWidth;
  aspectRatio?: AspectRatio;
  alignment?: ImageAlignment;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  caption?: string;
  background?: BackgroundShade;
};

export type QuoteBlockData = {
  content: string;
  attribution?: string;
  align?: TextAlign;
  font?: FontFamily;
};

export type CaptionBlockData = {
  content: string;
  align?: TextAlign;
};

export type MediaItem = {
  kind: 'image' | 'video';
  src: string;
  alt?: string;
  provider?: VideoProvider;
};

export type TwoUpBlockData = {
  left: MediaItem;
  right: MediaItem;
  ratio?: '1/1' | '2/1' | '1/2';
  aspectRatio?: AspectRatio;
  caption?: string;
};

export type ThreeUpBlockData = {
  items: [MediaItem, MediaItem, MediaItem];
  aspectRatio?: AspectRatio;
  caption?: string;
};

export type SpacerBlockData = {
  size: SpacerSize;
};

// ----------------------------------------------------------------
// BLOCK UNION
// ----------------------------------------------------------------

type WithPos<T> = T & { pos?: CanvasPosition };

export type Block =
  | WithPos<{ id: string; type: 'hero'; data: HeroBlockData }>
  | WithPos<{ id: string; type: 'text'; data: TextBlockData }>
  | WithPos<{ id: string; type: 'image'; data: ImageBlockData }>
  | WithPos<{ id: string; type: 'imageGrid'; data: ImageGridBlockData }>
  | WithPos<{ id: string; type: 'split'; data: SplitBlockData }>
  | WithPos<{ id: string; type: 'video'; data: VideoBlockData }>
  | WithPos<{ id: string; type: 'quote'; data: QuoteBlockData }>
  | WithPos<{ id: string; type: 'caption'; data: CaptionBlockData }>
  | WithPos<{ id: string; type: 'twoUp'; data: TwoUpBlockData }>
  | WithPos<{ id: string; type: 'threeUp'; data: ThreeUpBlockData }>
  | WithPos<{ id: string; type: 'spacer'; data: SpacerBlockData }>;

export const BLOCK_TYPES: BlockType[] = [
  'hero',
  'text',
  'image',
  'imageGrid',
  'split',
  'video',
  'quote',
  'caption',
  'twoUp',
  'threeUp',
  'spacer',
];

// ----------------------------------------------------------------
// CANVAS CONSTANTS (pixels)
// ----------------------------------------------------------------

export const CANVAS_WIDTH = 1600;
export const CANVAS_MIN_HEIGHT = 900;
export const TILE_MIN_W = 60;
export const TILE_MIN_H = 40;

export function findNextDropY(blocks: Block[]): number {
  if (!blocks.length) return 0;
  return Math.max(
    0,
    ...blocks.map((b) => (b.pos ? b.pos.y + b.pos.h : 0))
  );
}

export function sizeForType(type: BlockType): { w: number; h: number } {
  switch (type) {
    case 'hero':
      return { w: CANVAS_WIDTH, h: 600 };
    case 'image':
      return { w: 640, h: 420 };
    case 'video':
      return { w: 800, h: 450 };
    case 'text':
      return { w: 560, h: 220 };
    case 'quote':
      return { w: 1100, h: 260 };
    case 'caption':
      return { w: 560, h: 60 };
    case 'imageGrid':
      return { w: CANVAS_WIDTH, h: 480 };
    case 'split':
      return { w: CANVAS_WIDTH, h: 500 };
    case 'twoUp':
      return { w: CANVAS_WIDTH, h: 480 };
    case 'threeUp':
      return { w: CANVAS_WIDTH, h: 380 };
    case 'spacer':
      return { w: CANVAS_WIDTH, h: 80 };
  }
}

export function withPositions(blocks: Block[]): Block[] {
  let y = findNextDropY(blocks);
  return blocks.map((b) => {
    if (b.pos) return b;
    const sized = sizeForType(b.type);
    const pos: CanvasPosition = { x: 0, y, ...sized };
    y += sized.h + 16;
    return { ...b, pos } as Block;
  });
}

// ----------------------------------------------------------------
// FACTORIES
// ----------------------------------------------------------------

export function newBlockId(): string {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyMediaItem: MediaItem = { kind: 'image', src: '' };

export function createBlock(type: BlockType): Block {
  const id = newBlockId();
  switch (type) {
    case 'hero':
      return { id, type: 'hero', data: { src: '', aspectRatio: '16/9' } };
    case 'text':
      return {
        id,
        type: 'text',
        data: {
          content: '',
          size: 'body',
          font: 'sans',
          weight: 'regular',
          align: 'left',
          color: 'default',
          maxWidth: 'medium',
        },
      };
    case 'image':
      return {
        id,
        type: 'image',
        data: {
          src: '',
          width: 'wide',
          aspectRatio: 'auto',
          alignment: 'center',
          background: 'none',
        },
      };
    case 'imageGrid':
      return { id, type: 'imageGrid', data: { images: [], columns: 2 } };
    case 'split':
      return {
        id,
        type: 'split',
        data: { src: '', text: '', imageSide: 'left', font: 'sans' },
      };
    case 'video':
      return {
        id,
        type: 'video',
        data: {
          src: '',
          provider: 'vimeo',
          width: 'wide',
          aspectRatio: '16/9',
          alignment: 'center',
          autoplay: false,
          loop: false,
          muted: true,
          controls: true,
          background: 'none',
        },
      };
    case 'quote':
      return {
        id,
        type: 'quote',
        data: { content: '', attribution: '', align: 'center', font: 'serif' },
      };
    case 'caption':
      return { id, type: 'caption', data: { content: '', align: 'center' } };
    case 'twoUp':
      return {
        id,
        type: 'twoUp',
        data: {
          left: { ...emptyMediaItem },
          right: { ...emptyMediaItem },
          ratio: '1/1',
          aspectRatio: '4/3',
        },
      };
    case 'threeUp':
      return {
        id,
        type: 'threeUp',
        data: {
          items: [
            { ...emptyMediaItem },
            { ...emptyMediaItem },
            { ...emptyMediaItem },
          ],
          aspectRatio: '4/3',
        },
      };
    case 'spacer':
      return { id, type: 'spacer', data: { size: 'md' } };
  }
}

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------

export function isDataUrl(src: string): boolean {
  return typeof src === 'string' && src.startsWith('data:');
}

function mediaItemUrl(item: MediaItem): string | null {
  if (!item || !item.src) return null;
  if (item.kind === 'video' && item.provider !== 'direct') return null;
  return item.src;
}

/**
 * Returns URLs that should be persisted to (or cleaned from) storage.
 * Hosted video URLs (Vimeo/YouTube) are skipped — they aren't ours to manage.
 */
export function extractImageUrls(block: Block): string[] {
  switch (block.type) {
    case 'hero':
    case 'image':
    case 'split':
      return block.data.src ? [block.data.src] : [];
    case 'imageGrid':
      return block.data.images.map((i) => i.src).filter(Boolean);
    case 'video':
      return block.data.provider === 'direct' && block.data.src
        ? [block.data.src]
        : [];
    case 'twoUp': {
      const urls: string[] = [];
      const l = mediaItemUrl(block.data.left);
      const r = mediaItemUrl(block.data.right);
      if (l) urls.push(l);
      if (r) urls.push(r);
      return urls;
    }
    case 'threeUp':
      return block.data.items
        .map((i) => mediaItemUrl(i))
        .filter((s): s is string => !!s);
    case 'text':
    case 'quote':
    case 'caption':
    case 'spacer':
      return [];
  }
}

export function isValidBlock(value: unknown): value is Block {
  if (typeof value !== 'object' || value === null) return false;
  const b = value as { id?: unknown; type?: unknown; data?: unknown };
  if (typeof b.id !== 'string') return false;
  if (typeof b.type !== 'string') return false;
  if (typeof b.data !== 'object' || b.data === null) return false;
  return BLOCK_TYPES.includes(b.type as BlockType);
}

export function readBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isValidBlock);
}
