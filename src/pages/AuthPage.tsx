import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Hotel, Lock, Mail, Phone, User, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useDocumentTitle } from '../utils/useDocumentTitle';

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
      aria-pressed={show}
      title={show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
      className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
    >
      {show ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}

function FieldInput({ id, label, icon, placeholder, value, onChange, type = 'text', action, autoComplete, inputMode, required, minLength, dir }: {
  id: string; label: string; icon: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; action?: React.ReactNode;
  autoComplete?: string; inputMode?: 'text' | 'tel' | 'email' | 'numeric'; required?: boolean; minLength?: number; dir?: 'rtl' | 'ltr';
}) {
  const { theme } = useTheme();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:w-5 [&>svg]:h-5" aria-hidden="true">{icon}</div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        minLength={minLength}
        dir={dir}
        className="w-full pr-12 pl-12 py-4 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2"
        style={{
          backgroundColor: theme.colors.bodyBg,
          border: `2px solid ${theme.colors.cardBorder}`,
          color: theme.colors.textPrimary,
        }}
      />
      {action && <div className="absolute left-2 top-1/2 -translate-y-1/2">{action}</div>}
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, registerUser } = useApp();
  const { theme } = useTheme();
  const isRegister = location.pathname === '/register';
  useDocumentTitle(isRegister ? 'عضویت' : 'ورود');

  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ ok: boolean; msg: string } | null>(null);

  const [loginForm, setLoginForm] = useState({ emailOrPhone: '', password: '' });
  const [regForm, setRegForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (regForm.password !== regForm.confirm) {
        setAlert({ ok: false, msg: 'رمز عبور و تکرار آن یکسان نیستند.' });
        return;
      }
      const r = registerUser({ fullName: regForm.fullName, phone: regForm.phone, email: regForm.email, password: regForm.password });
      setAlert({ ok: r.success, msg: r.message });
      if (r.success) setTimeout(() => navigate('/account'), 700);
    } else {
      const r = loginUser(loginForm.emailOrPhone, loginForm.password);
      setAlert({ ok: r.success, msg: r.message });
      if (r.success) setTimeout(() => navigate('/account'), 700);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col pb-24 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* Visual hero */}
      <div className="relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgTo})` }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full blur-3xl bg-white" />
          <div className="absolute bottom-0 right-8 w-36 h-36 rounded-full blur-2xl" style={{ backgroundColor: theme.colors.primary }} />
        </div>
        <div className="relative px-6 py-10 text-white text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Hotel className="w-8 h-8" />
          </div>
          <div className="text-xl font-black mb-1">{isRegister ? 'عضویت در مهر سفر' : 'ورود به مهر سفر'}</div>
          <div className="text-sm opacity-80">{isRegister ? 'همین حالا رایگان ثبت‌نام کنید' : 'به حساب کاربری خود وارد شوید'}</div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-5 max-w-md mx-auto w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 shadow-soft-xl mb-4" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          {/* Tab switch */}
          <div className="grid grid-cols-2 bg-gray-100 rounded-2xl p-1 mb-5">
            <Link to="/login" className={`py-2.5 rounded-xl text-sm font-black text-center transition-all ${!isRegister ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>
              <span className="inline-flex items-center gap-1.5"><LogIn className="w-4 h-4" />ورود</span>
            </Link>
            <Link to="/register" className={`py-2.5 rounded-xl text-sm font-black text-center transition-all ${isRegister ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>
              <span className="inline-flex items-center gap-1.5"><UserPlus className="w-4 h-4" />عضویت</span>
            </Link>
          </div>

          {/* Alert */}
          {alert && (
            <div role="alert" aria-live="assertive" className={`mb-4 p-4 rounded-2xl text-sm font-semibold ${alert.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {alert.ok ? '✓ ' : '✗ '}{alert.msg}
            </div>
          )}

          {/* Forms */}
          <form onSubmit={submit} className="space-y-3">
            {isRegister ? (
              <>
                <FieldInput id="reg-fullname" label="نام و نام خانوادگی" autoComplete="name" required icon={<User />} placeholder="نام و نام خانوادگی" value={regForm.fullName} onChange={(v) => setRegForm((p) => ({ ...p, fullName: v }))} />
                <FieldInput id="reg-phone" label="شماره موبایل" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required icon={<Phone />} placeholder="شماره موبایل" value={regForm.phone} onChange={(v) => setRegForm((p) => ({ ...p, phone: v }))} />
                <FieldInput id="reg-email" label="ایمیل" type="email" inputMode="email" autoComplete="email" dir="ltr" icon={<Mail />} placeholder="ایمیل" value={regForm.email} onChange={(v) => setRegForm((p) => ({ ...p, email: v }))} />
                <FieldInput id="reg-password" label="رمز عبور (حداقل ۶ کاراکتر)" autoComplete="new-password" required minLength={6} icon={<Lock />} placeholder="رمز عبور (حداقل ۶ کاراکتر)" type={showPassword ? 'text' : 'password'} value={regForm.password} onChange={(v) => setRegForm((p) => ({ ...p, password: v }))} action={<PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />
                <FieldInput id="reg-confirm" label="تکرار رمز عبور" autoComplete="new-password" required minLength={6} icon={<Lock />} placeholder="تکرار رمز عبور" type={showPassword ? 'text' : 'password'} value={regForm.confirm} onChange={(v) => setRegForm((p) => ({ ...p, confirm: v }))} />
              </>
            ) : (
              <>
                <FieldInput id="login-id" label="ایمیل یا شماره موبایل" autoComplete="username" dir="ltr" required icon={<Mail />} placeholder="ایمیل یا شماره موبایل" value={loginForm.emailOrPhone} onChange={(v) => setLoginForm((p) => ({ ...p, emailOrPhone: v }))} />
                <FieldInput id="login-password" label="رمز عبور" autoComplete="current-password" required icon={<Lock />} placeholder="رمز عبور" type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(v) => setLoginForm((p) => ({ ...p, password: v }))} action={<PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, boxShadow: `0 12px 28px ${theme.colors.primary}35` }}
            >
              {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isRegister ? 'ساخت حساب کاربری' : 'ورود به حساب'}
            </button>
          </form>
        </motion.div>

        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 mx-auto text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </button>
      </div>
    </div>
  );
}
