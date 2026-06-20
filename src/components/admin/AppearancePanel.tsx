import { useState, useRef } from 'react';
import {
  Palette, Type, Ruler, FileText, Plus, Trash2, RotateCcw,
  ChevronDown, ChevronUp, Eye, Monitor, Smartphone, Tablet, X, Upload, Link2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ColorPicker from './ColorPicker';
import DraggableSize from './DraggableSize';
import { motion, AnimatePresence } from 'framer-motion';

type Section = 'colors' | 'sizes' | 'fonts' | 'texts';

const presetThemes = [
  {
    name: 'سبز پیش‌فرض',
    primary: '#059669', heroBgFrom: '#047857', heroBgVia: '#065f46', heroBgTo: '#115e59',
    primaryHover: '#047857', primaryLight: '#d1fae5',
  },
  {
    name: 'آبی آسمانی',
    primary: '#2563eb', heroBgFrom: '#1d4ed8', heroBgVia: '#1e3a8a', heroBgTo: '#1e40af',
    primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
  },
  {
    name: 'بنفش',
    primary: '#7c3aed', heroBgFrom: '#6d28d9', heroBgVia: '#5b21b6', heroBgTo: '#4c1d95',
    primaryHover: '#6d28d9', primaryLight: '#ede9fe',
  },
  {
    name: 'قرمز',
    primary: '#dc2626', heroBgFrom: '#b91c1c', heroBgVia: '#991b1b', heroBgTo: '#7f1d1d',
    primaryHover: '#b91c1c', primaryLight: '#fee2e2',
  },
  {
    name: 'نارنجی',
    primary: '#ea580c', heroBgFrom: '#c2410c', heroBgVia: '#9a3412', heroBgTo: '#7c2d12',
    primaryHover: '#c2410c', primaryLight: '#fff7ed',
  },
  {
    name: 'تیره',
    primary: '#10b981', heroBgFrom: '#1f2937', heroBgVia: '#111827', heroBgTo: '#030712',
    primaryHover: '#059669', primaryLight: '#d1fae5',
    headerBg: '#1f2937', headerText: '#f9fafb', bodyBg: '#0f172a',
    textPrimary: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#64748b',
    cardBg: '#1e293b', cardBorder: '#334155', footerBg: '#020617', footerText: '#94a3b8',
  },
];

const builtInFonts = [
  'Vazirmatn',
  'Lalezar',
  'Markazi Text',
  'Amiri',
  'Noto Naskh Arabic',
  'Tahoma',
  'Arial',
  'sans-serif',
];

export default function AppearancePanel() {
  const {
    theme, updateColors, updateSizes, updateFonts, updateTexts,
    addCustomFont, uploadFont, removeCustomFont, resetTheme
  } = useTheme();

  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
    colors: true,
    sizes: false,
    fonts: false,
    texts: false,
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [newFontName, setNewFontName] = useState('');
  const [newFontUrl, setNewFontUrl] = useState('');
  const [showAddFont, setShowAddFont] = useState(false);
  const [fontAddMode, setFontAddMode] = useState<'upload' | 'url'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = (s: Section) => setOpenSections((p) => ({ ...p, [s]: !p[s] }));

  const applyPreset = (preset: typeof presetThemes[0]) => {
    updateColors({
      primary: preset.primary,
      primaryHover: preset.primaryHover,
      primaryLight: preset.primaryLight,
      heroBgFrom: preset.heroBgFrom,
      heroBgVia: preset.heroBgVia,
      heroBgTo: preset.heroBgTo,
      ...('headerBg' in preset ? {
        headerBg: (preset as any).headerBg,
        headerText: (preset as any).headerText,
        bodyBg: (preset as any).bodyBg,
        textPrimary: (preset as any).textPrimary,
        textSecondary: (preset as any).textSecondary,
        textMuted: (preset as any).textMuted,
        cardBg: (preset as any).cardBg,
        cardBorder: (preset as any).cardBorder,
        footerBg: (preset as any).footerBg,
        footerText: (preset as any).footerText,
      } : {}),
    });
  };

  const handleAddFont = () => {
    if (newFontName && newFontUrl) {
      addCustomFont(newFontName, newFontUrl);
      setNewFontName('');
      setNewFontUrl('');
      setShowAddFont(false);
    }
  };

  const allFontOptions = [
    ...builtInFonts,
    ...theme.fonts.customFonts.map((f) => f.name),
  ];

  const SectionHeader = ({ section, icon, label }: { section: Section; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => toggle(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
        <span className="font-bold text-sm text-gray-900">{label}</span>
      </div>
      {openSections[section] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">ظاهر سایت</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            پیش‌نمایش
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازنشانی
          </button>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-4 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">قالب‌های آماده</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all group"
            >
              <div className="flex -space-x-1 space-x-reverse">
                <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.primary }} />
                <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.heroBgFrom }} />
                <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.heroBgTo }} />
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-emerald-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {/* ── COLORS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader section="colors" icon={<Palette className="w-5 h-5" />} label="رنگ‌ها" />
          <AnimatePresence>
            {openSections.colors && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 pt-0 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-2">رنگ اصلی</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorPicker label="رنگ اصلی" value={theme.colors.primary} onChange={(v) => updateColors({ primary: v })} />
                      <ColorPicker label="رنگ اصلی (هاور)" value={theme.colors.primaryHover} onChange={(v) => updateColors({ primaryHover: v })} />
                      <ColorPicker label="رنگ اصلی (روشن)" value={theme.colors.primaryLight} onChange={(v) => updateColors({ primaryLight: v })} />
                      <ColorPicker label="رنگ ستاره" value={theme.colors.starColor} onChange={(v) => updateColors({ starColor: v })} />
                      <ColorPicker label="رنگ قیمت" value={theme.colors.priceBadgeColor} onChange={(v) => updateColors({ priceBadgeColor: v })} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-2">هدر و فوتر</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorPicker label="پس‌زمینه هدر" value={theme.colors.headerBg} onChange={(v) => updateColors({ headerBg: v })} />
                      <ColorPicker label="متن هدر" value={theme.colors.headerText} onChange={(v) => updateColors({ headerText: v })} />
                      <ColorPicker label="پس‌زمینه فوتر" value={theme.colors.footerBg} onChange={(v) => updateColors({ footerBg: v })} />
                      <ColorPicker label="متن فوتر" value={theme.colors.footerText} onChange={(v) => updateColors({ footerText: v })} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-2">بخش Hero</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorPicker label="گرادیان شروع" value={theme.colors.heroBgFrom} onChange={(v) => updateColors({ heroBgFrom: v })} />
                      <ColorPicker label="گرادیان میانی" value={theme.colors.heroBgVia} onChange={(v) => updateColors({ heroBgVia: v })} />
                      <ColorPicker label="گرادیان پایانی" value={theme.colors.heroBgTo} onChange={(v) => updateColors({ heroBgTo: v })} />
                      <ColorPicker label="متن Hero" value={theme.colors.heroText} onChange={(v) => updateColors({ heroText: v })} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-2">کارت‌ها و متن</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorPicker label="پس‌زمینه بدنه" value={theme.colors.bodyBg} onChange={(v) => updateColors({ bodyBg: v })} />
                      <ColorPicker label="پس‌زمینه کارت" value={theme.colors.cardBg} onChange={(v) => updateColors({ cardBg: v })} />
                      <ColorPicker label="حاشیه کارت" value={theme.colors.cardBorder} onChange={(v) => updateColors({ cardBorder: v })} />
                      <ColorPicker label="متن اصلی" value={theme.colors.textPrimary} onChange={(v) => updateColors({ textPrimary: v })} />
                      <ColorPicker label="متن ثانویه" value={theme.colors.textSecondary} onChange={(v) => updateColors({ textSecondary: v })} />
                      <ColorPicker label="متن کم‌رنگ" value={theme.colors.textMuted} onChange={(v) => updateColors({ textMuted: v })} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SIZES ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader section="sizes" icon={<Ruler className="w-5 h-5" />} label="اندازه‌ها (درگ کنید)" />
          <AnimatePresence>
            {openSections.sizes && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 pt-0 space-y-1">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-2">هدر و Hero</h4>
                  <DraggableSize label="ارتفاع هدر" value={theme.sizes.headerHeight} min={40} max={120} onChange={(v) => updateSizes({ headerHeight: v })} />
                  <DraggableSize label="فاصله بالای Hero" value={theme.sizes.heroTopPadding} min={16} max={200} step={4} onChange={(v) => updateSizes({ heroTopPadding: v })} />
                  <DraggableSize label="فاصله پایین Hero" value={theme.sizes.heroBottomPadding} min={16} max={200} step={4} onChange={(v) => updateSizes({ heroBottomPadding: v })} />
                  <DraggableSize label="پدینگ جعبه جستجو" value={theme.sizes.searchBoxPadding} min={8} max={40} step={2} onChange={(v) => updateSizes({ searchBoxPadding: v })} />

                  <h4 className="text-xs font-semibold text-gray-500 mb-2 mt-4 border-b border-gray-100 pb-2">کارت‌ها</h4>
                  <DraggableSize label="گردی گوشه کارت" value={theme.sizes.cardBorderRadius} min={0} max={32} onChange={(v) => updateSizes({ cardBorderRadius: v })} />
                  <DraggableSize label="ارتفاع تصویر کارت" value={theme.sizes.cardImageHeight} min={100} max={350} step={5} onChange={(v) => updateSizes({ cardImageHeight: v })} />
                  <DraggableSize label="گردی دکمه‌ها" value={theme.sizes.buttonBorderRadius} min={0} max={24} onChange={(v) => updateSizes({ buttonBorderRadius: v })} />

                  <h4 className="text-xs font-semibold text-gray-500 mb-2 mt-4 border-b border-gray-100 pb-2">صفحه‌بندی</h4>
                  <DraggableSize label="عرض پنل فیلتر" value={theme.sizes.filterPanelWidth} min={200} max={400} step={4} onChange={(v) => updateSizes({ filterPanelWidth: v })} />
                  <DraggableSize label="حداکثر عرض محتوا" value={theme.sizes.maxContentWidth} min={900} max={1600} step={10} onChange={(v) => updateSizes({ maxContentWidth: v })} />
                  <DraggableSize label="فاصله عمودی فوتر" value={theme.sizes.footerPaddingY} min={16} max={96} step={4} onChange={(v) => updateSizes({ footerPaddingY: v })} />
                  <DraggableSize label="فاصله آمار" value={theme.sizes.statsSpacing} min={8} max={64} step={4} onChange={(v) => updateSizes({ statsSpacing: v })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FONTS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader section="fonts" icon={<Type className="w-5 h-5" />} label="فونت‌ها" />
          <AnimatePresence>
            {openSections.fonts && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فونت متن</label>
                      <select
                        value={theme.fonts.primary}
                        onChange={(e) => updateFonts({ primary: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={{ fontFamily: theme.fonts.primary }}
                      >
                        {allFontOptions.map((f) => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فونت عنوان‌ها</label>
                      <select
                        value={theme.fonts.heading}
                        onChange={(e) => updateFonts({ heading: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={{ fontFamily: theme.fonts.heading }}
                      >
                        {allFontOptions.map((f) => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">وزن فونت عنوان</label>
                    <select
                      value={theme.fonts.headingWeight}
                      onChange={(e) => updateFonts({ headingWeight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="400">عادی (400)</option>
                      <option value="500">نیمه‌ضخیم (500)</option>
                      <option value="600">ضخیم (600)</option>
                      <option value="700">بسیار ضخیم (700)</option>
                      <option value="800">خیلی ضخیم (800)</option>
                      <option value="900">فوق ضخیم (900)</option>
                    </select>
                  </div>

                  <DraggableSize label="اندازه فونت متن" value={theme.fonts.bodySize} min={10} max={22} onChange={(v) => updateFonts({ bodySize: v })} />
                  <DraggableSize label="اندازه فونت عنوان" value={theme.fonts.headingSize} min={14} max={40} onChange={(v) => updateFonts({ headingSize: v })} />
                  <DraggableSize label="اندازه فونت کوچک" value={theme.fonts.smallSize} min={8} max={16} onChange={(v) => updateFonts({ smallSize: v })} />
                  <DraggableSize label="فاصله بین خطوط" value={Math.round(theme.fonts.lineHeight * 10)} min={10} max={30} unit="" onChange={(v) => updateFonts({ lineHeight: v / 10 })} />

                  {/* Custom fonts list */}
                  {theme.fonts.customFonts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">فونت‌های اضافه‌شده</h4>
                      <div className="space-y-2">
                        {theme.fonts.customFonts.map((f) => (
                          <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                {f.dataUrl ? <Upload className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate" style={{ fontFamily: f.name }}>{f.name}</div>
                                <div className="text-[10px] text-gray-400">
                                  {f.dataUrl ? `فایل آپلود شده · ${f.format}` : 'لینک CSS'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeCustomFont(f.id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add custom font */}
                  {showAddFont ? (
                    <div className="p-4 bg-emerald-50 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-700">افزودن فونت جدید</h4>

                      {/* Tab switcher */}
                      <div className="flex bg-white rounded-lg p-0.5 border border-gray-200">
                        <button
                          onClick={() => setFontAddMode('upload')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-md font-medium transition-colors ${
                            fontAddMode === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          آپلود فایل فونت
                        </button>
                        <button
                          onClick={() => setFontAddMode('url')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-md font-medium transition-colors ${
                            fontAddMode === 'url' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          لینک CSS
                        </button>
                      </div>

                      {/* Font name input */}
                      <input
                        type="text"
                        placeholder="نام فونت (مثلاً: Sahel)"
                        value={newFontName}
                        onChange={(e) => setNewFontName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />

                      {fontAddMode === 'upload' ? (
                        <>
                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".woff2,.woff,.ttf,.otf,.eot"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadedFile(file);
                                // Auto-fill name from filename if empty
                                if (!newFontName) {
                                  const nameFromFile = file.name.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
                                  setNewFontName(nameFromFile);
                                }
                              }
                            }}
                          />

                          {/* Upload area */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed rounded-xl transition-colors ${
                              uploadedFile
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                            }`}
                          >
                            {uploadedFile ? (
                              <>
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <Type className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium text-emerald-700">{uploadedFile.name}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {(uploadedFile.size / 1024).toFixed(1)} کیلوبایت
                                  </div>
                                </div>
                                <span className="text-[10px] text-emerald-600">کلیک برای تغییر فایل</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400" />
                                <div className="text-center">
                                  <div className="text-sm text-gray-600">فایل فونت را انتخاب کنید</div>
                                  <div className="text-[10px] text-gray-400 mt-1">
                                    فرمت‌های مجاز: woff2, woff, ttf, otf
                                  </div>
                                </div>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <input
                          type="text"
                          placeholder="آدرس CSS فونت (مثلاً: https://cdn.jsdelivr.net/...)"
                          value={newFontUrl}
                          onChange={(e) => setNewFontUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs bg-white"
                          dir="ltr"
                        />
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowAddFont(false);
                            setUploadedFile(null);
                            setNewFontName('');
                            setNewFontUrl('');
                          }}
                          className="flex-1 py-2 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-white transition-colors"
                        >
                          انصراف
                        </button>
                        <button
                          onClick={async () => {
                            if (fontAddMode === 'upload' && uploadedFile && newFontName) {
                              setIsUploading(true);
                              await uploadFont(newFontName, uploadedFile);
                              setIsUploading(false);
                              setUploadedFile(null);
                              setNewFontName('');
                              setShowAddFont(false);
                            } else if (fontAddMode === 'url' && newFontName && newFontUrl) {
                              handleAddFont();
                            }
                          }}
                          disabled={
                            isUploading ||
                            !newFontName ||
                            (fontAddMode === 'upload' ? !uploadedFile : !newFontUrl)
                          }
                          className="flex-1 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {isUploading ? (
                            <>
                              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                              </svg>
                              در حال بارگذاری...
                            </>
                          ) : (
                            <>
                              {fontAddMode === 'upload' ? <Upload className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              {fontAddMode === 'upload' ? 'آپلود و افزودن' : 'افزودن'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddFont(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن فونت جدید
                    </button>
                  )}

                  {/* Live Preview */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-xs text-gray-400 mb-2">پیش‌نمایش فونت</h4>
                    <p style={{ fontFamily: `'${theme.fonts.heading}'`, fontWeight: theme.fonts.headingWeight, fontSize: `${theme.fonts.headingSize}px` }} className="mb-2">
                      عنوان نمونه - مهر سفر
                    </p>
                    <p style={{ fontFamily: `'${theme.fonts.primary}'`, fontSize: `${theme.fonts.bodySize}px`, lineHeight: theme.fonts.lineHeight }}>
                      این یک متن نمونه است برای بررسی ظاهر فونت انتخاب‌شده. هتل‌ها و اقامتگاه‌های ایران.
                    </p>
                    <p style={{ fontFamily: `'${theme.fonts.primary}'`, fontSize: `${theme.fonts.smallSize}px` }} className="text-gray-400 mt-1">
                      متن کوچک - ۱۴۰۴/۰۱/۰۱
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── TEXTS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader section="texts" icon={<FileText className="w-5 h-5" />} label="متن‌ها و محتوا" />
          <AnimatePresence>
            {openSections.texts && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">نام سایت</label>
                    <input type="text" value={theme.texts.siteName} onChange={(e) => updateTexts({ siteName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">عنوان Hero</label>
                    <input type="text" value={theme.texts.heroTitle} onChange={(e) => updateTexts({ heroTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">زیرعنوان Hero</label>
                    <textarea value={theme.texts.heroSubtitle} onChange={(e) => updateTexts({ heroSubtitle: e.target.value })} rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">متن جستجو (placeholder)</label>
                    <input type="text" value={theme.texts.searchPlaceholder} onChange={(e) => updateTexts({ searchPlaceholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">توضیحات فوتر</label>
                    <textarea value={theme.texts.footerDescription} onChange={(e) => updateTexts({ footerDescription: e.target.value })} rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">کپی‌رایت</label>
                    <input type="text" value={theme.texts.footerCopyright} onChange={(e) => updateTexts({ footerCopyright: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-2">آمار صفحه اصلی</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 mb-0.5 block">تعداد هتل‌ها</label>
                        <input type="text" value={theme.texts.statsHotels} onChange={(e) => updateTexts({ statsHotels: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-0.5 block">تعداد شهرها</label>
                        <input type="text" value={theme.texts.statsCities} onChange={(e) => updateTexts({ statsCities: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-0.5 block">تعداد رزرو</label>
                        <input type="text" value={theme.texts.statsBookings} onChange={(e) => updateTexts({ statsBookings: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-0.5 block">رضایت مشتریان</label>
                        <input type="text" value={theme.texts.statsSatisfaction} onChange={(e) => updateTexts({ statsSatisfaction: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">پیش‌نمایش</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Monitor className="w-5 h-5" />
                </button>
                <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Tablet className="w-5 h-5" />
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Smartphone className="w-5 h-5" />
                </button>
                <button onClick={() => setShowPreview(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex justify-center">
              <div
                className="bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
                  maxWidth: '100%',
                }}
              >
                {/* Mini preview of site */}
                <div style={{ background: `linear-gradient(135deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgVia}, ${theme.colors.heroBgTo})`, color: theme.colors.heroText, padding: `${theme.sizes.heroTopPadding / 2}px 24px ${theme.sizes.heroBottomPadding / 2}px` }}>
                  <div className="text-center">
                    <h1 style={{ fontFamily: `'${theme.fonts.heading}'`, fontWeight: theme.fonts.headingWeight, fontSize: `${Math.min(theme.fonts.headingSize * 1.5, 36)}px` }} className="mb-2">{theme.texts.heroTitle}</h1>
                    <p style={{ fontFamily: `'${theme.fonts.primary}'`, fontSize: `${theme.fonts.bodySize}px`, opacity: 0.8 }}>{theme.texts.heroSubtitle}</p>
                    <div className="mt-4 mx-auto max-w-md" style={{ backgroundColor: theme.colors.cardBg, borderRadius: `${theme.sizes.cardBorderRadius}px`, padding: `${theme.sizes.searchBoxPadding}px` }}>
                      <div className="h-10 rounded-lg" style={{ backgroundColor: theme.colors.bodyBg, border: `1px solid ${theme.colors.cardBorder}` }} />
                    </div>
                  </div>
                </div>
                <div style={{ backgroundColor: theme.colors.bodyBg, padding: '24px' }}>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div key={i} style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}`, borderRadius: `${theme.sizes.cardBorderRadius}px` }} className="overflow-hidden">
                        <div style={{ height: `${theme.sizes.cardImageHeight / 2}px`, background: `linear-gradient(45deg, ${theme.colors.primary}33, ${theme.colors.heroBgFrom}33)` }} />
                        <div className="p-3">
                          <div className="h-3 rounded-full mb-2" style={{ backgroundColor: theme.colors.textPrimary, width: '60%', opacity: 0.2 }} />
                          <div className="h-2 rounded-full mb-3" style={{ backgroundColor: theme.colors.textSecondary, width: '80%', opacity: 0.15 }} />
                          <div className="h-7 rounded-md" style={{ backgroundColor: theme.colors.primary, borderRadius: `${theme.sizes.buttonBorderRadius}px` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ backgroundColor: theme.colors.footerBg, color: theme.colors.footerText, padding: '16px 24px' }}>
                  <p style={{ fontSize: `${theme.fonts.smallSize}px`, textAlign: 'center' }}>{theme.texts.footerCopyright}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">بازنشانی ظاهر</h3>
            <p className="text-sm text-gray-500 mb-4">تمامی تنظیمات ظاهر به حالت پیش‌فرض بازگردانده می‌شود. آیا مطمئنید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                انصراف
              </button>
              <button onClick={() => { resetTheme(); setShowResetConfirm(false); }} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700">
                بازنشانی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
