import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteEdits, CustomWidget } from '../../context/SiteEditsContext';
import { useTheme } from '../../context/ThemeContext';
import { getIconComp } from '../../utils/iconLibrary';
import { shapeCss } from '../../utils/shapeLibrary';

/** Canva/Photoshop-style extras applied to every widget: rotation, lock, visibility. */
function extraStyle(w: CustomWidget, editing: boolean): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (w.rotation) s.transform = `rotate(${w.rotation}deg)`;
  if (w.hidden) {
    if (!editing) { s.display = 'none'; }
    else { s.opacity = 0.3; s.outline = '2px dashed #ef4444'; s.outlineOffset = '2px'; }
  }
  // Locked layers can't be grabbed/clicked on the canvas while editing (manage via the layers panel).
  if (w.locked && editing) s.pointerEvents = 'none';
  return s;
}

function getBorder(w: CustomWidget): string {
  if (w.strokeWidth !== undefined && w.strokeWidth > 0) {
    const style = w.strokeStyle || 'solid';
    const color = w.strokeColor || '#10b981';
    return `${w.strokeWidth}px ${style} ${color}`;
  }
  if (w.strokeWidth === 0) return 'none';
  return w.border || '1px solid #e5e7eb';
}

function getShadow(w: CustomWidget, defaultShadow: string): string {
  if (
    w.shadowX !== undefined || w.shadowY !== undefined ||
    w.shadowBlur !== undefined || w.shadowSpread !== undefined ||
    w.shadowColor !== undefined
  ) {
    const x = w.shadowX ?? 0;
    const y = w.shadowY ?? 4;
    const blur = w.shadowBlur ?? 12;
    const spread = w.shadowSpread ?? 0;
    const color = w.shadowColor ?? 'rgba(0,0,0,0.15)';
    const inset = w.shadowInset ? 'inset ' : '';
    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }
  return defaultShadow;
}

