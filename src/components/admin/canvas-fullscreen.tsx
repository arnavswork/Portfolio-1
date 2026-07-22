'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, Loader2, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageDropzone } from '@/components/admin/image-dropzone';
import { CanvasEditor } from '@/components/admin/canvas-editor';
import type { Block } from '@/lib/blocks';

export interface CanvasFormData {
  title: string;
  year: number;
  discipline: string;
  description: string;
  featured: boolean;
  coverImageUrl: string;
  presentationImageUrl: string;
  imageUrls: string[];
  imageLayouts: string[];
  blocks: Block[];
  layoutMode: 'stack' | 'canvas';
}

interface Props {
  formData: CanvasFormData;
  setFormData: (next: CanvasFormData) => void;
  disciplines: { id: string; name: string }[];
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
  previewUrl?: string;
  onPreview?: () => void;
}

export function CanvasFullscreen({
  formData,
  setFormData,
  disciplines,
  onSave,
  saving,
  saveLabel,
  previewUrl,
  onPreview,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-background flex items-center gap-3 px-3 md:px-4 py-2 shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Exit</span>
          </Link>
        </Button>

        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Untitled project"
          className="max-w-md font-medium"
        />

        <div className="ml-auto flex items-center gap-2">
          <LayoutModeToggle
            value={formData.layoutMode}
            onChange={(layoutMode) => setFormData({ ...formData, layoutMode })}
          />

          {previewUrl && onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              disabled={!formData.title}
            >
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Preview</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Button>

          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
            ) : (
              <Save className="h-4 w-4 md:mr-2" />
            )}
            <span className="hidden md:inline">{saveLabel}</span>
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="py-6">
          <CanvasEditor
            blocks={formData.blocks}
            onChange={(blocks) => setFormData({ ...formData, blocks })}
          />
        </div>
      </div>

      {/* Settings sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Project settings</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select
                value={formData.discipline}
                onValueChange={(val) =>
                  setFormData({ ...formData, discipline: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <p className="text-xs text-muted-foreground">
                Square / 4:3. Used on the work grid tiles.
              </p>
              <ImageDropzone
                value={formData.coverImageUrl}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    coverImageUrl: val as string,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Presentation image</Label>
              <p className="text-xs text-muted-foreground">
                Wide / 16:9. Used in the home page slideshow.
              </p>
              <ImageDropzone
                value={formData.presentationImageUrl}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    presentationImageUrl: val as string,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: !!checked })
                }
              />
              <Label>Feature this project</Label>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LayoutModeToggle({
  value,
  onChange,
}: {
  value: 'stack' | 'canvas';
  onChange: (v: 'stack' | 'canvas') => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-muted/30 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onChange('stack')}
        className={
          'px-3 py-1 rounded ' +
          (value === 'stack'
            ? 'bg-background border shadow-sm'
            : 'text-muted-foreground hover:text-foreground')
        }
      >
        Stack
      </button>
      <button
        type="button"
        onClick={() => onChange('canvas')}
        className={
          'px-3 py-1 rounded ' +
          (value === 'canvas'
            ? 'bg-background border shadow-sm'
            : 'text-muted-foreground hover:text-foreground')
        }
      >
        Canvas
      </button>
    </div>
  );
}
