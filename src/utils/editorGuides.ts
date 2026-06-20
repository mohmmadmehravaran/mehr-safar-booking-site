/* ────────────────────────────────────────────────────────────────────────
   editorGuides.ts
   A tiny vanilla store for the visual editor's "magnet / snap" guide lines
   plus the magnet-enabled toggle (persisted to localStorage).
   Also exposes the snapping math used while dragging / resizing elements.
   ──────────────────────────────────────────────────────────────────────── */

export interface Guide {
  axis: 'v' | 'h';
  pos: number; // viewport coordinate (px)
}

interface GuideSnapshot {
  guides: Guide[];
}

let guideState: GuideSnapshot = { guides: [] };
const guideListeners = new Set<() => void>();

function emitGuides() {
  for (const cb of guideListeners) cb();
}

export function subscribeGuides(cb: () => void): () => void {
  guideListeners.add(cb);
  return () => guideListeners.delete(cb);
}

export function getGuidesSnapshot(): GuideSnapshot {
  return guideState;
}

export function setGuides(guides: Guide[]) {
  guideState = { guides };
  emitGuides();
}

export function clearGuides() {
  if (guideState.guides.length) {
    guideState = { guides: [] };
    emitGuides();
  }
}

/* ─── Magnet (snap) enabled toggle ─────────────────────────────────────── */
const MAGNET_KEY = 'mehr_magnet_enabled';

function readMagnet(): boolean {
  try {
    return localStorage.getItem(MAGNET_KEY) !== '0'; // default ON
  } catch {
    return true;
  }
}

let magnetEnabled = readMagnet();
const magnetListeners = new Set<() => void>();

export function getMagnet(): boolean {
  return magnetEnabled;
}

export function setMagnet(v: boolean) {
  magnetEnabled = v;
  try {
    localStorage.setItem(MAGNET_KEY, v ? '1' : '0');
  } catch {
    /* ignore */
  }
  for (const cb of magnetListeners) cb();
}

export function subscribeMagnet(cb: () => void): () => void {
  magnetListeners.add(cb);
  return () => magnetListeners.delete(cb);
}

/* ─── Snap math ────────────────────────────────────────────────────────── */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const SNAP_THRESHOLD = 7; // px

/**
 * Collect snap-target rectangles for an element: its parent container and the
 * parent's visible direct children (siblings). These are the references the
 * moving element will magnetically align to (edges + centers).
 */
export function collectSnapTargets(el: HTMLElement): DOMRect[] {
  const rects: DOMRect[] = [];
  const parent = el.parentElement;
  if (!parent) return rects;

  rects.push(parent.getBoundingClientRect());

  for (const child of Array.from(parent.children)) {
    if (child === el) continue;
    const he = child as HTMLElement;
    if (he.closest && he.closest('[data-visual-ui]')) continue;
    const r = he.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    rects.push(r);
  }
  return rects;
}

/**
 * Given a proposed (screen-space) rectangle for the moving element and a set of
 * target rects, compute the snap correction (dx, dy) that aligns the closest
 * edge/center pair within SNAP_THRESHOLD, plus the guide lines to render.
 */
export function computeSnap(
  rect: Rect,
  targets: DOMRect[],
  threshold = SNAP_THRESHOLD
): { dx: number; dy: number; guides: Guide[] } {
  const mLeft = rect.left;
  const mRight = rect.left + rect.width;
  const mCx = rect.left + rect.width / 2;
  const mTop = rect.top;
  const mBottom = rect.top + rect.height;
  const mCy = rect.top + rect.height / 2;

  // Candidate alignment lines
  const vLines: number[] = [window.innerWidth / 2];
  const hLines: number[] = [window.innerHeight / 2];
  for (const t of targets) {
    vLines.push(t.left, t.left + t.width / 2, t.right);
    hLines.push(t.top, t.top + t.height / 2, t.bottom);
  }

  let bestDX = 0;
  let bestDistX = threshold + 1;
  let snappedVx: number | null = null;
  const movingXs = [mLeft, mCx, mRight];
  for (const line of vLines) {
    for (const mx of movingXs) {
      const d = line - mx;
      const ad = Math.abs(d);
      if (ad < bestDistX) {
        bestDistX = ad;
        bestDX = d;
        snappedVx = line;
      }
    }
  }

  let bestDY = 0;
  let bestDistY = threshold + 1;
  let snappedHy: number | null = null;
  const movingYs = [mTop, mCy, mBottom];
  for (const line of hLines) {
    for (const my of movingYs) {
      const d = line - my;
      const ad = Math.abs(d);
      if (ad < bestDistY) {
        bestDistY = ad;
        bestDY = d;
        snappedHy = line;
      }
    }
  }

  const guides: Guide[] = [];
  if (snappedVx !== null && bestDistX <= threshold) guides.push({ axis: 'v', pos: snappedVx });
  if (snappedHy !== null && bestDistY <= threshold) guides.push({ axis: 'h', pos: snappedHy });

  return {
    dx: bestDistX <= threshold ? bestDX : 0,
    dy: bestDistY <= threshold ? bestDY : 0,
    guides,
  };
}

/**
 * Snap a single moving edge value to the nearest target line (used during
 * resize). Returns the corrected delta to add and an optional guide line.
 */
export function snapEdge(
  edgeValue: number,
  targets: DOMRect[],
  axis: 'v' | 'h',
  threshold = SNAP_THRESHOLD
): { delta: number; guide: Guide | null } {
  const lines: number[] = [];
  if (axis === 'v') {
    lines.push(window.innerWidth / 2);
    for (const t of targets) lines.push(t.left, t.left + t.width / 2, t.right);
  } else {
    lines.push(window.innerHeight / 2);
    for (const t of targets) lines.push(t.top, t.top + t.height / 2, t.bottom);
  }
  let best = 0;
  let bestDist = threshold + 1;
  let snapped: number | null = null;
  for (const line of lines) {
    const d = line - edgeValue;
    const ad = Math.abs(d);
    if (ad < bestDist) {
      bestDist = ad;
      best = d;
      snapped = line;
    }
  }
  if (snapped !== null && bestDist <= threshold) {
    return { delta: best, guide: { axis, pos: snapped } };
  }
  return { delta: 0, guide: null };
}