export default function CustomWidgetsLayer() {
  const { customWidgets } = useSiteEdits();
  const { isVisualEditing: editing } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (typeof document === 'undefined') return null;

  // Only show widgets for current page
  const currentPage = location.pathname;
  const pageWidgets = customWidgets.filter((w) => w.page === currentPage);

  return createPortal(
    <>
      {pageWidgets.map((w: CustomWidget) => {
        if (w.type === 'container') {
          return (
            <div
              key={w.id}
              data-custom-widget-id={w.id}
              style={{
                position: w.pinned ? 'fixed' : 'absolute',
                top: w.y,
                left: w.x,
                width: w.width,
                height: w.height,
                backgroundColor: w.bg || '#ffffff',
                color: w.color || '#111827',
                borderRadius: w.radius ?? 16,
                padding: w.padding ?? 20,
                border: getBorder(w),
                boxShadow: getShadow(w, '0 10px 30px rgba(0,0,0,0.12)'),
                zIndex: w.zIndex ?? 25,
                opacity: w.opacity ?? 1,
                backgroundImage: w.bgGradient || 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backdropFilter: w.glass ? 'blur(16px) saturate(180%)' : 'none',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: w.fontFamily || "'Vazirmatn', sans-serif",
                fontSize: w.fontSize ?? 14,
                cursor: w.link ? 'pointer' : 'default',
                ...extraStyle(w, editing),
              }}
              dir="rtl"
              onClick={() => { if (w.link && !document.body.classList.contains('master-visual-editing')) navigate(w.link); }}
            >
              {w.title && <h3 style={{ fontSize: 'inherit', fontFamily: "'Vazirmatn', sans-serif", fontWeight: 'bold', marginBottom: 8, margin: 0 }}>{w.title}</h3>}
              {w.text && <p style={{ fontSize: 'inherit', fontFamily: "'Vazirmatn', sans-serif", lineHeight: 1.6, margin: 0, opacity: 0.9 }}>{w.text}</p>}
            </div>
          );
        }

        const editingNow = () => document.body.classList.contains('master-visual-editing');
        const goLink = () => { if (w.link && !editingNow()) navigate(w.link); };

        // type === 'button'
        if (w.type === 'button') {
          return (
            <button
              key={w.id}
              data-custom-widget-id={w.id}
              type="button"
              onClick={goLink}
              style={{
                position: w.pinned ? 'fixed' : 'absolute',
                top: w.y,
                left: w.x,
                width: w.width,
                height: w.height,
                backgroundColor: w.bg || '#10b981',
                backgroundImage: w.bgGradient || 'none',
                color: w.color || '#ffffff',
                borderRadius: w.radius ?? 14,
                padding: w.padding ?? 12,
                border: getBorder(w),
                boxShadow: getShadow(w, '0 8px 20px rgba(16,185,129,0.25)'),
                zIndex: w.zIndex ?? 25,
                opacity: w.opacity ?? 1,
                fontFamily: w.fontFamily || "'Vazirmatn', sans-serif",
                fontSize: w.fontSize ?? 16,
                fontWeight: (w.fontWeight as any) ?? 700,
                textAlign: (w.textAlign as any) ?? 'center',
                cursor: editingNow() ? 'move' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                backdropFilter: w.glass ? 'blur(16px) saturate(180%)' : 'none',
                ...extraStyle(w, editing),
              }}
              dir="rtl"
            >
              {w.title || 'دکمه'}
            </button>
          );
        }

        // type === 'text'
        if (w.type === 'text') {
          return (
            <div
              key={w.id}
              data-custom-widget-id={w.id}
              onClick={goLink}
              style={{
                position: w.pinned ? 'fixed' : 'absolute',
                top: w.y,
                left: w.x,
                width: w.width,
                minHeight: w.height,
                color: w.color || '#111827',
                padding: w.padding ?? 4,
                zIndex: w.zIndex ?? 25,
                opacity: w.opacity ?? 1,
                fontFamily: w.fontFamily || "'Vazirmatn', sans-serif",
                fontSize: w.fontSize ?? 20,
                fontWeight: (w.fontWeight as any) ?? 600,
                textAlign: (w.textAlign as any) ?? 'right',
                lineHeight: 1.7,
                cursor: w.link && !editingNow() ? 'pointer' : 'default',
                boxSizing: 'border-box',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                ...extraStyle(w, editing),
              }}
              dir="rtl"
            >
              {w.text || 'متن دلخواه'}
            </div>
          );
        }

        // type === 'icon'
        if (w.type === 'icon') {
          const IconComp = getIconComp(w.icon);
          const iconSize = w.iconSize ?? Math.min(w.width, w.height) * 0.8;
          return (
            <div
              key={w.id}
              data-custom-widget-id={w.id}
              onClick={goLink}
              style={{
                position: w.pinned ? 'fixed' : 'absolute',
                top: w.y,
                left: w.x,
                width: w.width,
                height: w.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: w.bg || 'transparent',
                backgroundImage: w.bgGradient || 'none',
                borderRadius: w.radius ?? 16,
                border: w.strokeWidth ? getBorder(w) : 'none',
                boxShadow: getShadow(w, 'none'),
                padding: w.padding ?? 0,
                zIndex: w.zIndex ?? 25,
                opacity: w.opacity ?? 1,
                cursor: w.link && !editingNow() ? 'pointer' : 'default',
                boxSizing: 'border-box',
                ...extraStyle(w, editing),
              }}
            >
              <IconComp size={iconSize} color={w.color || '#10b981'} strokeWidth={2} />
            </div>
          );
        }

        // type === 'shape'
        if (w.type === 'shape') {
          const css = shapeCss(w.shape, w.radius ?? 16);
          const isLine = w.shape === 'line';
          return (
            <div
              key={w.id}
              data-custom-widget-id={w.id}
              onClick={goLink}
              style={{
                position: w.pinned ? 'fixed' : 'absolute',
                top: w.y,
                left: w.x,
                width: w.width,
                height: isLine ? Math.min(w.height, 12) : w.height,
                backgroundColor: w.bg || '#10b981',
                backgroundImage: w.bgGradient || 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: w.strokeWidth ? getBorder(w) : 'none',
                boxShadow: getShadow(w, 'none'),
                zIndex: w.zIndex ?? 25,
                opacity: w.opacity ?? 1,
                cursor: w.link && !editingNow() ? 'pointer' : 'default',
                boxSizing: 'border-box',
                backdropFilter: w.glass ? 'blur(16px) saturate(180%)' : 'none',
                ...css,
                ...extraStyle(w, editing),
              }}
            />
          );
        }

        // type === 'image'
        return (
          <img
            key={w.id}
            data-custom-widget-id={w.id}
            src={w.src || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
            alt={w.title || 'تصویر دلخواه'}
            style={{
              position: w.pinned ? 'fixed' : 'absolute',
              top: w.y,
              left: w.x,
              width: w.width,
              height: w.height,
              objectFit: 'cover',
              borderRadius: w.radius ?? 16,
              border: getBorder(w),
              boxShadow: getShadow(w, '0 12px 32px rgba(0,0,0,0.18)'),
              zIndex: w.zIndex ?? 25,
              opacity: w.opacity ?? 1,
              backdropFilter: w.glass ? 'blur(16px) saturate(180%)' : undefined,
              WebkitBackdropFilter: w.glass ? 'blur(16px) saturate(180%)' : undefined,
              boxSizing: 'border-box',
              ...extraStyle(w, editing),
            }}
          />
        );
      })}
    </>,
    document.body
  );
}
