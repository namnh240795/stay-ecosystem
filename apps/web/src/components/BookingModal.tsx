import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle,
  X,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  Phone,
  User,
  Check,
  MessageSquare,
  Sparkles,
  Clock,
  QrCode,
  Loader2,
  Landmark
} from 'lucide-react';
import { Branch, SearchQuery, UserSim } from '../types';
import { formatVND } from '../data';
import { useCreateBooking } from '../hooks/useBookings';
import StripePaymentForm from './StripePaymentForm';
import GuestReview from './GuestReview';

interface BookingModalProps {
  selectedBranch: Branch | null;
  onClose: () => void;
  searchQuery: SearchQuery;
  currentUser: UserSim;
  onReviewAdded: (branchId: string, newReview: any) => void;
  onBookingSuccess: (bookedItem: Branch, totalPrice: number) => void;
}

export default function BookingModal({
  selectedBranch,
  onClose,
  searchQuery,
  currentUser,
  onReviewAdded,
  onBookingSuccess
}: BookingModalProps) {
  if (!selectedBranch) return null;

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  // React Query mutation for creating bookings via API
  const createBookingMutation = useCreateBooking();

  // SePay & Holding States
  const [bookingStep, setBookingStep] = useState<'form' | 'hold' | 'success'>('form');
  const [bookingCode, setBookingCode] = useState('');
  const [holdTimer, setHoldTimer] = useState(600); // 10 minutes (600s)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'completed'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'sepay' | 'stripe'>('sepay');
  const [cardNumberLast4, setCardNumberLast4] = useState('');

  // Handle countdown for booking hold
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (bookingStep === 'hold' && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => prev - 1);
      }, 1000);
    } else if (holdTimer === 0 && bookingStep === 'hold') {
      alert("Thời gian giữ chỗ tạm thời đã hết hạn! Vui lòng thực hiện đặt phòng lại.");
      setBookingStep('form');
    }
    return () => clearInterval(interval);
  }, [bookingStep, holdTimer]);

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const handleCopy = (text: string, type: 'account' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  // Calculate nights
  const getNightsCount = () => {
    const start = new Date(searchQuery.checkIn);
    const end = new Date(searchQuery.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 3 : diffDays;
  };

  const nights = getNightsCount();
  const totalPrice = selectedBranch ? selectedBranch.pricePerNight * nights * searchQuery.rooms : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Hold the reservation and show SePay QR
  const handleInitiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    // Generate unique booking code
    const code = `GS2026${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingCode(code);
    setHoldTimer(600); // 10 minutes
    setPaymentStatus('pending');
    setBookingStep('hold');
  };

  // Step 2: Confirm SePay payment callback simulation
  const handleSimulatePayment = () => {
    setPaymentStatus('verifying');
    createBookingMutation.mutate(
      {
        apartmentId: selectedBranch.id,
        branchId: selectedBranch.id,
        customerName: guestName,
        customerEmail: currentUser.email || `${guestPhone}@grandstay.vn`,
        customerPhone: guestPhone,
        checkIn: searchQuery.checkIn,
        checkOut: searchQuery.checkOut,
        guests: searchQuery.adults + searchQuery.children,
        notes: specialRequest || 'Đặt phòng trực tuyến qua Customer Portal.',
      },
      {
        onSuccess: () => {
          const bookedItem: Branch = {
            ...selectedBranch,
            paymentMethod: 'sepay' as const,
            bookingCode: bookingCode,
            checkIn: searchQuery.checkIn,
            checkOut: searchQuery.checkOut,
            totalPrice: totalPrice,
            guestName: guestName,
            guestPhone: guestPhone,
            guestEmail: currentUser.email || `${guestPhone}@grandstay.vn`,
            rooms: searchQuery.rooms,
            adults: searchQuery.adults,
            children: searchQuery.children,
            bookingStatus: 'Reserved',
            description: specialRequest || 'Đặt phòng trực tuyến qua Customer Portal.'
          };

          onBookingSuccess(bookedItem, totalPrice);
          setPaymentStatus('completed');
          setBookingStep('success');
        },
        onError: () => {
          setPaymentStatus('pending');
          alert('Có lỗi xảy ra khi tạo đặt phòng. Vui lòng thử lại.');
        },
      }
    );
  };

  // Step 2 (Stripe option): Confirm Stripe payment secure submit
  const handleStripePaymentSubmit = (cardDetails: { number: string; name: string }) => {
    setPaymentStatus('verifying');
    const cleanNumber = cardDetails.number.replace(/\s+/g, '');
    const last4 = cleanNumber.slice(-4);
    setCardNumberLast4(last4);

    createBookingMutation.mutate(
      {
        apartmentId: selectedBranch.id,
        branchId: selectedBranch.id,
        customerName: guestName,
        customerEmail: currentUser.email || `${guestPhone}@grandstay.vn`,
        customerPhone: guestPhone,
        checkIn: searchQuery.checkIn,
        checkOut: searchQuery.checkOut,
        guests: searchQuery.adults + searchQuery.children,
        notes: specialRequest || 'Đặt phòng trực tuyến qua Customer Portal.',
      },
      {
        onSuccess: () => {
          const bookedItem: Branch = {
            ...selectedBranch,
            paymentMethod: 'stripe' as const,
            cardNumberLast4: last4,
            bookingCode: bookingCode,
            checkIn: searchQuery.checkIn,
            checkOut: searchQuery.checkOut,
            totalPrice: totalPrice,
            guestName: guestName,
            guestPhone: guestPhone,
            guestEmail: currentUser.email || `${guestPhone}@grandstay.vn`,
            rooms: searchQuery.rooms,
            adults: searchQuery.adults,
            children: searchQuery.children,
            bookingStatus: 'Reserved',
            description: specialRequest || 'Đặt phòng trực tuyến qua Customer Portal.'
          };

          onBookingSuccess(bookedItem, totalPrice);
          setPaymentStatus('completed');
          setBookingStep('success');
        },
        onError: () => {
          setPaymentStatus('pending');
          alert('Có lỗi xảy ra khi tạo đặt phòng. Vui lòng thử lại.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop shadow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      {/* Modal Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-white/5 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-brand-gold" />
          <div className="text-left">
            <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest block mb-1">
              {selectedBranch.brand} • KHÁCH SẠN & KHU NGHỈ DƯỠNG
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Đặt Phòng Nghỉ Dưỡng Thượng Hạng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with scrolling */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 text-left no-scrollbar">
          {/* Success Screen State */}
          {bookingStep === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100 shadow-md">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Đặt phòng thành công!</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  {paymentMethod === 'stripe' ? 'Hệ thống Stripe đã xử lý và xác nhận thanh toán thành công.' : 'Cổng SePay đã xác nhận thanh toán thành công.'} Cảm ơn quý khách <strong className="text-slate-800 font-bold">{guestName}</strong> đã tin tưởng lựa chọn <strong className="text-slate-800 font-bold">{selectedBranch.name}</strong> cho kỳ nghỉ dưỡng sắp tới.
                </p>
              </div>
              
              {/* Stay Receipt Details as a beautiful luxury card */}
              <div className="bg-slate-50/80 rounded-3xl p-6 text-left text-xs max-w-md mx-auto space-y-4 border border-slate-100 relative overflow-hidden shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                <div className="flex justify-between items-center border-b border-slate-200/55 pb-3">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Chi nhánh nghỉ dưỡng:</span>
                  <strong className="text-slate-800 font-black text-sm">{selectedBranch.name}</strong>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-200/55 pb-3">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Mã đặt phòng (ID):</span>
                  <strong className="font-mono text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded text-sm uppercase font-black">
                    {bookingCode}
                  </strong>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-200/55 pb-3">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Thời gian lưu trú:</span>
                  <strong className="text-slate-700 font-bold text-xs">{searchQuery.checkIn} đến {searchQuery.checkOut} ({nights} đêm)</strong>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-200/55 pb-3">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Cấu hình phòng:</span>
                  <strong className="text-slate-700 font-bold">{searchQuery.rooms} Phòng x {searchQuery.adults} Người lớn, {searchQuery.children} Trẻ em</strong>
                </div>
                
                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-800 uppercase tracking-wide">Trạng thái thanh toán:</span>
                  <strong className="font-black text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {paymentMethod === 'stripe' ? `Đã thanh toán qua Stripe (•••• ${cardNumberLast4 || '4242'})` : 'Đã thanh toán SePay'}
                  </strong>
                </div>

                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-800 uppercase tracking-wide">Tổng chi phí thanh toán:</span>
                  <strong className="font-black text-lg text-blue-600">{formatVND(totalPrice)}</strong>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100/80 rounded-2xl p-4 text-left text-[11px] text-amber-800 leading-relaxed max-w-md mx-auto flex items-start gap-3">
                <span className="text-base shrink-0">🔔</span>
                <p className="font-medium">
                  Hóa đơn điện tử và mã phòng đã được gửi tự động tới số điện thoại <strong className="text-amber-950 font-black">{guestPhone}</strong> của bạn. Nhân viên GrandStay sẽ liên hệ lại trong vòng 15 phút để xác nhận giờ đón và các yêu cầu đi kèm.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-300 cursor-pointer"
                >
                  Quay lại trang chủ
                </button>
              </div>
            </motion.div>
          ) : bookingStep === 'hold' ? (
            /* HOLDING & PAYMENT OPTION STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-left"
            >
              {/* Hold Timer Alert Header */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-rose-500 h-1 transition-all duration-1000" style={{ width: `${(holdTimer / 600) * 100}%` }} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Hệ thống đang giữ chỗ phòng của bạn</span>
                  </div>
                  <span className="font-mono text-sm font-black text-rose-600 bg-white border border-rose-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-4 h-4 animate-spin text-rose-500" style={{ animationDuration: '4s' }} />
                    {formatTime(holdTimer)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {paymentMethod === 'stripe' ? (
                    <>Để bảo đảm giữ phòng cho hành trình của bạn, vui lòng hoàn tất thanh toán bảo mật bằng thẻ qua cổng quốc tế <strong className="text-slate-800">Stripe</strong> bên dưới trước khi thời gian giữ chỗ kết thúc. Hết 10 phút, phòng sẽ tự động giải phóng trên hệ thống.</>
                  ) : (
                    <>Để bảo đảm giữ phòng cho hành trình của bạn, vui lòng hoàn tất quét mã QR thanh toán của cổng <strong className="text-slate-800">SePay (Chuyển khoản)</strong> bên dưới trước khi thời gian giữ chỗ kết thúc. Hết 10 phút, phòng sẽ tự động giải phóng trên hệ thống.</>
                  )}
                </p>
              </div>

              {paymentMethod === 'sepay' ? (
                <>
                  {/* QR Code and Transfer detail container */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Left: QR Code Container */}
                    <div className="md:col-span-5 bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-inner relative group">
                        {(paymentStatus === 'verifying' || createBookingMutation.isPending) && (
                          <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center p-4 z-10 transition-all">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Đang kiểm tra...</span>
                          </div>
                        )}
                        <img 
                          src={`https://qr.sepay.vn/img?acc=190356789999&bank=Techcombank&amount=${totalPrice}&des=${bookingCode}`}
                          alt="VietQR SePay" 
                          className="w-44 h-44 object-contain transition-all hover:scale-105 duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                          <QrCode className="w-3.5 h-3.5" /> Quét qua Mobile Banking
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium px-2 mt-1">
                          Sử dụng bất kỳ ứng dụng ngân hàng nào (Vietcombank, MB Bank, Techcombank,...) để quét mã thanh toán tự động nhanh chóng.
                        </p>
                      </div>
                    </div>

                    {/* Right: Transfer detail values */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-4 text-left">
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm flex-1">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-brand-gold" />
                          Thông tin chuyển khoản thủ công
                        </h5>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-semibold">Ngân hàng:</span>
                            <strong className="text-slate-800 font-black">Techcombank (TCB)</strong>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-semibold">Chủ tài khoản:</span>
                            <strong className="text-slate-800 font-bold text-[11px] text-right">CÔNG TY CP DU LỊCH & NGHỈ DƯỠNG GRANDSTAY</strong>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-semibold">Số tài khoản:</span>
                            <div className="flex items-center gap-2">
                              <strong className="text-blue-600 font-mono font-black text-sm">190356789999</strong>
                              <button
                                type="button"
                                onClick={() => handleCopy('190356789999', 'account')}
                                className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded px-1.5 py-0.5 transition-all cursor-pointer flex items-center gap-1 shadow-sm border border-slate-200/40"
                              >
                                {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Copy'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-semibold">Nội dung chuyển khoản:</span>
                            <div className="flex items-center gap-2">
                              <strong className="text-amber-600 font-mono font-black text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 uppercase tracking-wider">{bookingCode}</strong>
                              <button
                                type="button"
                                onClick={() => handleCopy(bookingCode, 'memo')}
                                className="text-[10px] font-bold bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-500 rounded px-1.5 py-0.5 transition-all cursor-pointer flex items-center gap-1 shadow-sm border border-slate-200/40"
                              >
                                {copiedMemo ? <Check className="w-3 h-3 text-emerald-600" /> : 'Copy'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-400 font-semibold">Số tiền cần thanh toán:</span>
                            <strong className="text-slate-900 font-black text-base">{formatVND(totalPrice)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Note on automatic detection via SePay */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 leading-relaxed flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="font-semibold">
                          Cổng thanh toán <strong className="text-blue-900">SePay</strong> tự động khớp lệnh chuyển khoản bằng nội dung chuyển khoản <strong className="font-mono text-amber-700 bg-amber-100/50 px-1 rounded">{bookingCode}</strong>. Quý khách vui lòng không tự ý thay đổi nội dung chuyển khoản để hệ thống duyệt phòng tự động ngay lập tức.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Verification Simulation block */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setBookingStep('form')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg"
                    >
                      ← Quay lại sửa thông tin khách
                    </button>

                    {/* Payment simulation and confirmation button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={paymentStatus === 'verifying' || createBookingMutation.isPending}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {paymentStatus === 'verifying' || createBookingMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                            <span>SePay Đang Kiểm Tra...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-slate-200" />
                            <span>Xác Nhận Đã Chuyển Khoản</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mock quick simulation hint */}
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>💡 <strong>Mô phỏng thanh toán SePay:</strong> Hệ thống sử dụng cổng kiểm thử SePay tự động. Click nút "Xác Nhận Đã Chuyển Khoản" để hệ thống đối soát và xác thực thành công.</span>
                    <button 
                      type="button" 
                      onClick={handleSimulatePayment}
                      className="text-[9px] font-bold text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Thử ngay
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Stripe Payment Form */}
                  <StripePaymentForm 
                    totalPrice={totalPrice}
                    paymentStatus={paymentStatus}
                    onSubmitPayment={handleStripePaymentSubmit}
                    bookingCode={bookingCode}
                  />

                  {/* Status & Verification Back block */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep('form')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg block text-left"
                    >
                      ← Quay lại sửa thông tin khách
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            /* Interactive Reservation Form State */
            <form onSubmit={handleInitiateBooking} className="space-y-6 text-left">
              {/* Hotel brief banner */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <img src={selectedBranch.image} alt={selectedBranch.name} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" />
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider border border-blue-100 mb-1">
                    {selectedBranch.brand}
                  </span>
                  <h4 className="font-extrabold text-slate-950 text-base">{selectedBranch.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedBranch.region}</span>
                  </div>
                </div>
              </div>

              {/* Booking parameters recap as a luxury ticket stub */}
              <div className="relative overflow-hidden bg-slate-50/70 rounded-2xl border border-slate-100/80 p-5 space-y-4">
                {/* Ticket effect left/right punchouts */}
                <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-white border-r border-slate-200/60 -translate-y-1/2" />
                <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-white border-l border-slate-200/60 -translate-y-1/2" />
                
                <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
                  <div className="space-y-1.5 border-r border-slate-200/60 pr-4">
                    <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      Lịch trình lưu trú
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[10px]">Check-in / Check-out</span>
                      <strong className="text-slate-800 text-sm font-extrabold tracking-tight">
                        {searchQuery.checkIn} → {searchQuery.checkOut}
                      </strong>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-100/60">
                      <Clock className="w-3 h-3" /> {nights} đêm nghỉ dưỡng
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-gold" />
                      Phòng & Khách hàng
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[10px]">Cấu hình đoàn</span>
                      <strong className="text-slate-800 text-sm font-extrabold tracking-tight">
                        {searchQuery.rooms} phòng x {searchQuery.adults} khách
                      </strong>
                    </div>
                    {searchQuery.children > 0 && (
                      <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1.5">
                        +{searchQuery.children} trẻ em cùng đi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inputs: Guest Info */}
              <div className="space-y-5">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-brand-gold pl-2.5">
                  Thông tin khách hàng đại diện
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="guest-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và Tên <span className="text-rose-500">*</span></label>
                    <div className="relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-brand-blue transition-colors">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="guest-name"
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Thế Phong"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-blue-100/40 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="guest-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số Điện Thoại <span className="text-rose-500">*</span></label>
                    <div className="relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-brand-blue transition-colors">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        id="guest-phone"
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Ví dụ: 0912 345 678"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-blue-100/40 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Special request */}
                <div className="space-y-1.5">
                  <label htmlFor="special-request" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Yêu cầu đặc biệt (Không bắt buộc)</label>
                  <div className="relative group/input">
                    <span className="absolute left-4 top-4 text-slate-400 group-focus-within/input:text-brand-blue transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <textarea
                      id="special-request"
                      rows={3}
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      placeholder="Ví dụ: Căn góc hướng biển tầng cao, chuẩn bị nôi em bé, dịch vụ đón sân bay..."
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-blue-100/40 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all duration-300 resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-3 border-brand-gold pl-2.5">
                    Phương thức thanh toán <span className="text-rose-500">*</span>
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Vui lòng chọn phương thức thanh toán trước khi tiến hành tạo đơn giữ chỗ tạm thời.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* SePay option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('sepay')}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-3 cursor-pointer ${
                        paymentMethod === 'sepay'
                          ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${paymentMethod === 'sepay' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 pr-4 text-left">
                        <span className="block text-xs font-extrabold text-slate-800">Chuyển Khoản SePay (VietQR)</span>
                        <span className="block text-[10px] text-slate-500 leading-normal">
                          Quét mã QR chuyển khoản tự động, đối soát duyệt phòng ngay tức thì.
                        </span>
                      </div>
                      {paymentMethod === 'sepay' && (
                        <div className="absolute top-2 right-2 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </button>

                    {/* Stripe option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-3 cursor-pointer ${
                        paymentMethod === 'stripe'
                          ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${paymentMethod === 'stripe' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 pr-4 text-left">
                        <span className="block text-xs font-extrabold text-slate-800">Thẻ Quốc Tế Stripe (Visa/Master)</span>
                        <span className="block text-[10px] text-slate-500 leading-normal">
                          Thanh toán trực tuyến bằng thẻ tín dụng/ghi nợ qua cổng Stripe PCI-DSS an toàn.
                        </span>
                      </div>
                      {paymentMethod === 'stripe' && (
                        <div className="absolute top-2 right-2 w-4.5 h-4.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Guest Reviews Section */}
                <GuestReview 
                  targetId={selectedBranch.id} 
                  targetName={selectedBranch.name} 
                  onReviewAdded={(newReview) => onReviewAdded(selectedBranch.id, newReview)} 
                  currentUser={currentUser}
                />
              </div>

              {/* Price Breakdown Footer inside modal */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 bg-slate-50/40 -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8 shrink-0">
                {/* Price info */}
                <div className="text-left space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng giá trị tạm tính</span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{formatVND(totalPrice)}</span>
                    <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-md font-mono border border-slate-200/60 shadow-sm">
                      {formatVND(selectedBranch.pricePerNight)} x {nights} đêm
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã bao gồm thuế, phí & buffet sáng thượng hạng
                  </span>
                </div>

                {/* Confirm button */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-4 h-4 text-slate-200" />
                  <span>Xác Nhận Giữ Chỗ & Thanh Toán {paymentMethod === 'stripe' ? 'Qua Stripe' : 'Chuyển Khoản'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
