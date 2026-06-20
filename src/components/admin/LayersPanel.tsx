import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown,
  Layers, X, GripVertical, Image as ImageIcon, Square, Type as TypeIcon,
  MousePointerClick, Smile, Pencil,
} from 'lucide-react';
import { useSiteEdits, CustomWidget } from '../../context/SiteEditsContext';

const TYPE_META: Record<string, { icon: any; label: string; color: string }> = {
  image: { icon: ImageIcon, label: 'تصویر', color: '#6366f1' },
  container: { icon: Square, label: 'کادر', color: '#10b981' },
  button: { icon: MousePointerClick, label: 'دکمه', color: '#059669' },
  text: { icon: TypeIcon, label: 'متن', color: '#0ea5e9' },
  icon: { icon: Smile, label: 'آیکون', color: '#f59e0b' },
  shape: { icon: Square, label: 'شکل', color: '#a855f7' },
};

function layerName(w: CustomWidget): string {
  if (w.name) return w.name;
  if (w.title) return w.title;
  if (w.type === 'text') return (w.text || 'متن').slice(0, 18);
  return TYPE_META[w.type]?.label || w.type;
}

export default function LayersPanel({ onClose }: { onClose: () => void }) {
  const {
    customWidgets, selectedPath, setSelectedPath,
    updateCustomWidget, removeCustomWidget, duplicateWidget,
    moveWidgetLayer, reorderWidgets,
  } = useSiteEdits();
  const location = useLocation();
  const pageWidgets = customWidgets.filter((w) => w.page === location.pathname);
  // Top-most (highest z-index) first — matches Photoshop ordering
  const sorted = [...pageWidgets].sort((a, b) => (b.zIndex ?? 25) - (a.zIndex ?? 25));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Draggable panel position
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dref = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const startDrag = (e: React.PointerEvent) => {
    const root = (e.currentTarget as HTMLElement).closest('[data-layers-root]') as HTMLElement;
    const r = root.getBoundingClientRect();
    dref.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top };
    setPos({ x: r.left, y: r.top });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDrag = (e: React.PointerEvent) => {
    const d = dref.current; if (!d) return;
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 300, d.ox + e.clientX - d.sx)),
      y: Math.max(8, Math.min(window.innerHeight - 120, d.oy + e.clientY - d.sy)),
    });
  };
  const endDrag = () => { dref.current = null; };

  const applyReorder = (targetId: string) => {
    const from = dragId.current;
    setDragOver(null);
    dragId.current = null;
    if (!from || from === targetId) return;
    const ids = sorted.map((w) => w.id);
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, from);
    reorderWidgets(ids); // top→bottom order
  };

  return (
    <div
      data-visual-ui
      data-layers-root
      dir="rtl"
      className="fixed z-[9996] w-72 bg-white/97 backdrop-blur-2xl rounded-3xl shadow-soft-xl border border-gray-200/80 overflow-hidden flex flex-col max-h-[70vh]"
      style={pos ? { top: pos.y, left: pos.x } : { top: 96, right: 24 }}
    >
      {/* Header (draggable) */}
      <div
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white flex items-center justify-between cursor-move select-none touch-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span className="font-bold text-sm">پنل لایه‌ها</span>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">{sorted.length}</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="p-2 overflow-y-auto flex-1 space-y-1">
        {sorted.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-10 px-4 leading-relaxed">
            هنوز لایه‌ای روی این صفحه نیست.<br />از نوار بالا عنصر اضافه کنید (تصویر، متن، دکمه، شکل…).
          </div>
        )}
        {sorted.map((w) => {
          const meta = TYPE_META[w.type] || TYPE_META.container;
          const Icon = meta.icon;
          const isSel = selectedPath === `widget-id:${w.id}`;
          return (
            <div
              key={w.id}
              draggable={editingId !== w.id}
              onDragStart={() => { dragId.current = w.id; }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(w.id); }}
              onDragLeave={() => setDragOver((d) => (d === w.id ? null : d))}
              onDrop={(e) => { e.preventDefault(); applyReorder(w.id); }}
              onClick={() => setSelectedPath(`widget-id:${w.id}`)}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all border ${
                isSel ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
              } ${dragOver === w.id ? 'ring-2 ring-blue-400' : ''} ${w.hidden ? 'opacity-50' : ''}`}
            >
              <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <span className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center" style={{ backgroundColor: meta.color + '22' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
              </span>

              {editingId === w.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => { updateCustomWidget(w.id, { name: draftName.trim() || undefined }); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateCustomWidget(w.id, { name: draftName.trim() || undefined }); setEditingId(null); } }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 text-xs px-2 py-1 rounded-lg border border-emerald-300 focus:outline-none"
                />
              ) : (
                <span
                  className="flex-1 min-w-0 truncate text-xs text-gray-700"
                  onDoubleClick={(e) => { e.stopPropagation(); setDraftName(w.name || w.title || ''); setEditingId(w.id); }}
                  title="دابل‌کلیک برای تغییر نام"
                >
                  {layerName(w)}
                </span>
              )}

              {/* Quick actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button title="بالا بردن لایه" onClick={(e) => { e.stopPropagation(); moveWidgetLayer(w.id, 'up'); }} className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-700"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button title="پایین بردن لایه" onClick={(e) => { e.stopPropagation(); moveWidgetLayer(w.id, 'down'); }} className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-700"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button title={w.hidden ? 'نمایش' : 'مخفی کردن'} onClick={(e) => { e.stopPropagation(); updateCustomWidget(w.id, { hidden: !w.hidden }); }} className={`p-1 rounded hover:bg-white ${w.hidden ? 'text-red-500' : 'text-gray-400 hover:text-gray-700'}`}>{w.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                <button title={w.locked ? 'باز کردن قفل' : 'قفل کردن'} onClick={(e) => { e.stopPropagation(); updateCustomWidget(w.id, { locked: !w.locked }); }} className={`p-1 rounded hover:bg-white ${w.locked ? 'text-amber-600' : 'text-gray-400 hover:text-gray-700'}`}>{w.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                <button title="تغییر نام" onClick={(e) => { e.stopPropagation(); setDraftName(w.name || w.title || ''); setEditingId(w.id); }} className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-700 hidden group-hover:block"><Pencil className="w-3 h-3" /></button>
                <button title="کپی لایه" onClick={(e) => { e.stopPropagation(); duplicateWidget(w.id); }} className="p-1 rounded hover:bg-white text-gray-400 hover:text-blue-600 hidden group-hover:block"><Copy className="w-3 h-3" /></button>
                <button title="حذف لایه" onClick={(e) => { e.stopPropagation(); if (confirm('این لایه حذف شود؟')) removeCustomWidget(w.id); }} className="p-1 rounded hover:bg-white text-gray-400 hover:text-red-600 hidden group-hover:block"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed">
        لایه‌ها را بکشید تا ترتیب رو‌هم‌قرارگرفتن عوض شود · دابل‌کلیک = تغییر نام
      </div>
    </div>
  );
}
