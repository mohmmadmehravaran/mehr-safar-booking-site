export type ReviewLevel = 'ضعیف' | 'متوسط' | 'خوب' | 'بسیار خوب' | 'عالی';

export type AccommodationType =
  | 'هتل'
  | 'هتل آپارتمان'
  | 'مهمان‌پذیر'
  | 'اقامتگاه بوم‌گردی'
  | 'اقامتگاه سنتی';

export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  stars: number;
  type: AccommodationType;
  review: ReviewLevel;
  reviewScore: number;
  pricePerNight: number;
  images: string[];
  description: string;
  amenities: string[];
  rooms: Room[];
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  isFeatured: boolean;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  price: number;
  count: number;
  features: string[];
}

export interface Booking {
  id: number;
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomName: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: string; // ISO date (Gregorian)
  checkOut: string; // ISO date (Gregorian)
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string; // ISO date (Gregorian)
}

export interface UserReview {
  id: number;
  hotelId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AdminUser {
  username: string;
  password: string;
  name: string;
}

export interface SiteUser {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  createdAt: string;
}
