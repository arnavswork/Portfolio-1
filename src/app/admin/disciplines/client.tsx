'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDisciplines, addDiscipline, deleteDiscipline } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ManageDisciplinesClient() {
  const { toast } = useToast();
  const router = useRouter();

  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newDiscipline, setNewDiscipline] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Load disciplines
  useEffect(() => {
    async function fetchData() {
      const data = await getDisciplines();
      setDisciplines(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const refreshData = async () => {
    const updated = await getDisciplines();
    setDisciplines(updated);
    router.refresh(); // ✅ keeps UI in sync with server
  };

  const handleAddDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscipline.trim() || isAdding) return;

    setIsAdding(true);

    try {
      await addDiscipline(newDiscipline.trim());

      await refreshData();

      setNewDiscipline('');

      toast({
        title: 'Discipline added',
        description: 'New category is now available for projects.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add discipline',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure? Projects using this discipline will still show the name, but it won't be in the dropdown."
      )
    ) {
      try {
        await deleteDiscipline(id);

        await refreshData();

        toast({
          title: 'Deleted',
          description: 'Discipline removed successfully.',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to delete discipline',
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        {/* ADD */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              Add New Discipline
            </CardTitle>
            <CardDescription>
              Create categories like "Brand Identity" or "Web Design".
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAddDiscipline} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label className="sr-only">Discipline Name</Label>
                <Input
                  placeholder="Enter discipline name..."
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isAdding}>
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Disciplines</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : disciplines.length > 0 ? (
              <div className="divide-y border rounded-lg">
                {disciplines.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-4 bg-card"
                  >
                    <span className="font-medium">{d.name}</span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(d.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No disciplines found. Add one above.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}