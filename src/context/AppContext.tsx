import React, { createContext, useContext, useState, useCallback } from 'react';
import { Hotel, Booking, UserReview, ReviewLevel, AccommodationType, SiteUser } from '../types';
import { sampleHotels, sampleBookings, sampleReviews } from '../data/hotels';

interface Filters {
  stars: number[];
  types: AccommodationType[];
  reviews: ReviewLevel[];
  minPrice: number;
  maxPrice: number;
  city: string;
  search: string;
  checkIn: string;
  checkOut: string;
}

interface AppContextType {
  hotels: Hotel[];
  bookings: Booking[];
  reviews: UserReview[];
  filters: Filters;
  filteredHotels: Hotel[];
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: number, status: Booking['status']) => void;
  addReview: (review: UserReview) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (hotel: Hotel) => void;
  deleteHotel: (id: number) => void;
  isAdmin: boolean;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  adminName: string;
  users: SiteUser[];
  currentUser: SiteUser | null;
  registerUser: (user: Omit<SiteUser, 'id' | 'createdAt'>) => { success: boolean; message: string };
  loginUser: (emailOrPhone: string, password: string) => { success: boolean; message: string };
  logoutUser: () => void;
}

const defaultFilters: Filters = {
  stars: [],
  types: [],
  reviews: [],
  minPrice: 0,
  maxPrice: 10000000,
  city: '',
  search: '',
  checkIn: '',
  checkOut: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hotels, setHotels] = useState<Hotel[]>(sampleHotels);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [reviews, setReviews] = useState<UserReview[]>(sampleReviews);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try { return localStorage.getItem('mehrsafar-is-admin') === '1'; } catch { return false; }
  });
  const [adminName, setAdminName] = useState<string>(() => {
    try { return localStorage.getItem('mehrsafar-admin-name') || ''; } catch { return ''; }
  });
  const [users, setUsers] = useState<SiteUser[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mehrsafar-users') || '[]');
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<SiteUser | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('mehrsafar-current-user') || 'null');
    } catch {
      return null;
    }
  });

  const filteredHotels = hotels.filter((hotel) => {
    if (filters.stars.length > 0 && !filters.stars.includes(hotel.stars)) return false;
    if (filters.types.length > 0 && !filters.types.includes(hotel.type)) return false;
    if (filters.reviews.length > 0 && !filters.reviews.includes(hotel.review)) return false;
    if (hotel.pricePerNight < filters.minPrice || hotel.pricePerNight > filters.maxPrice) return false;
    if (filters.city && !hotel.city.includes(filters.city)) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!hotel.name.toLowerCase().includes(s) && !hotel.city.toLowerCase().includes(s) && !hotel.address.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  const updateBookingStatus = useCallback((id: number, status: Booking['status']) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const addReview = useCallback((review: UserReview) => {
    setReviews((prev) => [...prev, review]);
  }, []);

  const addHotel = useCallback((hotel: Hotel) => {
    setHotels((prev) => [...prev, hotel]);
  }, []);

  const updateHotel = useCallback((hotel: Hotel) => {
    setHotels((prev) => prev.map((h) => (h.id === hotel.id ? hotel : h)));
  }, []);

  const deleteHotel = useCallback((id: number) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const loginAdmin = useCallback((username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setAdminName('مدیر سیستم');
      try {
        localStorage.setItem('mehrsafar-is-admin', '1');
        localStorage.setItem('mehrsafar-admin-name', 'مدیر سیستم');
      } catch {}
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminName('');
    try {
      localStorage.removeItem('mehrsafar-is-admin');
      localStorage.removeItem('mehrsafar-admin-name');
      localStorage.setItem('mehrsafar-visual-editing', '0');
    } catch {}
  }, []);

  const registerUser = useCallback((user: Omit<SiteUser, 'id' | 'createdAt'>) => {
    const normalizedEmail = user.email.trim().toLowerCase();
    const normalizedPhone = user.phone.trim();
    if (!user.fullName.trim() || !normalizedPhone || !normalizedEmail || !user.password) {
      return { success: false, message: 'لطفاً همه فیلدهای ضروری را وارد کنید.' };
    }
    if (user.password.length < 6) {
      return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
    }
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail || u.phone === normalizedPhone)) {
      return { success: false, message: 'کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است.' };
    }

    const newUser: SiteUser = {
      ...user,
      email: normalizedEmail,
      phone: normalizedPhone,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setCurrentUser(newUser);
    localStorage.setItem('mehrsafar-users', JSON.stringify(nextUsers));
    localStorage.setItem('mehrsafar-current-user', JSON.stringify(newUser));
    return { success: true, message: 'ثبت‌نام با موفقیت انجام شد.' };
  }, [users]);

  const loginUser = useCallback((emailOrPhone: string, password: string) => {
    const login = emailOrPhone.trim().toLowerCase();
    const found = users.find((u) => (u.email.toLowerCase() === login || u.phone === emailOrPhone.trim()) && u.password === password);
    if (!found) {
      return { success: false, message: 'ایمیل/موبایل یا رمز عبور اشتباه است.' };
    }
    setCurrentUser(found);
    localStorage.setItem('mehrsafar-current-user', JSON.stringify(found));
    return { success: true, message: 'ورود با موفقیت انجام شد.' };
  }, [users]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('mehrsafar-current-user');
  }, []);

  return (
    <AppContext.Provider
      value={{
        hotels,
        bookings,
        reviews,
        filters,
        filteredHotels,
        setFilters,
        addBooking,
        updateBookingStatus,
        addReview,
        addHotel,
        updateHotel,
        deleteHotel,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        adminName,
        users,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
