import { Branch, Apartment } from './types';

export const BRANCHES: Branch[] = [
  {
    id: 'thai-nguyen',
    name: 'GrandStay Premier Thai Nguyen',
    region: 'Northern Highlands',
    brand: 'GrandStay Premier',
    description: 'Trải nghiệm khu nghỉ dưỡng đẳng cấp nép mình bên những đồi chè thơ mộng, với dịch vụ hồ bơi vô cực và spa chăm sóc sức khỏe thượng hạng.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviews: 142,
    pricePerNight: 3000000, // VND
    amenities: ['Pool', 'Spa', 'Tea Garden', 'Gym', 'Restaurant', 'Free Wi-Fi'],
    popularFor: 'Eco-Luxury & Wellness'
  },
  {
    id: 'phu-quoc',
    name: 'GrandStay Beachfront Resort Phu Quoc',
    region: 'South Coast',
    brand: 'GrandStay Resort',
    description: 'Thiên đường nghỉ dưỡng sát biển với bãi cát trắng mịn, ngắm hoàng hôn rực rỡ và hệ thống villa có hồ bơi riêng tư tuyệt đối.',
    image: 'https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviews: 289,
    pricePerNight: 4500000,
    amenities: ['Private Beach', 'Pool', 'Bar', 'Water Sports', 'Spa', 'Kids Club'],
    popularFor: 'Sunset Ocean View'
  },
  {
    id: 'da-nang',
    name: 'GrandStay Lux Waterfront Da Nang',
    region: 'Central Coast',
    brand: 'GrandStay Lux',
    description: 'Khách sạn cao tầng sang trọng bên sông Hàn thơ mộng, tích hợp sky bar thời thượng và tầm nhìn ôm trọn bờ biển Mỹ Khê.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    reviews: 412,
    pricePerNight: 3750000,
    amenities: ['Rooftop Bar', 'Pool', 'Gym', 'Conference', 'Fine Dining', 'Free Wi-Fi'],
    popularFor: 'Skyline & River Views'
  },
  {
    id: 'ha-noi',
    name: 'GrandStay Heritage Oasis Hanoi',
    region: 'Capital Region',
    brand: 'GrandStay Heritage',
    description: 'Biệt thự phong cách Indochine yên bình giữa lòng Hà Nội cổ kính, mang lại không gian tĩnh lặng, tách biệt khỏi xô bồ phố thị.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviews: 95,
    pricePerNight: 2750000,
    amenities: ['Boutique Garden', 'Spa', 'Traditional Tea', 'Free Wi-Fi', 'Bicycle Rental'],
    popularFor: 'Cultural & Historic Charm'
  },
  {
    id: 'saigon',
    name: 'GrandStay Urban Suites Saigon',
    region: 'Southern Metropolis',
    brand: 'GrandStay Suites',
    description: 'Căn hộ dịch vụ cao cấp bậc nhất tại trung tâm Quận 1, trang bị nội thất tối tân và hồ bơi chân mây ngắm toàn cảnh thành phố.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    reviews: 184,
    pricePerNight: 3375000,
    amenities: ['Kitchenette', 'Infinity Pool', 'Smart Home', 'Gym', '24/7 Lounge'],
    popularFor: 'Modern Urban Living'
  },
  {
    id: 'sapa',
    name: 'GrandStay Cloud Retreat Sapa',
    region: 'Northern Highlands',
    brand: 'GrandStay Resort',
    description: 'Nghỉ dưỡng mộc mạc đẳng cấp trên đỉnh đồi mờ sương, ban công ngắm trọn thung lũng Mường Hoa kỳ vĩ và những thửa ruộng bậc thang.',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviews: 210,
    pricePerNight: 4125000,
    amenities: ['Fireplace', 'Heated Pool', 'Spa', 'Organic Dining', 'Mountain Trekking'],
    popularFor: 'Mountain View & Serenity'
  }
];

