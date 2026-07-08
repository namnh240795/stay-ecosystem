// ─── Schemas ─────────────────────────────────────────────────────────────────
export { users, partnerApplications } from './users-schema';
export type { User, NewUser, PartnerApplication, NewPartnerApplication } from './users-schema';

export {
  properties,
  propertyImages,
  amenities,
  propertyAmenities,
  availability,
} from './properties-schema';
export type {
  Property,
  NewProperty,
  PropertyImage,
  NewPropertyImage,
  Amenity,
  NewAmenity,
  PropertyAmenity,
  Availability,
  NewAvailability,
} from './properties-schema';

export { bookings } from './bookings-schema';
export type { Booking, NewBooking } from './bookings-schema';

export { payments } from './payments-schema';
export type { Payment, NewPayment } from './payments-schema';

export { reviews } from './reviews-schema';
export type { Review, NewReview } from './reviews-schema';

export {
  complaints,
  dailyLogs,
  serviceRequests,
  staff,
  roles,
  leaveRequests,
} from './operations-schema';
export type {
  Complaint,
  NewComplaint,
  DailyLog,
  NewDailyLog,
  ServiceRequest,
  NewServiceRequest,
  Staff,
  NewStaff,
  Role,
  NewRole,
  LeaveRequest,
  NewLeaveRequest,
} from './operations-schema';

export {
  longtermApartments,
  longtermAmenities,
  maintenanceRecords,
  longtermContracts,
} from './longterm-schema';
export type {
  LongtermApartment,
  NewLongtermApartment,
  LongtermAmenity,
  NewLongtermAmenity,
  MaintenanceRecord,
  NewMaintenanceRecord,
  LongtermContract,
  NewLongtermContract,
} from './longterm-schema';

export {
  tours,
  tourHighlights,
  tourItinerary,
  tourBookings,
  groupTours,
} from './tours-schema';
export type {
  Tour,
  NewTour,
  TourHighlight,
  NewTourHighlight,
  TourItinerary,
  NewTourItinerary,
  TourBooking,
  NewTourBooking,
  GroupTour,
  NewGroupTour,
} from './tours-schema';

export {
  branches,
  branchAmenities,
  webApartments,
  webApartmentAmenities,
  webApartmentImages,
  siteConfig,
} from './web-schema';
export type {
  Branch,
  NewBranch,
  BranchAmenity,
  NewBranchAmenity,
  WebApartment,
  NewWebApartment,
  WebApartmentAmenity,
  NewWebApartmentAmenity,
  WebApartmentImage,
  NewWebApartmentImage,
  SiteConfig,
  NewSiteConfig,
} from './web-schema';

export {
  heroSlides,
  footerSettings,
  aboutContent,
  longtermContent,
  refundPolicies,
} from './config-schema';
export type {
  HeroSlide,
  NewHeroSlide,
  FooterSetting,
  NewFooterSetting,
  AboutContent,
  NewAboutContent,
  LongtermContent,
  NewLongtermContent,
  RefundPolicy,
  NewRefundPolicy,
} from './config-schema';
