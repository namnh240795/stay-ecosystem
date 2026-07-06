import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Users, User, Calendar, MapPin, Clock, Star, Check, Plus, Minus, 
  QrCode, CreditCard, Info, Sparkles, DollarSign, Send, ArrowRight, Search, 
  X, Filter, CheckCircle, Flame, ShieldCheck, Ticket
} from 'lucide-react';
import { Tour, GroupTour, TourBooking, UserSim } from '../types';

// Initial Mock Data
const INITIAL_TOURS: Tour[] = [
  {
    id: 'tour-halong',
    name: 'Tour Du Thuyền 5 Sao Vịnh Hạ Long Premium',
    region: 'Vịnh Hạ Long',
    image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=800&q=85',
    pricePerSlot: 2500000,
    maxSlots: 12,
    bookedSlots: 8,
    duration: '2 ngày 1 đêm',
    rating: 4.9,
    description: 'Trải nghiệm du thuyền 5 sao đẳng cấp thế giới đi qua các hòn đảo đá vôi kỳ vĩ nhất Vịnh Hạ Long, nghỉ dưỡng phòng suite có ban công riêng, chèo thuyền kayak và thưởng thức tiệc hải sản thượng hạng.',
    highlights: ['Nghỉ phòng Suite ban công hướng vịnh', 'Chèo thuyền kayak qua hang Luồn', 'Thưởng thức buffet hải sản tôm hùm', 'Đón hoàng hôn tại sundeck'],
    tourType: 'multi',
    itinerary: [
      {
        day: "Ngày 1",
        title: "Hà Nội - Vịnh Hạ Long - Chèo thuyền Kayak & Hoàng Hôn",
        activities: [
          "08:30 - Xe limousine đón quý khách tại điểm hẹn hoặc khu phố cổ Hà Nội khởi hành đi Hạ Long.",
          "12:00 - Check-in du thuyền tại cảng tàu quốc tế Tuần Châu, thưởng thức đồ uống chào mừng và nghe hướng dẫn an toàn.",
          "13:00 - Thưởng thức bữa trưa buffet hải sản thượng hạng trong lúc du thuyền di chuyển qua Hòn Trống Mái, đỉnh Hương.",
          "15:00 - Khám phá Hang Luồn bằng đò nan chèo tay hoặc tự do chèo thuyền kayak khám phá vách đá vôi.",
          "17:30 - Tham gia tiệc trà hoàng hôn Sunset Party tại sundeck của tàu, ngắm ráng chiều tuyệt đẹp.",
          "19:00 - Dùng bữa tối lãng mạn phong cách Fine Dining tại nhà hàng chuẩn Michelin của du thuyền."
        ]
      },
      {
        day: "Ngày 2",
        title: "Hang Sửng Sốt - Hà Nội kết thúc hành trình di sản",
        activities: [
          "06:15 - Khởi đầu ngày mới với lớp tập Thái Cực Quyền (Tai Chi) trên sundeck đón tia nắng bình minh đầu tiên.",
          "07:30 - Thưởng thức điểm tâm sáng nhẹ với trà, cafe hảo hạng và các loại bánh ngọt tự làm ngon miệng.",
          "08:30 - Chinh phục Hang Sửng Sốt - hang động rộng lớn và lộng lẫy bậc nhất vịnh với hàng vạn mảng thạch nhũ tự nhiên.",
          "10:00 - Quý khách trở về tàu, làm thủ tục trả phòng và thưởng thức bữa trưa sớm (Brunch buffet) trên đường về bến.",
          "11:30 - Du thuyền cập bến Tuần Châu, xe limousine đón quý khách quay trở lại thủ đô Hà Nội."
        ]
      }
    ]
  },
  {
    id: 'tour-sapa',
    name: 'Tour Trekking Chinh Phục Đỉnh Fansipan & Bản Cát Cát',
    region: 'Sapa',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=85',
    pricePerSlot: 1500000,
    maxSlots: 8,
    bookedSlots: 5,
    duration: '3 ngày 2 đêm',
    rating: 4.8,
    description: 'Chinh phục nóc nhà Đông Dương Fansipan bằng cáp treo hiện đại, trekking xuyên qua thung lũng Mường Hoa thơ mộng và trải nghiệm văn hóa bản địa độc đáo tại Bản Cát Cát.',
    highlights: ['Vé cáp treo khứ hồi Fansipan', 'Trekking thung lũng Mường Hoa', 'Nghỉ đêm resort view núi thung lũng', 'Thưởng thức lẩu cá hồi đặc sản'],
    tourType: 'multi',
    itinerary: [
      {
        day: "Ngày 1",
        title: "Hà Nội - Sapa - Bản Cát Cát mộc mạc",
        activities: [
          "06:30 - Khởi hành từ Hà Nội đi Sapa bằng xe giường nằm hạng sang đi qua cao tốc Nội Bài - Lào Cai.",
          "13:00 - Đến Sapa nghỉ ngơi, dùng bữa trưa đậm đà phong vị Tây Bắc và nhận phòng khách sạn resort cao cấp.",
          "14:30 - Bắt đầu đi bộ tham quan Bản Cát Cát của người đồng bào H'Mông, xem biểu diễn múa xòe và check-in thác nước Cát Cát.",
          "19:00 - Thưởng thức lẩu cá hồi, cá tầm tươi ngọt đặc trưng vùng lạnh Sapa và dạo phố đêm tự do."
        ]
      },
      {
        day: "Ngày 2",
        title: "Chinh Phục Đỉnh Fansipan - Check-in Cổng Trời mây ngàn",
        activities: [
          "07:30 - Dùng bữa sáng buffet tại khách sạn hướng núi rừng.",
          "08:30 - Lên tàu hỏa leo núi Mường Hoa phong cách châu Âu, nối tuyến Cáp treo Fansipan vượt biển mây kỳ ảo.",
          "10:00 - Chạm tay vào mốc cao độ 3,143m đỉnh Fansipan hùng vĩ, vãn cảnh quần thể tâm linh Kim Sơn Bảo Thắng Tự.",
          "12:30 - Ăn trưa buffet trên đỉnh núi hoặc quay về thị trấn dùng bữa trưa riêng.",
          "15:30 - Ghé thăm các quán cafe view thung lũng siêu mộng mơ như Viettrekking hay Moana Sapa.",
          "18:30 - Thưởng thức các món đồ nướng ngói thơm lừng đặc trưng tại phố cổ Sapa."
        ]
      },
      {
        day: "Ngày 3",
        title: "Sapa - Đèo Ô Quy Hồ siêu vĩ - Hà Nội",
        activities: [
          "08:00 - Ăn sáng thư thả, dạo chợ Sapa mua sắm các loại măng ớt, rau cải mèo và đồ thổ cẩm thủ công.",
          "09:30 - Xe đưa đoàn chinh phục Đèo Ô Quy Hồ - cung đường đèo hùng vĩ nhất Việt Nam, ngắm nhìn thung lũng hoang dại.",
          "12:00 - Làm thủ tục check-out khách sạn, dùng bữa trưa ấm cúng chia tay Sapa.",
          "13:30 - Lên xe trở về Hà Nội, kết thúc chuyến đi tuyệt đẹp."
        ]
      }
    ]
  },
  {
    id: 'tour-phongnha',
    name: 'Tour Khám Phá Kỳ Vĩ Hệ Thống Hang Động Phong Nha',
    region: 'Quảng Bình',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
    pricePerSlot: 1800000,
    maxSlots: 10,
    bookedSlots: 4,
    duration: '1 ngày khép kín',
    rating: 4.7,
    description: 'Hành trình mạo hiểm khám phá Động Phong Nha và Động Thiên Đường - kỳ quan hang động dài nhất châu Á với hệ thống thạch nhũ huyền ảo và tráng lệ được kiến tạo hàng triệu năm.',
    highlights: ['Du thuyền ngược dòng sông Son', 'Khám phá thạch nhũ Động Thiên Đường', 'Bữa trưa ẩm thực dân dã Quảng Bình', 'Bảo hiểm du lịch trọn gói'],
    tourType: 'day',
    itinerary: [
      {
        day: "Cả Ngày",
        title: "Hành Trình Khám Phá Kỳ Quan Thạch Nhũ Phong Nha & Thiên Đường",
        activities: [
          "08:00 - Hướng dẫn viên và xe du lịch đón khách tại Đồng Hới (nhà ga, sân bay hoặc khách sạn) di chuyển lên Phong Nha.",
          "09:15 - Lên thuyền độc mộc rẽ sóng dòng sông Son nước xanh ngọc bích, tiến vào hang động Phong Nha lung linh huyền ảo.",
          "10:00 - Trải nghiệm đi bộ trên dải cát trong động, ngắm nhìn mảng thạch nhũ Cung Đình, Tóc Tiên kiến tạo qua hàng triệu năm.",
          "12:00 - Dùng bữa trưa đậm chất Quảng Bình tại nhà hàng ven sông Son với cá mát, gà nướng mật ong và tôm sông chao.",
          "13:30 - Khởi hành đi Động Thiên Đường - khám phá 'Hoàng cung trong lòng đất' với hệ thống cầu gỗ tản bộ dài 1km mát rượi.",
          "16:00 - Check-out động, khởi hành đưa quý khách trở lại điểm đón tại thành phố Đồng Hới.",
          "17:30 - Xe trả khách an toàn. Kết thúc hành trình tham quan kỳ quan thiên nhiên."
        ]
      }
    ]
  },
  {
    id: 'tour-phuquoc',
    name: 'Tour Lặn Ngắm San Hô & Khám Phá 4 Đảo Phú Quốc',
    region: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=85',
    pricePerSlot: 1200000,
    maxSlots: 15,
    bookedSlots: 10,
    duration: '1 ngày (8h - 17h)',
    rating: 4.9,
    description: 'Khám phá thế giới đại dương tuyệt mỹ tại Hòn Mây Rút, Hòn Móng Tay, lặn ngắm san hô tự nhiên tại Công viên bảo tồn san hô Nam Đảo Phú Quốc bằng cano cao tốc cực đỉnh.',
    highlights: ['Di chuyển cano cao tốc đời mới', 'Lặn snorkeling ngắm san hô 100% tự nhiên', 'Quay phim flycam & chụp ảnh Sup miễn phí', 'Ăn trưa hải sản 8 món trên đảo hòn'],
    tourType: 'day',
    itinerary: [
      {
        day: "Cả Ngày",
        title: "Khám Phá Thiên Đường Đảo Ngọc - Hòn Mây Rút, Hòn Móng Tay & Lặn San Hô",
        activities: [
          "08:30 - Xe đón quý khách tại khu nghỉ dưỡng, di chuyển đến cảng biển An Thới phía Nam đảo.",
          "09:15 - Cano cao tốc đời mới xuất bến, lướt sóng đưa quý khách ra Hòn Móng Tay - tắm biển, check-in rặng dừa thơ mộng.",
          "10:30 - Cano di chuyển đến khu vực Hòn Gầm Ghì, trang bị kính lặn ống thở chuyên nghiệp để ngắm san hô tự nhiên rực rỡ sắc màu.",
          "12:00 - Di chuyển lên Hòn Mây Rút Trong - dùng bữa trưa hải sản 8 món ngập tràn tôm, cua, mực tươi ngon ngọt lịm.",
          "14:30 - Trải nghiệm check-in sup chụp ảnh từ flycam cực độc đáo được các hướng dẫn viên setup hoàn toàn miễn phí.",
          "15:30 - Cano quay lại cảng, xe đưa quý khách ghé qua Sunset Sanato ngắm hoàng hôn đỏ lựng bên bờ biển Phú Quốc.",
          "17:00 - Trả khách về resort an toàn, kết thúc hành trình lặn biển."
        ]
      }
    ]
  },
  {
    id: 'tour-hue',
    name: 'Tour Hoàng Hôn Sông Hương & Nhã Nhạc Cung Đình',
    region: 'Huế',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=85',
    pricePerSlot: 850000,
    maxSlots: 20,
    bookedSlots: 12,
    duration: 'Nửa ngày (15h - 20h30)',
    rating: 4.6,
    description: 'Ngắm hoàng hôn lãng mạn trên dòng sông Hương thơ mộng, ghé thăm Chùa Thiên Mụ cổ kính, trải nghiệm thả hoa đăng cầu may mắn và thưởng thức Ca Huế Nhã Nhạc Cung Đình trên thuyền rồng.',
    highlights: ['Thuyền rồng rước trên sông Hương', 'Nghe nhã nhạc và thả hoa đăng', 'Thưởng thức ẩm thực cung đình Huế', 'Trà chiều ngắm hoàng hôn'],
    tourType: 'day',
    itinerary: [
      {
        day: "Nửa Ngày",
        title: "Hoàng Hôn Sông Hương, Thả Hoa Đăng & Thưởng Thức Ca Huế",
        activities: [
          "15:00 - Hướng dẫn viên và lái xe đón quý khách tại khu vực trung tâm Huế, xuất phát đi viếng Chùa Thiên Mụ.",
          "16:30 - Xuống thuyền rồng gỗ truyền thống tại bến Kim Long, thưởng thức trà chiều cung đình khi nắng quái chiều vàng nhuộm sông Hương.",
          "18:00 - Thưởng thức bữa tối ẩm thực các món bánh đặc sản Huế (bánh bèo, lọc, nậm, ram ít) chuẩn vị Huế xưa ngay trên thuyền.",
          "19:15 - Thuyền tắt máy thả trôi, chương trình Ca Huế Nhã Nhạc Cung Đình Huế chính thức bắt đầu dưới sự biểu diễn của các nghệ sĩ gạo cội.",
          "20:00 - Tự tay thả những chiếc đèn hoa đăng lung linh lấp lánh xuống dòng sông Hương thơ mộng gửi gắm ước nguyện bình an.",
          "20:30 - Thuyền cập bến bờ sông Hương, xe đón quý khách về khách sạn nghỉ ngơi."
        ]
      }
    ]
  }
];

