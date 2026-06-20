import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { findByDomPath, getCurrentPath, pageOfKey, PAGE_SEP } from '../utils/domPath';
import { fileToCompressedDataURL } from '../utils/image';

export interface StyleEdits {
  text?: string;
  placeholder?: string;
  src?: string;
  href?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  bgGradient?: string; // e.g., "linear-gradient(135deg, #059669, #0d9488)"
  bgSrc?: string; // background image URL (replace colorful box with image)
  padding?: number;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  hidden?: boolean;
  opacity?: number;
  glass?: boolean;
  zIndex?: number;
  // Stroke (border)
  strokeWidth?: number;
  strokeColor?: string;
  strokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  // Shadow
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  shadowInset?: boolean;
}

export interface CustomPage {
  id: string;
  path: string;   // route path, e.g. "/page/about-123"
  label: string;  // display name shown in menus
  icon?: string;  // optional lucide icon name for menus
}

export type WidgetType = 'image' | 'container' | 'button' | 'text' | 'icon' | 'shape';
export type ShapeKind =
  | 'rectangle' | 'rounded' | 'circle' | 'ellipse' | 'pill'
  | 'triangle' | 'diamond' | 'star' | 'hexagon' | 'line';

export interface CustomWidget {
  id: string;
  type: WidgetType;
  page: string; // which route this widget belongs to, e.g. "/" or "/login"
  title?: string;
  text?: string;
  src?: string;
  link?: string; // URL to navigate when clicked
  // Button / text
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  // Icon widgets (lucide icon by name)
  icon?: string;
  iconSize?: number;
  // Shape widgets
  shape?: ShapeKind;
  // Stay fixed in the viewport while scrolling (matches the sticky header)
  pinned?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  bg?: string;
  bgGradient?: string;
  color?: string;
  radius?: number;
  padding?: number;
  border?: string;
  opacity?: number;
  zIndex?: number;
  glass?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  strokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  shadowInset?: boolean;
  fontSize?: number;
}

export type EditsRegistry = Record<string, StyleEdits>;

interface SiteEditsContextType {
  edits: EditsRegistry;
  setElementEdit: (path: string, partial: Partial<StyleEdits>) => void;
  resetElementEdit: (path: string) => void;
  resetAllEdits: () => void;
  selectedPath: string | null;
  setSelectedPath: (p: string | null) => void;
  customWidgets: CustomWidget[];
  addCustomWidget: (type: WidgetType, fileOrSrc?: File | string, page?: string, preset?: Partial<CustomWidget>) => Promise<void>;
  updateCustomWidget: (id: string, partial: Partial<CustomWidget>) => void;
  removeCustomWidget: (id: string) => void;
  updateWidgetZIndex: (id: string, zIndex: number) => void;
  moveWidgetLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  // Custom pages (no-code page builder)
  customPages: CustomPage[];
  addCustomPage: (label: string, icon?: string) => string; // returns the new page path
  updateCustomPage: (id: string, partial: Partial<CustomPage>) => void;
  removeCustomPage: (id: string) => void;
  undoCount: number;
  undo: () => void;
}

const STORAGE_KEY = 'mehrsafar-visual-edits-2026';
const WIDGETS_STORAGE_KEY = 'mehrsafar-visual-widgets-2026';
const PAGES_STORAGE_KEY = 'mehrsafar-custom-pages-2026';

