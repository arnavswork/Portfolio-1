'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVideoUploadUrl } from '@/lib/actions';

interface VideoDropzoneProps {
  value?: string;
  onChange: (value: string) => void;
  maxMB?: number;
}

export function VideoDropzone({
  value,
  onChange,
  maxMB = 200,
}: VideoDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      setProgress(0);
      try {
        const { uploadUrl, publicUrl } = await getVideoUploadUrl({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });

        await uploadWithProgress(uploadUrl, file, setProgress);
        onChange(publicUrl);
      } catch (err: any) {
        console.error('Video upload failed', err);
        setError(err?.message ?? 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov', '.m4v'] },
    multiple: false,
    disabled: uploading,
    maxSize: maxMB * 1024 * 1024,
  });

  return (
    <div className="space-y-3">
      {!value ? (
        <div
          {...getRootProps()}
          className={
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ' +
            (isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground/50')
          }
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              {uploading ? (
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              ) : (
                <UploadCloud className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploading
                  ? `Uploading… ${progress}%`
                  : isDragActive
                  ? 'Drop video to upload'
                  : 'Click or drop a video file'}
              </p>
              <p className="text-xs text-muted-foreground">
                MP4 / WebM / MOV — up to {maxMB} MB
              </p>
            </div>
            {uploading && (
              <div className="w-full max-w-xs h-1 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative border rounded-md overflow-hidden bg-black group">
          <video
            src={value}
            controls
            playsInline
            className="w-full max-h-72 object-contain bg-black"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full shadow-lg"
              onClick={() => onChange('')}
              aria-label="Remove video"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
            <Film className="h-3 w-3" />
            Uploaded
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () =>
      reject(
        new Error(
          'Upload network error — check R2 CORS settings (PUT from this origin must be allowed).'
        )
      );
    xhr.send(file);
  });
}
