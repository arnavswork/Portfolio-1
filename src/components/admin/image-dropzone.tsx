'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, X, Loader2, GripVertical } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';

interface ImageDropzoneProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export function ImageDropzone({ value, onChange, multiple = false }: ImageDropzoneProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsCompressing(true);
    
    // Aggressive compression for multiple images to stay under Firestore document limits (1MB)
    const options = {
      maxSizeMB: multiple ? 0.15 : 0.4, 
      maxWidthOrHeight: multiple ? 1280 : 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as string,
      initialQuality: 0.75
    };

    try {
      const compressedFiles = await Promise.all(
        acceptedFiles.map(file => imageCompression(file, options))
      );

      const base64Strings = await Promise.all(
        compressedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        onChange([...currentValues, ...base64Strings]);
      } else {
        onChange(base64Strings[0]);
      }
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setIsCompressing(false);
    }
  }, [multiple, onChange, value]);

  const removeImage = (index: number) => {
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter((_, i) => i !== index);
      onChange(newValues);
    } else {
      onChange('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple,
  });

  const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : []);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted hover:border-muted-foreground/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-muted">
            {isCompressing ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isCompressing ? 'Optimizing for web...' : isDragActive ? 'Drop images to upload' : `Click to upload ${multiple ? 'gallery images' : 'cover image'}`}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP (Pentagram-style editorial compression)
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1 max-w-sm'}`}>
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border bg-muted shadow-sm group">
              <Image src={img} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {multiple && (
                <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-mono uppercase">
                  Img {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
