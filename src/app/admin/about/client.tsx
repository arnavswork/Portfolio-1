'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockEditor } from '@/components/admin/block-editor';
import { updateAboutBlocks } from '@/lib/actions';
import type { Block } from '@/lib/blocks';

interface Props {
  initialBlocks: Block[];
}

export default function AboutAdminClient({ initialBlocks }: Props) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAboutBlocks({ blocks });
      router.refresh();
    } catch (err) {
      console.error('Failed to save about page', err);
      alert('Failed to save about page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">About Page</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Build your about page using the same block system as projects.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>

        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
