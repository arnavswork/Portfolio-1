'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProject, getDisciplines, updateProject } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ImageDropzone } from '@/components/admin/image-dropzone';
import { BlockEditor } from '@/components/admin/block-editor';
import { CanvasFullscreen } from '@/components/admin/canvas-fullscreen';
import { PreviewOverlay } from '@/components/admin/preview-overlay';
import type { Block } from '@/lib/blocks';
import { ChevronLeft, Loader2, Save, Tag, Eye } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EditProjectClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    discipline: '',
    description: '',
    featured: false,
    coverImageUrl: '',
    presentationImageUrl: '',
    imageUrls: [] as string[],
    imageLayouts: [] as string[],
    blocks: [] as Block[],
    layoutMode: 'stack' as 'stack' | 'canvas',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [project, disciplinesData] = await Promise.all([
          getProject(id),
          getDisciplines(),
        ]);

        if (!project) {
          router.replace('/admin');
          return;
        }

        setDisciplines(disciplinesData);

        setFormData({
          title: project.title || '',
          year: project.year || new Date().getFullYear(),
          discipline: project.discipline?.name || '',
          description: project.description || '',
          featured: !!project.featured,
          coverImageUrl: project.coverImageUrl || '',
          presentationImageUrl:
            (project as { presentationImageUrl?: string | null }).presentationImageUrl || '',
          imageUrls: project.imageUrls || [],
          imageLayouts: project.imageLayouts || [],
          blocks: Array.isArray(project.blocks)
            ? (project.blocks as unknown as Block[])
            : [],
          layoutMode:
            (project as { layoutMode?: string }).layoutMode === 'canvas'
              ? 'canvas'
              : 'stack',
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProject(id, formData);

      // ✅ IMPORTANT: refresh after update
      router.replace('/admin');
      router.refresh();

    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const previewUrl = formData.title
    ? `/project/${slugify(formData.title)}`
    : '';

  if (formData.layoutMode === 'canvas') {
    return (
      <>
        <CanvasFullscreen
          formData={formData}
          setFormData={setFormData}
          disciplines={disciplines}
          onSave={() =>
            handleSubmit({ preventDefault: () => {} } as React.FormEvent)
          }
          saving={loading}
          saveLabel="Update"
          previewUrl={previewUrl}
          onPreview={() => setPreviewOpen(true)}
        />
        <PreviewOverlay
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          url={previewUrl}
          title={formData.title}
        />
      </>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              Edit Project: {formData.title}
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <div className="flex gap-2">
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

                    <Button variant="outline" size="icon" asChild>
                      <Link href="/admin/disciplines">
                        <Tag className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        featured: !!checked,
                      })
                    }
                  />
                  <Label>Feature this project</Label>
                </div>

              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
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
                  <Label>Presentation Image</Label>
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
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Page Content</Label>
                  <LayoutModeToggle
                    value={formData.layoutMode}
                    onChange={(layoutMode) =>
                      setFormData({ ...formData, layoutMode })
                    }
                  />
                </div>
                <BlockEditor
                  blocks={formData.blocks}
                  onChange={(blocks: Block[]) =>
                    setFormData({ ...formData, blocks })
                  }
                />
              </div>

            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t pt-6">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
                disabled={!formData.title}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Project
              </Button>
            </CardFooter>
          </form>
        </Card>

      </div>

      <PreviewOverlay
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        url={previewUrl}
        title={formData.title}
      />
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