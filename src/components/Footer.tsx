import { Hotel, Phone, Mail, MapPin, Globe, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className="relative overflow-hidden hidden md:block"
      style={{ backgroundColor: theme.colors.footerBg, color: theme.colors.footerText }}
    >
      {/* Gradient accent top */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`,
        }}
      />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.primary }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.secondary }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: theme.sizes.footerPaddingY, paddingBottom: theme.sizes.footerPaddingY }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-3 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  boxShadow: `0 8px 20px ${theme.colors.primary}30`,
                }}
              >
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: `'${theme.fonts.heading}'`, fontWeight: theme.fonts.headingWeight }}
              >
                {theme.texts.siteName}
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-80 mb-6">
              {theme.texts.footerDescription}
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Globe, label: 'وب‌سایت مهر سفر', href: 'https://mehrsafar.com' },
                { Icon: Send, label: 'تلگرام مهر سفر', href: 'https://t.me/mehrsafar' },
                { Icon: MessageCircle, label: 'پشتیبانی واتساپ مهر سفر', href: 'https://wa.me/989000000000' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">لینک‌های سریع</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'صفحه اصلی', to: '/' },
                { label: 'جستجوی هتل', to: '/' },
                { label: 'پیگیری رزرو', to: '/track' },
                { label: 'پشتیبانی و تماس با ما', to: '/support' },
                { label: 'ورود / عضویت کاربران', to: '/login' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-current opacity-50 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">تماس با ما</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Phone className="w-4 h-4" style={{ color: theme.colors.primaryLight }} />
                </div>
                <div>
                  <div className="opacity-60 mb-1 text-xs">تلفن پشتیبانی</div>
                  <div className="font-semibold text-white">۰۲۱-۸۸۷۷۶۶۵۵</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Mail className="w-4 h-4" style={{ color: theme.colors.primaryLight }} />
                </div>
                <div>
                  <div className="opacity-60 mb-1 text-xs">ایمیل</div>
                  <div className="font-semibold text-white">info@mehrsafar.com</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <MapPin className="w-4 h-4" style={{ color: theme.colors.primaryLight }} />
                </div>
                <div>
                  <div className="opacity-60 mb-1 text-xs">آدرس</div>
                  <div className="font-semibold text-white">تهران، خیابان ولیعصر</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            {theme.texts.footerCopyright}
          </p>
          <div className="flex items-center gap-4 text-xs opacity-70">
            <Link to="/admin" className="hover:opacity-100 hover:text-white transition-all underline underline-offset-4">
              ورود مدیر
            </Link>
            <span>ساخته شده با</span>
            <span className="text-red-500">❤</span>
            <span>توسط تیم مهر سفر</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
