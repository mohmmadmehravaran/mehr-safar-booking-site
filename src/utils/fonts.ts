/**
 * Canva-style font library for the visual editor.
 * Persian + Latin web fonts loaded on demand from Google Fonts so non-technical
 * users can restyle any text/button without touching code.
 */
export interface FontDef {
  /** CSS font-family value applied to the element */
  value: string;
  /** Friendly label shown in the picker */
  label: string;
  /** Google Fonts family name (omitted for system/default fonts) */
  google?: string;
  /** Direction the font is best suited for */
  script: 'fa' | 'latin';
}

export const FONT_LIBRARY: FontDef[] = [
  { value: "'Vazirmatn', sans-serif", label: 'وزیر متن (پیش‌فرض)', script: 'fa' },
  { value: "'Lalezar', system-ui", label: 'لاله‌زار (تیتر)', google: 'Lalezar', script: 'fa' },
  { value: "'Markazi Text', serif", label: 'مرکزی', google: 'Markazi Text:wght@400;600;700', script: 'fa' },
  { value: "'Amiri', serif", label: 'امیری (نستعلیق‌گونه)', google: 'Amiri:wght@400;700', script: 'fa' },
  { value: "'Noto Naskh Arabic', serif", label: 'نسخ', google: 'Noto Naskh Arabic:wght@400;700', script: 'fa' },
  { value: "'Noto Kufi Arabic', sans-serif", label: 'کوفی', google: 'Noto Kufi Arabic:wght@400;700', script: 'fa' },
  { value: "'Gulzar', serif", label: 'گلزار', google: 'Gulzar', script: 'fa' },
  { value: "'Poppins', sans-serif", label: 'Poppins', google: 'Poppins:wght@400;600;700', script: 'latin' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat', google: 'Montserrat:wght@400;600;700', script: 'latin' },
  { value: "'Playfair Display', serif", label: 'Playfair Display', google: 'Playfair Display:wght@400;700', script: 'latin' },
  { value: "'Roboto Mono', monospace", label: 'Roboto Mono', google: 'Roboto Mono:wght@400;700', script: 'latin' },
  { value: "'Lobster', cursive", label: 'Lobster', google: 'Lobster', script: 'latin' },
  { value: 'Georgia, serif', label: 'Georgia', script: 'latin' },
  { value: 'system-ui, sans-serif', label: 'سیستمی', script: 'fa' },
];

const loaded = new Set<string>();

/** Inject a single Google-Font <link> once for the chosen family. */
export function ensureFontLoaded(value: string) {
  const def = FONT_LIBRARY.find((f) => f.value === value);
  if (!def || !def.google || loaded.has(def.google)) return;
  loaded.add(def.google);
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(def.google)}&display=swap`;
  link.setAttribute('data-editor-font', def.google);
  document.head.appendChild(link);
}

/** Preload every library font (used when the editor opens so previews look right). */
export function preloadAllFonts() {
  FONT_LIBRARY.forEach((f) => ensureFontLoaded(f.value));
}
