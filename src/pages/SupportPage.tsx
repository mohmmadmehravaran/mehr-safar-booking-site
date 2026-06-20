import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDocumentTitle } from '../utils/useDocumentTitle';

interface Message { id: number; text: string; from: 'user' | 'agent'; time: string; }

const autoResponses = [
  'ممنون از تماس شما. کارشناسان ما در اسرع وقت پاسخ می‌دهند. ⏰',
  'برای پیگیری رزرو، کافیه روی تب «پیگیری رزرو» ضربه بزنید و شماره موبایلتون رو وارد کنید. 📋',
  'برای رزرو هتل می‌تونید از صفحه اصلی، هتل مورد نظر رو جستجو و رزرو کنید. 🏨',
  'در صورت لغو رزرو، مبلغ پرداختی ظرف ۷۲ ساعت عودت داده می‌شود. 💰',
  'ساعات کاری پشتیبانی ما از ۸ صبح تا ۱۰ شب، هفت روز هفته است. 🕐',
  'آیا سوال دیگری دارید؟ خوشحال می‌شیم کمک کنیم! 😊',
];

const faqs = [
  { q: 'چطور رزروم رو پیگیری کنم؟', a: 'از تب پیگیری رزرو، شماره موبایل خود را وارد کنید.' },
  { q: 'آیا امکان لغو رزرو وجود داره؟', a: 'بله، تا ۲۴ ساعت قبل از ورود امکان لغو وجود دارد.' },
  { q: 'هزینه لغو رزرو چقدره؟', a: 'تا ۴۸ ساعت قبل: رایگان. بعد از آن: ۳۰٪ هزینه کسر می‌شود.' },
  { q: 'چطور می‌تونم به هتل تماس بگیرم؟', a: 'اطلاعات تماس هتل در صفحه جزئیات هتل موجود است.' },
];

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function SupportPage() {
  const { theme } = useTheme();
  const { currentUser } = useApp();
  useDocumentTitle('پشتیبانی آنلاین');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `سلام${currentUser ? ' ' + currentUser.fullName.split(' ')[0] : ''}! 👋\nبه پشتیبانی آنلاین مهر سفر خوش آمدید.\nچه کمکی می‌تونم بکنم؟`, from: 'agent', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text: text.trim(), from: 'user', time: now() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = { id: Date.now() + 1, text: autoResponses[Math.floor(Math.random() * autoResponses.length)], from: 'agent', time: now() };
      setMessages((p) => [...p, reply]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-auto md:min-h-screen" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* ── TOP BAR ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 flex-shrink-0"
        style={{ backgroundColor: theme.colors.headerBg, borderBottom: `1px solid ${theme.colors.cardBorder}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
            <Bot className="w-6 h-6" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1">
          <div className="font-black text-sm" style={{ color: theme.colors.textPrimary }}>پشتیبانی آنلاین</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            آنلاین · پاسخگویی سریع
          </div>
        </div>
        <a href="tel:02188776655" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
          <Phone className="w-5 h-5" style={{ color: theme.colors.primary }} />
        </a>
      </div>

      {/* ── FAQs ── */}
      <div className="px-4 py-3 flex-shrink-0 overflow-x-auto" style={{ backgroundColor: theme.colors.headerBg }}>
        <div className="flex gap-2 min-w-max pb-1">
          {faqs.map((faq, i) => (
            <button
              key={i}
              onClick={() => { send(faq.q); }}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}
            >
              {faq.q}
            </button>
          ))}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28 md:pb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: msg.from === 'agent' ? theme.colors.primaryLight : theme.colors.bodyBg }}>
                {msg.from === 'agent' ? <Bot className="w-4 h-4" style={{ color: theme.colors.primary }} /> : <User className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />}
              </div>
              <div className={`max-w-[78%] group`}>
                <div
                  className="px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    ...(msg.from === 'user'
                      ? { background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, color: 'white', borderRadius: '20px 4px 20px 20px' }
                      : { backgroundColor: theme.colors.cardBg, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.cardBorder}`, borderRadius: '4px 20px 20px 20px' }),
                  }}
                >
                  {msg.text}
                </div>
                <div className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-left' : 'text-right'}`} style={{ color: theme.colors.textMuted }}>
                  {msg.time}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                <Bot className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <div className="px-4 py-3 rounded-[4px_20px_20px_20px]" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.primary }} animate={{ y: [0, -5, 0] }} transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.7 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="fixed md:sticky bottom-16 md:bottom-0 left-0 right-0 px-4 py-3 flex gap-2 items-end flex-shrink-0"
        style={{ backgroundColor: theme.colors.headerBg, borderTop: `1px solid ${theme.colors.cardBorder}`, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 px-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 resize-none"
          style={{ backgroundColor: theme.colors.bodyBg, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.cardBorder}` }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-90 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, boxShadow: `0 4px 14px ${theme.colors.primary}50` }}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
