'use client';

import { useMemo, useRef, useState } from 'react';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CanvasBlock } from '@/components/blocks/canvas-block';
import { BlockBody, BLOCK_PICKER, labelForType } from './block-editor';
import { cn } from '@/lib/utils';
import {
  Block,
  BlockType,
  CanvasPosition,
  CANVAS_WIDTH,
  CANVAS_MIN_HEIGHT,
  TILE_MIN_W,
  TILE_MIN_H,
  createBlock,
  findNextDropY,
  sizeForType,
  withPositions,
} from '@/lib/blocks';

interface CanvasEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function CanvasEditor({ blocks, onChange }: CanvasEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const positioned = useMemo(() => withPositions(blocks), [blocks]);
  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...positioned.map((b) => (b.pos?.y ?? 0) + (b.pos?.h ?? 0) + 40)
  );

  const updatePos = (id: string, pos: CanvasPosition) => {
    onChange(positioned.map((b) => (b.id === id ? ({ ...b, pos } as Block) : b)));
  };

  const handleAdd = (type: BlockType) => {
    const block = createBlock(type);
    const sized = sizeForType(type);
    const y = findNextDropY(positioned) + (positioned.length ? 16 : 0);
    const x = Math.max(0, Math.floor((CANVAS_WIDTH - sized.w) / 2));
    const next: Block = { ...block, pos: { x, y, ...sized } } as Block;
    onChange([...positioned, next]);
    setPickerOpen(false);
    setSelectedId(next.id);
    setEditingId(next.id);
  };

  const handleUpdate = (id: string, updated: Block) => {
    onChange(
      positioned.map((b) =>
        b.id === id ? ({ ...updated, pos: b.pos } as Block) : b
      )
    );
  };

  const handleDelete = (id: string) => {
    onChange(positioned.filter((b) => b.id !== id));
    if (editingId === id) setEditingId(null);
    if (selectedId === id) setSelectedId(null);
  };

  const editing = positioned.find((b) => b.id === editingId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          Click to select. Drag the handle to move, drag the corner to resize.
        </p>
        <AddBlockMenu
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onAdd={handleAdd}
        />
      </div>

      <div className="border rounded-lg bg-muted/30 overflow-auto">
        <div
          ref={canvasRef}
          className="relative bg-background mx-auto shadow-sm"
          style={{ width: CANVAS_WIDTH, height: canvasHeight }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {positioned.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground pointer-events-none">
              Empty canvas — add a block to start.
            </div>
          )}

          {positioned.map((block) => (
            <CanvasTile
              key={block.id}
              block={block}
              selected={block.id === selectedId}
              onSelect={() => setSelectedId(block.id)}
              onEdit={() => setEditingId(block.id)}
              onDelete={() => handleDelete(block.id)}
              onPosChange={(pos) => updatePos(block.id, pos)}
              canvasHeight={canvasHeight}
            />
          ))}
        </div>
      </div>

      <Sheet
        open={!!editing}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Edit {editing ? labelForType(editing.type) : ''}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-6">
              <BlockBody
                block={editing}
                onUpdate={(b) => handleUpdate(editing.id, b)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CanvasTile({
  block,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onPosChange,
  canvasHeight,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPosChange: (pos: CanvasPosition) => void;
  canvasHeight: number;
}) {
  const pos = block.pos!;

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...pos };

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nextX = clamp(start.x + dx, 0, CANVAS_WIDTH - start.w);
      const nextY = Math.max(0, start.y + dy);
      onPosChange({ ...start, x: nextX, y: nextY });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...pos };

    const onMove = (ev: PointerEvent) => {
      const dw = ev.clientX - startX;
      const dh = ev.clientY - startY;
      const nextW = clamp(start.w + dw, TILE_MIN_W, CANVAS_WIDTH - start.x);
      const nextH = Math.max(TILE_MIN_H, start.h + dh);
      onPosChange({ ...start, w: nextW, h: nextH });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={cn(
        'absolute group',
        selected ? 'ring-2 ring-primary z-10' : 'ring-1 ring-border/40 hover:ring-border'
      )}
      style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.h }}
      onPointerDown={(e) => {
        // Click anywhere on the tile = select.
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative w-full h-full overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <CanvasBlock block={block} title="Preview" />
        </div>

        {/* Type badge */}
        <div className="absolute top-1 left-1 z-10 text-[10px] uppercase tracking-[0.12em] font-medium bg-background/90 px-1.5 py-0.5 rounded border">
          {labelForType(block.type)}
        </div>

        {/* Drag handle */}
        <button
          type="button"
          className={cn(
            'absolute top-1 left-1/2 -translate-x-1/2 z-10 bg-background/90 border rounded p-1 cursor-move',
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            'transition-opacity'
          )}
          onPointerDown={startDrag}
          aria-label="Drag"
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* Action buttons */}
        <div
          className={cn(
            'absolute top-1 right-1 z-10 flex gap-1',
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            'transition-opacity'
          )}
        >
          <button
            type="button"
            className="bg-background border rounded p-1 hover:bg-primary hover:text-primary-foreground"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="bg-background border rounded p-1 hover:bg-destructive hover:text-destructive-foreground"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Resize handle */}
        {selected && (
          <div
            className="absolute right-0 bottom-0 w-4 h-4 bg-primary cursor-se-resize z-20"
            onPointerDown={startResize}
            aria-label="Resize"
          />
        )}
      </div>
    </div>
  );
}

function AddBlockMenu({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: BlockType) => void;
}) {
  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(true)}
        className="border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Block
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-3 bg-card w-full max-w-3xl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {BLOCK_PICKER.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
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
        onClick={() => onOpenChange(false)}
        className="text-xs text-muted-foreground hover:text-foreground mt-3 px-2"
      >
        Cancel
      </button>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
