/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "economy" | "luxury" | "suv" | "family" | "van" | "wedding";
  image: string;
  pricePerDay: number; // in DZD
  transmission: "automatic" | "manual";
  city: string; // Algiers, Oran, Constantine, etc.
  agencyId?: string; // If belongs to an agency
  hostId?: string; // If belongs to an individual host
  agencyName?: string;
  hostName?: string;
  rating: number;
  reviewsCount: number;
  isAvailable: boolean;
  fuel: "essence" | "diesel" | "hybrid" | "electric";
  seats: number;
  deposit: number; // in DZD
  description: string;
  plates?: string;
}

export interface Agency {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewsCount: number;
  city: string;
  address: string;
  phone: string;
  verified: boolean;
  banner: string;
  carsCount: number;
}

export interface Reservation {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "active" | "completed";
  agencyId?: string;
  hostId?: string;
  bookingCode: string;
  contractVerified: boolean;
  ratingGiven?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  walletBalance: number; // in DZD
  isDriverVerified: boolean;
  licenseNumber?: string;
  identityCardNumber?: string;
  isHost: boolean;
  hasPendingVerification: boolean;
  registrationDate: string;
  phone?: string;
  about?: string;
  lives?: string;
  works?: string;
  school?: string;
  languages?: string;
  isGuest?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  carId: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: "booking" | "system" | "wallet" | "host";
  date: string;
  read: boolean;
}
