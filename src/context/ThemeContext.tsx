import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
  heroBgFrom: string;
  heroBgVia: string;
  heroBgTo: string;
  heroText: string;
  cardBg: string;
  cardBorder: string;
  bodyBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  starColor: string;
  reviewBadgeBg: string;
  priceBadgeColor: string;
}

export interface ThemeSizes {
  headerHeight: number;
  heroTopPadding: number;
  heroBottomPadding: number;
  cardBorderRadius: number;
  cardImageHeight: number;
  buttonBorderRadius: number;
  filterPanelWidth: number;
  maxContentWidth: number;
  searchBoxPadding: number;
  footerPaddingY: number;
  statsSpacing: number;
}

export interface ThemeFonts {
  primary: string;
  heading: string;
  headingWeight: string;
  bodySize: number;
  headingSize: number;
  smallSize: number;
  lineHeight: number;
  customFonts: CustomFont[];
}

export interface CustomFont {
  id: string;
  name: string;
  url: string;        // CSS link URL OR empty for uploaded fonts
  dataUrl?: string;    // base64 data URL for uploaded font files
  format?: string;     // font format: woff2, woff, ttf, otf
  loaded: boolean;
}

export interface ThemeTexts {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  footerDescription: string;
  footerCopyright: string;
  statsHotels: string;
  statsCities: string;
  statsBookings: string;
  statsSatisfaction: string;
}

export interface SiteTheme {
  colors: ThemeColors;
  sizes: ThemeSizes;
  fonts: ThemeFonts;
  texts: ThemeTexts;
}

const defaultTheme: SiteTheme = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    headerBg: '#ffffff',
    headerText: '#374151',
    footerBg: '#1e293b',
    footerText: '#cbd5e1',
    heroBgFrom: '#e0f2fe',
    heroBgVia: '#e8f4f8',
    heroBgTo: '#f0f9ff',
    heroText: '#1e293b',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    bodyBg: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    starColor: '#f59e0b',
    reviewBadgeBg: '#dbeafe',
    priceBadgeColor: '#2563eb',
  },
  sizes: {
    headerHeight: 64,
    heroTopPadding: 64,
    heroBottomPadding: 64,
    cardBorderRadius: 16,
    cardImageHeight: 192,
    buttonBorderRadius: 12,
    filterPanelWidth: 288,
    maxContentWidth: 1280,
    searchBoxPadding: 16,
    footerPaddingY: 48,
    statsSpacing: 24,
  },
  fonts: {
    primary: 'Vazirmatn',
    heading: 'Vazirmatn',
    headingWeight: '700',
    bodySize: 14,
    headingSize: 20,
    smallSize: 12,
    lineHeight: 1.7,
    customFonts: [],
  },
  texts: {
    siteName: 'مهر سفر',
    heroTitle: 'سفری به یادماندنی با مهر سفر',
    heroSubtitle: 'بهترین هتل‌ها و اقامتگاه‌های ایران را جستجو و رزرو کنید. تجربه‌ای متفاوت از اقامت در سراسر کشور.',
    searchPlaceholder: 'شهر یا نام هتل را جستجو کنید...',
    footerDescription: 'مهر سفر، پلتفرم جامع رزرو هتل و اقامتگاه در سراسر ایران. با ما سفری به یادماندنی را تجربه کنید.',
    footerCopyright: 'تمامی حقوق محفوظ است © ۱۴۰۴ مهر سفر',
    statsHotels: '+۵۰۰',
    statsCities: '+۳۰',
    statsBookings: '+۱۰هزار',
    statsSatisfaction: '۹۸٪',
  },
};

