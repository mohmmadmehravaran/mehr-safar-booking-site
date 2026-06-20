import type { ShapeKind } from '../context/SiteEditsContext';

export interface ShapeDef {
  kind: ShapeKind;
  label: string;
}

export const SHAPE_LIBRARY: ShapeDef[] = [
  { kind: 'rectangle', label: 'مستطیل' },
  { kind: 'rounded', label: 'مستطیل گرد' },
  { kind: 'circle', label: 'دایره' },
  { kind: 'ellipse', label: 'بیضی' },
  { kind: 'pill', label: 'کپسول' },
  { kind: 'triangle', label: 'مثلث' },
  { kind: 'diamond', label: 'لوزی' },
  { kind: 'star', label: 'ستاره' },
  { kind: 'hexagon', label: 'شش‌ضلعی' },
  { kind: 'line', label: 'خط' },
];

/** Returns the CSS needed to draw a given shape on a div. */
export function shapeCss(
  kind: ShapeKind | undefined,
  radius: number
): { borderRadius?: string; clipPath?: string } {
  switch (kind) {
    case 'circle':
    case 'ellipse':
      return { borderRadius: '50%' };
    case 'pill':
      return { borderRadius: '9999px' };
    case 'rounded':
      return { borderRadius: `${Math.max(12, radius)}px` };
    case 'triangle':
      return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
    case 'diamond':
      return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    case 'star':
      return {
        clipPath:
          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      };
    case 'hexagon':
      return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    case 'line':
      return { borderRadius: '9999px' };
    case 'rectangle':
    default:
      return { borderRadius: `${radius}px` };
  }
}
