import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarSearch, UserPlus, HeadphonesIcon, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home',     label: 'خانه',         icon: Home,             path: '/' },
  { id: 'track',   label: 'پیگیری رزرو',  icon: CalendarSearch,   path: '/track' },
  { id: 'support', label: 'پشتیبانی',      icon: HeadphonesIcon,  path: '/support' },
  { id: 'account', label: 'ثبت‌نام / ورود', icon: UserPlus,        path: '/register' },
];

export default function MobileBottomNav() {
  const { theme } = useTheme();
  const { currentUser } = useApp();
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9000] md:hidden"
      style={{
        background: theme.colors.headerBg === '#ffffff' ? 'rgba(255,255,255,0.92)' : theme.colors.headerBg,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid ${theme.colors.cardBorder}`,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const isUserTab = tab.id === 'account';
          const destPath = isUserTab && currentUser ? '/account' : tab.path;
          const isActive = activePath === tab.path
            || (tab.path !== '/' && activePath.startsWith(tab.path))
            || (isUserTab && (activePath === '/account' || activePath === '/login'));
          const Icon = (isUserTab && currentUser) ? User : tab.icon;
          const label = (isUserTab && currentUser) ? currentUser.fullName.split(' ')[0] : tab.label;

          return (
            <Link
              key={tab.id}
              to={destPath}
              className="relative flex flex-col items-center justify-center flex-1 gap-0.5 select-none active:opacity-70 transition-opacity"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon wrapper */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="w-11 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
                style={isActive ? {
                  backgroundColor: theme.colors.primary + '18',
                } : {}}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-200"
                  style={{ color: isActive ? theme.colors.primary : theme.colors.textMuted, strokeWidth: isActive ? 2.5 : 1.8 }}
                />
              </motion.div>

              {/* Label */}
              <span
                className="text-[9px] font-bold tracking-tight leading-none truncate w-full text-center px-0.5"
                style={{ color: isActive ? theme.colors.primary : theme.colors.textMuted }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
