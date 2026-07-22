import { CanvasBlock } from './canvas-block';
import {
  Block,
  CANVAS_WIDTH,
  CANVAS_MIN_HEIGHT,
  withPositions,
} from '@/lib/blocks';

// ----------------------------------------------------------------
// Public renderer for layoutMode === 'canvas'.
//
// Free-form absolute positioning at a fixed design width.
// Positions scale proportionally with viewport width using CSS transform,
// so the canvas reads at its native dimensions on smaller screens too.
// ----------------------------------------------------------------

export function CanvasRenderer({
  blocks,
  title,
}: {
  blocks: Block[];
  title: string;
}) {
  if (blocks.length === 0) return null;

  const placed = withPositions(blocks);
  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...placed.map((b) => (b.pos?.y ?? 0) + (b.pos?.h ?? 0))
  );

  return (
    <section className="w-full bg-background">
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: CANVAS_WIDTH,
          aspectRatio: `${CANVAS_WIDTH} / ${canvasHeight}`,
        }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: CANVAS_WIDTH,
            height: canvasHeight,
            transform: `scale(var(--canvas-scale, 1))`,
          }}
          data-canvas-root
        >
          {placed.map((block, idx) => {
            const pos = block.pos!;
            return (
              <div
                key={block.id}
                className="absolute overflow-hidden"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: pos.w,
                  height: pos.h,
                }}
              >
                <CanvasBlock block={block} title={title} priority={idx === 0} />
              </div>
            );
          })}
        </div>
      </div>
      <CanvasScaleScript />
    </section>
  );
}

/**
 * Tiny inline script that sets `--canvas-scale` based on the container's
 * actual rendered width vs the design width (CANVAS_WIDTH). Keeps positions
 * pixel-perfect at any viewport.
 */
function CanvasScaleScript() {
  const script = `
    (function() {
      function update() {
        document.querySelectorAll('[data-canvas-root]').forEach(function(el) {
          var parent = el.parentElement;
          if (!parent) return;
          var w = parent.getBoundingClientRect().width;
          el.style.setProperty('--canvas-scale', String(w / ${CANVAS_WIDTH}));
        });
      }
      update();
      window.addEventListener('resize', update);
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
