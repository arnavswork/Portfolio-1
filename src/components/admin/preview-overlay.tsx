'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Monitor, X, RotateCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEVICES = {
  mobile: { width: 390, label: 'Mobile' },
  tablet: { width: 820, label: 'Tablet' },
  desktop: { width: null as number | null, label: 'Desktop' },
};

type DeviceKey = keyof typeof DEVICES;

interface PreviewOverlayProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function PreviewOverlay({ open, onClose, url, title }: PreviewOverlayProps) {
  const [device, setDevice] = useState<DeviceKey>('desktop');
  const [reloadKey, setReloadKey] = useState(0);

  if (!open) return null;

  const target = DEVICES[device];
  const frameWidth = target.width ? `${target.width}px` : '100%';

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950 flex flex-col">
      <header className="flex items-center gap-3 px-3 md:px-4 py-2 bg-neutral-900 text-white border-b border-neutral-800 shrink-0">
        <div className="text-sm font-medium truncate max-w-[40%]">
          Preview — {title}
        </div>

        <div className="mx-auto flex items-center rounded-md bg-neutral-800 p-0.5">
          <DeviceButton
            icon={Smartphone}
            label="Mobile"
            active={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          />
          <DeviceButton
            icon={Tablet}
            label="Tablet"
            active={device === 'tablet'}
            onClick={() => setDevice('tablet')}
          />
          <DeviceButton
            icon={Monitor}
            label="Desktop"
            active={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-neutral-800 hover:text-white h-8 w-8"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label="Reload"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-neutral-800 hover:text-white h-8 w-8"
            asChild
          >
            <a href={url} target="_blank" rel="noreferrer" aria-label="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-neutral-800 hover:text-white h-8 w-8"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto flex justify-center py-6 px-4">
        <div
          className="bg-white shadow-2xl transition-[width] duration-200 ease-out"
          style={{ width: frameWidth, maxWidth: '100%', height: '100%' }}
        >
          <iframe
            key={reloadKey}
            src={url}
            className="w-full h-full border-0"
            title={`Preview of ${title}`}
          />
        </div>
      </div>
    </div>
  );
}

function DeviceButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors',
        active
          ? 'bg-neutral-700 text-white'
          : 'text-neutral-400 hover:text-white'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
