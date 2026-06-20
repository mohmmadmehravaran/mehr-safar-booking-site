import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel, LogIn, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin, logoutAdmin, adminName, currentUser, logoutUser } = useApp();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const goToHotels = () => {
    const scroll = () => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scroll, 300);
    } else {
      scroll();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        minHeight: theme.sizes.headerHeight,
        backgroundColor: scrolled ? `${theme.colors.headerBg}CC` : `${theme.colors.headerBg}80`,
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full min-h-[64px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                boxShadow: `0 8px 20px ${theme.colors.primary}40`,
              }}
            >
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight transition-colors"
              style={{ color: theme.colors.headerText, fontFamily: `'${theme.fonts.heading}'`, fontWeight: theme.fonts.headingWeight }}
            >
              {theme.texts.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={location.pathname === '/'} scrolled={scrolled}>
              خانه
            </NavLink>
            <button
              onClick={goToHotels}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              هتل‌ها
            </button>
            {isAdmin && (
              <NavLink to="/admin" active={location.pathname === '/admin'} scrolled={scrolled}>
                پنل مدیریت
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: theme.colors.headerText }}>{adminName}</span>
                </div>
                <button
                  onClick={logoutAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: theme.colors.headerText }}>{currentUser.fullName}</span>
                </Link>
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  boxShadow: `0 4px 16px ${theme.colors.primary}40`,
                }}
              >
                <LogIn className="w-4 h-4" />
                ورود / عضویت
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, scrolled, children, hash }: { to: string; active: boolean; scrolled: boolean; children: React.ReactNode; hash?: string }) {
  return (
    <Link
      to={hash ? `${to}${hash}` : to}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : scrolled
          ? 'text-gray-700 hover:bg-gray-100'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
