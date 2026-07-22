'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { UploadCloud, Loader2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Layout = 'full' | 'half';

interface GalleryLayoutEditorProps {
  images: string[];
  layouts: string[];
  onChange: (next: { images: string[]; layouts: string[] }) => void;
}

export function GalleryLayoutEditor({
  images,
  layouts,
  onChange,
}: GalleryLayoutEditorProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const normalizedLayouts: Layout[] = images.map((_, i) =>
    layouts[i] === 'half' ? 'half' : 'full'
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(
          acceptedFiles.map((f) =>
            imageCompression(f, {
              maxSizeMB: 0.4,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.8,
            })
          )
        );

        const base64 = await Promise.all(
          compressed.map(
            (f) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(f);
              })
          )
        );

        onChange({
          images: [...images, ...base64],
          layouts: [...normalizedLayouts, ...base64.map(() => 'full' as Layout)],
        });
      } finally {
        setIsCompressing(false);
      }
    },
    [images, normalizedLayouts, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  const setLayoutAt = (index: number, layout: Layout) => {
    const next = [...normalizedLayouts];
    next[index] = layout;
    onChange({ images, layouts: next });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const newLayouts = [...normalizedLayouts];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    [newLayouts[from], newLayouts[to]] = [newLayouts[to], newLayouts[from]];
    onChange({ images: newImages, layouts: newLayouts });
  };

  const remove = (index: number) => {
    onChange({
      images: images.filter((_, i) => i !== index),
      layouts: normalizedLayouts.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-muted-foreground/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-muted">
            {isCompressing ? (
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">
            {isCompressing
              ? 'Optimizing for web...'
              : isDragActive
              ? 'Drop images to add'
              : 'Click or drop to add gallery images'}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP. Choose Full or Half per image. Adjacent halves form a 2-column row.
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
          {images.map((src, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-md bg-background border"
            >
              <div className="relative w-20 h-14 rounded overflow-hidden bg-muted shrink-0">
                <Image src={src} alt="" fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-muted-foreground">
                  Image {i + 1}
                </div>
                <div className="text-[11px] text-muted-foreground/70">
                  {normalizedLayouts[i] === 'half'
                    ? 'Renders at half width'
                    : 'Renders at full width'}
                </div>
              </div>

              <div className="flex rounded-md border bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLayoutAt(i, 'full')}
                  className={cn(
                    'px-3 h-8 text-xs font-medium transition-colors',
                    normalizedLayouts[i] === 'full'
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted'
                  )}
                >
                  Full
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutAt(i, 'half')}
                  className={cn(
                    'px-3 h-8 text-xs font-medium transition-colors border-l',
                    normalizedLayouts[i] === 'half'
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted'
                  )}
                >
                  Half
                </button>
              </div>

              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => remove(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
