/**
 * Curated, ready-to-use icon library for the no-code visual editor.
 * Non-technical users pick an icon by clicking it — no code needed.
 * All icons come from lucide-react (already a project dependency).
 */
import {
  Home, Search, User, Users, Heart, Star, Bell, Mail, Phone, MapPin,
  Calendar, Clock, Check, X, Plus, Minus, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Settings, Menu, Filter,
  ShoppingCart, ShoppingBag, CreditCard, Wallet, Tag, Gift, Percent,
  Building2, Hotel, BedDouble, Bath, Wifi, Coffee, UtensilsCrossed,
  Car, Plane, Train, Bus, Globe, Compass, Camera, Image as ImageIcon,
  Sun, Moon, CloudSun, Snowflake, Umbrella, Trees, Mountain, Waves,
  ThumbsUp, MessageCircle, Send, Share2, Download, Upload, Link2,
  Lock, Unlock, Shield, Key, Eye, EyeOff, Info, AlertCircle, HelpCircle,
  CheckCircle2, XCircle, Award, Crown, Sparkles, Zap, Flame, Trophy,
  Map, Navigation, Ticket, Briefcase, Headphones, LifeBuoy, Smile,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface IconDef {
  name: string;          // stable key stored on the widget
  label: string;         // Persian label for the picker
  Comp: ComponentType<{ size?: number | string; color?: string; strokeWidth?: number }>;
}

export const ICON_LIBRARY: IconDef[] = [
  { name: 'Home', label: 'خانه', Comp: Home },
  { name: 'Search', label: 'جستجو', Comp: Search },
  { name: 'User', label: 'کاربر', Comp: User },
  { name: 'Users', label: 'کاربران', Comp: Users },
  { name: 'Heart', label: 'قلب', Comp: Heart },
  { name: 'Star', label: 'ستاره', Comp: Star },
  { name: 'Bell', label: 'زنگ', Comp: Bell },
  { name: 'Mail', label: 'ایمیل', Comp: Mail },
  { name: 'Phone', label: 'تلفن', Comp: Phone },
  { name: 'MapPin', label: 'موقعیت', Comp: MapPin },
  { name: 'Calendar', label: 'تقویم', Comp: Calendar },
  { name: 'Clock', label: 'ساعت', Comp: Clock },
  { name: 'Check', label: 'تیک', Comp: Check },
  { name: 'X', label: 'بستن', Comp: X },
  { name: 'Plus', label: 'افزودن', Comp: Plus },
  { name: 'Minus', label: 'کم‌کردن', Comp: Minus },
  { name: 'ChevronLeft', label: 'فلش چپ', Comp: ChevronLeft },
  { name: 'ChevronRight', label: 'فلش راست', Comp: ChevronRight },
  { name: 'ArrowLeft', label: 'پیکان چپ', Comp: ArrowLeft },
  { name: 'ArrowRight', label: 'پیکان راست', Comp: ArrowRight },
  { name: 'ArrowUp', label: 'پیکان بالا', Comp: ArrowUp },
  { name: 'ArrowDown', label: 'پیکان پایین', Comp: ArrowDown },
  { name: 'Settings', label: 'تنظیمات', Comp: Settings },
  { name: 'Menu', label: 'منو', Comp: Menu },
  { name: 'Filter', label: 'فیلتر', Comp: Filter },
  { name: 'ShoppingCart', label: 'سبد خرید', Comp: ShoppingCart },
  { name: 'ShoppingBag', label: 'کیف خرید', Comp: ShoppingBag },
  { name: 'CreditCard', label: 'کارت بانکی', Comp: CreditCard },
  { name: 'Wallet', label: 'کیف پول', Comp: Wallet },
  { name: 'Tag', label: 'برچسب', Comp: Tag },
  { name: 'Gift', label: 'هدیه', Comp: Gift },
  { name: 'Percent', label: 'درصد/تخفیف', Comp: Percent },
  { name: 'Building2', label: 'ساختمان', Comp: Building2 },
  { name: 'Hotel', label: 'هتل', Comp: Hotel },
  { name: 'BedDouble', label: 'تخت', Comp: BedDouble },
  { name: 'Bath', label: 'حمام', Comp: Bath },
  { name: 'Wifi', label: 'وای‌فای', Comp: Wifi },
  { name: 'Coffee', label: 'قهوه', Comp: Coffee },
  { name: 'UtensilsCrossed', label: 'رستوران', Comp: UtensilsCrossed },
  { name: 'Car', label: 'خودرو', Comp: Car },
  { name: 'Plane', label: 'هواپیما', Comp: Plane },
  { name: 'Train', label: 'قطار', Comp: Train },
  { name: 'Bus', label: 'اتوبوس', Comp: Bus },
  { name: 'Globe', label: 'کره زمین', Comp: Globe },
  { name: 'Compass', label: 'قطب‌نما', Comp: Compass },
  { name: 'Camera', label: 'دوربین', Comp: Camera },
  { name: 'ImageIcon', label: 'تصویر', Comp: ImageIcon },
  { name: 'Sun', label: 'خورشید', Comp: Sun },
  { name: 'Moon', label: 'ماه', Comp: Moon },
  { name: 'CloudSun', label: 'آفتابی', Comp: CloudSun },
  { name: 'Snowflake', label: 'برف', Comp: Snowflake },
  { name: 'Umbrella', label: 'چتر', Comp: Umbrella },
  { name: 'Trees', label: 'درختان', Comp: Trees },
  { name: 'Mountain', label: 'کوه', Comp: Mountain },
  { name: 'Waves', label: 'دریا', Comp: Waves },
  { name: 'ThumbsUp', label: 'پسندیدن', Comp: ThumbsUp },
  { name: 'MessageCircle', label: 'پیام', Comp: MessageCircle },
  { name: 'Send', label: 'ارسال', Comp: Send },
  { name: 'Share2', label: 'اشتراک', Comp: Share2 },
  { name: 'Download', label: 'دانلود', Comp: Download },
  { name: 'Upload', label: 'آپلود', Comp: Upload },
  { name: 'Link2', label: 'لینک', Comp: Link2 },
  { name: 'Lock', label: 'قفل', Comp: Lock },
  { name: 'Unlock', label: 'باز کردن قفل', Comp: Unlock },
  { name: 'Shield', label: 'سپر/امنیت', Comp: Shield },
  { name: 'Key', label: 'کلید', Comp: Key },
  { name: 'Eye', label: 'چشم', Comp: Eye },
  { name: 'EyeOff', label: 'پنهان', Comp: EyeOff },
  { name: 'Info', label: 'اطلاعات', Comp: Info },
  { name: 'AlertCircle', label: 'هشدار', Comp: AlertCircle },
  { name: 'HelpCircle', label: 'راهنما', Comp: HelpCircle },
  { name: 'CheckCircle2', label: 'تایید', Comp: CheckCircle2 },
  { name: 'XCircle', label: 'رد', Comp: XCircle },
  { name: 'Award', label: 'نشان', Comp: Award },
  { name: 'Crown', label: 'تاج', Comp: Crown },
  { name: 'Sparkles', label: 'درخشش', Comp: Sparkles },
  { name: 'Zap', label: 'برق', Comp: Zap },
  { name: 'Flame', label: 'شعله', Comp: Flame },
  { name: 'Trophy', label: 'جام', Comp: Trophy },
  { name: 'Map', label: 'نقشه', Comp: Map },
  { name: 'Navigation', label: 'مسیریابی', Comp: Navigation },
  { name: 'Ticket', label: 'بلیط', Comp: Ticket },
  { name: 'Briefcase', label: 'کیف اداری', Comp: Briefcase },
  { name: 'Headphones', label: 'پشتیبانی', Comp: Headphones },
  { name: 'LifeBuoy', label: 'نجات', Comp: LifeBuoy },
  { name: 'Smile', label: 'لبخند', Comp: Smile },
];

const ICON_MAP: Record<string, IconDef> = Object.fromEntries(
  ICON_LIBRARY.map((i) => [i.name, i])
);

export function getIconComp(name?: string): IconDef['Comp'] {
  return (name && ICON_MAP[name]?.Comp) || Star;
}
