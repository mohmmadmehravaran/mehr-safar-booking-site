import { useLocation } from 'react-router-dom';
import { useSiteEdits } from '../context/SiteEditsContext';
import { useTheme } from '../context/ThemeContext';
import { useDocumentTitle } from '../utils/useDocumentTitle';

/**
 * Generic canvas for user-created (no-code) pages.
 * Real content is rendered by CustomWidgetsLayer, which matches the current
 * pathname. This component just provides the page shell, title and a roomy
 * canvas so absolutely-positioned widgets have space to live in.
 */
export default function CustomPage() {
  const location = useLocation();
  const { customPages, customWidgets } = useSiteEdits();
  const { isVisualEditing } = useTheme();

  const page = customPages.find((p) => p.path === location.pathname);
  useDocumentTitle(page ? page.label : 'صفحه');

  const widgetCount = customWidgets.filter((w) => w.page === location.pathname).length;

  if (!page) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6" dir="rtl">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">صفحه پیدا نشد</h1>
        <p className="text-gray-500">این صفحه وجود ندارد یا حذف شده است.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] w-full" dir="rtl">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{page.label}</h1>

        {widgetCount === 0 && (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-10 text-center">
            <div className="text-5xl mb-3">🎨</div>
            <h2 className="text-lg font-bold text-emerald-800 mb-1">این صفحه خالی است</h2>
            {isVisualEditing ? (
              <p className="text-sm text-emerald-700 leading-relaxed">
                از نوار ابزار بالا عناصر دلخواه را اضافه کنید: «+ دکمه»، «+ متن»، «+ آیکون»، «+ شکل»، «+ تصویر» یا «+ کادر».
                <br /> هر عنصر را می‌توانید بکشید، تغییر اندازه دهید و به صفحات دیگر لینک کنید.
              </p>
            ) : (
              <p className="text-sm text-emerald-700">
                برای افزودن محتوا، حالت «ویرایش بصری» را روشن کنید.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
