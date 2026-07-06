import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Sparkles, 
  Calendar, 
  Ticket, 
  FileText, 
  CheckCircle2, 
  QrCode, 
  Award, 
  Gift, 
  Copy, 
  Check, 
  MapPin, 
  CreditCard, 
  ExternalLink,
  Phone,
  Mail,
  X,
  Plus,
  Home,
  Star,
  Camera,
  ShieldCheck,
  RefreshCw,
  Info,
  AlertTriangle,
  Compass,
  Users
} from 'lucide-react';
import { Branch, UserSim } from '../types';
import { formatVND } from '../data';
import GuestReview from './GuestReview';
import { getTierInfo } from '../utils/loyalty';
import OnlineCheckIn, { CheckInDocumentData } from './OnlineCheckIn';
import TourPortal from './TourPortal';

interface CustomerPortalProps {
  bookedList: Branch[];
  onBackToHome: () => void;
  currentUser: UserSim;
  onUpdateUser: (updatedUser: UserSim) => void;
  onUpdateBookedList?: (updatedList: Branch[]) => void;
}

interface Contract {
  id: string;
  aptName: string;
  location: string;
  monthlyPrice: number;
  leaseTerm: number;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  signedDate: string;
}

export const DEFAULT_REFUND_POLICY_SETTINGS = {
  title: "Chính Sách Đổi Trả & Hoàn Tiền",
  subtitle: "Cam kết minh bạch, bảo vệ tối đa quyền lợi của quý khách hàng và chuẩn hóa thủ tục hoàn tiền tự động trong 1-3 ngày làm việc.",
  policies: [
    {
      percentage: 100,
      timeframe: "TRƯỚC 3 NGÀY (72H)",
      title: "Miễn Phí Huỷ Phòng",
      description: "Hoàn tiền 100% giá trị đặt phòng, không thu bất kỳ khoản phí phụ thu nào. Áp dụng cho mọi hình thức thanh toán."
    },
    {
      percentage: 50,
      timeframe: "1 - 3 NGÀY (24H - 72H)",
      title: "Huỷ Muộn Trả Phí",
      description: "Hoàn tiền 50% giá trị đặt phòng. 50% còn lại được khấu trừ cho chi phí giữ phòng & cơ hội phục vụ khách hàng khác."
    },
    {
      percentage: 0,
      timeframe: "DƯỚI 24 TIẾNG / NO-SHOW",
      title: "Không Hoàn Lại",
      description: "Thu phí 100% giá trị đặt phòng. Không áp dụng chính sách hoàn trả trừ trường hợp bất khả kháng được xác nhận từ địa phương."
    }
  ],
  modificationTerms: [
    "Hỗ trợ thay đổi ngày check-in, check-out hoàn toàn miễn phí trước 24 giờ.",
    "Phòng mới sau khi thay đổi sẽ áp dụng biểu giá hiện hành tại thời điểm đổi lịch.",
    "Trong trường hợp phòng mới có giá trị thấp hơn phòng cũ, số dư chênh lệch sẽ được tích lũy vào tài khoản ví điểm thưởng của hội viên.",
    "Không giới hạn số lần thay đổi đối với hội viên hạng Gold và Diamond."
  ],
  forceMajeureTerms: [
    "Khách hàng được giải quyết hủy phòng miễn phí 100% bất kể mốc thời gian trong trường hợp có thiên tai, dịch bệnh, hoặc lệnh hạn chế di chuyển từ chính quyền địa phương.",
    "Trường hợp gặp sự cố y tế đột xuất của cá nhân, vui lòng cung cấp giấy xác nhận sức khỏe từ cơ sở y tế có thẩm quyền để bộ phận lễ tân xét duyệt đặc cách hoàn phí 100%."
  ]
};