function applySingleEdit(el: HTMLElement, edit: StyleEdits) {
  // 1. Text/Value/Placeholder/Src/Href
  // Important: ONLY apply text override if it's actually different.
  // And ONLY for leaf nodes that don't have SVGs or other icons inside.
  if (edit.text !== undefined) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const inp = el as HTMLInputElement;
      if (inp.value !== edit.text) inp.value = edit.text;
    } else if (el.children.length === 0) {
      // This is a leaf node (pure text)
      if (el.textContent !== edit.text) el.textContent = edit.text;
    } else {
      // Element has children (maybe icons). 
      // If we apply textContent here, we DESTROY the icons.
      // So we do nothing or only apply if it's a known pure-text container.
    }
  }

  if (edit.placeholder !== undefined && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
    const inp = el as HTMLInputElement;
    if (inp.placeholder !== edit.placeholder) inp.placeholder = edit.placeholder;
  }

  if (edit.src !== undefined && el.tagName === 'IMG') {
    const img = el as HTMLImageElement;
    if (img.src !== edit.src) img.src = edit.src;
  }

  if (edit.href !== undefined && el.tagName === 'A') {
    const a = el as HTMLAnchorElement;
    if (a.href !== edit.href) a.href = edit.href;
  }

  // 2. Transform (Move)
  const x = edit.x || 0;
  const y = edit.y || 0;
  if (x !== 0 || y !== 0) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    el.style.transition = 'none'; // Overcome hover CSS transitions jumping
    if (edit.zIndex === undefined) el.style.zIndex = '30';
  } else {
    el.style.removeProperty('transform');
    if (edit.zIndex === undefined) el.style.removeProperty('z-index');
  }

  // 2b. Layer order (Photoshop-style z-index) — works for any element
  if (edit.zIndex !== undefined) {
    el.style.zIndex = String(edit.zIndex);
    // z-index only works on positioned elements; promote static ones to relative
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
  }

  // 3. Dimensions
  if (edit.width !== undefined) {
    el.style.width = `${edit.width}px`;
    el.style.minWidth = `${edit.width}px`;
    el.style.maxWidth = `${edit.width}px`;
    el.style.flex = '0 0 auto'; // Don't squash
    el.style.boxSizing = 'border-box';
  } else {
    el.style.removeProperty('width');
    el.style.removeProperty('min-width');
    el.style.removeProperty('max-width');
    el.style.removeProperty('flex');
    el.style.removeProperty('box-sizing');
  }
  if (edit.height !== undefined) {
    el.style.height = `${edit.height}px`;
    el.style.minHeight = `${edit.height}px`;
    el.style.maxHeight = `${edit.height}px`;
    el.style.flex = '0 0 auto';
    el.style.boxSizing = 'border-box';
  } else {
    el.style.removeProperty('height');
    el.style.removeProperty('min-height');
    el.style.removeProperty('max-height');
    el.style.removeProperty('flex');
    el.style.removeProperty('box-sizing');
  }

  // 4. Styles
  if (edit.fontSize !== undefined) el.style.fontSize = `${edit.fontSize}px`;
  else el.style.removeProperty('font-size');
  
  if (edit.color !== undefined) el.style.color = edit.color;
  else el.style.removeProperty('color');
  
  if (edit.bgColor !== undefined) el.style.backgroundColor = edit.bgColor;
  else el.style.removeProperty('background-color');

  if (edit.bgGradient !== undefined) {
    el.style.backgroundImage = edit.bgGradient;
  } else if (edit.bgSrc !== undefined) {
    el.style.backgroundImage = `url('${edit.bgSrc}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  } else {
    el.style.removeProperty('background-image');
    el.style.removeProperty('background-size');
    el.style.removeProperty('background-position');
  }
  if (edit.padding !== undefined) el.style.padding = `${edit.padding}px`;
  else el.style.removeProperty('padding');
  
  if (edit.borderRadius !== undefined) el.style.borderRadius = `${edit.borderRadius}px`;
  else el.style.removeProperty('border-radius');
  
  if (edit.textAlign !== undefined) el.style.textAlign = edit.textAlign;
  else el.style.removeProperty('text-align');

  // 5. Opacity
  if (edit.opacity !== undefined) el.style.opacity = String(edit.opacity);
  else el.style.removeProperty('opacity');

  // 6. Glass effect (شیشه‌ای – backdrop blur instead of mere transparency)
  if (edit.glass) {
    el.style.backdropFilter = 'blur(16px) saturate(180%)';
    (el.style as any).webkitBackdropFilter = 'blur(16px) saturate(180%)';
    if (!el.style.backgroundColor || el.style.backgroundColor === 'transparent') {
      el.style.backgroundColor = 'rgba(255,255,255,0.5)';
    }
  } else {
    el.style.removeProperty('backdrop-filter');
    el.style.removeProperty('-webkit-backdrop-filter');
    // only remove bg if it was added by glass
  }

  // 7. Stroke (border)
  if (edit.strokeWidth !== undefined && edit.strokeWidth > 0) {
    const style = edit.strokeStyle || 'solid';
    const color = edit.strokeColor || '#10b981';
    el.style.border = `${edit.strokeWidth}px ${style} ${color}`;
  } else if (edit.strokeWidth === 0) {
    el.style.border = 'none';
  } else {
    el.style.removeProperty('border');
  }

  // 8. Shadow
  if (
    edit.shadowX !== undefined ||
    edit.shadowY !== undefined ||
    edit.shadowBlur !== undefined ||
    edit.shadowSpread !== undefined ||
    edit.shadowColor !== undefined
  ) {
    const x = edit.shadowX ?? 0;
    const y = edit.shadowY ?? 4;
    const blur = edit.shadowBlur ?? 12;
    const spread = edit.shadowSpread ?? 0;
    const color = edit.shadowColor ?? 'rgba(0,0,0,0.15)';
    const inset = edit.shadowInset ? 'inset ' : '';
    el.style.boxShadow = `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  } else {
    el.style.removeProperty('box-shadow');
  }

  // 9. Visibility
  if (edit.hidden) el.style.display = 'none';
  else if (edit.hidden === false) el.style.removeProperty('display');
}

