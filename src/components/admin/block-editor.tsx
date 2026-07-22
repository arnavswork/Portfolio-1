'use client';

import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Image as ImageIcon,
  Type,
  Grid3X3,
  Columns,
  ImagePlus,
  Video,
  Quote,
  AlignLeft,
  Minus,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageDropzone } from '@/components/admin/image-dropzone';
import { VideoDropzone } from '@/components/admin/video-dropzone';
import { cn } from '@/lib/utils';
import {
  Block,
  BlockType,
  createBlock,
  MediaItem,
  VideoProvider,
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

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const BLOCK_PICKER: {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { type: 'hero', label: 'Hero', icon: ImageIcon, description: 'Full-bleed banner image' },
  { type: 'text', label: 'Text', icon: Type, description: 'Paragraph or heading' },
  { type: 'image', label: 'Image', icon: ImagePlus, description: 'Single image' },
  { type: 'imageGrid', label: 'Image Grid', icon: Grid3X3, description: '2–4 image grid' },
  { type: 'split', label: 'Split', icon: Columns, description: 'Image + text side-by-side' },
  { type: 'video', label: 'Video', icon: Video, description: 'Vimeo, YouTube, or direct' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Pull quote with attribution' },
  { type: 'caption', label: 'Caption', icon: AlignLeft, description: 'Small caption text' },
  { type: 'twoUp', label: '2-Up', icon: LayoutGrid, description: 'Two media side-by-side' },
  { type: 'threeUp', label: '3-Up', icon: LayoutGrid, description: 'Three media in a row' },
  { type: 'spacer', label: 'Spacer', icon: Minus, description: 'Vertical breathing room' },
];

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const addBlock = (type: BlockType) => {
    onChange([...blocks, createBlock(type)]);
  };

  const updateBlock = (index: number, updated: Block) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-10 text-center bg-muted/20">
          <p className="text-sm text-muted-foreground mb-5">
            No blocks yet. Add your first block to start building the project page.
          </p>
          <AddBlockMenu onAdd={addBlock} />
        </div>
      ) : (
        <>
          {blocks.map((block, i) => (
            <BlockListItem
              key={block.id}
              block={block}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              onUpdate={(b) => updateBlock(i, b)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              onDelete={() => remove(i)}
            />
          ))}
          <div className="flex justify-center pt-2">
            <AddBlockMenu onAdd={addBlock} />
          </div>
        </>
      )}
    </div>
  );
}

function AddBlockMenu({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Block
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-3 bg-card w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {BLOCK_PICKER.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              onAdd(type);
              setOpen(false);
            }}
            className="text-left p-3 rounded-md border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Icon className="h-5 w-5 mb-2 text-muted-foreground" />
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {description}
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground mt-3 px-2"
      >
        Cancel
      </button>
    </div>
  );
}

function BlockListItem({
  block,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (b: Block) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
          {labelForType(block.type)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={isLast}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <BlockBody block={block} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

export function BlockBody({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (b: Block) => void;
}) {
  switch (block.type) {
    case 'hero':
      return <HeroEditor block={block} onUpdate={onUpdate} />;
    case 'text':
      return <TextEditor block={block} onUpdate={onUpdate} />;
    case 'image':
      return <ImageEditor block={block} onUpdate={onUpdate} />;
    case 'imageGrid':
      return <ImageGridEditor block={block} onUpdate={onUpdate} />;
    case 'split':
      return <SplitEditor block={block} onUpdate={onUpdate} />;
    case 'video':
      return <VideoEditor block={block} onUpdate={onUpdate} />;
    case 'quote':
      return <QuoteEditor block={block} onUpdate={onUpdate} />;
    case 'caption':
      return <CaptionEditor block={block} onUpdate={onUpdate} />;
    case 'twoUp':
      return <TwoUpEditor block={block} onUpdate={onUpdate} />;
    case 'threeUp':
      return <ThreeUpEditor block={block} onUpdate={onUpdate} />;
    case 'spacer':
      return <SpacerEditor block={block} onUpdate={onUpdate} />;
  }
}

// ----------------------------------------------------------------
// SHARED PICKERS
// ----------------------------------------------------------------

const ASPECT_RATIOS: AspectRatio[] = [
  'auto',
  '16/9',
  '4/3',
  '1/1',
  '3/4',
  '21/9',
  '9/16',
];

const IMAGE_WIDTHS: { value: ImageWidth; label: string }[] = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'wide', label: 'Wide' },
  { value: 'full', label: 'Full' },
  { value: 'edge', label: 'Edge-to-edge' },
];

const ALIGNMENTS: { value: ImageAlignment; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const BACKGROUNDS: { value: BackgroundShade; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'muted', label: 'Muted' },
  { value: 'accent', label: 'Accent' },
  { value: 'dark', label: 'Dark' },
];

const FONT_FAMILIES: { value: FontFamily; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'mono', label: 'Mono' },
];

