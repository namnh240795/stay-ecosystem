// ─── Schemas ─────────────────────────────────────────────────────────────────
export { users, partnerApplications } from './users-schema';
export type { User, NewUser, PartnerApplication, NewPartnerApplication } from './users-schema';

export {
  properties,
  amenities,
  propertyAmenities,
  availability,
} from './properties-schema';
export type {
  Property,
  NewProperty,
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