interface ThemeContextType {
  theme: SiteTheme;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateSizes: (sizes: Partial<ThemeSizes>) => void;
  updateFonts: (fonts: Partial<ThemeFonts>) => void;
  updateTexts: (texts: Partial<ThemeTexts>) => void;
  addCustomFont: (name: string, url: string) => void;
  uploadFont: (name: string, file: File) => Promise<void>;
  removeCustomFont: (id: string) => void;
  resetTheme: () => void;
  getCSSVar: (key: string) => string;
  isVisualEditing: boolean;
  setIsVisualEditing: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isVisualEditing, setIsVisualEditingState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mehrsafar-visual-editing') === '1';
    } catch {
      return false;
    }
  });
  const setIsVisualEditing = useCallback((v: boolean) => {
    setIsVisualEditingState(v);
    try {
      localStorage.setItem('mehrsafar-visual-editing', v ? '1' : '0');
    } catch {}
  }, []);
  const [theme, setTheme] = useState<SiteTheme>(() => {
    try {
      const saved = localStorage.getItem('mehrsafar-theme');
      if (saved) return { ...defaultTheme, ...JSON.parse(saved) };
    } catch {}
    return defaultTheme;
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('mehrsafar-theme', JSON.stringify(theme));
    } catch (e) {
      console.warn('ذخیرهٔ تم ناموفق بود.', e);
    }
  }, [theme]);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
    root.style.setProperty('--color-header-bg', theme.colors.headerBg);
    root.style.setProperty('--color-header-text', theme.colors.headerText);
    root.style.setProperty('--color-footer-bg', theme.colors.footerBg);
    root.style.setProperty('--color-footer-text', theme.colors.footerText);
    root.style.setProperty('--color-hero-from', theme.colors.heroBgFrom);
    root.style.setProperty('--color-hero-via', theme.colors.heroBgVia);
    root.style.setProperty('--color-hero-to', theme.colors.heroBgTo);
    root.style.setProperty('--color-hero-text', theme.colors.heroText);
    root.style.setProperty('--color-card-bg', theme.colors.cardBg);
    root.style.setProperty('--color-card-border', theme.colors.cardBorder);
    root.style.setProperty('--color-body-bg', theme.colors.bodyBg);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-star', theme.colors.starColor);
    root.style.setProperty('--color-price', theme.colors.priceBadgeColor);

    root.style.setProperty('--size-header-h', `${theme.sizes.headerHeight}px`);
    root.style.setProperty('--size-hero-pt', `${theme.sizes.heroTopPadding}px`);
    root.style.setProperty('--size-hero-pb', `${theme.sizes.heroBottomPadding}px`);
    root.style.setProperty('--size-card-radius', `${theme.sizes.cardBorderRadius}px`);
    root.style.setProperty('--size-card-img-h', `${theme.sizes.cardImageHeight}px`);
    root.style.setProperty('--size-btn-radius', `${theme.sizes.buttonBorderRadius}px`);
    root.style.setProperty('--size-filter-w', `${theme.sizes.filterPanelWidth}px`);
    root.style.setProperty('--size-max-w', `${theme.sizes.maxContentWidth}px`);
    root.style.setProperty('--size-search-p', `${theme.sizes.searchBoxPadding}px`);
    root.style.setProperty('--size-footer-py', `${theme.sizes.footerPaddingY}px`);

    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-heading-weight', theme.fonts.headingWeight);
    root.style.setProperty('--font-body-size', `${theme.fonts.bodySize}px`);
    root.style.setProperty('--font-heading-size', `${theme.fonts.headingSize}px`);
    root.style.setProperty('--font-small-size', `${theme.fonts.smallSize}px`);
    root.style.setProperty('--font-line-height', `${theme.fonts.lineHeight}`);

    document.body.style.fontFamily = `'${theme.fonts.primary}', system-ui, sans-serif`;
    document.body.style.fontSize = `${theme.fonts.bodySize}px`;
    document.body.style.lineHeight = `${theme.fonts.lineHeight}`;
    document.body.style.backgroundColor = theme.colors.bodyBg;
    document.body.style.color = theme.colors.textPrimary;

    // Force the chosen font across ALL site text (overriding any hardcoded
    // inline font-family), while leaving the editor's own UI (data-visual-ui)
    // untouched. Headings use the heading font; everything else the body font.
    let fontStyle = document.getElementById('dynamic-site-fonts') as HTMLStyleElement | null;
    if (!fontStyle) {
      fontStyle = document.createElement('style');
      fontStyle.id = 'dynamic-site-fonts';
      document.head.appendChild(fontStyle);
    }
    const primary = `'${theme.fonts.primary}', 'Vazirmatn', system-ui, sans-serif`;
    const heading = `'${theme.fonts.heading}', '${theme.fonts.primary}', 'Vazirmatn', sans-serif`;
    fontStyle.textContent = `
      #root, #root *:not([data-visual-ui]):not([data-visual-ui] *),
      [data-custom-widget-id], [data-custom-widget-id] * {
        font-family: ${primary} !important;
      }
      #root h1, #root h2, #root h3, #root h4, #root h5, #root h6 {
        font-family: ${heading} !important;
      }
    `;
  }, [theme]);

  // Load built-in Persian Google fonts once (so font changes are visible)
  useEffect(() => {
    const id = 'google-persian-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lalezar&family=Markazi+Text:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Load custom fonts
  useEffect(() => {
    theme.fonts.customFonts.forEach((f) => {
      if (document.getElementById(`custom-font-${f.id}`)) return;
      if (f.dataUrl && f.format) {
        // Uploaded font file → inject @font-face
        const style = document.createElement('style');
        style.id = `custom-font-${f.id}`;
        style.textContent = `
          @font-face {
            font-family: '${f.name}';
            src: url('${f.dataUrl}') format('${f.format}');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
      } else if (f.url) {
        // External CSS link
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = f.url;
        link.id = `custom-font-${f.id}`;
        document.head.appendChild(link);
      }
    });
  }, [theme.fonts.customFonts]);

  const updateColors = useCallback((colors: Partial<ThemeColors>) => {
    setTheme((p) => ({ ...p, colors: { ...p.colors, ...colors } }));
  }, []);
  const updateSizes = useCallback((sizes: Partial<ThemeSizes>) => {
    setTheme((p) => ({ ...p, sizes: { ...p.sizes, ...sizes } }));
  }, []);
  const updateFonts = useCallback((fonts: Partial<ThemeFonts>) => {
    setTheme((p) => ({ ...p, fonts: { ...p.fonts, ...fonts } }));
  }, []);
  const updateTexts = useCallback((texts: Partial<ThemeTexts>) => {
    setTheme((p) => ({ ...p, texts: { ...p.texts, ...texts } }));
  }, []);

  const addCustomFont = useCallback((name: string, url: string) => {
    const id = `font-${Date.now()}`;
    setTheme((p) => ({
      ...p,
      fonts: {
        ...p.fonts,
        customFonts: [...p.fonts.customFonts, { id, name, url, loaded: false }],
      },
    }));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = `custom-font-${id}`;
    document.head.appendChild(link);
  }, []);

  const uploadFont = useCallback(async (name: string, file: File) => {
    const id = `font-${Date.now()}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const formatMap: Record<string, string> = {
      woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype', eot: 'embedded-opentype',
    };
    const format = formatMap[ext] || 'truetype';

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    setTheme((p) => ({
      ...p,
      fonts: {
        ...p.fonts,
        customFonts: [...p.fonts.customFonts, { id, name, url: '', dataUrl, format, loaded: true }],
      },
    }));

    // Inject @font-face immediately
    const style = document.createElement('style');
    style.id = `custom-font-${id}`;
    style.textContent = `
      @font-face {
        font-family: '${name}';
        src: url('${dataUrl}') format('${format}');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const removeCustomFont = useCallback((id: string) => {
    setTheme((p) => ({
      ...p,
      fonts: {
        ...p.fonts,
        customFonts: p.fonts.customFonts.filter((f) => f.id !== id),
      },
    }));
    const el = document.getElementById(`custom-font-${id}`);
    if (el) el.remove();
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
    localStorage.removeItem('mehrsafar-theme');
  }, []);

  const getCSSVar = useCallback((key: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateColors, updateSizes, updateFonts, updateTexts, addCustomFont, uploadFont, removeCustomFont, resetTheme, getCSSVar, isVisualEditing, setIsVisualEditing }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