const INITIAL_GROUPS: GroupTour[] = [
  {
    id: 'group-1',
    tourId: 'tour-sapa',
    tourName: 'Tour Trekking Chinh Phục Đỉnh Fansipan & Bản Cát Cát',
    creatorName: 'Trần Quân',
    creatorEmail: 'tran_quan90@gmail.com',
    currentMembers: 5,
    requiredMembers: 8,
    status: 'matching',
    members: ['Trần Quân', 'Lê Minh', 'Nguyễn Lan', 'Phạm Huy', 'Đỗ Vy'],
    date: '2026-07-04'
  },
  {
    id: 'group-2',
    tourId: 'tour-halong',
    tourName: 'Tour Du Thuyền 5 Sao Vịnh Hạ Long Premium',
    creatorName: 'Hoàng Oanh',
    creatorEmail: 'oanh_hoang96@gmail.com',
    currentMembers: 8,
    requiredMembers: 12,
    status: 'matching',
    members: ['Hoàng Oanh (3 người)', 'Nguyễn Bảo (2 người)', 'Trần Hà (3 người)'],
    date: '2026-07-06'
  },
  {
    id: 'group-3',
    tourId: 'tour-phuquoc',
    tourName: 'Tour Lặn Ngắm San Hô & Khám Phá 4 Đảo Phú Quốc',
    creatorName: 'Alex Smith',
    creatorEmail: 'alex_smith@gmail.com',
    currentMembers: 3,
    requiredMembers: 6,
    status: 'matching',
    members: ['Alex Smith', 'Emma Watson', 'Minh Thư'],
    date: '2026-07-08'
  }
];