export default function CustomerPortal({ bookedList, onBackToHome, currentUser, onUpdateUser, onUpdateBookedList }: CustomerPortalProps) {
  const [refundPolicySettings, setRefundPolicySettings] = useState(() => {
    const saved = localStorage.getItem('gs_refund_policies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return DEFAULT_REFUND_POLICY_SETTINGS;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('gs_refund_policies');
      if (saved) {
        try {
          setRefundPolicySettings(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener('refund_policies_updated', handleUpdate);
    return () => {
      window.removeEventListener('refund_policies_updated', handleUpdate);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'vouchers' | 'contracts' | 'policies' | 'tours'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimedBonus, setClaimedBonus] = useState(false);
  const [points, setPoints] = useState(currentUser.loyaltyPoints || 0);
  const tierInfo = getTierInfo(points);
  const [showQrModal, setShowQrModal] = useState<string | null>(null);
  const [showContractDetail, setShowContractDetail] = useState<Contract | any | null>(null);
  const [customContracts, setCustomContracts] = useState<Contract[]>([]);
  const [activeReviewBranch, setActiveReviewBranch] = useState<{ id: string, name: string } | null>(null);

  const handleReviewAddedFromPortal = (branchId: string, newReview: any) => {
    try {
      const savedBranches = localStorage.getItem('gs_branches_data');
      if (savedBranches) {
        const branches = JSON.parse(savedBranches) as Branch[];
        const updatedBranches = branches.map(b => {
          if (b.id === branchId) {
            const currentReviewsCount = b.reviews || 0;
            const currentRating = b.rating || 5.0;
            const newReviewsCount = currentReviewsCount + 1;
            const newRating = Number(((currentRating * currentReviewsCount + newReview.rating) / newReviewsCount).toFixed(1));
            return {
              ...b,
              reviews: newReviewsCount,
              rating: newRating
            };
          }
          return b;
        });
        localStorage.setItem('gs_branches_data', JSON.stringify(updatedBranches));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Profile fields (can be updated!)
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Cancellation and Modification request states
  const [selectedBookingForPolicy, setSelectedBookingForPolicy] = useState<number | null>(null);
  const [policyModalType, setPolicyModalType] = useState<'cancel' | 'modify' | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundBankName, setRefundBankName] = useState('Vietcombank');
  const [refundBankAccount, setRefundBankAccount] = useState('');
  const [refundBankOwner, setRefundBankOwner] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [policySuccessMsg, setPolicySuccessMsg] = useState<string | null>(null);

  // Online Check-in states
  const [activeCheckInBooking, setActiveCheckInBooking] = useState<any | null>(null);
  const [viewCheckedInDoc, setViewCheckedInDoc] = useState<CheckInDocumentData | null>(null);
  const [checkedInDocs, setCheckedInDocs] = useState<{ [bookingId: string]: CheckInDocumentData }>(() => {
    try {
      const stored = localStorage.getItem('gs_online_checkins');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleCompleteCheckIn = (data: CheckInDocumentData) => {
    if (!activeCheckInBooking) return;
    const bookingId = activeCheckInBooking.id || `CONF-${activeCheckInBooking.name}`;
    const updated = {
      ...checkedInDocs,
      [bookingId]: data
    };
    setCheckedInDocs(updated);
    try {
      localStorage.setItem('gs_online_checkins', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Also optionally update user name if they checked in
    if (data.fullName && !currentUser.name.includes(data.fullName)) {
      onUpdateUser({
        ...currentUser,
        name: data.fullName
      });
    }
    setActiveCheckInBooking(null);
  };

  // Helper to calculate exact refund based on booking check-in date (Reference Date: 2026-06-30)
  const calculateRefund = (checkInDateStr: string, totalPrice: number) => {
    try {
      const today = new Date('2026-06-30'); // System standard current date
      const checkIn = new Date(checkInDateStr);
      const diffTime = checkIn.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const p100 = refundPolicySettings.policies[0]?.percentage ?? 100;
      const p50 = refundPolicySettings.policies[1]?.percentage ?? 50;
      const p0 = refundPolicySettings.policies[2]?.percentage ?? 0;
      
      if (diffDays > 3) {
        return {
          refundPercentage: p100,
          refundAmount: Math.floor(totalPrice * (p100 / 100)),
          isFree: p100 === 100,
          isLate: false,
          isNonRefundable: p100 === 0,
          daysRemaining: diffDays
        };
      } else if (diffDays >= 1) {
        return {
          refundPercentage: p50,
          refundAmount: Math.floor(totalPrice * (p50 / 100)),
          isFree: p50 === 100,
          isLate: p50 !== 100 && p50 !== 0,
          isNonRefundable: p50 === 0,
          daysRemaining: diffDays
        };
      } else {
        return {
          refundPercentage: p0,
          refundAmount: Math.floor(totalPrice * (p0 / 100)),
          isFree: p0 === 100,
          isLate: p0 !== 100 && p0 !== 0,
          isNonRefundable: p0 === 0,
          daysRemaining: diffDays
        };
      }
    } catch {
      const p100 = refundPolicySettings.policies[0]?.percentage ?? 100;
      return {
        refundPercentage: p100,
        refundAmount: Math.floor(totalPrice * (p100 / 100)),
        isFree: p100 === 100,
        isLate: false,
        isNonRefundable: p100 === 0,
        daysRemaining: 5
      };
    }
  };

  // Submit cancellation/modification request
  const handleSubmitRequest = () => {
    if (selectedBookingForPolicy === null || !policyModalType) return;
    const booking = bookedList[selectedBookingForPolicy];
    const refundCalculated = calculateRefund(booking.checkIn || '2026-07-05', booking.totalPrice || 0);
    
    // Build updated bookedList
    const updatedBookedList = bookedList.map((item, idx) => {
      if (idx === selectedBookingForPolicy) {
        return {
          ...item,
          bookingStatus: policyModalType === 'cancel' ? 'RefundPending' : ('ModifyPending' as any),
          refundRequestReason: refundReason,
          refundRequestType: policyModalType,
          refundRequestedAt: '2026-06-30T18:56:20-07:00',
          refundRequestAmount: policyModalType === 'cancel' ? refundCalculated.refundAmount : 0,
          refundBankName: policyModalType === 'cancel' ? refundBankName : undefined,
          refundBankAccount: policyModalType === 'cancel' ? refundBankAccount : undefined,
          refundBankOwner: policyModalType === 'cancel' ? refundBankOwner : undefined,
          refundNewCheckIn: policyModalType === 'modify' ? newCheckIn : undefined,
          refundNewCheckOut: policyModalType === 'modify' ? newCheckOut : undefined
        };
      }
      return item;
    });
    
    // Update state & localStorage
    if (onUpdateBookedList) {
      onUpdateBookedList(updatedBookedList);
    }
    localStorage.setItem('gs_op_booked_list', JSON.stringify(updatedBookedList));
    
    // Sync to gs_op_reservations so Admin Portal can see it!
    try {
      const savedRes = localStorage.getItem('gs_op_reservations');
      if (savedRes) {
        const currentRes = JSON.parse(savedRes);
        const updatedRes = currentRes.map((r: any) => {
          if (r.id === booking.bookingCode) {
            return {
              ...r,
              status: policyModalType === 'cancel' ? 'RefundPending' : 'ModifyPending',
              refundRequest: {
                reason: refundReason,
                requestType: policyModalType,
                requestedAt: '2026-06-30T18:56:20-07:00',
                refundAmount: policyModalType === 'cancel' ? refundCalculated.refundAmount : 0,
                bankName: refundBankName,
                bankAccount: refundBankAccount,
                bankOwner: refundBankOwner,
                newCheckIn: policyModalType === 'modify' ? newCheckIn : undefined,
                newCheckOut: policyModalType === 'modify' ? newCheckOut : undefined
              }
            };
          }
          return r;
        });
        localStorage.setItem('gs_op_reservations', JSON.stringify(updatedRes));
      }
    } catch (e) {
      console.error(e);
    }
    
    setPolicySuccessMsg(
      policyModalType === 'cancel' 
        ? `Gửi yêu cầu huỷ phòng và hoàn trả thành công! Hệ thống ghi nhận mức hoàn trả dự kiến ${formatVND(refundCalculated.refundAmount)} (${refundCalculated.refundPercentage}%). Bộ phận tài vụ sẽ hoàn tất xử lý trong vòng 3 ngày làm việc.`
        : `Gửi yêu cầu đổi lịch trình lưu trú thành công! Bộ phận lễ tân sẽ đối chiếu phòng trống từ ngày ${newCheckIn} đến ${newCheckOut} và liên hệ phản hồi cho quý khách trong vòng 15 phút.`
    );
    
    // Clear forms
    setRefundReason('');
    setRefundBankAccount('');
    setRefundBankOwner('');
    setNewCheckIn('');
    setNewCheckOut('');
  };

  // Sync with currentUser prop changes (e.g., when switched from admin simulator)
  useEffect(() => {
    setProfileName(currentUser.name);
    setProfilePhone(currentUser.phone);
    setProfileEmail(currentUser.email);
    setPoints(currentUser.loyaltyPoints || 0);
  }, [currentUser]);

  // Load contracts signed in the current session
  useEffect(() => {
    const handleLoadContracts = () => {
      try {
        const stored = localStorage.getItem('gs_signed_contracts');
        if (stored) {
          setCustomContracts(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error parsing contracts', e);
      }
    };

    handleLoadContracts();

    // Add window listener to sync local storage changes
    window.addEventListener('storage', handleLoadContracts);
    return () => window.removeEventListener('storage', handleLoadContracts);
  }, []);

  // List of pre-seeded vouchers
  const vouchers = [
    {
      code: 'GOLDSTAY15',
      title: 'Giảm 15% Đặt Phòng Thượng Hạng',
      desc: 'Áp dụng cho toàn bộ resort & khách sạn của GrandStay trên toàn quốc. Không giới hạn số tiền giảm tối đa.',
      expiry: '31/12/2026',
      type: 'Stay Discount',
      color: 'from-amber-500 to-amber-600',
    },
    {
      code: 'SPARESORT2026',
      title: 'Miễn Phí Liệu Trình Spa Thảo Dược 60 Phút',
      desc: 'Dành riêng cho hội viên VIP. Tận hưởng liệu pháp trị liệu phục hồi cơ thể tại GrandStay Lotus Spa.',
      expiry: '31/10/2026',
      type: 'Spa Wellness',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      code: 'DININGVIP',
      title: 'Tặng Chai Vang Pháp & Nến Lãng Mạn',
      desc: 'Tặng kèm set up bàn tiệc tối lãng mạn hướng biển cho 2 người tại các nhà hàng Fine Dining nội khu.',
      expiry: '30/09/2026',
      type: 'Fine Dining',
      color: 'from-purple-500 to-purple-600',
    },
    {
      code: 'WELCOME2026',
      title: 'Ưu Đãi Chào Mừng Thành Viên Mới 500k',
      desc: 'Giảm ngay 500,000 VND cho hóa đơn đặt phòng đầu tiên của bạn tại bất kỳ chi nhánh nào.',
      expiry: '31/12/2026',
      type: 'Welcome Gift',
      color: 'from-blue-500 to-blue-600',
    }
  ];

  // List of pre-seeded historical bookings
  const historicalBookings = [
    {
      id: 'GS-8821-2026',
      branchId: 'ha-noi',
      branchName: 'GrandStay Heritage Oasis Hanoi',
      brand: 'GrandStay Heritage',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
      region: 'Capital Region',
      dates: '10/02/2026 đến 13/02/2026 (3 đêm)',
      rooms: '1 Phòng King Suite',
      guests: '2 Người lớn',
      price: 10500000,
      status: 'Đã hoàn thành',
    },
    {
      id: 'GS-7749-2025',
      branchId: 'sapa',
      branchName: 'GrandStay Cloud Retreat Sapa',
      brand: 'GrandStay Resort',
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
      region: 'Northern Highlands',
      dates: '22/12/2025 đến 24/12/2025 (2 đêm)',
      rooms: '1 Biệt thự Mù Sương 1BR',
      guests: '2 Người lớn, 1 Trẻ em',
      price: 7800000,
      status: 'Đã hoàn thành',
    }
  ];

  // Pre-seeded signed contracts
  const historicalContracts = [
    {
      id: 'HD-SQS-2026-003',
      aptName: 'Căn hộ Hạng Sang Saigon Skyline Panorama #1408',
      location: 'Quận Bình Thạnh, TP. HCM',
      monthlyPrice: 28500000,
      leaseTerm: 12,
      tenantName: profileName,
      tenantPhone: profilePhone,
      tenantEmail: profileEmail,
      signedDate: '01/03/2026',
      status: 'Đang hiệu lực',
      deposit: 57000000,
      startDate: '01/03/2026',
      endDate: '28/02/2027'
    }
  ];

  // Combined contracts list
  const allContracts = [
    ...customContracts.map(c => ({
      id: c.id,
      aptName: c.aptName,
      location: c.location,
      monthlyPrice: c.monthlyPrice,
      leaseTerm: c.leaseTerm,
      tenantName: c.tenantName,
      tenantPhone: c.tenantPhone,
      tenantEmail: c.tenantEmail,
      signedDate: c.signedDate,
      status: 'Mới phê duyệt',
      deposit: c.monthlyPrice * 2,
      startDate: c.signedDate,
      endDate: new Date(new Date(c.signedDate).setMonth(new Date(c.signedDate).getMonth() + c.leaseTerm)).toISOString().split('T')[0]
    })),
    ...historicalContracts
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaimPoints = () => {
    if (claimedBonus) return;
    const newPoints = points + 150;
    setPoints(newPoints);
    setClaimedBonus(true);
    onUpdateUser({
      ...currentUser,
      loyaltyPoints: newPoints
    });
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    onUpdateUser({
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      email: profileEmail
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Main Panel Content - full page view */}
      <div
        className="relative w-full min-h-[80vh] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-100/80"
      >
        {/* Top Gold Border Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-brand-gold z-20" />

        {/* Panel Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-white/5 relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 text-brand-gold flex items-center justify-center border border-brand-gold/20 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-brand-gold uppercase block">HỘI VIÊN GRANDSTAY CLUB</span>
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Trang Cá Nhân & Đặc Quyền Hội Viên
              </h2>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-white/10"
          >
            <Home className="w-3.5 h-3.5 text-slate-300" />
            <span>Quay lại Trang Chủ</span>
          </button>
        </div>

        {/* Workspace: Sidebar + Tab Content */}
        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-5 flex flex-col justify-between shrink-0 space-y-6">
            
            {/* Short User Info & Edit */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-full blur-xl pointer-events-none" />
                
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Họ và Tên</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hòm thư email</label>
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <button 
                      onClick={handleSaveProfile} 
                      className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Lưu thông tin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-brand-gold text-brand-gold flex items-center justify-center font-bold text-sm">
                        {profileName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{profileName}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block uppercase tracking-wider ${tierInfo.badgeBg}`}>
                          {tierInfo.current}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-slate-500 text-[11px] font-medium border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profilePhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{profileEmail}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingProfile(true)} 
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      Cập nhật thông tin
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Menu List */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4" />
                    <span>Tổng Quan & Điểm Thưởng</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Lịch Sử Đặt Phòng</span>
                  </div>
                  <span className="bg-amber-500 text-white rounded-full font-mono text-[10px] px-1.5 py-0.5 font-bold min-w-5 text-center">
                    {historicalBookings.length + bookedList.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('vouchers')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'vouchers' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-4 h-4" />
                    <span>Kho Voucher Của Tôi</span>
                  </div>
                  <span className="bg-slate-200 text-slate-700 rounded-full font-mono text-[10px] px-1.5 py-0.5 font-bold">
                    {vouchers.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'contracts' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Hợp Đồng Đã Ký (Long-term)</span>
                  </div>
                  <span className="bg-emerald-500 text-white rounded-full font-mono text-[10px] px-1.5 py-0.5 font-bold">
                    {allContracts.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('policies')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'policies' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4" />
                    <span>Chính sách Đổi/Huỷ phòng</span>
                  </div>
                  <span className="bg-rose-500 text-white rounded-full font-mono text-[10px] px-1.5 py-0.5 font-bold">
                    NEW
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('tours')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'tours' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
                    <span>Lịch Trình & Tour Ghép</span>
                  </div>
                  <span className="bg-amber-500 text-white rounded-full font-mono text-[10px] px-1.5 py-0.5 font-bold animate-pulse">
                    HOT
                  </span>
                </button>
              </nav>
            </div>

            {/* Footer Help */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/40 text-left text-[11px] text-blue-800 leading-relaxed">
              <span className="font-bold block mb-0.5 text-blue-950">Hỗ trợ 24/7 VIP Line:</span>
              <p className="font-mono font-bold text-xs">1800 6899 (Bấm phím 1)</p>
              <p className="text-[10px] text-blue-600/80 mt-1">Đội ngũ trợ lý VIP sẵn sàng hỗ trợ bạn bất kỳ thời điểm nào.</p>
            </div>

          </div>

          {/* Main Content Area */}
          <div className="flex-grow p-6 sm:p-8 overflow-y-auto min-w-0 bg-white">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* VIP loyalty card */}
                <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-white/5 shadow-2xl overflow-hidden min-h-[220px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-6 right-6 opacity-15">
                    <Award className="w-24 h-24 text-brand-gold" />
                  </div>

                  {/* Top card bar */}
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">HỘI VIÊN CAO CẤP</span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">GRANDSTAY ELITE</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Tài khoản tích lũy</span>
                      <span className="text-2xl sm:text-3xl font-mono font-black text-brand-gold">{points.toLocaleString()} <span className="text-xs">PTS</span></span>
                    </div>
                  </div>

                  {/* Mid Points status */}
                  <div className="space-y-2.5 relative z-10">
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span className="font-medium">Hạng {tierInfo.current}</span>
                      {tierInfo.remaining > 0 ? (
                        <span className="font-bold text-slate-200">
                          Hạng kế tiếp: {tierInfo.next} (Còn thiếu {tierInfo.remaining.toLocaleString()} PTS)
                        </span>
                      ) : (
                        <span className="font-bold text-brand-gold">✓ Bạn đã đạt hạng cao nhất!</span>
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 via-brand-gold to-yellow-300 rounded-full"
                        style={{ width: `${Math.min(tierInfo.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom details card */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10 text-[11px] text-slate-400 font-mono">
                    <span>MÃ SỐ: GS-889-2026-VIP</span>
                    <span>XÁC THỰC • ĐÃ KÝ LIÊN KẾT SMART-CONTRACT</span>
                  </div>
                </div>

                {/* Claim Points Box */}
                <div className="bg-amber-50/50 border border-amber-100/70 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-sm">
                  <div className="absolute -right-10 -bottom-10 opacity-5 text-brand-gold pointer-events-none">
                    <Gift className="w-32 h-32" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <span className="text-lg">🎁</span> Điểm danh nhận thưởng hàng ngày
                    </h4>
                    <p className="text-slate-500 text-xs font-light">
                      Điểm danh mỗi ngày để tích lũy thêm 150 điểm thưởng GrandStay Club hoàn toàn miễn phí!
                    </p>
                  </div>
                  <button
                    disabled={claimedBonus}
                    onClick={handleClaimPoints}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 ${claimedBonus ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60' : 'bg-gradient-to-r from-amber-500 to-brand-gold hover:from-amber-600 text-slate-950 shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer'}`}
                  >
                    {claimedBonus ? '✓ Đã điểm danh hôm nay' : 'Nhận 150 Điểm Thưởng'}
                  </button>
                </div>

                {/* Quick stats / Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Stat 1 */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Kỳ nghỉ đã đi</span>
                      <strong className="text-slate-900 text-lg font-black">{historicalBookings.length} địa điểm</strong>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Voucher khả dụng</span>
                      <strong className="text-slate-900 text-lg font-black">{vouchers.length} ưu đãi</strong>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Hợp đồng pháp lý</span>
                      <strong className="text-slate-900 text-lg font-black">{allContracts.length} văn bản</strong>
                    </div>
                  </div>

                </div>

                {/* Co-living co-working program card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-4 text-left max-w-2xl relative z-10">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-emerald-500/20 inline-block">
                      DỊCH VỤ SỐNG DÀI HẠN
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">Ký hợp đồng thuê nhà trực tuyến, nhận căn hộ thông minh 5★</h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                      Chương trình "GrandStay Co-living" cung cấp giải pháp nhà ở dài hạn từ 3-12 tháng tại những trung tâm đô thị lớn của Việt Nam. Toàn bộ quy trình từ xem nhà 3D, thanh toán cọc và ký tên hợp đồng đều được thực hiện thông minh thông qua trang web.
                    </p>
                    <div className="pt-2">
                      <span className="text-xs text-brand-gold font-bold">✓ Hiện tại bạn đang có {customContracts.length} hợp đồng thuê nhà trực tuyến đang khởi tạo.</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: BOOKINGS */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Thông tin đặt phòng nghỉ dưỡng của bạn</h3>
                  <span className="text-xs text-slate-400 font-mono">ĐỒNG BỘ TRỰC TUYẾN</span>
                </div>

                {/* Session Bookings List (Dynamic) */}
                {bookedList.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-block">
                      ĐẶT PHÒNG HIỆN TẠI (Đang chờ nhận phòng)
                    </span>
                    
                    {bookedList.map((book, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white border-2 border-blue-100 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-5 shadow-md shadow-blue-500/5 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <img 
                          src={book.image} 
                          alt={book.name} 
                          className="w-full md:w-32 h-24 object-cover rounded-2xl shrink-0" 
                        />
                        <div className="flex-grow text-left space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-100">
                              {book.brand}
                            </span>
                            <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded border border-amber-100">
                              {book.paymentMethod === 'stripe' ? `Thanh toán Stripe (•••• ${book.cardNumberLast4 || '4242'})` : 'Thanh toán SePay'}
                            </span>
                            
                            {/* Policy Status badges */}
                            {book.bookingStatus === 'RefundPending' && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                ⏳ Chờ hoàn tiền
                              </span>
                            )}
                            {book.bookingStatus === 'RefundApproved' && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                ✓ Đã huỷ & hoàn tiền
                              </span>
                            )}
                            {book.bookingStatus === 'RefundDeclined' && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                                ✕ Từ chối hoàn tiền
                              </span>
                            )}
                            {book.bookingStatus === 'ModifyPending' && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                                ⏳ Chờ duyệt đổi lịch
                              </span>
                            )}
                            {book.bookingStatus === 'ModifyApproved' && (
                              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                                ✓ Đã đổi lịch thành công
                              </span>
                            )}
                            {book.bookingStatus === 'ModifyDeclined' && (
                              <span className="text-[10px] bg-slate-150 text-slate-800 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                                ✕ Từ chối đổi lịch
                              </span>
                            )}

                            {(!book.bookingStatus || book.bookingStatus === 'Reserved') && (
                              checkedInDocs[`GS-2026-CONF-${1000 + idx}`] ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Đã Check-in Trực Tuyến
                                </span>
                              ) : (
                                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100">
                                  Chưa khai báo lưu trú
                                </span>
                              )
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">{book.name}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {book.region}</span>
                            <span className="font-mono text-blue-600 font-bold">Mã phòng: {book.bookingCode || `GS2026-${1000 + idx}`}</span>
                          </div>
                          {book.bookingStatus === 'ModifyApproved' && book.refundNewCheckIn && (
                            <div className="text-xs bg-teal-50 border border-teal-100 text-teal-800 rounded-lg p-2 mt-1">
                              📅 Lịch mới: <strong>{book.refundNewCheckIn}</strong> đến <strong>{book.refundNewCheckOut}</strong>
                            </div>
                          )}
                        </div>

                        {/* Booking actions */}
                        <div className="shrink-0 w-full md:w-auto flex flex-row md:flex-col gap-2">
                          {(!book.bookingStatus || book.bookingStatus === 'Reserved') && (
                            <>
                              {checkedInDocs[`GS-2026-CONF-${1000 + idx}`] ? (
                                <button
                                  onClick={() => setViewCheckedInDoc(checkedInDocs[`GS-2026-CONF-${1000 + idx}`])}
                                  className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                  <span>Thẻ Lưu Trú Số</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveCheckInBooking({ id: `GS-2026-CONF-${1000 + idx}`, name: book.name, image: book.image, region: book.region, brand: book.brand })}
                                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <Camera className="w-4 h-4 text-white" />
                                  <span>Check-in (CCCD/Passport)</span>
                                </button>
                              )}
                              <button
                                onClick={() => setShowQrModal(book.bookingCode || `GS-2026-CONF-${1000 + idx}`)}
                                className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <QrCode className="w-4 h-4 text-brand-gold" />
                                <span>Nhận Vé Trực Tuyến</span>
                              </button>
                              <button
                                onClick={() => setShowQrModal(`INVOICE-${book.bookingCode || idx}`)}
                                className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Hóa Đơn Chi Tiết</span>
                              </button>

                              {/* Yêu cầu Đổi/Huỷ */}
                              <button
                                onClick={() => {
                                  setSelectedBookingForPolicy(idx);
                                  setPolicyModalType('cancel');
                                  setRefundReason('');
                                  setRefundBankAccount('');
                                  setRefundBankOwner('');
                                }}
                                className="flex-1 md:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4 text-rose-500" />
                                <span>Yêu cầu Đổi / Huỷ</span>
                              </button>
                            </>
                          )}

                          {book.bookingStatus === 'RefundPending' && (
                            <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 max-w-xs space-y-1">
                              <span className="text-sm block">⏳</span>
                              <p className="text-xs font-bold">Đang chờ xử lý hoàn tiền</p>
                              <p className="text-[10px] text-amber-600">Bộ phận tài vụ đang xác minh tài khoản ngân hàng của bạn.</p>
                            </div>
                          )}

                          {book.bookingStatus === 'RefundApproved' && (
                            <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 max-w-xs space-y-1">
                              <span className="text-sm block">✓</span>
                              <p className="text-xs font-bold">Đã hoàn tiền thành công</p>
                              <p className="text-[10px] text-emerald-600">Giao dịch hoàn tất. Quý khách vui lòng kiểm tra số dư tài khoản.</p>
                            </div>
                          )}

                          {book.bookingStatus === 'ModifyPending' && (
                            <div className="text-center p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 max-w-xs space-y-1">
                              <span className="text-sm block">⏳</span>
                              <p className="text-xs font-bold">Đang duyệt thay đổi lịch</p>
                              <p className="text-[10px] text-purple-600">Lễ tân đang check phòng trống từ ngày {book.refundNewCheckIn} đến {book.refundNewCheckOut}.</p>
                            </div>
                          )}

                          {book.bookingStatus === 'RefundDeclined' && (
                            <div className="text-center p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 max-w-xs space-y-1">
                              <span className="text-sm block">✕</span>
                              <p className="text-xs font-bold">Yêu cầu hoàn trả bị từ chối</p>
                              <p className="text-[10px] text-rose-600">Vui lòng liên hệ tổng đài hỗ trợ 1800 6899 để được giải đáp chi tiết.</p>
                            </div>
                          )}

                          {book.bookingStatus === 'ModifyDeclined' && (
                            <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 max-w-xs space-y-1">
                              <span className="text-sm block">✕</span>
                              <p className="text-xs font-bold">Từ chối thay đổi lịch</p>
                              <p className="text-[10px] text-slate-500">Phòng hết trống trong khung giờ yêu cầu mới. Hãy chọn khung giờ khác hoặc liên hệ lễ tân.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Historical Bookings */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-left">
                    LỊCH SỬ ĐẶT PHÒNG TRƯỚC ĐÂY
                  </span>

                  {historicalBookings.map((book) => (
                    <div 
                      key={book.id} 
                      className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col md:flex-row items-center gap-5 hover:bg-white hover:border-slate-200 transition-all shadow-sm"
                    >
                      <img 
                        src={book.image} 
                        alt={book.branchName} 
                        className="w-full md:w-32 h-24 object-cover rounded-2xl shrink-0 filter brightness-95" 
                      />
                      
                      <div className="flex-grow text-left space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                            {book.brand}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200/50">
                            Hạng phòng: {book.rooms}
                          </span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> {book.status}
                          </span>
                        </div>
                        
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">{book.branchName}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {book.region}</span>
                          <span className="font-semibold text-slate-600">{book.dates}</span>
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto text-left md:text-right flex md:flex-col justify-between items-center md:items-end gap-2 border-t border-slate-200/50 pt-3 md:pt-0 md:border-t-0">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">TỔNG CHI PHÍ</span>
                          <strong className="text-slate-800 text-sm font-black">{formatVND(book.price)}</strong>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => setActiveReviewBranch({ id: book.branchId, name: book.branchName })}
                            className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                            <span>Đánh Giá Kỳ Nghỉ</span>
                          </button>
                          <button
                            onClick={() => setShowQrModal(book.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <QrCode className="w-4 h-4 text-slate-500" />
                            <span className="hidden sm:inline">Xem vé</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* TAB 3: VOUCHERS */}
            {activeTab === 'vouchers' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-left space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Kho Voucher Ưu Đãi Của Bạn</h3>
                  <p className="text-slate-500 text-xs font-light">
                    Sử dụng mã giảm giá khi đặt phòng lưu trú hoặc trình mã voucher cho nhân viên lễ tân khi dùng dịch vụ spa & ăn uống tại các resort.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map((voucher) => {
                    const isCopied = copiedCode === voucher.code;
                    return (
                      <div 
                        key={voucher.code}
                        className="bg-white rounded-3xl border border-slate-100 shadow-md flex overflow-hidden relative group hover:shadow-lg transition-all hover:border-slate-200"
                      >
                        {/* Cut-out ticket dots left/right */}
                        <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-white border-r border-slate-200 -translate-y-1/2 z-10" />
                        <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-white border-l border-slate-200 -translate-y-1/2 z-10" />
                        
                        {/* Side color accent block */}
                        <div className={`w-24 bg-gradient-to-b ${voucher.color} shrink-0 p-4 flex flex-col justify-between items-center text-white relative`}>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
                          
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-100 font-mono text-center block">
                            {voucher.type}
                          </span>

                          <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center border border-white/20">
                            <Ticket className="w-5 h-5" />
                          </div>

                          <span className="text-[9px] font-bold text-slate-200 font-mono">
                            Hạn: {voucher.expiry.split('/')[1]}/{voucher.expiry.split('/')[2].substring(2)}
                          </span>
                        </div>

                        {/* Details Block */}
                        <div className="flex-grow p-5 text-left flex flex-col justify-between space-y-3 min-w-0">
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {voucher.title}
                            </h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-light line-clamp-2">
                              {voucher.desc}
                            </p>
                          </div>

                          {/* Code section */}
                          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-700">
                              {voucher.code}
                            </div>
                            
                            <button
                              onClick={() => handleCopyCode(voucher.code)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${isCopied ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10'}`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã copy</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Voucher guidelines */}
                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed text-left space-y-1 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">Lưu ý khi sử dụng mã ưu đãi:</span>
                  <p>• Mã giảm giá lưu trú chỉ áp dụng cho phòng trống khi đặt trước trực tiếp thông qua trang web.</p>
                  <p>• Các voucher quà tặng (Spa, Wine & Dining) được xuất trình cho lễ tân resort dưới dạng mã hội viên tại khu nghỉ dưỡng.</p>
                  <p>• Điểm thưởng GrandStay Club có thể đổi thêm các voucher giảm giá phòng ở phần đổi quà trong kỳ kế tiếp.</p>
                </div>
              </motion.div>
            )}

            {/* TAB 4: CONTRACTS */}
            {activeTab === 'contracts' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-left space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Danh sách hợp đồng thuê nhà dài hạn</h3>
                  <p className="text-slate-500 text-xs font-light">
                    Các tài liệu pháp lý và hợp đồng thuê phòng/căn hộ co-living dài hạn của bạn được lưu trữ an toàn với chữ ký số pháp lý.
                  </p>
                </div>

                {allContracts.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                    <span className="text-3xl block">📄</span>
                    <h4 className="font-bold text-slate-700 text-sm">Chưa có hợp đồng nào được ký kết</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                      Bạn có thể chọn thuê căn hộ dài hạn từ 3-12 tháng tại tab <strong className="text-slate-600">Long-term Rooms</strong> trên trang chủ, ký tên điện tử trực tuyến và hợp đồng sẽ tự động đồng bộ về đây.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allContracts.map((contract) => (
                      <div 
                        key={contract.id}
                        className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-all hover:border-slate-200"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                                {contract.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-semibold">
                                Số: {contract.id}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1">
                              {contract.aptName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {contract.location}</span>
                              <span>•</span>
                              <span>Giá: <strong className="text-slate-700">{formatVND(contract.monthlyPrice)}/tháng</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto flex justify-between sm:justify-start items-center gap-3 border-t border-slate-100 pt-4 sm:pt-0 sm:border-t-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">NGÀY KÝ</span>
                            <strong className="text-slate-700 text-xs font-bold">{contract.signedDate}</strong>
                          </div>
                          
                          <button
                            onClick={() => setShowContractDetail(contract)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-slate-950/10 cursor-pointer"
                          >
                            <span>Xem Chi Tiết</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom alert box */}
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-3xl p-5 text-left text-xs text-blue-800 leading-relaxed max-w-3xl flex items-start gap-3">
                  <span className="text-base shrink-0">🛡️</span>
                  <div>
                    <strong className="font-bold text-blue-950 block mb-0.5">Cam kết pháp lý & Bảo mật:</strong>
                    <p className="text-blue-700/90">
                      Tất cả hợp đồng thuê căn hộ co-living trực tuyến tại GrandStay đều được bảo chứng pháp lý theo quy định về Hợp đồng điện tử của Bộ Công Thương Việt Nam. Chữ ký số của quý cư dân được mã hóa và lưu trữ an toàn trên mạng dữ liệu nội bộ.
                    </p>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 5: POLICIES */}
            {activeTab === 'policies' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">{refundPolicySettings.title}</h3>
                  <p className="text-slate-500 text-xs font-light">
                    {refundPolicySettings.subtitle}
                  </p>
                </div>

                {/* Timeline visual card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <h4 className="font-extrabold text-base text-amber-400 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Biểu Đồ Thời Gian & Tỷ Lệ Hoàn Tiền Tiêu Chuẩn
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {refundPolicySettings.policies.map((p: any, idx: number) => {
                      const colors = [
                        { text: 'text-emerald-400', pct: 'text-emerald-400' },
                        { text: 'text-amber-400', pct: 'text-amber-400' },
                        { text: 'text-rose-400', pct: 'text-rose-400' }
                      ];
                      const c = colors[idx] || colors[0];
                      return (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative">
                          <div className={`absolute top-3 right-3 ${c.pct} text-xl font-mono font-bold`}>{p.percentage}%</div>
                          <span className={`text-xs ${c.text} font-bold block mb-1 uppercase tracking-wide`}>{p.timeframe}</span>
                          <h5 className="font-extrabold text-sm text-slate-100">{p.title}</h5>
                          <p className="text-slate-400 text-xs mt-2 leading-relaxed">{p.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Line graph visualization */}
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider block mb-4">Mô phỏng trục thời gian:</span>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden flex">
                      <div className="w-1/2 h-full bg-emerald-500" title={`Hoàn ${refundPolicySettings.policies[0]?.percentage ?? 100}%`} />
                      <div className="w-1/3 h-full bg-amber-500" title={`Hoàn ${refundPolicySettings.policies[1]?.percentage ?? 50}%`} />
                      <div className="w-1/6 h-full bg-rose-500" title={`Hoàn ${refundPolicySettings.policies[2]?.percentage ?? 0}%`} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Đặt phòng</span>
                      <span className="text-emerald-400">{refundPolicySettings.policies[0]?.timeframe} (Hoàn {refundPolicySettings.policies[0]?.percentage}%)</span>
                      <span className="text-amber-400">{refundPolicySettings.policies[1]?.timeframe} (Hoàn {refundPolicySettings.policies[1]?.percentage}%)</span>
                      <span className="text-rose-400">{refundPolicySettings.policies[2]?.timeframe} (Hoàn {refundPolicySettings.policies[2]?.percentage}%)</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator Tool */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                      Công Cụ Tính Thử Hoàn Tiền Tự Động
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      Điền số tiền và số ngày chuẩn bị check-in để đối chiếu nhanh mức hoàn trả thực tế bạn sẽ nhận được về tài khoản ngân hàng liên kết.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tổng tiền phòng đặt (VND)</label>
                        <input 
                          type="number" 
                          defaultValue={5000000}
                          id="sim_total_price"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 transition-all"
                          placeholder="Nhập số tiền..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Số ngày còn lại trước check-in</label>
                        <select 
                          id="sim_days_left"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="5">Còn 5 ngày nữa (Hợp lệ hoàn {refundPolicySettings.policies[0]?.percentage}%)</option>
                          <option value="2">Còn 2 ngày nữa (Phí huỷ muộn {100 - (refundPolicySettings.policies[1]?.percentage ?? 50)}%)</option>
                          <option value="0">Còn dưới 24 tiếng (Không hỗ trợ hoàn trả / Hoàn {refundPolicySettings.policies[2]?.percentage}%)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const priceVal = Number((document.getElementById('sim_total_price') as HTMLInputElement)?.value || 5000000);
                          const daysVal = Number((document.getElementById('sim_days_left') as HTMLSelectElement)?.value || 5);
                          let resPercent = refundPolicySettings.policies[0]?.percentage ?? 100;
                          let resAmt = priceVal * (resPercent / 100);
                          let explanation = `Hủy phòng trước 3 ngày. Bạn được hoàn trả ${resPercent}% số tiền đã đặt phòng.`;
                          if (daysVal === 2) {
                            resPercent = refundPolicySettings.policies[1]?.percentage ?? 50;
                            resAmt = priceVal * (resPercent / 100);
                            explanation = `Hủy phòng muộn (1-3 ngày). Khấu trừ phí phạt huỷ muộn ${100 - resPercent}%, hoàn trả ${resPercent}%.`;
                          } else if (daysVal === 0) {
                            resPercent = refundPolicySettings.policies[2]?.percentage ?? 0;
                            resAmt = priceVal * (resPercent / 100);
                            explanation = `Yêu cầu sát giờ nhận phòng (<24h). Phí phạt huỷ phòng là ${100 - resPercent}%, hoàn trả ${resPercent}%.`;
                          }
                          const outDiv = document.getElementById('sim_result_box');
                          if (outDiv) {
                            outDiv.innerHTML = `
                              <div class="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
                                <div class="flex justify-between items-center">
                                  <span class="text-[10px] text-slate-400 font-bold uppercase">Tỷ lệ hoàn trả:</span>
                                  <span class="text-xs font-black text-indigo-600 font-mono">${resPercent}%</span>
                                </div>
                                <div class="flex justify-between items-center">
                                  <span class="text-[10px] text-slate-400 font-bold uppercase">Số tiền hoàn thực nhận:</span>
                                  <span class="text-sm font-black text-slate-800 font-mono">${resAmt.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <p class="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60 leading-relaxed">${explanation}</p>
                              </div>
                            `;
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Bắt đầu tính toán
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center text-center space-y-3 p-4 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50" id="sim_result_box">
                    <span className="text-3xl">🧮</span>
                    <h5 className="font-bold text-slate-600 text-xs">Kết quả tính thử hoàn tiền</h5>
                    <p className="text-slate-400 text-[10px] max-w-xs mx-auto">
                      Chọn số tiền phòng và khoảng cách ngày lưu trú bên trái rồi nhấn nút "Bắt đầu tính toán" để xem mô phỏng.
                    </p>
                  </div>
                </div>

                {/* Policy terms details block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                      🔄 1. Quy định về Thay Đổi Lịch Trình (Modification)
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
                      {(refundPolicySettings.modificationTerms || []).map((term: string, idx: number) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                      ⚠️ 2. Trường hợp miễn trừ đặc biệt (Force Majeure)
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
                      {(refundPolicySettings.forceMajeureTerms || []).map((term: string, idx: number) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: TOURS */}
            {activeTab === 'tours' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Quản Lý Hành Trình & Vé Tour Du Lịch</h3>
                  <p className="text-slate-500 text-xs font-light">
                    Theo dõi lịch trình hoạt động dã ngoại, lặn biển, đi du thuyền 5 sao và các hội nhóm ghép xe, ghép tour của bạn.
                  </p>
                </div>
                
                <TourPortal currentUser={currentUser} onUpdateUser={onUpdateUser} embedded={true} />
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* QR MODAL (For Check-in Code and Invoice details) */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center space-y-6 shadow-2xl border border-slate-100 z-10"
            >
              <button
                onClick={() => setShowQrModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-widest inline-block">
                  {showQrModal.startsWith('INVOICE') ? 'HÓA ĐƠN CHI TIẾT' : 'MÃ VÉ KHÁCH SẠN'}
                </span>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {showQrModal.startsWith('INVOICE') ? 'Hóa Đơn GrandStay' : 'Mã Nhận Phòng Lễ Tân'}
                </h4>
                <p className="text-slate-400 font-mono text-xs uppercase font-bold">{showQrModal}</p>
              </div>

              {/* Fake QR representation with elegant SVG mesh layout */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 w-52 h-52 mx-auto flex items-center justify-center relative shadow-inner">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-400 m-2" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400 m-2" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-400 m-2" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-400 m-2" />
                
                {/* SVG representing a beautiful, complex QR Code with GrandStay logo nested */}
                <svg className="w-40 h-40 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="22" height="22" rx="2" />
                  <rect x="9" y="9" width="14" height="14" fill="white" rx="1" />
                  <rect x="12" y="12" width="8" height="8" rx="0.5" />

                  <rect x="73" y="5" width="22" height="22" rx="2" />
                  <rect x="77" y="9" width="14" height="14" fill="white" rx="1" />
                  <rect x="80" y="12" width="8" height="8" rx="0.5" />

                  <rect x="5" y="73" width="22" height="22" rx="2" />
                  <rect x="9" y="77" width="14" height="14" fill="white" rx="1" />
                  <rect x="12" y="80" width="8" height="8" rx="0.5" />

                  {/* Random pixels representing QR matrix code */}
                  <rect x="35" y="8" width="6" height="6" />
                  <rect x="45" y="5" width="8" height="8" />
                  <rect x="58" y="10" width="6" height="4" />
                  <rect x="40" y="20" width="4" height="8" />
                  
                  <rect x="8" y="35" width="8" height="4" />
                  <rect x="5" y="45" width="6" height="8" />
                  <rect x="20" y="40" width="8" height="4" />
                  
                  <rect x="35" y="35" width="30" height="30" fill="#0f172a" rx="6" />
                  <rect x="38" y="38" width="24" height="24" fill="white" rx="4" />
                  <circle cx="50" cy="50" r="8" fill="#d97706" />
                  <text x="50" y="53" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">G</text>

                  <rect x="75" y="35" width="8" height="8" />
                  <rect x="88" y="42" width="6" height="10" />
                  <rect x="80" y="58" width="12" height="6" />

                  <rect x="35" y="75" width="12" height="4" />
                  <rect x="42" y="85" width="10" height="8" />
                  <rect x="35" y="90" width="6" height="5" />

                  <rect x="75" y="75" width="6" height="6" />
                  <rect x="85" y="72" width="8" height="8" />
                  <rect x="80" y="88" width="10" height="6" />
                </svg>
              </div>

              <div className="text-slate-500 text-xs leading-relaxed">
                {showQrModal.startsWith('INVOICE') ? (
                  <p>Trình mã quét này cho nhân viên lễ tân khi thanh toán để xuất hóa đơn tài chính đỏ (hóa đơn GTGT) và cập nhật điểm hội viên tự động.</p>
                ) : (
                  <p>Khi đến khách sạn, quý khách vui lòng trình mã QR này tại quầy Lễ tân VIP để thực hiện nhận phòng nhanh (Express Check-in) trong vòng 1 phút.</p>
                )}
              </div>

              <button
                onClick={() => setShowQrModal(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTRACT DETAILS LIGHTBOX */}
      <AnimatePresence>
        {showContractDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContractDetail(null)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl h-[80vh] flex flex-col justify-between shadow-2xl border border-slate-100 z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                <div className="text-left">
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest block w-max">
                    HỢP ĐỒNG ĐIỆN TỬ PHÁP LÝ
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                    Chi tiết Hợp đồng Thuê nhà trực tuyến
                  </h3>
                </div>
                <button
                  onClick={() => setShowContractDetail(null)}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable contract paper */}
              <div className="flex-grow my-5 overflow-y-auto bg-slate-50/70 rounded-2xl p-6 border border-slate-200/50 text-left text-[11px] sm:text-xs text-slate-600 space-y-5 font-sans scrollbar-thin">
                <div className="text-center font-bold text-slate-800 uppercase space-y-1">
                  <h4>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                  <h5>Độc lập - Tự do - Hạnh phúc</h5>
                  <div className="w-20 h-0.5 bg-slate-400 mx-auto my-1.5" />
                  <h4 className="pt-2 text-sm sm:text-base">HỢP ĐỒNG THUÊ CĂN HỘ CO-LIVING DÀI HẠN</h4>
                  <p className="font-mono text-xs font-semibold normal-case text-slate-400">Số mã định danh: {showContractDetail.id}</p>
                </div>

                <div className="space-y-3">
                  <p><strong className="text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">BÊN CHO THUÊ (BÊN A):</strong> 
                    <strong>Công ty Cổ phần Đầu tư Phát triển Nghỉ dưỡng GrandStay Hospitality</strong><br />
                    Mã số doanh nghiệp: 0108892026 do Sở Kế hoạch và Đầu tư Hà Nội cấp.<br />
                    Đại diện pháp luật: Ông Trần Hoàng Sơn - Chức vụ: Chủ tịch HĐQT.
                  </p>

                  <p><strong className="text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">BÊN THUÊ (BÊN B):</strong> 
                    <strong>Khách hàng đại diện: {showContractDetail.tenantName}</strong><br />
                    Số điện thoại liên hệ: {showContractDetail.tenantPhone} <br />
                    Địa chỉ thư điện tử đăng ký chữ ký số: {showContractDetail.tenantEmail}
                  </p>

                  <p><strong className="text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</strong><br />
                    Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê tài sản là:<br />
                    - <strong>Căn hộ/Phòng nghỉ:</strong> {showContractDetail.aptName}<br />
                    - <strong>Vị trí chi nhánh:</strong> {showContractDetail.location}<br />
                    - Toàn bộ trang thiết bị nội thất đi kèm đã được chi tiết hóa trong Phụ lục bàn giao đính kèm.
                  </p>

                  <p><strong className="text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">ĐIỀU 2: THỜI HẠN & CHI PHÍ THUÊ</strong><br />
                    - <strong>Thời hạn hợp đồng:</strong> {showContractDetail.leaseTerm} tháng.<br />
                    - <strong>Ngày bắt đầu hiệu lực:</strong> {showContractDetail.startDate}<br />
                    - <strong>Ngày hết hạn hợp đồng:</strong> {showContractDetail.endDate}<br />
                    - <strong>Tiền thuê nhà hàng tháng:</strong> {formatVND(showContractDetail.monthlyPrice)} / tháng. (Chưa bao gồm tiền điện nước sinh hoạt thực tế).<br />
                    - <strong>Số tiền cọc đảm bảo:</strong> {formatVND(showContractDetail.deposit)} (Bằng 2 tháng tiền thuê, sẽ được hoàn lại 100% khi thanh lý hợp đồng đúng hạn và không có hư hại tài sản).
                  </p>

                  <p><strong className="text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">ĐIỀU 3: CHỮ KÝ SỐ XÁC NHẬN CÁC BÊN</strong><br />
                    Hợp đồng được ký điện tử trực tiếp thông qua hệ thống chữ ký số GrandStay. Các bên công nhận giá trị pháp lý tương đương văn bản giấy ký tay truyền thống theo Luật Giao dịch điện tử hiện hành của nước CHXHCN Việt Nam.
                  </p>
                </div>

                {/* Digital sign stamps visual */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-2 border border-slate-200/60 p-3 bg-white rounded-xl relative overflow-hidden">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">ĐẠI DIỆN BÊN A</span>
                    <strong className="block text-slate-800">GrandStay Hospitality</strong>
                    <div className="text-emerald-500 font-black italic text-xs border border-dashed border-emerald-400/50 bg-emerald-50 py-1.5 rounded-lg rotate-[-3deg] uppercase tracking-wider scale-90">
                      ✓ ĐÃ KÝ SỐ DOANH NGHIỆP
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono block">Thời gian: {showContractDetail.signedDate}</span>
                  </div>

                  <div className="text-center space-y-2 border border-slate-200/60 p-3 bg-white rounded-xl relative overflow-hidden">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">ĐẠI DIỆN BÊN B</span>
                    <strong className="block text-slate-800 truncate">{showContractDetail.tenantName}</strong>
                    <div className="text-blue-500 font-black italic text-xs border border-dashed border-blue-400/50 bg-blue-50 py-1.5 rounded-lg rotate-[-3deg] uppercase tracking-wider scale-90">
                      ✓ KÝ TÊN ĐIỆN TỬ
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono block">Thời gian: {showContractDetail.signedDate}</span>
                  </div>
                </div>

              </div>

              {/* Action and Close */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => {
                    alert('Hệ thống đang tải xuống tệp PDF có dấu chữ ký số của bạn. Vui lòng kiểm tra thư mục tải xuống trong giây lát.');
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-brand-gold" />
                  <span>Tải Xuống Bản Gốc PDF (Có Chữ Ký Số)</span>
                </button>
                <button
                  onClick={() => setShowContractDetail(null)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Đóng lại
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GUEST REVIEW LIGHTBOX */}
      <AnimatePresence>
        {activeReviewBranch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReviewBranch(null)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                <div className="text-left">
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded border border-amber-500/10 uppercase tracking-widest block w-max">
                    ĐÁNH GIÁ TRẢI NGHIỆM
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                    Nhận xét & đánh giá về {activeReviewBranch.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveReviewBranch(null)}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* GuestReview Component with custom scrolling inside modal */}
              <div className="flex-grow my-4 overflow-y-auto no-scrollbar">
                <GuestReview 
                  targetId={activeReviewBranch.id} 
                  targetName={activeReviewBranch.name} 
                  onReviewAdded={(newReview) => handleReviewAddedFromPortal(activeReviewBranch.id, newReview)}
                  currentUser={{ name: profileName }}
                />
              </div>

              {/* Close button */}
              <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setActiveReviewBranch(null)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Đóng lại
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ONLINE CHECK-IN MODAL */}
      <AnimatePresence>
        {activeCheckInBooking && (
          <OnlineCheckIn
            booking={activeCheckInBooking}
            onClose={() => setActiveCheckInBooking(null)}
            onComplete={handleCompleteCheckIn}
          />
        )}
      </AnimatePresence>

      {/* VERIFIED CHECK-IN PASS DETAILS LIGHTBOX */}
      <AnimatePresence>
        {viewCheckedInDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewCheckedInDoc(null)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-slate-800 z-10 overflow-hidden"
            >
              {/* Background accent glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />

              <button
                onClick={() => setViewCheckedInDoc(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 transition-all cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Xác minh tạm trú thành công
                </div>

                <h4 className="text-lg font-black tracking-tight text-white">Thẻ Khai Báo Lưu Trú Số</h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">MÃ QR ĐỒNG BỘ: GS-SECURE-{viewCheckedInDoc.docNumber.substring(0, 4)}-VIP</p>
              </div>

              {/* The "Pass" Ticket Card */}
              <div className="mt-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-5 relative overflow-hidden flex flex-col sm:flex-row gap-5">
                {/* Photo frame */}
                <div className="w-24 h-32 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden shrink-0 flex items-center justify-center group mx-auto sm:mx-0">
                  {viewCheckedInDoc.capturedPhoto ? (
                    <img 
                      src={viewCheckedInDoc.capturedPhoto} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-700" />
                  )}
                  {/* Scanning scan line visual overlay */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_#10b981] animate-bounce" style={{ animationDuration: '4s' }} />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 py-1 text-center text-[8px] text-slate-500 font-bold uppercase tracking-wider">Hồ sơ quét</div>
                </div>

                {/* Document metadata table details */}
                <div className="flex-grow text-left space-y-3">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">HỌ VÀ TÊN</span>
                      <strong className="text-white font-black tracking-wide text-sm">{viewCheckedInDoc.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">SỐ GIẤY TỜ ({viewCheckedInDoc.docType})</span>
                      <strong className="text-blue-400 font-mono font-bold text-xs truncate block max-w-[150px]">{viewCheckedInDoc.docNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">NGÀY SINH</span>
                      <strong className="text-slate-200 font-semibold">{viewCheckedInDoc.dob}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">GIỚI TÍNH</span>
                      <strong className="text-slate-200 font-semibold">{viewCheckedInDoc.gender}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">QUỐC TỊCH</span>
                      <strong className="text-slate-200 font-semibold">{viewCheckedInDoc.nationality}</strong>
                    </div>
                    <div>
                      {viewCheckedInDoc.docType === 'PASSPORT' ? (
                        <>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase">HẠN HỘ CHIẾU</span>
                          <strong className="text-amber-400 font-semibold">{viewCheckedInDoc.expiryDate}</strong>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase">NƠI CẤP</span>
                          <strong className="text-slate-200 font-semibold text-[10.5px] truncate block max-w-[150px]" title={viewCheckedInDoc.placeOfIssue}>
                            {viewCheckedInDoc.placeOfIssue}
                          </strong>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Mã hóa AES-256
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">LIÊN THÔNG VNEID</span>
                  </div>
                </div>
              </div>

              {/* Security advice notice */}
              <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl flex items-start gap-2 text-[10.5px] text-slate-400 leading-normal mt-5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <p>
                  Thẻ lưu trú này đã được đẩy tự động lên Cổng dịch vụ công Quốc gia quản lý cư trú. Bạn có thể sử dụng mã này để check-in thẳng tại quầy tự động (Kiosk) hoặc nhận phòng trực tiếp từ quầy VIP không cần xếp hàng.
                </p>
              </div>

              {/* Close controls */}
              <button
                onClick={() => setViewCheckedInDoc(null)}
                className="w-full py-3 bg-white text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-100 transition-colors cursor-pointer mt-5"
              >
                Đồng ý & Đóng lại
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL & MODIFY POLICY REQUEST MODAL */}
      <AnimatePresence>
        {selectedBookingForPolicy !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedBookingForPolicy(null);
                setPolicySuccessMsg(null);
              }}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 z-10 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => {
                  setSelectedBookingForPolicy(null);
                  setPolicySuccessMsg(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {policySuccessMsg ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Gửi Yêu Cầu Thành Công</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{policySuccessMsg}</p>
                  <button
                    onClick={() => {
                      setSelectedBookingForPolicy(null);
                      setPolicySuccessMsg(null);
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Xác nhận & Đóng
                  </button>
                </div>
              ) : (
                <div className="space-y-5 text-left">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest block w-max">
                      QUY TRÌNH HỖ TRỢ KHÁCH HÀNG
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                      Thủ tục Đổi ngày / Huỷ phòng hoàn tiền
                    </h3>
                    <p className="text-slate-400 text-xs">Phòng đặt: <strong className="text-slate-700">{bookedList[selectedBookingForPolicy]?.name}</strong></p>
                  </div>

                  {/* Mode Tab buttons */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPolicyModalType('cancel')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${policyModalType === 'cancel' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Huỷ phòng & Hoàn tiền
                    </button>
                    <button
                      type="button"
                      onClick={() => setPolicyModalType('modify')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${policyModalType === 'modify' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Đổi ngày lưu trú
                    </button>
                  </div>

                  {policyModalType === 'cancel' ? (
                    <div className="space-y-4">
                      {/* Calculate refund status block */}
                      {(() => {
                        const booking = bookedList[selectedBookingForPolicy];
                        const calc = calculateRefund(booking?.checkIn || '2026-07-05', booking?.totalPrice || 0);
                        return (
                          <div className={`p-4 rounded-2xl border ${calc.refundPercentage === 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : calc.refundPercentage === 50 ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                            <div className="flex justify-between items-center text-xs font-bold mb-2">
                              <span>MỨC HOÀN TRẢ KHẢ THI:</span>
                              <span className="text-sm uppercase">{calc.refundPercentage}% HOÀN TRẢ</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p>• Ngày nhận phòng dự kiến: <strong>{booking?.checkIn}</strong> (Còn lại {calc.daysRemaining} ngày)</p>
                              <p>• Tổng giá trị đặt phòng: <strong>{formatVND(booking?.totalPrice || 0)}</strong></p>
                              <p>• Số tiền sẽ hoàn trả: <strong className="text-sm font-extrabold">{formatVND(calc.refundAmount)}</strong></p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-200/40 text-[10px] opacity-80 leading-normal">
                              {calc.refundPercentage === 100 && "✓ Bạn thuộc diện HUỶ PHÒNG MIỄN PHÍ. Nhận 100% hoàn tiền về tài khoản ngân hàng."}
                              {calc.refundPercentage === 50 && "⚠️ Bạn thuộc diện HUỶ MUỘN (1-3 ngày trước check-in). Thu phí 50% tiền cọc, hoàn trả 50% số tiền."}
                              {calc.refundPercentage === 0 && "✕ Bạn thuộc diện KHÔNG THỂ HOÀN TRẢ (dưới 24h). Phí phạt huỷ phòng là 100%."}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Refund fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Lý do huỷ phòng <span className="text-rose-500">*</span></label>
                          <textarea 
                            rows={2}
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Vui lòng cho biết lý do để giúp GrandStay cải thiện dịch vụ..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 transition-all resize-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ngân hàng thụ hưởng</label>
                            <select
                              value={refundBankName}
                              onChange={(e) => setRefundBankName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 transition-all font-bold"
                            >
                              <option value="Vietcombank">Vietcombank</option>
                              <option value="Techcombank">Techcombank</option>
                              <option value="MB Bank">MB Bank</option>
                              <option value="Vietinbank">Vietinbank</option>
                              <option value="ACB">ACB</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Chủ tài khoản ngân hàng <span className="text-rose-500">*</span></label>
                            <input 
                              type="text" 
                              value={refundBankOwner}
                              onChange={(e) => setRefundBankOwner(e.target.value)}
                              placeholder="NGUYEN VAN A"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-rose-500 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Số tài khoản nhận tiền <span className="text-rose-500">*</span></label>
                          <input 
                            type="text" 
                            value={refundBankAccount}
                            onChange={(e) => setRefundBankAccount(e.target.value)}
                            placeholder="Nhập số tài khoản ngân hàng..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-rose-500 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Current dates */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <p>📅 Ngày ở hiện tại: <strong>{bookedList[selectedBookingForPolicy]?.checkIn}</strong> đến <strong>{bookedList[selectedBookingForPolicy]?.checkOut}</strong></p>
                        <p className="text-[11px] text-slate-400">GrandStay hỗ trợ đổi lịch trình miễn phí nếu liên hệ trước 24 giờ nhận phòng.</p>
                      </div>

                      {/* Modification fields */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ngày Check-in mới <span className="text-rose-500">*</span></label>
                            <input 
                              type="date" 
                              value={newCheckIn}
                              onChange={(e) => setNewCheckIn(e.target.value)}
                              min="2026-06-30"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ngày Check-out mới <span className="text-rose-500">*</span></label>
                            <input 
                              type="date" 
                              value={newCheckOut}
                              onChange={(e) => setNewCheckOut(e.target.value)}
                              min={newCheckIn || "2026-06-30"}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all font-bold"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Lý do thay đổi <span className="text-rose-500">*</span></label>
                          <textarea 
                            rows={3}
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Ví dụ: Thay đổi lịch công tác, lịch bay bị hoãn..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForPolicy(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitRequest}
                      disabled={!refundReason || (policyModalType === 'cancel' ? (!refundBankAccount || !refundBankOwner) : (!newCheckIn || !newCheckOut))}
                      className={`flex-1 py-3 text-white rounded-xl text-xs font-bold transition-all cursor-pointer ${policyModalType === 'cancel' ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'}`}
                    >
                      Gửi yêu cầu đổi/huỷ
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