const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'medium', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
];

const TEXT_ALIGNS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const TEXT_COLORS: { value: TextColor; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'muted', label: 'Muted' },
  { value: 'accent', label: 'Accent' },
  { value: 'inverse', label: 'Inverse' },
];

const TEXT_MAXW: { value: TextMaxWidth; label: string }[] = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
  { value: 'full', label: 'Full' },
];

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'display', label: 'Display' },
  { value: 'lead', label: 'Lead' },
  { value: 'body', label: 'Body' },
  { value: 'small', label: 'Small' },
  { value: 'caption', label: 'Caption' },
];

// ----------------------------------------------------------------
// EDITORS
// ----------------------------------------------------------------

function HeroEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'hero' }>;
  onUpdate: (b: Block) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Aspect ratio">
        <Toggle
          options={ASPECT_RATIOS.map((r) => ({ value: r, label: r }))}
          value={block.data.aspectRatio ?? 'auto'}
          onChange={(aspectRatio) =>
            onUpdate({
              ...block,
              data: { ...block.data, aspectRatio: aspectRatio as AspectRatio },
            })
          }
        />
      </Field>
      <ImageDropzone
        value={block.data.src}
        onChange={(val) =>
          onUpdate({ ...block, data: { ...block.data, src: val as string } })
        }
      />
    </div>
  );
}

function TextEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'text' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-4">
      <Textarea
        value={block.data.content}
        onChange={(e) => set('content', e.target.value)}
        placeholder="Write your text..."
        className="min-h-[120px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Size">
          <Toggle
            options={TEXT_SIZES}
            value={block.data.size}
            onChange={(v) => set('size', v as TextSize)}
          />
        </Field>
        <Field label="Font">
          <Toggle
            options={FONT_FAMILIES}
            value={block.data.font ?? 'sans'}
            onChange={(v) => set('font', v as FontFamily)}
          />
        </Field>
        <Field label="Weight">
          <Toggle
            options={FONT_WEIGHTS}
            value={block.data.weight ?? 'regular'}
            onChange={(v) => set('weight', v as FontWeight)}
          />
        </Field>
        <Field label="Align">
          <Toggle
            options={TEXT_ALIGNS}
            value={block.data.align ?? 'left'}
            onChange={(v) => set('align', v as TextAlign)}
          />
        </Field>
        <Field label="Color">
          <Toggle
            options={TEXT_COLORS}
            value={block.data.color ?? 'default'}
            onChange={(v) => set('color', v as TextColor)}
          />
        </Field>
        <Field label="Max width">
          <Toggle
            options={TEXT_MAXW}
            value={block.data.maxWidth ?? 'medium'}
            onChange={(v) => set('maxWidth', v as TextMaxWidth)}
          />
        </Field>
      </div>
    </div>
  );
}

function ImageEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'image' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-4">
      <ImageDropzone
        value={block.data.src}
        onChange={(val) => set('src', val as string)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Width">
          <Toggle
            options={IMAGE_WIDTHS}
            value={block.data.width}
            onChange={(v) => set('width', v as ImageWidth)}
          />
        </Field>
        <Field label="Aspect ratio">
          <Toggle
            options={ASPECT_RATIOS.map((r) => ({ value: r, label: r }))}
            value={block.data.aspectRatio ?? 'auto'}
            onChange={(v) => set('aspectRatio', v as AspectRatio)}
          />
        </Field>
        <Field label="Alignment">
          <Toggle
            options={ALIGNMENTS}
            value={block.data.alignment ?? 'center'}
            onChange={(v) => set('alignment', v as ImageAlignment)}
          />
        </Field>
        <Field label="Background">
          <Toggle
            options={BACKGROUNDS}
            value={block.data.background ?? 'none'}
            onChange={(v) => set('background', v as BackgroundShade)}
          />
        </Field>
      </div>

      <Field label="Caption (optional)">
        <Input
          value={block.data.caption ?? ''}
          onChange={(e) => set('caption', e.target.value)}
          placeholder="Image caption..."
        />
      </Field>
    </div>
  );
}

function ImageGridEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'imageGrid' }>;
  onUpdate: (b: Block) => void;
}) {
  const updateImages = (urls: string[]) => {
    const limited = urls.slice(0, 4);
    onUpdate({
      ...block,
      data: {
        ...block.data,
        images: limited.map((src) => ({ src })),
      },
    });
  };

  return (
    <div className="space-y-3">
      <Field label="Columns">
        <Toggle
          options={[
            { value: '2', label: '2 cols' },
            { value: '3', label: '3 cols' },
            { value: '4', label: '4 cols' },
          ]}
          value={String(block.data.columns)}
          onChange={(c) =>
            onUpdate({
              ...block,
              data: {
                ...block.data,
                columns: Number(c) as 2 | 3 | 4,
              },
            })
          }
        />
      </Field>
      <ImageDropzone
        multiple
        value={block.data.images.map((i) => i.src)}
        onChange={(vals) => updateImages(vals as string[])}
      />
      <p className="text-xs text-muted-foreground">Up to 4 images.</p>
      <Field label="Caption (optional)">
        <Input
          value={block.data.caption ?? ''}
          onChange={(e) =>
            onUpdate({
              ...block,
              data: { ...block.data, caption: e.target.value },
            })
          }
          placeholder="Caption shown beneath grid..."
        />
      </Field>
    </div>
  );
}

function SplitEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'split' }>;
  onUpdate: (b: Block) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Image side">
          <Toggle
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
            value={block.data.imageSide}
            onChange={(side) =>
              onUpdate({
                ...block,
                data: {
                  ...block.data,
                  imageSide: side as 'left' | 'right',
                },
              })
            }
          />
        </Field>
        <Field label="Font">
          <Toggle
            options={FONT_FAMILIES}
            value={block.data.font ?? 'sans'}
            onChange={(v) =>
              onUpdate({
                ...block,
                data: { ...block.data, font: v as FontFamily },
              })
            }
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ImageDropzone
          value={block.data.src}
          onChange={(val) =>
            onUpdate({
              ...block,
              data: { ...block.data, src: val as string },
            })
          }
        />
        <Textarea
          value={block.data.text}
          onChange={(e) =>
            onUpdate({
              ...block,
              data: { ...block.data, text: e.target.value },
            })
          }
          placeholder="Text shown alongside image..."
          className="min-h-[180px]"
        />
      </div>
    </div>
  );
}

function VideoEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'video' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-4">
      <Field label="Provider">
        <Toggle
          options={[
            { value: 'vimeo', label: 'Vimeo' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'direct', label: 'Direct (mp4)' },
          ]}
          value={block.data.provider}
          onChange={(v) => set('provider', v as VideoProvider)}
        />
      </Field>

      {block.data.provider === 'direct' ? (
        <Field label="Upload video">
          <VideoDropzone
            value={block.data.src}
            onChange={(src) => set('src', src)}
          />
        </Field>
      ) : (
        <Field label={`${block.data.provider === 'vimeo' ? 'Vimeo' : 'YouTube'} URL`}>
          <Input
            value={block.data.src}
            onChange={(e) => set('src', e.target.value)}
            placeholder={
              block.data.provider === 'vimeo'
                ? 'https://vimeo.com/123456789'
                : 'https://youtube.com/watch?v=...'
            }
          />
        </Field>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Width">
          <Toggle
            options={IMAGE_WIDTHS}
            value={block.data.width}
            onChange={(v) => set('width', v as ImageWidth)}
          />
        </Field>
        <Field label="Aspect ratio">
          <Toggle
            options={ASPECT_RATIOS.filter((r) => r !== 'auto').map((r) => ({
              value: r,
              label: r,
            }))}
            value={block.data.aspectRatio ?? '16/9'}
            onChange={(v) => set('aspectRatio', v as AspectRatio)}
          />
        </Field>
        <Field label="Alignment">
          <Toggle
            options={ALIGNMENTS}
            value={block.data.alignment ?? 'center'}
            onChange={(v) => set('alignment', v as ImageAlignment)}
          />
        </Field>
        <Field label="Background">
          <Toggle
            options={BACKGROUNDS}
            value={block.data.background ?? 'none'}
            onChange={(v) => set('background', v as BackgroundShade)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Checkbox
          label="Autoplay"
          checked={!!block.data.autoplay}
          onChange={(v) => set('autoplay', v)}
        />
        <Checkbox
          label="Loop"
          checked={!!block.data.loop}
          onChange={(v) => set('loop', v)}
        />
        <Checkbox
          label="Muted"
          checked={!!block.data.muted}
          onChange={(v) => set('muted', v)}
        />
        <Checkbox
          label="Controls"
          checked={block.data.controls ?? true}
          onChange={(v) => set('controls', v)}
        />
      </div>

      <Field label="Caption (optional)">
        <Input
          value={block.data.caption ?? ''}
          onChange={(e) => set('caption', e.target.value)}
          placeholder="Video caption..."
        />
      </Field>
    </div>
  );
}

function QuoteEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'quote' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-3">
      <Textarea
        value={block.data.content}
        onChange={(e) => set('content', e.target.value)}
        placeholder="The quote..."
        className="min-h-[120px]"
      />
      <Field label="Attribution (optional)">
        <Input
          value={block.data.attribution ?? ''}
          onChange={(e) => set('attribution', e.target.value)}
          placeholder="Who said it"
        />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Align">
          <Toggle
            options={TEXT_ALIGNS}
            value={block.data.align ?? 'center'}
            onChange={(v) => set('align', v as TextAlign)}
          />
        </Field>
        <Field label="Font">
          <Toggle
            options={FONT_FAMILIES}
            value={block.data.font ?? 'serif'}
            onChange={(v) => set('font', v as FontFamily)}
          />
        </Field>
      </div>
    </div>
  );
}

function CaptionEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'caption' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-3">
      <Input
        value={block.data.content}
        onChange={(e) => set('content', e.target.value)}
        placeholder="Caption text..."
      />
      <Field label="Align">
        <Toggle
          options={TEXT_ALIGNS}
          value={block.data.align ?? 'center'}
          onChange={(v) => set('align', v as TextAlign)}
        />
      </Field>
    </div>
  );
}

function TwoUpEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'twoUp' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Width ratio">
          <Toggle
            options={[
              { value: '1/1', label: '50/50' },
              { value: '2/1', label: '66/33' },
              { value: '1/2', label: '33/66' },
            ]}
            value={block.data.ratio ?? '1/1'}
            onChange={(v) =>
              set('ratio', v as '1/1' | '2/1' | '1/2')
            }
          />
        </Field>
        <Field label="Aspect ratio">
          <Toggle
            options={ASPECT_RATIOS.filter((r) => r !== 'auto').map((r) => ({
              value: r,
              label: r,
            }))}
            value={block.data.aspectRatio ?? '4/3'}
            onChange={(v) => set('aspectRatio', v as AspectRatio)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MediaItemEditor
          label="Left"
          value={block.data.left}
          onChange={(left) => set('left', left)}
        />
        <MediaItemEditor
          label="Right"
          value={block.data.right}
          onChange={(right) => set('right', right)}
        />
      </div>

      <Field label="Caption (optional)">
        <Input
          value={block.data.caption ?? ''}
          onChange={(e) => set('caption', e.target.value)}
          placeholder="Caption shown beneath pair..."
        />
      </Field>
    </div>
  );
}

function ThreeUpEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'threeUp' }>;
  onUpdate: (b: Block) => void;
}) {
  const set = <K extends keyof typeof block.data>(
    key: K,
    value: typeof block.data[K]
  ) => onUpdate({ ...block, data: { ...block.data, [key]: value } });

  const updateItem = (index: number, next: MediaItem) => {
    const items = [...block.data.items] as [MediaItem, MediaItem, MediaItem];
    items[index] = next;
    set('items', items);
  };

  return (
    <div className="space-y-4">
      <Field label="Aspect ratio">
        <Toggle
          options={ASPECT_RATIOS.filter((r) => r !== 'auto').map((r) => ({
            value: r,
            label: r,
          }))}
          value={block.data.aspectRatio ?? '4/3'}
          onChange={(v) => set('aspectRatio', v as AspectRatio)}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {block.data.items.map((item, i) => (
          <MediaItemEditor
            key={i}
            label={`Item ${i + 1}`}
            value={item}
            onChange={(next) => updateItem(i, next)}
          />
        ))}
      </div>

      <Field label="Caption (optional)">
        <Input
          value={block.data.caption ?? ''}
          onChange={(e) => set('caption', e.target.value)}
          placeholder="Caption shown beneath row..."
        />
      </Field>
    </div>
  );
}

function SpacerEditor({
  block,
  onUpdate,
}: {
  block: Extract<Block, { type: 'spacer' }>;
  onUpdate: (b: Block) => void;
}) {
  return (
    <Field label="Size">
      <Toggle
        options={[
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ]}
        value={block.data.size}
        onChange={(v) =>
          onUpdate({
            ...block,
            data: { ...block.data, size: v as SpacerSize },
          })
        }
      />
    </Field>
  );
}

// ----------------------------------------------------------------
// MEDIA ITEM EDITOR (used by twoUp / threeUp)
// ----------------------------------------------------------------

function MediaItemEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MediaItem;
  onChange: (v: MediaItem) => void;
}) {
  return (
    <div className="border rounded-md p-3 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Toggle
          options={[
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
          ]}
          value={value.kind}
          onChange={(kind) =>
            onChange({ ...value, kind: kind as 'image' | 'video', src: '' })
          }
        />
      </div>

      {value.kind === 'image' ? (
        <ImageDropzone
          value={value.src}
          onChange={(src) => onChange({ ...value, src: src as string })}
        />
      ) : (
        <div className="space-y-2">
          <Toggle
            options={[
              { value: 'vimeo', label: 'Vimeo' },
              { value: 'youtube', label: 'YouTube' },
              { value: 'direct', label: 'Direct' },
            ]}
            value={value.provider ?? 'direct'}
            onChange={(p) =>
              onChange({
                ...value,
                provider: p as VideoProvider,
                src: '',
              })
            }
          />
          {(value.provider ?? 'direct') === 'direct' ? (
            <VideoDropzone
              value={value.src}
              onChange={(src) => onChange({ ...value, src })}
            />
          ) : (
            <Input
              value={value.src}
              onChange={(e) => onChange({ ...value, src: e.target.value })}
              placeholder={
                value.provider === 'vimeo'
                  ? 'https://vimeo.com/123456789'
                  : 'https://youtube.com/watch?v=...'
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// SHARED PRIMITIVES
// ----------------------------------------------------------------

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background overflow-hidden flex-wrap">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 h-8 text-xs font-medium transition-colors',
            i > 0 && 'border-l',
            value === opt.value
              ? 'bg-foreground text-background'
              : 'hover:bg-muted'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-input"
      />
      {label}
    </label>
  );
}

export function labelForType(type: BlockType): string {
  switch (type) {
    case 'hero':
      return 'Hero';
    case 'text':
      return 'Text';
    case 'image':
      return 'Image';
    case 'imageGrid':
      return 'Image Grid';
    case 'split':
      return 'Split (Image + Text)';
    case 'video':
      return 'Video';
    case 'quote':
      return 'Quote';
    case 'caption':
      return 'Caption';
    case 'twoUp':
      return '2-Up Media';
    case 'threeUp':
      return '3-Up Media';
    case 'spacer':
      return 'Spacer';
  }
}