export function SiteEditsProvider({ children }: { children: React.ReactNode }) {
  const [edits, setEdits] = useState<EditsRegistry>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: EditsRegistry = saved ? JSON.parse(saved) : {};
      // Migration: drop legacy element edits that aren't page-scoped, so old
      // edits stop bleeding across pages. Widget edits (widget-id:*) and already
      // page-scoped edits are kept.
      const cleaned: EditsRegistry = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (k.startsWith('widget-id:') || k.includes(PAGE_SEP)) cleaned[k] = v;
      }
      return cleaned;
    } catch {
      return {};
    }
  });

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // Undo history stacks
  const editsHistory = useRef<EditsRegistry[]>([]);
  const widgetsHistory = useRef<CustomWidget[][]>([]);
  const [undoCount, setUndoCount] = useState(0);

  const pushSnapshot = useCallback(() => {
    editsHistory.current.push(JSON.parse(JSON.stringify(editsRef.current)));
    widgetsHistory.current.push(JSON.parse(JSON.stringify(customWidgetsRef.current)));
    if (editsHistory.current.length > 50) editsHistory.current.shift();
    if (widgetsHistory.current.length > 50) widgetsHistory.current.shift();
    setUndoCount(editsHistory.current.length);
  }, []);

  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>(() => {
    try {
      const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    try {
      const saved = localStorage.getItem(PAGES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const editsRef = useRef(edits);
  editsRef.current = edits;
  const customWidgetsRef = useRef(customWidgets);
  customWidgetsRef.current = customWidgets;

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch (e) {
      console.warn('ذخیرهٔ تغییرات در حافظهٔ مرورگر ناموفق بود (احتمالاً حجم زیاد تصاویر).', e);
    }
  }, [edits]);

  useEffect(() => {
    try {
      localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(customWidgets));
    } catch (e) {
      console.warn('ذخیرهٔ ویجت‌ها در حافظهٔ مرورگر ناموفق بود (احتمالاً حجم زیاد تصاویر).', e);
    }
  }, [customWidgets]);

  useEffect(() => {
    try {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(customPages));
    } catch (e) {
      console.warn('ذخیرهٔ صفحات سفارشی ناموفق بود.', e);
    }
  }, [customPages]);

  // High performance sync loop
  useEffect(() => {
    let animationFrameId: number;
    const sync = () => {
      const registry = editsRef.current;
      const cur = getCurrentPath();
      Object.entries(registry).forEach(([path, edit]) => {
        // Page scoping: only apply an element edit on the page it was made.
        if (!path.startsWith('widget-id:')) {
          const pg = pageOfKey(path);
          if (pg === null || pg !== cur) return; // legacy/global or other-page → skip
        }
        const el = findByDomPath(path);
        if (el) applySingleEdit(el, edit);
      });
      animationFrameId = requestAnimationFrame(sync);
    };
    sync();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const setElementEdit = useCallback((path: string, partial: Partial<StyleEdits>) => {
    pushSnapshot();
    setEdits((prev) => ({
      ...prev,
      [path]: { ...(prev[path] || {}), ...partial },
    }));
    // If editing a custom widget, also sync stroke/shadow/glass props
    if (path.startsWith('widget-id:')) {
      const wId = path.replace('widget-id:', '');
      const widgetProps: any = {};
      const fields: (keyof StyleEdits)[] = [
        'strokeWidth', 'strokeColor', 'strokeStyle',
        'shadowX', 'shadowY', 'shadowBlur', 'shadowSpread', 'shadowColor', 'shadowInset',
        'glass', 'opacity', 'borderRadius', 'padding', 'color', 'bgColor', 'fontSize',
      ];
      let hasUpdate = false;
      fields.forEach((f) => {
        if (f in partial) {
          if (f === 'bgColor') widgetProps.bg = (partial as any)[f];
          else if (f === 'borderRadius') widgetProps.radius = (partial as any)[f];
          else if (f === 'bgGradient') widgetProps.bgGradient = (partial as any)[f];
          else widgetProps[f] = (partial as any)[f];
          hasUpdate = true;
        }
      });
      if (hasUpdate) {
        setCustomWidgets((prev) => prev.map((w) => (w.id === wId ? { ...w, ...widgetProps } : w)));
      }
    }
  }, [pushSnapshot]);

  /** Only remove styles that the visual editor added, not the component's own inline styles. */
  const safeResetStyle = (el: HTMLElement) => {
    // If the element is an image, we need to be careful with src. 
    // But here we only handle inline style properties.
    const editorProps = [
      'transform', 'z-index', 'position',
      'width', 'min-width', 'max-width',
      'height', 'min-height', 'max-height',
      'flex', 'box-sizing',
      'font-size', 'color',
      'background-color', 'background-image', 'background-size', 'background-position',
      'background-image', // redundant but safe
      'padding', 'border-radius', 'text-align',
      'opacity',
      'backdrop-filter', '-webkit-backdrop-filter',
      'border', 'box-shadow',
      'display',
    ];
    editorProps.forEach((prop) => {
      try { el.style.removeProperty(prop); } catch {}
    });

    // Handle attributes that are not styles (like src for images or placeholders)
    // We can't easily "restore" them without knowing their original value, 
    // but React will usually restore them on the next render if we remove our override.
    if (el.tagName === 'IMG') {
      // If we don't know the original src, React's re-render will fix it 
      // as long as our high-performance sync loop is cleared.
    }
  };

  const resetElementEdit = useCallback((path: string) => {
    pushSnapshot();
    setEdits((prev) => {
      const copy = { ...prev };
      delete copy[path];
      const el = findByDomPath(path);
      if (el) safeResetStyle(el);
      return copy;
    });
  }, [pushSnapshot]);

  const resetAllEdits = useCallback(() => {
    pushSnapshot();
    // First, clear the state to stop the sync loop from re-applying
    const pathsToClean = Object.keys(editsRef.current);
    setEdits({});
    setCustomWidgets([]);
    editsRef.current = {};
    customWidgetsRef.current = [];
    
    // Now clean the DOM once
    pathsToClean.forEach((path) => {
      const el = findByDomPath(path);
      if (el) safeResetStyle(el);
    });

    // Don't clear selectedPath – keep the Inspector open
    editsHistory.current = [];
    widgetsHistory.current = [];
    setUndoCount(0);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WIDGETS_STORAGE_KEY);
  }, [pushSnapshot]);

  const undo = useCallback(() => {
    if (editsHistory.current.length === 0) return;
    const prevEdits = editsHistory.current.pop()!;
    const prevWidgets = widgetsHistory.current.pop()!;
    // Revert DOM for previous edits
    Object.keys(editsRef.current).forEach((path) => {
      const el = findByDomPath(path);
      if (el) safeResetStyle(el);
    });
    setEdits(prevEdits);
    setCustomWidgets(prevWidgets);
    setUndoCount(editsHistory.current.length);
    // Re-apply old edits
    setTimeout(() => {
      Object.entries(prevEdits).forEach(([path, edit]) => {
        const el = findByDomPath(path);
        if (el) applySingleEdit(el, edit);
      });
    }, 50);
  }, []);

  const addCustomWidget = useCallback(async (type: WidgetType, fileOrSrc?: File | string, page?: string, preset?: Partial<CustomWidget>) => {
    let src = '';

    if (fileOrSrc instanceof File) {
      src = await fileToCompressedDataURL(fileOrSrc);
    } else if (typeof fileOrSrc === 'string') {
      src = fileOrSrc;
    }

    const id = `custom-widget-${Date.now()}`;
    const cx = Math.max(20, window.scrollX + window.innerWidth / 2 - 160);
    const cy = Math.max(20, window.scrollY + window.innerHeight / 2 - 100);

    // Per-type sensible defaults so non-technical users get a usable element instantly
    const defaults: Record<WidgetType, Partial<CustomWidget>> = {
      image: { title: fileOrSrc instanceof File ? fileOrSrc.name : 'تصویر دلخواه', src, width: 300, height: 200, radius: 20 },
      container: {
        title: 'کادر دلخواه',
        text: 'این یک کادر سفارشی است که شما اضافه کرده‌اید. می‌توانید متن، رنگ، و ابعاد آن را تغییر دهید.',
        width: 360, height: 220, bg: '#ecfdf5', color: '#065f46', radius: 20, padding: 20, border: '2px solid #10b981',
      },
      button: {
        title: 'دکمه جدید', width: 180, height: 52, bg: '#10b981', color: '#ffffff',
        radius: 14, padding: 12, fontSize: 16, fontWeight: 700, textAlign: 'center',
      },
      text: {
        text: 'متن دلخواه خود را اینجا بنویسید', width: 300, height: 60, color: '#111827',
        fontSize: 20, fontWeight: 600, textAlign: 'right', padding: 4,
      },
      icon: {
        icon: 'Star', iconSize: 64, color: '#10b981', width: 80, height: 80, padding: 0,
      },
      shape: {
        shape: 'rectangle', width: 160, height: 160, bg: '#10b981', radius: 16, padding: 0,
      },
    };

    const newWidget: CustomWidget = {
      id,
      type,
      page: page || '/',
      x: cx,
      y: cy,
      width: 200,
      height: 200,
      radius: 16,
      padding: 0,
      ...defaults[type],
      ...(preset || {}),
    };

    pushSnapshot();
    setCustomWidgets((prev) => [...prev, newWidget]);
    setSelectedPath(`widget-id:${id}`);
  }, [pushSnapshot]);

  const updateCustomWidget = useCallback((id: string, partial: Partial<CustomWidget>) => {
    pushSnapshot();
    setCustomWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...partial } : w)));
  }, [pushSnapshot]);

  const removeCustomWidget = useCallback((id: string) => {
    pushSnapshot();
    setCustomWidgets((prev) => prev.filter((w) => w.id !== id));
    setSelectedPath(null);
  }, [pushSnapshot]);

  /* ─── Custom Pages CRUD (no-code page builder) ─── */
  const addCustomPage = useCallback((label: string, icon?: string) => {
    const id = `page-${Date.now()}`;
    // Build a clean slug; fall back to the id when the label has no latin/number chars
    const baseSlug = (label || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = encodeURIComponent(baseSlug || 'page') + '-' + id.slice(-5);
    const path = `/page/${slug}`;
    const newPage: CustomPage = { id, path, label: label?.trim() || 'صفحه جدید', icon };
    setCustomPages((prev) => [...prev, newPage]);
    return path;
  }, []);

  const updateCustomPage = useCallback((id: string, partial: Partial<CustomPage>) => {
    setCustomPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  }, []);

  const removeCustomPage = useCallback((id: string) => {
    setCustomPages((prev) => {
      const page = prev.find((p) => p.id === id);
      if (page) {
        // Clean up any widgets that lived on this page
        setCustomWidgets((ws) => ws.filter((w) => w.page !== page.path));
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const updateWidgetZIndex = useCallback((id: string, zIndex: number) => {
    setCustomWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex } : w)));
  }, []);

  const moveWidgetLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setCustomWidgets((prev) => {
      const widgets = [...prev];
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx === -1) return prev;
      const maxZ = Math.max(...widgets.map((w) => w.zIndex ?? 20), 20);
      const minZ = Math.min(...widgets.map((w) => w.zIndex ?? 20), 20);
      if (direction === 'up') {
        widgets[idx] = { ...widgets[idx], zIndex: Math.max(maxZ + 1, (widgets[idx].zIndex ?? 20) + 1) };
      } else if (direction === 'down') {
        widgets[idx] = { ...widgets[idx], zIndex: Math.min(minZ - 1, (widgets[idx].zIndex ?? 20) - 1) };
      } else if (direction === 'top') {
        widgets[idx] = { ...widgets[idx], zIndex: maxZ + 1 };
      } else if (direction === 'bottom') {
        widgets[idx] = { ...widgets[idx], zIndex: minZ - 1 };
      }
      return widgets;
    });
  }, []);

  return (
    <SiteEditsContext.Provider
      value={{
        edits,
        setElementEdit,
        resetElementEdit,
        resetAllEdits,
        selectedPath,
        setSelectedPath,
        customWidgets,
        addCustomWidget,
        updateCustomWidget,
        removeCustomWidget,
        updateWidgetZIndex,
        moveWidgetLayer,
        customPages,
        addCustomPage,
        updateCustomPage,
        removeCustomPage,
        undoCount,
        undo,
      }}
    >
      {children}
    </SiteEditsContext.Provider>
  );
}

const SiteEditsContext = createContext<SiteEditsContextType | undefined>(undefined);

export function useSiteEdits() {
  const ctx = useContext(SiteEditsContext);
  if (!ctx) throw new Error('useSiteEdits must be used within SiteEditsProvider');
  return ctx;
}
