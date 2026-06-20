import { createPortal } from 'react-dom';
import { Wand2, Power } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

/* ────────────────────────────────────────────────────────────────────────
   EditModeFab
   A persistent floating ON/OFF switch for the visual editor, always visible
   to the logged-in admin on every page. The flow becomes effortless:

     • Editing ON  → tap to TURN OFF  → browse the site normally, click any
       link / button, navigate to any page (clicks are no longer captured).
     • Editing OFF → tap to TURN ON   → edit the page you just landed on.

   Admin state and edit state are both persisted, so reloading or navigating
   never makes this button disappear.
   ──────────────────────────────────────────────────────────────────────── */
export default function EditModeFab() {
  const { isVisualEditing, setIsVisualEditing } = useTheme();
  const { isAdmin } = useApp();

  if (typeof document === 'undefined') return null;
  if (!isAdmin) return null; // only the logged-in admin sees the switch

  const editing = isVisualEditing;

  return createPortal(
    <button
      data-visual-ui
      onClick={() => setIsVisualEditing(!editing)}
      title={editing ? 'خاموش کردن ویرایش (برای رفتن به صفحات دیگر)' : 'روشن کردن ویرایش بصری'}
      style={{
        position: 'fixed',
        bottom: 88,
        left: 20,
        zIndex: 9997,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 18px',
        background: editing
          ? 'linear-gradient(135deg, #e11d48, #be123c)'
          : 'linear-gradient(135deg, #2563eb, #4f46e5)',
        color: 'white',
        border: 'none',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'Vazirmatn', sans-serif",
        cursor: 'pointer',
        boxShadow: editing
          ? '0 8px 24px rgba(225,29,72,0.45)'
          : '0 8px 24px rgba(37,99,235,0.45)',
        userSelect: 'none',
      }}
      dir="rtl"
    >
      {editing ? <Power style={{ width: 17, height: 17 }} /> : <Wand2 style={{ width: 17, height: 17 }} />}
      <span>{editing ? 'خاموش کردن ویرایش' : 'ویرایش بصری'}</span>
    </button>,
    document.body
  );
}
