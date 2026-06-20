/**
 * Compute a robust, unique DOM path for an element.
 */
export const PAGE_SEP = '§§';

/** Current route path from the HashRouter (works outside Router context). */
export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  const h = window.location.hash || '#/';
  const raw = h.replace(/^#/, '') || '/';
  return raw.split('?')[0] || '/';
}

/** Page-scope a DOM path so edits on one page never bleed onto another. */
export function makePageScopedKey(domPath: string, page?: string): string {
  if (!domPath || domPath.startsWith('widget-id:')) return domPath;
  const p = page ?? getCurrentPath();
  return `${p}${PAGE_SEP}${domPath}`;
}

/** The page a scoped key belongs to, or null for widget / legacy keys. */
export function pageOfKey(key: string): string | null {
  if (!key || key.startsWith('widget-id:')) return null;
  const i = key.indexOf(PAGE_SEP);
  return i === -1 ? null : key.slice(0, i);
}

/** Strip the page prefix from a scoped key to get the raw DOM path. */
export function rawDomPath(key: string): string {
  if (!key || key.startsWith('widget-id:')) return key;
  const i = key.indexOf(PAGE_SEP);
  return i === -1 ? key : key.slice(i + PAGE_SEP.length);
}

export function computeDomPath(el: Element | null): string | null {
  if (!el) return null;
  if (el === document.body || el === document.documentElement) return null;
  // Skip editor UI
  if ((el as HTMLElement).closest && (el as HTMLElement).closest('[data-visual-ui]')) return null;

  // Custom added widgets
  const widget = (el as HTMLElement).closest?.('[data-custom-widget-id]') as HTMLElement | null;
  if (widget?.getAttribute('data-custom-widget-id')) {
    return `widget-id:${widget.getAttribute('data-custom-widget-id')}`;
  }

  const parts: string[] = [];
  let cur: Element | null = el;
  let depth = 0;

  while (cur && cur !== document.body && cur.parentElement && depth < 25) {
    const parent: Element = cur.parentElement;
    const tag = cur.tagName.toLowerCase();
    
    // Compute sibling index
    const siblings = Array.from(parent.children).filter(c => c.tagName.toLowerCase() === tag);
    const idx = siblings.indexOf(cur);

    parts.unshift(`${tag}:${idx}`);
    cur = parent;
    depth++;
  }

  return parts.join('/');
}

/**
 * Find an element by its computed DOM path.
 */
export function findByDomPath(path: string): HTMLElement | null {
  if (!path) return null;
  if (path.startsWith('widget-id:')) {
    const id = path.replace('widget-id:', '');
    return document.querySelector(`[data-custom-widget-id="${id}"]`) as HTMLElement | null;
  }
  const parts = rawDomPath(path).split('/');
  let cur: Element | null = document.body;

  for (const part of parts) {
    if (!cur) return null;
    const m = part.match(/^([\w-]+):(\d+)$/);
    if (!m) return null;
    const tag = m[1];
    const idx = Number(m[2]);

    const matches: Element[] = Array.from(cur.children).filter(c => c.tagName.toLowerCase() === tag);
    cur = matches[idx] || null;
  }

  return cur as HTMLElement | null;
}

/**
 * Get a friendly Persian label for an element.
 */
export function getFriendlyLabel(el: HTMLElement | null): string {
  if (!el) return 'عنصر';
  const tag = el.tagName.toLowerCase();
  
  // Custom check for search and filter controls
  if (el.closest('#hotels')) {
    if (tag === 'button') return 'دکمه فیلتر / هتل';
    if (tag === 'img') return 'تصویر کارت هتل';
    if (tag === 'h3') return 'نام هتل';
  }

  const map: Record<string, string> = {
    h1: 'عنوان اصلی', h2: 'عنوان بخش', h3: 'زیرعنوان',
    p: 'پاراگراف', span: 'متن', button: 'دکمه', a: 'لینک',
    img: 'تصویر', input: 'فیلد ورودی', select: 'لیست کشویی',
    header: 'هدر سایت', footer: 'فوتر سایت', nav: 'منوی ناوبری',
    div: 'کادر (بخش)', section: 'بخش اصلی', aside: 'سایدبار',
  };

  return map[tag] || tag;
}

/**
 * Check if element can have its text directly edited.
 */
export function isEditableTextLeaf(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'img') return false;
  // If it contains only text or fine inline tags like span/svg
  return el.children.length === 0 || Array.from(el.children).every(c => c.tagName.toLowerCase() === 'span' || c.tagName.toLowerCase() === 'svg');
}
