export interface Branch {
  id: string;
  name: string;
  region: string;
  brand: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  amenities: string[];
  popularFor: string;
  paymentMethod?: 'sepay' | 'stripe';
  cardNumberLast4?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  bookingCode?: string;
  bookingStatus?: 'Reserved' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'RefundPending' | 'RefundApproved' | 'RefundDeclined' | 'ModifyPending' | 'ModifyApproved' | 'ModifyDeclined';
  refundRequestReason?: string;
  refundRequestType?: 'cancel' | 'modify';
  refundRequestedAt?: string;
  refundRequestAmount?: number;
  refundBankName?: string;
  refundBankAccount?: string;
  refundBankOwner?: string;
  refundNewCheckIn?: string;
  refundNewCheckOut?: string;
  refundNewCheckOutStatus?: string;
  virtualTourUrl?: string;
}

export interface Apartment {
  id: string;
  name: string;
  location: string;
  type: 'Studio' | '1-Bedroom' | '2-Bedroom' | 'Penthouse' | 'Service Apartment';
  area: number;
  bedrooms: number;
  bathrooms: number;
  monthlyPrice: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  availableFrom: string;
  hasVirtualTour: boolean;
  virtualTourUrl?: string;
  petFriendly: boolean;
  maintenanceStatus?: 'Clean' | 'Needs Repair' | 'Under Maintenance';
  estimatedRepairCost?: number;
  maintenanceNotes?: string;
}

export interface UserSim {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'member' | string;
  roleName: string;
  avatarInitials: string;
  tier?: string;
  loyaltyPoints?: number;
}