export const APARTMENTS: Apartment[] = [
  {
    id: 'apt-saigon-skyline',
    name: 'Metropolitan Luxury Studio - Saigon Central',
    location: 'Saigon',
    type: 'Studio',
    area: 38,
    bedrooms: 1,
    bathrooms: 1,
    monthlyPrice: 23750000,
    rating: 4.8,
    reviews: 74,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Căn hộ Studio cao cấp sở hữu ban công kính nhìn trực diện Landmark 81 sầm uất. Đầy đủ tiện ích nhà bếp hiện đại, máy giặt kết hợp sấy riêng và bàn làm việc chuẩn Ergonomic cho người làm việc từ xa.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock', 'Gym', 'Pool'],
    availableFrom: '2026-07-01',
    hasVirtualTour: true,
    petFriendly: true
  },
  {
    id: 'apt-hanoi-indochine',
    name: 'Indochine Heritage 1BR Suite - Hoan Kiem',
    location: 'Hanoi',
    type: '1-Bedroom',
    area: 52,
    bedrooms: 1,
    bathrooms: 1,
    monthlyPrice: 27500000,
    rating: 4.9,
    reviews: 43,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Nằm tại trung tâm khu phố cổ Hà Nội, căn hộ kết hợp tinh tế giữa nét đẹp Indochine truyền thống và nội thất thông minh tiện lợi. Có khu vườn ban công xanh mát, hệ lọc khí tươi thông minh và bếp biệt lập.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock', 'Bicycle', 'Cleaning Service'],
    availableFrom: '2026-07-10',
    hasVirtualTour: true,
    petFriendly: false
  },
  {
    id: 'apt-danang-ocean',
    name: 'My Khe Beachfront Panoramic 2BR Apartment',
    location: 'Da Nang',
    type: '2-Bedroom',
    area: 78,
    bedrooms: 2,
    bathrooms: 2,
    monthlyPrice: 36250000,
    rating: 4.7,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thức dậy cùng bình minh rực rỡ trên biển Mỹ Khê từ phòng ngủ master cửa kính sát trần. Căn hộ 2 phòng ngủ lý tưởng cho gia đình hoặc nhóm bạn cư trú lâu dài với hồ bơi vô cực tòa nhà và bãi đỗ xe rộng rãi.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock', 'Pool', 'Gym', 'Parking'],
    availableFrom: '2026-06-28',
    hasVirtualTour: false,
    petFriendly: true
  },
  {
    id: 'apt-phuquoc-sunset',
    name: 'Sunset Horizon Pool Villa - Phu Quoc Resort',
    location: 'Phu Quoc',
    type: 'Penthouse',
    area: 120,
    bedrooms: 3,
    bathrooms: 3,
    monthlyPrice: 70000000,
    rating: 4.95,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Trải nghiệm phong cách sống "vô lo lo nghĩ" tại căn Penthouse nghỉ dưỡng sang trọng bậc nhất Phú Quốc. Bể sục jacuzzi riêng ngoài trời, dịch vụ quản gia cao cấp 24/7 và đầu bếp riêng phục vụ theo yêu cầu.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock', 'Pool', 'Private Beach', 'Jacuzzi', 'Chef Service'],
    availableFrom: '2026-07-15',
    hasVirtualTour: true,
    petFriendly: true
  },
  {
    id: 'apt-sapa-misty',
    name: 'Misty Valley Cozy Chalet - Sapa Eco-Retreat',
    location: 'Sapa',
    type: '1-Bedroom',
    area: 48,
    bedrooms: 1,
    bathrooms: 1,
    monthlyPrice: 20000000,
    rating: 4.85,
    reviews: 51,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tận hưởng kỳ nghỉ trốn bụi mịn tại căn hộ gỗ phong cách Scandinavian cổ điển trên đỉnh Sapa. Lò sưởi hơi nước ấm cúng, ban công rộng ngắm sương mù thung lũng Mường Hoa thơ mộng và bếp nướng BBQ.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Fireplace', 'Heated Pool', 'Balcony'],
    availableFrom: '2026-07-05',
    hasVirtualTour: false,
    petFriendly: true
  },
  {
    id: 'apt-thainguyen-garden',
    name: 'Zen Garden Tea-view Suite - GrandStay Thai Nguyen',
    location: 'Thai Nguyen',
    type: 'Service Apartment',
    area: 45,
    bedrooms: 1,
    bathrooms: 1,
    monthlyPrice: 18750000,
    rating: 4.9,
    reviews: 35,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Căn hộ dịch vụ cao cấp hướng đồi chè thơ mộng thuộc tổ hợp GrandStay Premier Thái Nguyên. Không gian thiền yên tĩnh thích hợp dưỡng sinh, trị liệu sức khỏe hoặc làm việc tập trung cao độ.',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Tea Garden', 'Spa', 'Pool', 'Cleaning Service'],
    availableFrom: '2026-07-01',
    hasVirtualTour: true,
    petFriendly: false
  }
];

export const APARTMENT_TYPES = [
  'All Types',
  'Studio',
  '1-Bedroom',
  '2-Bedroom',
  'Penthouse',
  'Service Apartment'
];

export const BRANDS = [
  'All Brands',
  'GrandStay Premier',
  'GrandStay Resort',
  'GrandStay Lux',
  'GrandStay Heritage',
  'GrandStay Suites'
];

export const LOCATIONS = [
  'All Locations',
  'Thai Nguyen',
  'Phu Quoc',
  'Da Nang',
  'Hanoi',
  'Saigon',
  'Sapa'
];

export const POPULAR_AMENITIES = [
  { id: 'Pool', label: 'Hồ bơi', icon: 'Waves' },
  { id: 'Spa', label: 'Spa & Trị liệu', icon: 'Sparkles' },
  { id: 'Gym', label: 'Phòng gym', icon: 'Dumbbell' },
  { id: 'Free Wi-Fi', label: 'Wi-Fi miễn phí', icon: 'Wifi' },
  { id: 'Private Beach', label: 'Bãi biển riêng', icon: 'Palmtree' },
  { id: 'Rooftop Bar', label: 'Skybar tầng thượng', icon: 'Beer' }
];

export const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

