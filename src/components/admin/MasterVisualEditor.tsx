import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Move, Type, Palette, RotateCcw, EyeOff, Eye,
  Image as ImageIcon, Link as LinkIcon, AlignRight, AlignCenter, AlignLeft,
  Check, Upload, Sparkles, Magnet
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSiteEdits } from '../../context/SiteEditsContext';
import { computeDomPath, findByDomPath, getFriendlyLabel, isEditableTextLeaf } from '../../utils/domPath';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  collectSnapTargets, computeSnap, snapEdge, setGuides, clearGuides,
  getMagnet, setMagnet, subscribeMagnet,
} from '../../utils/editorGuides';
import SnapOverlay from './SnapOverlay';
import { useSyncExternalStore } from 'react';
import { fileToCompressedDataURL } from '../../utils/image';
import { IconPicker, ShapePicker, PageManager, LinkSelect, useAllPages } from './PickerModals';
import { getIconComp, ICON_LIBRARY } from '../../utils/iconLibrary';
import { SHAPE_LIBRARY } from '../../utils/shapeLibrary';
import { MousePointerClick, Square, Smile as SmileIcon } from 'lucide-react';

/* useMagnet — subscribe to the magnet-enabled toggle */
function useMagnet() {
  return useSyncExternalStore(subscribeMagnet, getMagnet, getMagnet);
}

