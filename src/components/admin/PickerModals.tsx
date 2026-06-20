import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { ICON_LIBRARY } from '../../utils/iconLibrary';
import { SHAPE_LIBRARY, shapeCss } from '../../utils/shapeLibrary';
import type { ShapeKind } from '../../context/SiteEditsContext';
import { useSiteEdits } from '../../context/SiteEditsContext';

/* Built-in site pages, shown alongside user-created pages in every link picker. */
export const BUILT_IN_PAGES = [
  { path: '/', label: '🏠 صفحه اصلی' },
  { path: '/login', label: '🔑 ورود' },
  { path: '/register', label: '📝 عضویت' },
  { path: '/track', label: '🔍 پیگیری رزرو' },
  { path: '/support', label: '💬 پشتیبانی' },
  { path: '/account', label: '👤 حساب کاربری' },
  { path: '/admin', label: '⚙️ پنل مدیریت' },
];

/** All navigable pages = built-in + user-created custom pages. */
export function useAllPages() {
  const { customPages } = useSiteEdits();
  return [
    ...BUILT_IN_PAGES,
    ...customPages.map((p) => ({ path: p.path, label: `📄 ${p.label}` })),
  ];
}

/* ─────────── Link selector reused by every element inspector ─────────── */
export function LinkSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const pages = useAllPages();
  return (
    <div>
      <span className="text-xs text-gray-500 mb-1 block">لینک (با کلیک کاربر به کجا برود؟)</span>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">بدون لینک</option>
        {pages.map((p) => (
          <option key={p.path} value={p.path}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─────────── Icon picker modal ─────────── */
export function IconPicker({
  value,
  onPick,
  onClose,
}: {
  value?: string;
  onPick: (name: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const list = ICON_LIBRARY.filter(
    (i) => !q || i.label.includes(q) || i.name.toLowerCase().includes(q.toLowerCase())
  );

  return createPortal(
    <div
      data-visual-ui
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">انتخاب آیکون</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی آیکون..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-5 sm:grid-cols-6 gap-2">
          {list.map(({ name, label, Comp }) => (
            <button
              key={name}
              title={label}
              onClick={() => { onPick(name); onClose(); }}
              className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all hover:bg-emerald-50 hover:border-emerald-300 ${
                value === name ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400' : 'border-gray-200'
              }`}
            >
              <Comp size={24} color="#374151" />
              <span className="text-[8px] text-gray-400 truncate w-full text-center px-0.5">{label}</span>
            </button>
          ))}
          {list.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-400 py-8">آیکونی یافت نشد</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────── Shape picker modal ─────────── */
export function ShapePicker({
  value,
  onPick,
  onClose,
}: {
  value?: ShapeKind;
  onPick: (kind: ShapeKind) => void;
  onClose: () => void;
}) {
  return createPortal(
    <div
      data-visual-ui
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">انتخاب شکل</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {SHAPE_LIBRARY.map(({ kind, label }) => {
            const css = shapeCss(kind, 12);
            const isLine = kind === 'line';
            return (
              <button
                key={kind}
                onClick={() => { onPick(kind); onClose(); }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-all hover:bg-emerald-50 hover:border-emerald-300 ${
                  value === kind ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400' : 'border-gray-200'
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <div
                    style={{
                      width: 40,
                      height: isLine ? 8 : 40,
                      backgroundColor: '#10b981',
                      ...css,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────── New / manage pages modal ─────────── */
export function PageManager({ onClose }: { onClose: () => void }) {
  const { customPages, addCustomPage, updateCustomPage, removeCustomPage } = useSiteEdits();
  const [name, setName] = useState('');

  return createPortal(
    <div
      data-visual-ui
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">📄 مدیریت صفحات</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs text-gray-500 mb-1.5 block">نام صفحه جدید</span>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { addCustomPage(name); setName(''); } }}
              placeholder="مثلاً: درباره ما"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              disabled={!name.trim()}
              onClick={() => { if (name.trim()) { addCustomPage(name); setName(''); } }}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              + ساختن
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[40vh] overflow-y-auto space-y-2">
          {customPages.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-6">هنوز صفحه‌ای نساخته‌اید</div>
          )}
          {customPages.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-base">📄</span>
              <input
                value={p.label}
                onChange={(e) => updateCustomPage(p.id, { label: e.target.value })}
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
              />
              <button
                onClick={() => { if (confirm(`صفحهٔ «${p.label}» و همهٔ عناصر آن حذف شود؟`)) removeCustomPage(p.id); }}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                title="حذف صفحه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
