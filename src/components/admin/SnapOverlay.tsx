import { useSyncExternalStore, useEffect, useState } from 'react';
import { useSiteEdits } from '../../context/SiteEditsContext';
import { findByDomPath } from '../../utils/domPath';
import { subscribeGuides, getGuidesSnapshot } from '../../utils/editorGuides';

/* ────────────────────────────────────────────────────────────────────────
   SnapOverlay
   1) Renders Figma-style pink alignment guide lines while dragging/resizing.
   2) Always shows the distance (spacing) from the SELECTED element to its
      container on all four sides — top / bottom / left / right — with dashed
      connectors and px badges, so spacing is always visible.
   ──────────────────────────────────────────────────────────────────────── */

interface SideSpacing {
  // dashed connector line (viewport coords)
  x1: number; y1: number; x2: number; y2: number;
  // badge position + value
  bx: number; by: number; value: number;
}

const PINK = '#ec4899';

export default function SnapOverlay() {
  const { selectedPath } = useSiteEdits();

  // ─── Live guide lines (set by drag/resize handlers) ───
  const snapshot = useSyncExternalStore(subscribeGuides, getGuidesSnapshot, getGuidesSnapshot);

  // ─── Spacing measurement of the selected element vs its container ───
  const [spacing, setSpacing] = useState<SideSpacing[]>([]);

  useEffect(() => {
    if (!selectedPath) {
      setSpacing([]);
      return;
    }
    let frame: number;
    const tick = () => {
      const el = findByDomPath(selectedPath);
      const parent = el?.parentElement || null;
      if (el && parent) {
        const r = el.getBoundingClientRect();
        const p = parent.getBoundingClientRect();

        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        const left = Math.round(r.left - p.left);
        const right = Math.round(p.right - r.right);
        const top = Math.round(r.top - p.top);
        const bottom = Math.round(p.bottom - r.bottom);

        const items: SideSpacing[] = [
          // top gap
          { x1: cx, y1: p.top, x2: cx, y2: r.top, bx: cx, by: (p.top + r.top) / 2, value: top },
          // bottom gap
          { x1: cx, y1: r.bottom, x2: cx, y2: p.bottom, bx: cx, by: (r.bottom + p.bottom) / 2, value: bottom },
          // left gap
          { x1: p.left, y1: cy, x2: r.left, y2: cy, bx: (p.left + r.left) / 2, by: cy, value: left },
          // right gap
          { x1: r.right, y1: cy, x2: p.right, y2: cy, bx: (r.right + p.right) / 2, by: cy, value: right },
        ].filter((s) => s.value > 0); // only render visible (positive) gaps

        setSpacing(items);
      } else {
        setSpacing([]);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [selectedPath]);

  return (
    <div
      data-visual-ui
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9988,
        overflow: 'hidden',
      }}
    >
      {/* ─── Magnet snap guide lines ─── */}
      {snapshot.guides.map((g, i) =>
        g.axis === 'v' ? (
          <div
            key={`v${i}`}
            style={{
              position: 'absolute',
              left: g.pos,
              top: 0,
              width: 1,
              height: '100%',
              background: PINK,
              boxShadow: `0 0 0 0.5px ${PINK}`,
            }}
          />
        ) : (
          <div
            key={`h${i}`}
            style={{
              position: 'absolute',
              top: g.pos,
              left: 0,
              height: 1,
              width: '100%',
              background: PINK,
              boxShadow: `0 0 0 0.5px ${PINK}`,
            }}
          />
        )
      )}

      {/* ─── Spacing measurements (distance to container) ─── */}
      {spacing.map((s, i) => {
        const horizontal = s.y1 === s.y2;
        return (
          <div key={`sp${i}`}>
            {/* dashed connector */}
            <div
              style={{
                position: 'absolute',
                left: Math.min(s.x1, s.x2),
                top: Math.min(s.y1, s.y2),
                width: horizontal ? Math.abs(s.x2 - s.x1) : 1,
                height: horizontal ? 1 : Math.abs(s.y2 - s.y1),
                borderTop: horizontal ? `1px dashed ${PINK}` : 'none',
                borderLeft: horizontal ? 'none' : `1px dashed ${PINK}`,
              }}
            />
            {/* px badge */}
            <div
              style={{
                position: 'absolute',
                left: s.bx,
                top: s.by,
                transform: 'translate(-50%, -50%)',
                background: PINK,
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: 4,
                fontFamily: "'Vazirmatn', monospace",
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              {s.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