/* ─── RGB → HEX Helper ─── */
function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return '#ffffff';
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#ffffff';
  const r = parseInt(m[1]).toString(16).padStart(2, '0');
  const g = parseInt(m[2]).toString(16).padStart(2, '0');
  const b = parseInt(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/* ─────────────────────────────────────────────────────────
   Selection Overlay – کادر سبز دور عنصر انتخاب شده همراه با هندل کشیدن
───────────────────────────────────────────────────────── */
function SelectionBox({ path }: { path: string }) {
  const { edits, setElementEdit } = useSiteEdits();
  const el = findByDomPath(path);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Position sync loop
  useEffect(() => {
    let frameId: number;
    const update = () => {
      const currentEl = findByDomPath(path);
      if (currentEl) {
        setRect(currentEl.getBoundingClientRect());
      } else {
        setRect(null);
      }
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, [path, edits]);

  // Dragging state
  const dragState = useRef<{
    startMouseX: number; startMouseY: number;
    startElemX: number; startElemY: number;
    startRect: DOMRect; targets: DOMRect[];
  } | null>(null);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const curX = edits[path]?.x || 0;
    const curY = edits[path]?.y || 0;
    const node = findByDomPath(path);
    dragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElemX: curX,
      startElemY: curY,
      startRect: node ? node.getBoundingClientRect() : new DOMRect(),
      targets: node ? collectSnapTargets(node) : [],
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const doDrag = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    e.preventDefault();
    e.stopPropagation();
    let deltaX = e.clientX - dragState.current.startMouseX;
    let deltaY = e.clientY - dragState.current.startMouseY;

    // Magnet / snap: align proposed screen rect to nearby edges & centers
    if (getMagnet() && dragState.current.targets.length) {
      const sr = dragState.current.startRect;
      const proposed = {
        left: sr.left + deltaX,
        top: sr.top + deltaY,
        width: sr.width,
        height: sr.height,
      };
      const snap = computeSnap(proposed, dragState.current.targets);
      deltaX += snap.dx;
      deltaY += snap.dy;
      setGuides(snap.guides);
    }

    setElementEdit(path, {
      x: dragState.current.startElemX + deltaX,
      y: dragState.current.startElemY + deltaY,
    });
  };

  const endDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = null;
    clearGuides();
  };

  if (!rect || !el) return null;

  const label = getFriendlyLabel(el);

  return (
    <div
      data-visual-ui
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: '2px solid #10b981',
        borderRadius: 6,
        pointerEvents: 'none',
        zIndex: 9990,
        boxShadow: '0 0 0 1px white, 0 0 15px rgba(16,185,129,0.3)',
      }}
    >
      {/* Drag Move Handle */}
      <div
        onPointerDown={startDrag}
        onPointerMove={doDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="بکشید تا جابجا شود"
        style={{
          position: 'absolute',
          top: -34,
          right: -2,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          borderRadius: '8px 8px 0 8px',
          fontSize: 12,
          fontWeight: 'bold',
          cursor: 'move',
          pointerEvents: 'auto',
          userSelect: 'none',
          touchAction: 'none',
          boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        <Move className="w-4 h-4 text-white" />
        <span>کشیدن ({label})</span>
      </div>

      {/* Resize Handles */}
      <ResizeHandles el={el} path={path} rect={rect} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Resize Handles (8 Directions)
───────────────────────────────────────────────────────── */
type RDir = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

function ResizeHandles({ el, path }: { el: HTMLElement; path: string; rect?: DOMRect }) {
  const { edits, setElementEdit } = useSiteEdits();
  const rDrag = useRef<{
    startX: number; startY: number; startW: number; startH: number;
    startElemX: number; startElemY: number; startRect: DOMRect; targets: DOMRect[];
  } | null>(null);

  const beginResize = (dir: RDir) => (e: React.PointerEvent) => {
    if (!dir) return;
    e.preventDefault();
    e.stopPropagation();
    const startW = edits[path]?.width || el.offsetWidth;
    const startH = edits[path]?.height || el.offsetHeight;
    const startElemX = edits[path]?.x || 0;
    const startElemY = edits[path]?.y || 0;

    rDrag.current = {
      startX: e.clientX, startY: e.clientY, startW, startH, startElemX, startElemY,
      startRect: el.getBoundingClientRect(),
      targets: collectSnapTargets(el),
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const performResize = (dir: RDir) => (e: React.PointerEvent) => {
    if (!rDrag.current) return;
    e.preventDefault();
    e.stopPropagation();
    let dX = e.clientX - rDrag.current.startX;
    let dY = e.clientY - rDrag.current.startY;

    const { startRect, targets } = rDrag.current;
    const magnet = getMagnet() && targets.length > 0;
    const guides: any[] = [];

    // Snap the moving edges to nearby alignment lines
    if (magnet) {
      if (dir.includes('e')) {
        const s = snapEdge(startRect.right + dX, targets, 'v');
        dX += s.delta; if (s.guide) guides.push(s.guide);
      }
      if (dir.includes('w')) {
        const s = snapEdge(startRect.left + dX, targets, 'v');
        dX += s.delta; if (s.guide) guides.push(s.guide);
      }
      if (dir.includes('s')) {
        const s = snapEdge(startRect.bottom + dY, targets, 'h');
        dY += s.delta; if (s.guide) guides.push(s.guide);
      }
      if (dir.includes('n')) {
        const s = snapEdge(startRect.top + dY, targets, 'h');
        dY += s.delta; if (s.guide) guides.push(s.guide);
      }
      setGuides(guides);
    }

    const partial: any = {};

    if (dir.includes('e')) partial.width = Math.max(20, rDrag.current.startW + dX);
    if (dir.includes('w')) {
      const nextW = Math.max(20, rDrag.current.startW - dX);
      partial.width = nextW;
      partial.x = rDrag.current.startElemX + dX;
    }
    if (dir.includes('s')) partial.height = Math.max(20, rDrag.current.startH + dY);
    if (dir.includes('n')) {
      const nextH = Math.max(20, rDrag.current.startH - dY);
      partial.height = nextH;
      partial.y = rDrag.current.startElemY + dY;
    }

    setElementEdit(path, partial);
  };

  const finishResize = () => { rDrag.current = null; clearGuides(); };

  const point = (dir: RDir, cursor: string, pos: React.CSSProperties) => (
    <div
      onPointerDown={beginResize(dir)}
      onPointerMove={performResize(dir)}
      onPointerUp={finishResize}
      onPointerCancel={finishResize}
      style={{
        position: 'absolute',
        ...pos,
        width: 14,
        height: 14,
        background: '#ffffff',
        border: '3px solid #10b981',
        borderRadius: '50%',
        cursor,
        pointerEvents: 'auto',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    />
  );

  return (
    <>
      {point('nw', 'nwse-resize', { top: 0, left: 0 })}
      {point('n', 'ns-resize', { top: 0, left: '50%' })}
      {point('ne', 'nesw-resize', { top: 0, left: '100%' })}
      {point('w', 'ew-resize', { top: '50%', left: 0 })}
      {point('e', 'ew-resize', { top: '50%', left: '100%' })}
      {point('sw', 'nesw-resize', { top: '100%', left: 0 })}
      {point('s', 'ns-resize', { top: '100%', left: '50%' })}
      {point('se', 'nwse-resize', { top: '100%', left: '100%' })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Inspector Modal (سمت چپ صفحه)
───────────────────────────────────────────────────────── */
function InspectorWindow({ path }: { path: string }) {
  const { edits, setElementEdit, resetElementEdit, setSelectedPath, customWidgets, updateCustomWidget, removeCustomWidget, moveWidgetLayer } = useSiteEdits();
  const [showIconPick, setShowIconPick] = useState(false);
  const [showShapePick, setShowShapePick] = useState(false);
  const el = findByDomPath(path);
  if (!el) return null;

  const edit = edits[path] || {};
  const label = getFriendlyLabel(el);
  const tag = el.tagName.toLowerCase();

  const isInput = tag === 'input' || tag === 'textarea';
  const isImg = tag === 'img';
  const isLink = tag === 'a';
  const canEditText = isEditableTextLeaf(el);

  // Read current computed values
  const comp = getComputedStyle(el);
  const curText = edit.text ?? (canEditText ? el.textContent || '' : '');
  const curPlaceholder = edit.placeholder ?? (isInput ? (el as HTMLInputElement).placeholder : '');
  const curSrc = edit.src ?? (isImg ? (el as HTMLImageElement).src : '');
  const curHref = edit.href ?? (isLink ? el.getAttribute('href') || '' : '');

  const curFontSize = edit.fontSize ?? (parseInt(comp.fontSize) || 14);
  const curColor = edit.color ?? rgbToHex(comp.color);
  const curBg = edit.bgColor ?? rgbToHex(comp.backgroundColor);

  const uploadImg = async (file: File) => {
    const src = await fileToCompressedDataURL(file);
    setElementEdit(path, { src });
  };

  return (
    <div
      data-visual-ui
      className="fixed top-24 left-6 z-[9995] w-80 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-soft-xl border border-gray-200/80 overflow-hidden flex flex-col max-h-[calc(100vh-140px)]"
      dir="rtl"
    >
      {/* Top Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">Inspector</div>
          <div className="font-bold text-base mt-0.5">{label}</div>
        </div>
        <button
          onClick={() => setSelectedPath(null)}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
        {/* CUSTOM WIDGET EDITORS (container / button / text / icon / shape) */}
        {path.startsWith('widget-id:') ? (() => {
          const wId = path.replace('widget-id:', '');
          const wObj = customWidgets.find((cw) => wId === cw.id);
          if (!wObj) return null;

          if (wObj.type === 'container') {
            return (
              <Section title="متن و عنوان کادر سفارشی" icon={<Type className="w-4 h-4 text-emerald-600" />}>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={wObj.title || ''}
                    onChange={(e) => updateCustomWidget(wId, { title: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="عنوان کادر"
                  />
                  <textarea
                    value={wObj.text || ''}
                    onChange={(e) => updateCustomWidget(wId, { text: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="متن کادر"
                  />
                  <div className="mt-2">
                    <LinkSelect value={wObj.link} onChange={(v) => updateCustomWidget(wId, { link: v })} />
                  </div>
                </div>
              </Section>
            );
          }

          if (wObj.type === 'button') {
            return (
              <Section title="متن و لینک دکمه" icon={<Type className="w-4 h-4 text-emerald-600" />}>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={wObj.title || ''}
                    onChange={(e) => updateCustomWidget(wId, { title: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="متن روی دکمه"
                  />
                  <LinkSelect value={wObj.link} onChange={(v) => updateCustomWidget(wId, { link: v })} />
                </div>
              </Section>
            );
          }

          if (wObj.type === 'text') {
            return (
              <Section title="محتوای متن" icon={<Type className="w-4 h-4 text-emerald-600" />}>
                <div className="space-y-3">
                  <textarea
                    value={wObj.text || ''}
                    onChange={(e) => updateCustomWidget(wId, { text: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="متن خود را بنویسید..."
                  />
                  <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                    {([
                      { v: 700, t: 'پررنگ' },
                      { v: 500, t: 'متوسط' },
                      { v: 400, t: 'نازک' },
                    ] as const).map((o) => (
                      <button
                        key={o.v}
                        onClick={() => updateCustomWidget(wId, { fontWeight: o.v })}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${(wObj.fontWeight ?? 600) === o.v ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                      >{o.t}</button>
                    ))}
                  </div>
                  <LinkSelect value={wObj.link} onChange={(v) => updateCustomWidget(wId, { link: v })} />
                </div>
              </Section>
            );
          }

          if (wObj.type === 'icon') {
            const IconComp = getIconComp(wObj.icon);
            const iconLabel = ICON_LIBRARY.find((i) => i.name === wObj.icon)?.label || wObj.icon;
            return (
              <Section title="آیکون" icon={<Palette className="w-4 h-4 text-emerald-600" />}>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowIconPick(true)}
                    className="w-full flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">{iconLabel}</span>
                    <span className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                      <IconComp size={22} color={wObj.color || '#10b981'} />
                    </span>
                  </button>
                  <button
                    onClick={() => setShowIconPick(true)}
                    className="w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    تغییر آیکون از کتابخانه
                  </button>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-500">اندازه آیکون</span>
                      <span className="text-emerald-700 font-bold">{wObj.iconSize ?? 64}px</span>
                    </div>
                    <input
                      type="range" min={16} max={200}
                      value={wObj.iconSize ?? 64}
                      onChange={(e) => updateCustomWidget(wId, { iconSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">رنگ آیکون</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={wObj.color || '#10b981'}
                        onChange={(e) => updateCustomWidget(wId, { color: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                      />
                      <span className="font-mono text-xs uppercase">{wObj.color || '#10b981'}</span>
                    </div>
                  </div>
                  <LinkSelect value={wObj.link} onChange={(v) => updateCustomWidget(wId, { link: v })} />
                </div>
                {showIconPick && (
                  <IconPicker
                    value={wObj.icon}
                    onPick={(name) => updateCustomWidget(wId, { icon: name })}
                    onClose={() => setShowIconPick(false)}
                  />
                )}
              </Section>
            );
          }

          if (wObj.type === 'shape') {
            const shapeLabel = SHAPE_LIBRARY.find((s) => s.kind === wObj.shape)?.label || 'شکل';
            return (
              <Section title="شکل" icon={<Palette className="w-4 h-4 text-emerald-600" />}>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowShapePick(true)}
                    className="w-full flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">شکل فعلی: {shapeLabel}</span>
                    <span className="text-xs text-purple-600 font-bold">تغییر</span>
                  </button>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">رنگ شکل</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={wObj.bg || '#10b981'}
                        onChange={(e) => updateCustomWidget(wId, { bg: e.target.value, bgGradient: undefined })}
                        className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                      />
                      <span className="font-mono text-xs uppercase">{wObj.bg || '#10b981'}</span>
                    </div>
                  </div>
                  <LinkSelect value={wObj.link} onChange={(v) => updateCustomWidget(wId, { link: v })} />
                </div>
                {showShapePick && (
                  <ShapePicker
                    value={wObj.shape}
                    onPick={(kind) => updateCustomWidget(wId, { shape: kind })}
                    onClose={() => setShowShapePick(false)}
                  />
                )}
              </Section>
            );
          }

          return null;
        })() : (canEditText || isInput) ? (
          <Section title={isInput ? 'متن راهنما (Placeholder)' : 'محتوای متن'} icon={<Type className="w-4 h-4 text-emerald-600" />}>
            <textarea
              value={isInput ? curPlaceholder : curText}
              onChange={(e) => {
                if (isInput) setElementEdit(path, { placeholder: e.target.value });
                else setElementEdit(path, { text: e.target.value });
              }}
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed resize-none"
              placeholder="تایپ کنید..."
            />
          </Section>
        ) : null}

        {/* IMAGE */}
        {isImg && (
          <Section title="تصویر" icon={<ImageIcon className="w-4 h-4 text-emerald-600" />}>
            <input
              type="text"
              value={curSrc}
              onChange={(e) => setElementEdit(path, { src: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-left"
              dir="ltr"
            />
            <label className="flex items-center justify-center gap-2 w-full py-3 mt-3 border-2 border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors font-medium">
              <Upload className="w-4 h-4" />
              <span>آپلود تصویر جدید</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImg(f); }} />
            </label>
          </Section>
        )}

        {/* LINK */}
        {isLink && (
          <Section title="آدرس لینک (URL)" icon={<LinkIcon className="w-4 h-4 text-emerald-600" />}>
            <input
              type="text"
              value={curHref}
              onChange={(e) => setElementEdit(path, { href: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-left"
              dir="ltr"
            />
          </Section>
        )}

        {/* POSITION RESETS */}
        <Section title="جابجایی (Translate)" icon={<Move className="w-4 h-4 text-emerald-600" />}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-xs text-gray-500 mb-1 block">X (افقی)</span>
              <input type="number" value={edit.x || 0} onChange={(e) => setElementEdit(path, { x: Number(e.target.value) })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center" />
            </div>
            <div>
              <span className="text-xs text-gray-500 mb-1 block">Y (عمودی)</span>
              <input type="number" value={edit.y || 0} onChange={(e) => setElementEdit(path, { y: Number(e.target.value) })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center" />
            </div>
          </div>
          {(edit.x !== undefined || edit.y !== undefined) && (
            <button
              onClick={() => setElementEdit(path, { x: 0, y: 0 })}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              بازگشت به جای اولیه
            </button>
          )}
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="فونت و چیدمان">
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-gray-500">اندازه فونت</span>
              <span className="text-emerald-700 font-bold">{curFontSize}px</span>
            </div>
            <input type="range" min={10} max={64} value={curFontSize} onChange={(e) => setElementEdit(path, { fontSize: Number(e.target.value) })} className="w-full" />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            {(['right', 'center', 'left'] as const).map((align) => (
              <button
                key={align}
                onClick={() => setElementEdit(path, { textAlign: align })}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center font-medium transition-all ${edit.textAlign === align ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {align === 'right' ? <AlignRight className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </Section>

        {/* COLORS & BACKGROUND IMAGE */}
        <Section title="پس‌زمینه و رنگ‌ها" icon={<Palette className="w-4 h-4 text-emerald-600" />}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-xs text-gray-500 mb-1 block">رنگ متن</span>
              <div className="flex items-center gap-2">
                <input type="color" value={curColor} onChange={(e) => setElementEdit(path, { color: e.target.value })} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
                <span className="font-mono text-xs uppercase">{curColor}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 mb-1 block">رنگ پس‌زمینه</span>
              <div className="flex items-center gap-2">
                <input type="color" value={curBg} onChange={(e) => setElementEdit(path, { bgColor: e.target.value })} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
                <span className="font-mono text-xs uppercase">{curBg}</span>
              </div>
            </div>
          </div>

          {!isImg && !isInput && (
            <div className="pt-2 border-t border-gray-100 space-y-3">
              {/* Image Upload */}
              <div>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors font-bold text-xs">
                  <Upload className="w-4 h-4" />
                  <span>{edit.bgSrc ? 'تغییر عکس پس‌زمینه کادر' : 'جایگزین کردن رنگ با عکس'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const bgSrc = await fileToCompressedDataURL(f);
                        setElementEdit(path, { bgSrc, bgGradient: undefined });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Gradient Presets - Professional Mesh & Linear Mix */}
              <div>
                <span className="text-[10px] text-gray-400 mb-1.5 block">انتخاب گرادیانت حرفه‌ای</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { n: 'Emerald Mesh', v: 'radial-gradient(at 0% 0%, #10b981 0, transparent 50%), radial-gradient(at 100% 100%, #059669 0, transparent 50%), #065f46' },
                    { n: 'Midnight Silk', v: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
                    { n: 'Soft Rose', v: 'linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)' },
                    { n: 'Aura Purple', v: 'radial-gradient(circle at top left, #8b5cf6, transparent), radial-gradient(circle at bottom right, #ec4899, transparent), #6366f1' },
                    { n: 'Gold Luxury', v: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
                    { n: 'Ocean Deep', v: 'linear-gradient(225deg, #22d3ee 0%, #0369a1 100%)' },
                    { n: 'Glass White', v: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)' },
                    { n: 'Dark Satin', v: 'radial-gradient(at 50% 50%, #374151 0%, #111827 100%)' },
                    { n: 'Sunset Glow', v: 'linear-gradient(to right, #f97316, #f43f5e)' },
                    { n: 'Mint Fresh', v: 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' },
                    { n: 'Cyber Neon', v: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)' },
                    { n: 'Elegant Grey', v: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' },
                  ].map((g) => (
                    <button
                      key={g.n}
                      onClick={() => setElementEdit(path, { bgGradient: g.v, bgSrc: undefined })}
                      className={`h-7 rounded-lg border-2 border-white shadow-soft transition-all active:scale-90 hover:scale-110 ${edit.bgGradient === g.v ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                      style={{ background: g.v }}
                      title={g.n}
                    />
                  ))}
                </div>
              </div>

              {(edit.bgSrc || edit.bgGradient) && (
                <button
                  onClick={() => setElementEdit(path, { bgSrc: undefined, bgGradient: undefined })}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  حذف افکت و بازگشت به رنگ ثابت
                </button>
              )}
            </div>
          )}
        </Section>

        {/* SPACING */}
        <Section title="فاصله داخلی و گردی گوشه">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-gray-500">گردی گوشه‌ها (Radius)</span>
              <span className="text-emerald-700 font-bold">{edit.borderRadius || 0}px</span>
            </div>
            <input type="range" min={0} max={64} value={edit.borderRadius || 0} onChange={(e) => setElementEdit(path, { borderRadius: Number(e.target.value) })} className="w-full" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-gray-500">فاصله داخلی (Padding)</span>
              <span className="text-emerald-700 font-bold">{edit.padding || 0}px</span>
            </div>
            <input type="range" min={0} max={64} value={edit.padding || 0} onChange={(e) => setElementEdit(path, { padding: Number(e.target.value) })} className="w-full" />
          </div>
        </Section>

        {/* GLASS EFFECT + TRANSPARENCY */}
        <Section title="حالت شیشه‌ای + شفافیت">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">حالت شیشه‌ای (Glassmorphism)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={!!edit.glass} onChange={(e) => {
                setElementEdit(path, { glass: e.target.checked });
                if (path.startsWith('widget-id:')) {
                  const wId = path.replace('widget-id:', '');
                  updateCustomWidget(wId, { glass: e.target.checked } as any);
                }
              }} />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          {edit.glass && (
            <div className="p-3 rounded-2xl mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
              <span className="text-[11px] text-emerald-700 font-medium">✓ افکت شیشه‌ای فعال است</span>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500 w-14 shrink-0">شفافیت</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={edit.opacity ?? 1}
              onChange={(e) => setElementEdit(path, { opacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="font-bold text-emerald-700 w-10 text-left text-xs">{Math.round((edit.opacity ?? 1) * 100)}%</span>
          </div>
        </Section>

        {/* STROKE (BORDER) */}
        <Section title="حاشیه (Stroke)">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-gray-500">ضخامت حاشیه</span>
                <span className="text-emerald-700 font-bold">{edit.strokeWidth ?? 0}px</span>
              </div>
              <input type="range" min={0} max={20} value={edit.strokeWidth ?? 0} onChange={(e) => setElementEdit(path, { strokeWidth: Number(e.target.value) })} className="w-full" />
            </div>
            {(edit.strokeWidth ?? 0) > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">رنگ حاشیه</span>
                    <div className="flex items-center gap-2">
                      <input type="color" value={edit.strokeColor ?? '#10b981'} onChange={(e) => setElementEdit(path, { strokeColor: e.target.value })} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
                      <span className="font-mono text-xs uppercase">{edit.strokeColor ?? '#10b981'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">نوع خط</span>
                    <select
                      value={edit.strokeStyle ?? 'solid'}
                      onChange={(e) => setElementEdit(path, { strokeStyle: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="solid">خط ممتد ━━━</option>
                      <option value="dashed">خط چین ╌╌╌</option>
                      <option value="dotted">نقطه‌چین ⠿⠿⠿</option>
                      <option value="double">دوتایی ══</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* DROP SHADOW */}
        <Section title="سایه (Shadow)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">X (افقی)</span>
                  <span className="text-emerald-700 font-bold">{edit.shadowX ?? 0}px</span>
                </div>
                <input type="range" min={-50} max={50} value={edit.shadowX ?? 0} onChange={(e) => setElementEdit(path, { shadowX: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">Y (عمودی)</span>
                  <span className="text-emerald-700 font-bold">{edit.shadowY ?? 0}px</span>
                </div>
                <input type="range" min={-50} max={50} value={edit.shadowY ?? 0} onChange={(e) => setElementEdit(path, { shadowY: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">محو (Blur)</span>
                  <span className="text-emerald-700 font-bold">{edit.shadowBlur ?? 0}px</span>
                </div>
                <input type="range" min={0} max={80} value={edit.shadowBlur ?? 0} onChange={(e) => setElementEdit(path, { shadowBlur: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">گسترش (Spread)</span>
                  <span className="text-emerald-700 font-bold">{edit.shadowSpread ?? 0}px</span>
                </div>
                <input type="range" min={-30} max={30} value={edit.shadowSpread ?? 0} onChange={(e) => setElementEdit(path, { shadowSpread: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">رنگ سایه</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={edit.shadowColor?.startsWith('rgba') ? '#000000' : (edit.shadowColor ?? '#000000')} onChange={(e) => {
                    const hex = e.target.value;
                    // Convert to rgba with 25% opacity
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    setElementEdit(path, { shadowColor: `rgba(${r}, ${g}, ${b}, 0.25)` });
                  }} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
                  <span className="font-mono text-[10px] text-gray-500">{edit.shadowColor ?? 'rgba(0,0,0,0.15)'}</span>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={!!edit.shadowInset} onChange={(e) => setElementEdit(path, { shadowInset: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
              <span className="text-xs text-gray-700">سایه داخلی (Inset)</span>
            </label>
            <button
              onClick={() => setElementEdit(path, { shadowX: undefined, shadowY: undefined, shadowBlur: undefined, shadowSpread: undefined, shadowColor: undefined, shadowInset: undefined })}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              حذف سایه
            </button>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] text-gray-400 mb-1 block">پیش‌فرض‌ها</span>
              <div className="grid grid-cols-4 gap-1">
                <button onClick={() => setElementEdit(path, { shadowX: 0, shadowY: 2, shadowBlur: 4, shadowSpread: 0, shadowColor: 'rgba(0,0,0,0.1)' })} className="py-1.5 text-[10px] bg-gray-50 rounded-lg hover:bg-gray-100">نرم</button>
                <button onClick={() => setElementEdit(path, { shadowX: 0, shadowY: 6, shadowBlur: 16, shadowSpread: 0, shadowColor: 'rgba(0,0,0,0.15)' })} className="py-1.5 text-[10px] bg-gray-50 rounded-lg hover:bg-gray-100">معمولی</button>
                <button onClick={() => setElementEdit(path, { shadowX: 0, shadowY: 12, shadowBlur: 32, shadowSpread: 0, shadowColor: 'rgba(0,0,0,0.25)' })} className="py-1.5 text-[10px] bg-gray-50 rounded-lg hover:bg-gray-100">قوی</button>
                <button onClick={() => setElementEdit(path, { shadowX: 0, shadowY: 20, shadowBlur: 60, shadowSpread: -10, shadowColor: 'rgba(16,185,129,0.3)' })} className="py-1.5 text-[10px] bg-gray-50 rounded-lg hover:bg-gray-100">سبز</button>
              </div>
            </div>
          </div>
        </Section>

        {/* LAYER PANEL – مثل فتوشاپ */}
        {path.startsWith('widget-id:') && (() => {
          const wId = path.replace('widget-id:', '');
          const allWidgets = [...customWidgets];
          const idx = allWidgets.findIndex((w) => w.id === wId);
          // sort by zIndex descending for visual display
          const sorted = [...allWidgets].sort((a, b) => (b.zIndex ?? 25) - (a.zIndex ?? 25));
          return (
            <Section title="پنل لایه‌ها (Photoshop Style)">
              <div className="space-y-1 max-h-40 overflow-y-auto" style={{ direction: 'ltr' }}>
                {sorted.map((w, si) => {
                  const isSelected = w.id === wId;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedPath(`widget-id:${w.id}`)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-xs ${
                        isSelected ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{ direction: 'rtl' }}
                    >
                      <span className="font-mono text-[10px] text-gray-400 w-5 shrink-0">#{sorted.length - si}</span>
                      <div className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center text-white text-[9px] font-bold ${
                        w.type === 'image' ? '' : ''
                      }`} style={{ backgroundColor: w.type === 'image' ? '#6366f1' : '#10b981' }}>
                        {w.type === 'image' ? '🖼' : '📦'}
                      </div>
                      <span className="truncate flex-1">{w.title || w.type === 'image' ? 'تصویر' : 'کادر'}</span>
                      <div className="flex gap-0.5">
                        {si > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); moveWidgetLayer(w.id, 'up'); }} className="p-0.5 hover:bg-white/50 rounded" title="بالا">⬆</button>
                        )}
                        {si < sorted.length - 1 && (
                          <button onClick={(e) => { e.stopPropagation(); moveWidgetLayer(w.id, 'down'); }} className="p-0.5 hover:bg-white/50 rounded" title="پایین">⬇</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-[10px] text-gray-400 text-center">
                برای جابجایی لایه‌ها روی ⬆⬇ کلیک کنید · لایه فعلی: {idx + 1} از {allWidgets.length}
              </div>
            </Section>
          );
        })()}

        {/* RESET ACTION & DELETION */}
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
          {path.startsWith('widget-id:') ? (
            <button
              onClick={() => {
                removeCustomWidget(path.replace('widget-id:', ''));
                setSelectedPath(null);
              }}
              className="w-full py-3 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black hover:bg-red-700 transition-colors"
            >
              🗑️ حذف کامل این کادر / تصویر دلخواه
            </button>
          ) : (
            <button
              onClick={() => setElementEdit(path, { hidden: !edit.hidden })}
              className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors ${edit.hidden ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {edit.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {edit.hidden ? 'نمایش مجدد این کادر / عنصر' : 'مخفی کردن / حذف موقت این کادر / عنصر'}
            </button>
          )}

          <button
            onClick={() => { resetElementEdit(path); setSelectedPath(null); }}
            className="w-full py-3 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>حذف استایل‌های سفارشی این عنصر</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Master Toolbar (بالای صفحه شناور است)
───────────────────────────────────────────────────────── */
// (page list now comes from useAllPages — built-in + user-created pages)

function MasterToolbar() {
  const { isVisualEditing, setIsVisualEditing } = useTheme();
  const { edits, resetAllEdits, setSelectedPath, addCustomWidget, undoCount, undo } = useSiteEdits();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPageNav, setShowPageNav] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const allPages = useAllPages();
  const magnet = useMagnet();

  if (!isVisualEditing) return null;

  const editsCount = Object.keys(edits).length;

  const handleAddImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await addCustomWidget('image', file, location.pathname);
    if (e.target) e.target.value = '';
  };

  return (
    <div
      data-visual-ui
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] glass rounded-full px-4 py-2.5 shadow-2xl border border-white flex items-center gap-4 text-xs tracking-tight"
      dir="rtl"
    >
      <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>ویرایش بصری</span>
      </div>

      {/* Page Navigation Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowPageNav(!showPageNav)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-full hover:bg-indigo-100 transition-colors"
        >
          📄 <span>صفحات</span> <span className="text-[9px]">▼</span>
        </button>
        {showPageNav && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-56 z-[10000] max-h-[60vh] overflow-y-auto" dir="rtl">
            {allPages.map((r) => (
              <button
                key={r.path}
                onClick={() => { navigate(r.path); setShowPageNav(false); setSelectedPath(null); }}
                className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${location.pathname === r.path ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'}`}
              >
                {r.label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-1.5" />
            <button
              onClick={() => { setShowPageManager(true); setShowPageNav(false); }}
              className="w-full text-right px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              ➕ ساختن / مدیریت صفحات
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {undoCount > 0 && (
          <button
            onClick={undo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold rounded-full hover:bg-amber-100 transition-colors"
          >
            ↩️ <span>برگشت (Undo) ({undoCount})</span>
          </button>
        )}
        {editsCount > 0 && (
          <button
            onClick={() => { if (confirm('آیا مطمئنید که همه تغییرات در کل سایت حذف شوند؟')) resetAllEdits(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی کل ({editsCount})</span>
          </button>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFilePick}
        />
        <button
          onClick={handleAddImage}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-full hover:bg-emerald-100 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>+ تصویر</span>
        </button>

        <button
          onClick={() => addCustomWidget('container', undefined, location.pathname)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-full hover:bg-blue-100 transition-colors"
        >
          <span>+ کادر / کارت</span>
        </button>

        <button
          onClick={() => addCustomWidget('button', undefined, location.pathname)}
          title="افزودن دکمه"
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>+ دکمه</span>
        </button>

        <button
          onClick={() => addCustomWidget('text', undefined, location.pathname)}
          title="افزودن متن"
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-colors"
        >
          <Type className="w-3.5 h-3.5" />
          <span>+ متن</span>
        </button>

        <button
          onClick={() => setShowIconPicker(true)}
          title="افزودن آیکون از کتابخانه"
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold rounded-full hover:bg-amber-100 transition-colors"
        >
          <SmileIcon className="w-3.5 h-3.5" />
          <span>+ آیکون</span>
        </button>

        <button
          onClick={() => setShowShapePicker(true)}
          title="افزودن شکل"
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 font-bold rounded-full hover:bg-purple-100 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          <span>+ شکل</span>
        </button>

        {showIconPicker && (
          <IconPicker
            onPick={(name) => addCustomWidget('icon', undefined, location.pathname, { icon: name })}
            onClose={() => setShowIconPicker(false)}
          />
        )}
        {showShapePicker && (
          <ShapePicker
            onPick={(kind) => addCustomWidget('shape', undefined, location.pathname, { shape: kind })}
            onClose={() => setShowShapePicker(false)}
          />
        )}
        {showPageManager && <PageManager onClose={() => setShowPageManager(false)} />}

        <button
          onClick={() => setMagnet(!magnet)}
          title="آهنربا / چسبیدن به لبه‌ها (Snap)"
          className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-full transition-colors ${
            magnet
              ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>{magnet ? 'مگنت روشن' : 'مگنت خاموش'}</span>
        </button>

        <button
          onClick={() => { setSelectedPath(null); setIsVisualEditing(false); }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN Controller Component
───────────────────────────────────────────────────────── */
export default function MasterVisualEditor() {
  const { isVisualEditing } = useTheme();
  const { selectedPath, setSelectedPath } = useSiteEdits();

  // Highlight / Cursor styles
  useEffect(() => {
    if (!isVisualEditing) return;
    document.body.classList.add('master-visual-editing');
    return () => document.body.classList.remove('master-visual-editing');
  }, [isVisualEditing]);

  // Global click interception
  useEffect(() => {
    if (!isVisualEditing) return;

    const isEditorUI = (el: HTMLElement | null) => !el || !!el.closest('[data-visual-ui]');

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isEditorUI(target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isEditorUI(target)) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const domPath = computeDomPath(target);
      if (domPath) {
        setSelectedPath(domPath);
      }
    };

    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [isVisualEditing, setSelectedPath]);

  if (!isVisualEditing) return null;

  return createPortal(
    <>
      <MasterToolbar />
      <SnapOverlay />
      {selectedPath && <SelectionBox path={selectedPath} />}
      {selectedPath && <InspectorWindow path={selectedPath} />}
    </>,
    document.body
  );
}
