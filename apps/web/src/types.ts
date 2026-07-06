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
  area: number; // in m2
  bedrooms: number;
  bathrooms: number;
  monthlyPrice: number; // in VND
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  availableFrom: string; // date e.g. "2026-07-01"
  hasVirtualTour: boolean;
  virtualTourUrl?: string;
  petFriendly: boolean;
  maintenanceStatus?: 'Clean' | 'Needs Repair' | 'Under Maintenance';
  estimatedRepairCost?: number;
  maintenanceNotes?: string;
}

export interface SearchQuery {
  location: string;
  brand: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  activeTab: 'stay' | 'longTerm' | 'experience';
  amenities?: string[];
}

export interface LongTermSearchQuery {
  location: string;
  type: string;
  leaseTerm: number; // in months: 1, 3, 6, 12
  minPrice: number;
  maxPrice: number;
  petFriendly: boolean;
  hasVirtualTour: boolean;
}

export interface AmenityFilter {
  id: string;
  label: string;
  icon: string;
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

export interface Review {
  id: string;
  targetId: string; // branchId or apartmentId
  guestName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Tour {
  id: string;
  name: string;
  region: string;
  image: string;
  pricePerSlot: number;
  maxSlots: number;
  bookedSlots: number;
  duration: string;
  rating: number;
  description: string;
  highlights: string[];
  tourType?: 'day' | 'multi';
  itinerary?: { day: string; title: string; activities: string[] }[];
}

export interface GroupTour {
  id: string;
  tourId: string;
  tourName: string;
  creatorName: string;
  creatorEmail: string;
  currentMembers: number;
  requiredMembers: number;
  status: 'matching' | 'matched' | 'cancelled';
  members: string[];
  date: string;
}

export interface TourBooking {
  id: string;
  tourId: string;
  tourName: string;
  image: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  slots: number;
  totalPrice: number;
  bookingCode: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  isGroupTour: boolean;
  groupId?: string;
  date: string;
  paymentMethod?: 'stripe' | 'sepay';
  cardNumberLast4?: string;
}

export interface PolicySettingItem {
  percentage: number;
  timeframe: string;
  title: string;
  description: string;
}

export interface RefundPolicySettings {
  title: string;
  subtitle: string;
  policies: PolicySettingItem[];
  additionalTerms: string;
}