interface TourPortalProps {
  currentUser: UserSim;
  onUpdateUser?: (user: UserSim) => void;
  embedded?: boolean; // If used inside CustomerPortal as a tab
  initialLocation?: string;
}

export default function TourPortal({ currentUser, onUpdateUser, embedded = false, initialLocation }: TourPortalProps) {
  // Utility to map location string to region
  const mapPropToRegion = (loc?: string): string => {
    if (!loc || loc === 'All Locations') return 'All';
    const normalized = loc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('phu quoc')) return 'Phú Quốc';
    if (normalized.includes('sapa')) return 'Sapa';
    if (normalized.includes('ha long') || normalized.includes('quang ninh')) return 'Vịnh Hạ Long';
    if (normalized.includes('hue')) return 'Huế';
    if (normalized.includes('quang binh')) return 'Quảng Bình';
    return 'All';
  };

  // State initialization with Local Storage Sync
  const [tours, setTours] = useState<Tour[]>(() => {
    const saved = localStorage.getItem('gs_tours_list');
    return saved ? JSON.parse(saved) : INITIAL_TOURS;
  });

  const [groups, setGroups] = useState<GroupTour[]>(() => {
    const saved = localStorage.getItem('gs_group_tours');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [bookings, setBookings] = useState<TourBooking[]>(() => {
    const saved = localStorage.getItem('gs_tour_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // State Persistence Effect
  useEffect(() => {
    localStorage.setItem('gs_tours_list', JSON.stringify(tours));
  }, [tours]);

  useEffect(() => {
    localStorage.setItem('gs_group_tours', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('gs_tour_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // View States
  const [activeSubTab, setActiveSubTab] = useState<'tours' | 'groups' | 'my-bookings'>('tours');
  const [selectedRegion, setSelectedRegion] = useState<string>(() => mapPropToRegion(initialLocation));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync initialLocation prop to selectedRegion
  useEffect(() => {
    if (initialLocation) {
      setSelectedRegion(mapPropToRegion(initialLocation));
    }
  }, [initialLocation]);

  // Booking & Group Modals State
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [modalType, setModalType] = useState<'book' | 'create_group' | 'join_group' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupTour | null>(null);
  
  // Tour Filter & Details State
  const [selectedType, setSelectedType] = useState<'all' | 'day' | 'multi'>('all');
  const [selectedDetailTour, setSelectedDetailTour] = useState<Tour | null>(null);

  // Form states
  const [bookingSlots, setBookingSlots] = useState<number>(1);
  const [targetGroupSlots, setTargetGroupSlots] = useState<number>(6);
  const [guestName, setGuestName] = useState<string>(currentUser.name);
  const [guestPhone, setGuestPhone] = useState<string>(currentUser.phone);
  const [guestEmail, setGuestEmail] = useState<string>(currentUser.email);
  const [bookingDate, setBookingDate] = useState<string>('2026-07-05');

  // Payment states (SePay holding simulator)
  const [paymentMethod, setPaymentMethod] = useState<'sepay' | 'stripe'>('sepay');
  const [paymentStep, setPaymentStep] = useState<'form' | 'hold' | 'success'>('form');
  const [holdTimer, setHoldTimer] = useState<number>(180); // 3 minutes
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Success Notification state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // List of regions for filter
  const regions = ['All', 'Vịnh Hạ Long', 'Sapa', 'Quảng Bình', 'Phú Quốc', 'Huế'];

  // Currency utility
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Setup hold countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'hold' && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer(prev => prev - 1);
      }, 1000);
    } else if (holdTimer === 0 && paymentStep === 'hold') {
      setPaymentStep('form');
      alert('Hết thời gian giao dịch giữ chỗ! Vui lòng thao tác lại.');
    }
    return () => clearInterval(interval);
  }, [paymentStep, holdTimer]);

  const handleOpenBooking = (tour: Tour, type: 'book' | 'create_group') => {
    setSelectedTour(tour);
    setModalType(type);
    setBookingSlots(1);
    setPaymentStep('form');
    setGeneratedCode(`GS-TOUR-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleOpenJoinGroup = (group: GroupTour) => {
    const tour = tours.find(t => t.id === group.tourId);
    if (!tour) return;
    setSelectedTour(tour);
    setSelectedGroup(group);
    setModalType('join_group');
    setBookingSlots(1);
    setPaymentStep('form');
    setGeneratedCode(`GS-JOIN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Handle transaction confirmation trigger
  const handleStartPayment = () => {
    setHoldTimer(180);
    setPaymentStep('hold');
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentStep('success');

      // 1. Process Booking data
      const finalPrice = (selectedTour?.pricePerSlot || 0) * bookingSlots;
      const newBooking: TourBooking = {
        id: `TB-${Math.floor(10000 + Math.random() * 90000)}`,
        tourId: selectedTour!.id,
        tourName: selectedTour!.name,
        image: selectedTour!.image,
        guestName,
        guestPhone,
        guestEmail,
        slots: bookingSlots,
        totalPrice: finalPrice,
        bookingCode: generatedCode,
        status: 'Confirmed',
        isGroupTour: modalType === 'create_group' || modalType === 'join_group',
        groupId: selectedGroup?.id || undefined,
        date: bookingDate,
        paymentMethod,
        cardNumberLast4: paymentMethod === 'stripe' ? '4242' : undefined
      };

      setBookings(prev => [newBooking, ...prev]);

      // 2. Adjust Tour slot occupancy
      setTours(prev => prev.map(t => {
        if (t.id === selectedTour!.id) {
          const updatedBooked = Math.min(t.maxSlots, t.bookedSlots + bookingSlots);
          return { ...t, bookedSlots: updatedBooked };
        }
        return t;
      }));

      // 3. Update or Create matching groups
      if (modalType === 'create_group') {
        const newGroup: GroupTour = {
          id: `G-${Math.floor(1000 + Math.random() * 9000)}`,
          tourId: selectedTour!.id,
          tourName: selectedTour!.name,
          creatorName: guestName,
          creatorEmail: guestEmail,
          currentMembers: bookingSlots,
          requiredMembers: targetGroupSlots,
          status: bookingSlots >= targetGroupSlots ? 'matched' : 'matching',
          members: [`${guestName} (${bookingSlots} chỗ)`],
          date: bookingDate
        };
        setGroups(prev => [newGroup, ...prev]);
        setSuccessMessage(`Nhóm ghép mới của bạn đã được tạo thành công trên hệ thống!\nTỷ lệ ghép hiện tại: ${bookingSlots}/${targetGroupSlots} chỗ.`);
      } else if (modalType === 'join_group' && selectedGroup) {
        setGroups(prev => prev.map(g => {
          if (g.id === selectedGroup.id) {
            const nextMembers = g.currentMembers + bookingSlots;
            const updatedStatus = nextMembers >= g.requiredMembers ? 'matched' : 'matching';
            return {
              ...g,
              currentMembers: nextMembers,
              status: updatedStatus,
              members: [...g.members, `${guestName} (${bookingSlots} chỗ)`]
            };
          }
          return g;
        }));
        setSuccessMessage(`Bạn đã tham gia nhóm ghép thành công!\nGóp thêm ${bookingSlots} chỗ vào hành trình cùng đoàn.`);
      } else {
        setSuccessMessage(`Đặt chỗ tour du lịch thành công!\nMã vé điện tử: ${generatedCode}.\nChúng tôi đã gửi lịch trình chi tiết về email ${guestEmail}.`);
      }

      // Award loyalty points simulator
      if (onUpdateUser) {
        const earnedPoints = Math.floor(finalPrice / 10000); // 1 point for every 10k VND
        const updatedUser = {
          ...currentUser,
          loyaltyPoints: (currentUser.loyaltyPoints || 0) + earnedPoints
        };
        onUpdateUser(updatedUser);
      }
    }, 1500);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt vé tour này? Hoàn tiền sẽ tự động xử lý.')) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
      alert('Đã hủy đặt chỗ tour du lịch thành công. Số tiền đã được hoàn trả về phương thức thanh toán gốc.');
    }
  };

  // Filters logic
  const filteredTours = tours.filter(t => {
    const matchesRegion = selectedRegion === 'All' || t.region === selectedRegion;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isMultiDay = t.tourType === 'multi' || (t.duration && (t.duration.toLowerCase().includes('ngày') && !t.duration.toLowerCase().includes('nửa ngày') && !t.duration.toLowerCase().includes('1 ngày')));
    const actualType = isMultiDay ? 'multi' : 'day';
    const matchesType = selectedType === 'all' || actualType === selectedType;

    return matchesRegion && matchesSearch && matchesType;
  });

  const filteredGroups = groups.filter(g => {
    const tour = tours.find(t => t.id === g.tourId);
    if (!tour) return false;
    const matchesRegion = selectedRegion === 'All' || tour.region === selectedRegion;
    const matchesSearch = g.tourName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div id="tour-portal" className={`w-full font-sans ${embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}`}>
      
      {/* Premium Header Accent */}
      {!embedded && (
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
            GRANDSTAY EXPERIENCES & TOURS
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trải Nghiệm Độc Bản & Tour Du Lịch Ghép</h2>
          <p className="text-slate-500 text-sm font-light max-w-2xl mt-1">
            Kết nối những hành trình hoàn mỹ nhất tại các địa danh nghỉ dưỡng hàng đầu. Tiết kiệm chi phí, mở rộng kết nối thông qua dịch vụ Tour Ghép chủ động 5 sao.
          </p>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-slate-100 pb-5 mb-8">
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-2xl w-full lg:w-max overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveSubTab('tours')}
            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'tours' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>Danh Sách Tour</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('groups')}
            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'groups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Nhóm Tour Ghép ({groups.filter(g => g.status === 'matching').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my-bookings')}
            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'my-bookings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-500" />
            <span>Tour Của Tôi ({bookings.length})</span>
          </button>
        </div>

        {/* Unified Search & Quick Filter */}
        {activeSubTab !== 'my-bookings' && (
          <div className="flex flex-col md:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm hành trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-medium text-slate-800"
              />
            </div>
            
            <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
              {regions.map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer ${
                    selectedRegion === reg 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {reg === 'All' ? 'Tất cả vùng' : reg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CORE DISPLAY DECISION ENGINE */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: TOURS DISCOVER */}
        {activeSubTab === 'tours' && (
          <motion.div
            key="tours-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Tour Type Sub-Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 border border-slate-100 p-4 rounded-3xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span>Phân loại hành trình:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'Tất cả tour', count: tours.length },
                  { 
                    value: 'day', 
                    label: 'Tour trong ngày', 
                    count: tours.filter(t => !(t.tourType === 'multi' || (t.duration && t.duration.toLowerCase().includes('ngày') && !t.duration.toLowerCase().includes('nửa ngày') && !t.duration.toLowerCase().includes('1 ngày')))).length 
                  },
                  { 
                    value: 'multi', 
                    label: 'Tour dài ngày', 
                    count: tours.filter(t => (t.tourType === 'multi' || (t.duration && t.duration.toLowerCase().includes('ngày') && !t.duration.toLowerCase().includes('nửa ngày') && !t.duration.toLowerCase().includes('1 ngày')))).length 
                  }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedType === type.value
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                      selectedType === type.value ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{type.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {filteredTours.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                <h4 className="font-bold text-slate-600 text-sm">Không tìm thấy tour du lịch phù hợp</h4>
                <p className="text-slate-400 text-xs mt-1">Vui lòng thử bộ lọc khu vực khác, loại tour khác hoặc tìm kiếm cụm từ khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => {
                  const spotsLeft = tour.maxSlots - tour.bookedSlots;
                  const percentBooked = (tour.bookedSlots / tour.maxSlots) * 100;
                  const isMultiDay = tour.tourType === 'multi' || (tour.duration && (tour.duration.toLowerCase().includes('ngày') && !tour.duration.toLowerCase().includes('nửa ngày') && !tour.duration.toLowerCase().includes('1 ngày')));
                  const tourTypeLabel = isMultiDay ? 'Tour dài ngày' : 'Tour trong ngày';
                  const tourTypeColor = isMultiDay ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' : 'bg-teal-50 text-teal-700 border-teal-100/50';

                  return (
                    <div 
                      key={tour.id}
                      id={`tour-card-${tour.id}`}
                      className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full"
                    >
                      {/* Photo Banner */}
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={tour.image} 
                          alt={tour.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        
                        {/* Badge region */}
                        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          {tour.region}
                        </span>

                        {/* Left spots counter */}
                        <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                          spotsLeft <= 3 
                            ? 'bg-rose-500 text-white animate-pulse' 
                            : 'bg-slate-950/70 text-brand-gold backdrop-blur-sm'
                        }`}>
                          Còn {spotsLeft}/{tour.maxSlots} chỗ trống
                        </span>

                        {/* Title inside shadow */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest block mb-0.5">Trải nghiệm 5 sao</span>
                          <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight line-clamp-2">
                            {tour.name}
                          </h3>
                        </div>
                      </div>

                      {/* Body & Highlights */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                              Thời gian: {tour.duration}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tourTypeColor}`}>
                              {tourTypeLabel}
                            </span>
                          </div>

                          <p className="text-slate-500 text-xs font-light leading-relaxed line-clamp-3">
                            {tour.description}
                          </p>

                          {/* Highlights lists */}
                          <div className="space-y-1 pt-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Điểm nhấn nổi bật:</span>
                            {tour.highlights.slice(0, 3).map((hl, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{hl}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress occupancy bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span>Đã được đặt: {percentBooked.toFixed(0)}%</span>
                            <span>Giới hạn: {tour.maxSlots} khách</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percentBooked >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${percentBooked}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive View Details Action */}
                        <button
                          onClick={() => setSelectedDetailTour(tour)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>Xem Lịch Trình Chi Tiết</span>
                        </button>

                        {/* Bottom Pricing & Actions */}
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Giá mỗi vé chỗ</span>
                              <span className="text-base font-black text-slate-900 font-mono">{formatVND(tour.pricePerSlot)}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Đón rước VIP</span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">Miễn phí</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Group match trigger */}
                            <button
                              onClick={() => handleOpenBooking(tour, 'create_group')}
                              className="px-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Tạo nhóm ghép để rủ thêm người đi cùng, chia sẻ chi phí"
                            >
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Tạo Nhóm Ghép</span>
                            </button>

                            <button
                              onClick={() => handleOpenBooking(tour, 'book')}
                              disabled={spotsLeft <= 0}
                              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs transition-colors cursor-pointer text-center truncate"
                            >
                              {spotsLeft <= 0 ? 'Hết chỗ' : 'Đặt ngay'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: ACTIVE MATCHING GROUPS */}
        {activeSubTab === 'groups' && (
          <motion.div
            key="groups-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            {/* Visual alert container */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1 relative z-10">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                  💡 Lợi ích vượt trội
                </span>
                <h4 className="font-extrabold text-base sm:text-lg">Tham gia "Tour Ghép" - Gặp gỡ đoàn hữu, giảm 20% chi phí</h4>
                <p className="text-white/80 text-xs font-light max-w-xl">
                  Khi ghép thành công đủ số lượng thành viên tối thiểu, hệ thống sẽ tự động gửi khuyến mãi hoàn trả 20% vào ví điểm thưởng cho toàn bộ khách hàng tham gia.
                </p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-2 relative z-10 font-mono text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Hoàn 20% Điểm Hội Viên</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGroups.map(group => {
                const tourDetail = tours.find(t => t.id === group.tourId);
                const progressPercent = (group.currentMembers / group.requiredMembers) * 100;
                const neededCount = group.requiredMembers - group.currentMembers;

                return (
                  <div 
                    key={group.id}
                    id={`group-card-${group.id}`}
                    className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col justify-between space-y-5 hover:border-emerald-200 transition-colors"
                  >
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Đang ghép đoàn tích cực
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Khởi hành: {group.date}</span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                        {group.tourName}
                      </h4>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-slate-600">
                          {group.creatorName[0]}
                        </div>
                        <span className="text-slate-500">
                          Trưởng nhóm: <strong className="text-slate-800">{group.creatorName}</strong>
                        </span>
                      </div>

                      {/* Display current members list chips */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Thành viên tham gia:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.members.map((member, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1 font-medium"
                            >
                              <User className="w-3 h-3 text-slate-400" />
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress Matching Indicator */}
                    <div className="space-y-2 border-t border-slate-50 pt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Tiến độ gom chỗ:</span>
                        <span className="font-extrabold text-slate-800 font-mono">
                          {group.currentMembers}/{group.requiredMembers} chỗ ({progressPercent.toFixed(0)}%)
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] pt-1.5">
                        <span className="text-slate-400 font-light">Giá tour gốc: <strong>{formatVND(tourDetail?.pricePerSlot || 0)}</strong>/người</span>
                        <span className="text-rose-500 font-bold flex items-center gap-0.5">
                          🔥 Cần thêm {neededCount} người để đi đoàn!
                        </span>
                      </div>
                    </div>

                    {/* Join button Action */}
                    <button
                      onClick={() => handleOpenJoinGroup(group)}
                      disabled={neededCount <= 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Tham gia ghép đoàn cùng {group.creatorName}</span>
                    </button>
                  </div>
                );
              })}

              {filteredGroups.length === 0 && (
                <div className="col-span-full text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-600 text-sm">Không tìm thấy nhóm ghép nào</h4>
                  <p className="text-slate-400 text-xs mt-1">Chọn nút "Tạo Nhóm Ghép" bên trang Danh Sách Tour để khởi xướng một hành trình du ngoạn mới.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: USER'S PERSONAL TOUR BOOKINGS */}
        {activeSubTab === 'my-bookings' && (
          <motion.div
            key="my-bookings-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
                <span className="text-4xl block mb-2">🎟️</span>
                <h4 className="font-bold text-slate-800 text-sm">Chưa có lịch trình đặt Tour nào</h4>
                <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
                  Bạn có thể lựa chọn các hoạt động giải trí, lặn biển ngắm san hô hoặc đặt du thuyền vịnh Hạ Long để kỳ nghỉ GrandStay thêm trọn vẹn.
                </p>
                <button
                  onClick={() => setActiveSubTab('tours')}
                  className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Khám phá danh sách Tour
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((book) => (
                  <div 
                    key={book.id}
                    className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 mx-auto sm:mx-0">
                        <img 
                          src={book.image} 
                          alt={book.tourName} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap justify-start">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            book.status === 'Cancelled' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {book.status === 'Cancelled' ? 'Đã hủy' : 'Đã xác nhận'}
                          </span>
                          {book.isGroupTour && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5">
                              <Users className="w-3 h-3 text-indigo-500" />
                              Vé ghép đoàn
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">{book.tourName}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">📅 Ngày đi: <strong>{book.date}</strong></span>
                          <span>👥 Số khách: <strong>{book.slots} chỗ</strong></span>
                          <span className="font-mono text-blue-600 font-bold">Mã vé: {book.bookingCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-none pt-4 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase leading-none">Tổng thanh toán:</span>
                        <span className="text-sm sm:text-base font-black text-slate-800 font-mono">{formatVND(book.totalPrice)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {book.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(book.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all border border-rose-200 cursor-pointer"
                          >
                            Hủy vé
                          </button>
                        )}
                        <button
                          onClick={() => {
                            alert(`VÉ ĐIỆN TỬ TOUR GRANDSTAY\n\nMã vé: ${book.bookingCode}\nKhách hàng: ${book.guestName}\nSố chỗ: ${book.slots} người\nNgày trải nghiệm: ${book.date}\nTrạng thái: ${book.status}\n\nVui lòng đưa mã vé này cho hướng dẫn viên du lịch tại sảnh khách sạn đón tiễn.`);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Xem vé</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL 1: BOOKING & SEPAY SIMULATOR */}
      <AnimatePresence>
        {selectedTour && modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedTour(null);
                setModalType(null);
              }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Panel Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 z-10 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => {
                  setSelectedTour(null);
                  setModalType(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentStep === 'form' && (
                <div className="space-y-5 text-left">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest block w-max">
                      {modalType === 'create_group' ? 'Khởi tạo nhóm ghép đoàn' : modalType === 'join_group' ? 'Tham gia ghép đoàn cùng bạn đồng hành' : 'Đặt vé trực tiếp 5 sao'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                      {modalType === 'create_group' ? 'Thủ Tục Khởi Tạo Tour Ghép' : modalType === 'join_group' ? 'Xác Nhận Đóng Góp Chỗ Ghép' : 'Thủ Tục Đăng Ký Slot Vé Tour'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Tour: <strong className="text-slate-700">{selectedTour.name}</strong></p>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Họ tên khách hàng</label>
                        <input 
                          type="text" 
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Số điện thoại liên hệ</label>
                        <input 
                          type="tel" 
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="0912xxxxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ngày tham quan</label>
                        <input 
                          type="date" 
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min="2026-06-30"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Địa chỉ email</label>
                        <input 
                          type="email" 
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>

                    {/* Numeric Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Số lượng chỗ của bạn:</span>
                        <span className="block text-[10px] text-slate-400">Giá {formatVND(selectedTour.pricePerSlot)}/vé</span>
                      </div>
                      <div className="flex items-center justify-start sm:justify-end gap-3.5">
                        <button 
                          type="button"
                          onClick={() => setBookingSlots(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-bold text-slate-800">{bookingSlots}</span>
                        <button 
                          type="button"
                          onClick={() => setBookingSlots(prev => Math.min(selectedTour.maxSlots - selectedTour.bookedSlots, prev + 1))}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* If CREATING A GROUP */}
                    {modalType === 'create_group' && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider block">Cấu hình mục tiêu nhóm ghép:</span>
                        <div className="flex items-center justify-between text-xs">
                          <span>Số lượng người tối thiểu cần ghép để giảm giá:</span>
                          <select 
                            value={targetGroupSlots} 
                            onChange={(e) => setTargetGroupSlots(Number(e.target.value))}
                            className="bg-white border border-emerald-200 rounded-lg p-1 text-xs font-bold focus:outline-none text-slate-800"
                          >
                            <option value="4">4 Người</option>
                            <option value="6">6 Người</option>
                            <option value="8">8 Người</option>
                            <option value="10">10 Người</option>
                            <option value="12">12 Người</option>
                          </select>
                        </div>
                        <p className="text-[10px] leading-relaxed opacity-90 font-light">
                          * Khách hàng tham gia các nhóm ghép khác sẽ nộp tiền mua slot và gom cùng chuyến đi của bạn. Khi gom đủ sĩ số tối thiểu, ưu đãi hoàn tiền 20% sẽ lập tức có hiệu lực!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment method selection */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn phương thức thanh toán giữ vé</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div 
                        onClick={() => setPaymentMethod('sepay')}
                        className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                          paymentMethod === 'sepay' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-800">Cổng Tự Động SePay</span>
                        <span className="block text-[10px] text-slate-400 mt-1 leading-normal">Chuyển khoản QR ngân hàng thông minh tích hợp kiểm tra tức thì</span>
                      </div>
                      <div 
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                          paymentMethod === 'stripe' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-800">Thẻ Quốc Tế Stripe</span>
                        <span className="block text-[10px] text-slate-400 mt-1 leading-normal">Hỗ trợ Visa, Mastercard, Apple Pay bảo mật PCI-DSS</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing summary */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Tổng thanh toán:</span>
                      <span className="text-xl font-black text-slate-900 font-mono">
                        {formatVND(selectedTour.pricePerSlot * bookingSlots)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartPayment}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tiến hành thanh toán</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'hold' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">Giao Dịch Giữ Chỗ Đang Chờ Thanh Toán</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-light">
                      Chúng tôi đang tạm giữ <strong className="text-slate-800 font-bold">{bookingSlots} chỗ trong tour</strong> trong vòng <strong className="text-blue-600 font-mono font-bold">{Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, '0')}</strong> phút để chờ bạn thanh toán.
                    </p>
                  </div>

                  {paymentMethod === 'sepay' ? (
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4 max-w-sm mx-auto text-left">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 text-xs">
                        <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                        <strong className="text-slate-800 font-bold">MB Bank (Quân Đội)</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 text-xs">
                        <span className="text-slate-400">Số tài khoản:</span>
                        <strong className="text-slate-800 font-mono font-bold">9988 2026 8888</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 text-xs">
                        <span className="text-slate-400">Số tiền chuyển:</span>
                        <strong className="text-rose-600 font-mono font-extrabold">{formatVND(selectedTour.pricePerSlot * bookingSlots)}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Nội dung cú pháp chuyển:</span>
                        <span className="bg-amber-100 text-amber-800 font-mono font-extrabold px-1.5 py-0.5 rounded text-[11px] border border-amber-200 uppercase">
                          {generatedCode}
                        </span>
                      </div>

                      {/* Fake simulated QR */}
                      <div className="w-36 h-36 bg-white border border-slate-200 rounded-2xl mx-auto flex flex-col justify-center items-center p-2 relative">
                        <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-2xs rounded-2xl flex items-center justify-center p-1">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://grandstay.sepay.vn" 
                            alt="QR thanh toán MB Bank"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 block text-center leading-normal">
                        * Quét mã QR bằng ứng dụng ngân hàng bất kỳ để tự động điền thông tin và cú pháp chuyển tiền.
                      </span>
                    </div>
                  ) : (
                    // Stripe visual simulator
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-3.5 max-w-sm mx-auto text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Thông tin thẻ Visa/Mastercard</span>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Số thẻ bảo mật</label>
                          <input 
                            type="text" 
                            defaultValue="4242 •••• •••• 4242"
                            disabled
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-mono text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Hạn dùng (MM/YY)</label>
                            <input 
                              type="text" 
                              defaultValue="12/28" 
                              disabled 
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-mono text-xs font-bold text-slate-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Mã CVC</label>
                            <input 
                              type="text" 
                              defaultValue="***" 
                              disabled 
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-mono text-xs font-bold text-slate-700" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions to verify */}
                  <div className="flex gap-2 max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('form')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyPayment}
                      disabled={isVerifying}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Đang kiểm duyệt...</span>
                        </>
                      ) : (
                        <span>Xác nhận đã chuyển</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center space-y-5 py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Giao Dịch Thành Công!</h4>
                    <p className="text-slate-400 text-xs">Mã giao dịch xác minh: {generatedCode}</p>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line max-w-sm mx-auto">
                    {successMessage || "Hệ thống đã khớp giao dịch chuyển khoản thông minh tự động. Chúng tôi đang chuẩn bị dịch vụ đón rước và lịch trình tham quan chi tiết gửi tới điện thoại của bạn."}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedTour(null);
                      setModalType(null);
                      setActiveSubTab('my-bookings');
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Xem lịch trình vé của tôi
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* DETAILED TOUR ITINERARY MODAL */}
        {selectedDetailTour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailTour(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailTour(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Body Scroll Container */}
              <div className="overflow-y-auto flex-1 scrollbar-none">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  {/* Left Column: Cover & Quick Stats */}
                  <div className="lg:col-span-2 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-5">
                      {/* Tour Image */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-md">
                        <img
                          src={selectedDetailTour.image}
                          alt={selectedDetailTour.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                        <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                          {selectedDetailTour.region}
                        </span>
                      </div>

                      {/* Title & Badge */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(() => {
                            const isMulti = selectedDetailTour.tourType === 'multi' || (selectedDetailTour.duration && (selectedDetailTour.duration.toLowerCase().includes('ngày') && !selectedDetailTour.duration.toLowerCase().includes('nửa ngày') && !selectedDetailTour.duration.toLowerCase().includes('1 ngày')));
                            const label = isMulti ? 'Tour dài ngày' : 'Tour trong ngày';
                            const color = isMulti ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-teal-50 text-teal-700 border-teal-100';
                            return (
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>
                                {label}
                              </span>
                            );
                          })()}
                          <span className="text-slate-800 font-bold text-xs flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {selectedDetailTour.rating}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {selectedDetailTour.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-slate-500 text-xs font-light leading-relaxed">
                        {selectedDetailTour.description}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-2 bg-white rounded-2xl p-4 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Điểm nhấn chuyến đi:</span>
                        <div className="space-y-2">
                          {selectedDetailTour.highlights.map((hl, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Block */}
                    <div className="pt-4 border-t border-slate-200/60 space-y-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock className="w-4 h-4" /> Thời lượng:
                        </span>
                        <span>{selectedDetailTour.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <Users className="w-4 h-4" /> Chỗ tối đa:
                        </span>
                        <span>{selectedDetailTour.maxSlots} khách/đoàn</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <DollarSign className="w-4 h-4" /> Giá trọn gói:
                        </span>
                        <span className="font-mono text-slate-900 font-black text-sm">{formatVND(selectedDetailTour.pricePerSlot)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Itinerary Timeline */}
                  <div className="lg:col-span-3 p-6 sm:p-8 space-y-6">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest block mb-0.5">Chương trình chi tiết</span>
                      <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Lịch Trình Từng Ngày</h4>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {(() => {
                        const itineraryData = (() => {
                          if (selectedDetailTour.itinerary && selectedDetailTour.itinerary.length > 0) {
                            return selectedDetailTour.itinerary;
                          }
                          // Fallback logic
                          const isMulti = selectedDetailTour.tourType === 'multi' || (selectedDetailTour.duration && (selectedDetailTour.duration.toLowerCase().includes('ngày') && !selectedDetailTour.duration.toLowerCase().includes('nửa ngày') && !selectedDetailTour.duration.toLowerCase().includes('1 ngày')));
                          if (isMulti) {
                            return [
                              {
                                day: "Ngày 1",
                                title: "Khởi hành & Nhận phòng nghỉ dưỡng",
                                activities: [
                                  "Đón quý khách tại điểm hẹn và di chuyển đến resort nghỉ dưỡng đẳng cấp.",
                                  "Làm thủ tục check-in phòng nghỉ dưỡng, nghỉ ngơi sau chuyến đi.",
                                  "Thưởng thức tiệc trà chiều hoàng hôn nhẹ nhàng.",
                                  "Dùng bữa tối hải sản phong phú tại nhà hàng sang trọng."
                                ]
                              },
                              {
                                day: "Ngày 2",
                                title: "Khám phá danh lam & Hoạt động tập thể",
                                activities: [
                                  "Dùng bữa sáng buffet bổ dưỡng tại nhà hàng resort.",
                                  "Khám phá các quần thể di sản kì vĩ bằng xe ô tô du lịch riêng.",
                                  "Tham quan lặn ngắm san hô tự nhiên, chèo thuyền kayak mạo hiểm.",
                                  "Tiệc tối BBQ hải sản ngoài bãi biển lãng mạn dạt dào sóng vỗ."
                                ]
                              },
                              {
                                day: "Ngày 3",
                                title: "Mua sắm đặc sản địa phương - Trở về Hà Nội/Điểm đón",
                                activities: [
                                  "Tự do tắm biển đón bình minh sáng sớm sảng khoái.",
                                  "Ăn sáng và dạo bộ mua sắm sâm, yến, chả cá hoặc đặc sản địa phương.",
                                  "Trả phòng và xe đón đưa đoàn trở lại điểm hẹn lúc ban đầu an toàn."
                                ]
                              }
                            ];
                          } else {
                            return [
                              {
                                day: "Cả Ngày",
                                title: "Trải nghiệm đặc sản & Hoạt động vui chơi giải trí",
                                activities: [
                                  "Đón quý khách tại khách sạn bắt đầu tour trải nghiệm.",
                                  "Tản bộ tham quan các kỳ quan, thắng cảnh tự nhiên nổi trội nhất.",
                                  "Thưởng thức bữa trưa đậm đà mang dấu ấn ẩm thực làng quê.",
                                  "Ngắm hoàng hôn lãng mạn, thả hoa đăng hoặc xem ca nhạc nghệ thuật.",
                                  "Trả khách về điểm đón ban đầu và gửi lời chúc tốt đẹp nhất."
                                ]
                              }
                            ];
                          }
                        })();

                        return itineraryData.map((item, index) => (
                          <div key={index} className="flex gap-4 relative">
                            {/* Marker Icon */}
                            <div className="w-7.5 h-7.5 rounded-full bg-indigo-50 border-2 border-indigo-500 text-indigo-600 flex items-center justify-center font-black text-[10px] font-mono shrink-0 z-10 shadow-sm">
                              {index + 1}
                            </div>
                            
                            {/* Itinerary content block */}
                            <div className="space-y-2 flex-1 pt-0.5 text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-600 text-white rounded font-mono uppercase">
                                  {item.day}
                                </span>
                                <h5 className="text-xs sm:text-sm font-extrabold text-slate-800">
                                  {item.title}
                                </h5>
                              </div>

                              <div className="space-y-1.5 pl-1.5 border-l border-indigo-100">
                                {item.activities.map((act, actIdx) => (
                                  <div key={actIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed font-light">
                                    <span className="text-indigo-500 select-none mt-0.5 shrink-0 font-bold">•</span>
                                    <span>{act}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Direct Booking Shortcuts inside modal */}
                    <div className="bg-indigo-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md mt-6">
                      <div className="text-center sm:text-left space-y-1">
                        <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest block">Thích lịch trình này?</span>
                        <p className="text-xs font-light text-slate-200">Đặt ngay để được hưởng bảo hiểm du lịch & đưa đón VIP miễn phí!</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => {
                            const tour = selectedDetailTour;
                            setSelectedDetailTour(null);
                            handleOpenBooking(tour, 'create_group');
                          }}
                          className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Tạo Nhóm Ghép</span>
                        </button>

                        <button
                          onClick={() => {
                            const tour = selectedDetailTour;
                            setSelectedDetailTour(null);
                            handleOpenBooking(tour, 'book');
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs transition-colors cursor-pointer text-center shadow-md"
                        >
                          Đặt Tour Ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
