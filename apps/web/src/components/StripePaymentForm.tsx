import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, ShieldCheck, Check, Sparkles, Loader2, Info } from 'lucide-react';

interface StripePaymentFormProps {
  totalPrice: number;
  paymentStatus: 'pending' | 'verifying' | 'completed';
  onSubmitPayment: (cardDetails: { number: string; name: string }) => void;
  bookingCode: string;
}

export default function StripePaymentForm({
  totalPrice,
  paymentStatus,
  onSubmitPayment,
  bookingCode
}: StripePaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to detect card network
  const getCardType = (number: string) => {
    const cleanNum = number.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (cleanNum.startsWith('5')) return 'mastercard';
    if (cleanNum.startsWith('3')) return 'amex';
    return 'generic';
  };

  // Helper to format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length > 16) return;
    
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    
    if (errors.cardNumber) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.cardNumber;
        return copy;
      });
    }
  };

  // Helper to format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) return;

    if (input.length > 2) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    setCardExpiry(input);

    if (errors.cardExpiry) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.cardExpiry;
        return copy;
      });
    }
  };

  // Helper to format CVC (3-4 digits)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) return;
    setCardCvc(input);

    if (errors.cardCvc) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.cardCvc;
        return copy;
      });
    }
  };

  // Helper to format Cardholder Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Allow letters and spaces only
    if (/[^A-Z\s]/.test(value)) return;
    setCardName(value);

    if (errors.cardName) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.cardName;
        return copy;
      });
    }
  };

  // Autofill mock test card for the user
  const handleAutofillDemo = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardName('NGUYEN THE PHONG');
    setCardExpiry('12/28');
    setCardCvc('123');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const cleanNumber = cardNumber.replace(/\s+/g, '');

    if (cleanNumber.length !== 16) {
      newErrors.cardNumber = 'Số thẻ phải đủ 16 chữ số';
    }
    if (!cardName.trim()) {
      newErrors.cardName = 'Vui lòng nhập tên chủ thẻ';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newErrors.cardExpiry = 'Định dạng tháng/năm không hợp lệ (MM/YY)';
    } else {
      const [month, year] = cardExpiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        newErrors.cardExpiry = 'Tháng không hợp lệ (01-12)';
      }
    }
    if (cardCvc.length < 3) {
      newErrors.cardCvc = 'Mã CVC phải từ 3-4 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmitPayment({
      number: cardNumber,
      name: cardName
    });
  };

  const cardType = getCardType(cardNumber);

  return (
    <div className="space-y-6">
      
      {/* 3D Physical Credit Card Simulation */}
      <div className="flex justify-center py-2 perspective-[1000px]">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-80 sm:w-96 h-48 sm:h-56 rounded-2xl shadow-2xl preserve-3d cursor-pointer text-white"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Card Front Side */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between backface-hidden shadow-2xl overflow-hidden">
            {/* Background luxury watermarks */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] bg-amber-400/20 text-brand-gold font-extrabold tracking-widest px-2 py-0.5 rounded uppercase border border-amber-400/30">
                  GRANDSTAY LUXURY
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Cổng Stripe Secure</p>
              </div>
              
              {/* Card Network Logo */}
              <div className="h-8 flex items-center">
                {cardType === 'visa' && (
                  <span className="text-xl font-black italic tracking-wide text-blue-400">VISA</span>
                )}
                {cardType === 'mastercard' && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 opacity-90 relative z-10" />
                    <div className="w-5 h-5 rounded-full bg-amber-500 opacity-90 -ml-2.5" />
                  </div>
                )}
                {cardType === 'amex' && (
                  <span className="text-sm font-black bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded">AMEX</span>
                )}
                {cardType === 'generic' && (
                  <CreditCard className="w-6 h-6 text-slate-400" />
                )}
              </div>
            </div>

            {/* Chip & contactless wave */}
            <div className="flex items-center gap-3 relative z-10">
              {/* Gold chip design */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/30 p-1 flex flex-col justify-between shadow-inner">
                <div className="w-full h-0.5 bg-slate-800/20" />
                <div className="w-full h-0.5 bg-slate-800/20" />
                <div className="w-full h-0.5 bg-slate-800/20" />
              </div>
              <svg className="w-4 h-4 text-slate-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12a10 10 0 0114 0" />
                <path d="M8 12a6 6 0 018 0" />
                <path d="M11 12a2 2 0 012 0" />
              </svg>
            </div>

            {/* Card Number display */}
            <div className="font-mono text-base sm:text-xl font-black tracking-widest text-slate-100 relative z-10 drop-shadow">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div className="space-y-0.5 text-left max-w-[70%]">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-bold">Chủ thẻ</span>
                <p className="font-mono text-xs sm:text-sm font-black truncate text-slate-200 uppercase">
                  {cardName || 'NGUYEN THE PHONG'}
                </p>
              </div>
              <div className="space-y-0.5 text-right shrink-0">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-bold">Hạn dùng</span>
                <p className="font-mono text-xs sm:text-sm font-black text-slate-200">
                  {cardExpiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>

          {/* Card Back Side (fleshed out with Rotate-Y) */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-white/10 flex flex-col justify-between backface-hidden [transform:rotateY(180s)] p-5 sm:p-6 shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
            <div className="absolute top-4 left-0 w-full h-10 bg-slate-950" /> {/* Magnetic stripe */}
            
            <div className="space-y-3 pt-6 text-left">
              <p className="text-[8px] text-slate-500 font-mono text-right pr-2">MÃ BẢO MẬT CVC/CVV</p>
              <div className="flex items-center justify-end gap-3 pr-2">
                {/* Simulated signature box */}
                <div className="w-1/2 h-8 bg-slate-800 rounded flex items-center justify-center font-mono italic text-slate-400 text-[10px] tracking-widest">
                  GrandStay Club
                </div>
                {/* Actual CVC */}
                <div className="w-12 h-8 bg-white text-slate-900 font-mono font-black text-sm flex items-center justify-center rounded border border-slate-300 shadow-inner">
                  {cardCvc || '•••'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-slate-500 leading-normal font-mono border-t border-slate-800/80 pt-3">
              <p>Stripe Safe checkout API layer v3.0.</p>
              <p className="text-right">GrandStay Hotels Co., Ltd.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <span className="text-[10px] text-slate-400 font-medium">
          💡 Click vào thẻ ở trên để xoay lật mặt trước/sau
        </span>
      </div>

      {/* Actual Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Cardholder name input */}
        <div className="space-y-1 text-left">
          <label htmlFor="stripe-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tên Trên Thẻ <span className="text-rose-500">*</span>
          </label>
          <input
            id="stripe-name"
            type="text"
            required
            value={cardName}
            onChange={handleNameChange}
            onFocus={() => setIsFlipped(false)}
            placeholder="NGUYEN THE PHONG"
            className={`w-full px-4 py-3 bg-slate-50 border ${
              errors.cardName ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:bg-white focus:ring-4 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all`}
          />
          {errors.cardName && <span className="text-[10px] font-bold text-rose-500 block">{errors.cardName}</span>}
        </div>

        {/* Card Number input */}
        <div className="space-y-1 text-left">
          <label htmlFor="stripe-number" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Số Thẻ Tín Dụng / Ghi Nợ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="stripe-number"
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              onFocus={() => setIsFlipped(false)}
              placeholder="4242 4242 4242 4242"
              className={`w-full pl-4 pr-11 py-3 bg-slate-50 border ${
                errors.cardNumber ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:bg-white focus:ring-4 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              <CreditCard className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          {errors.cardNumber && <span className="text-[10px] font-bold text-rose-500 block">{errors.cardNumber}</span>}
        </div>

        {/* Exp date and CVC in a 2-column grid */}
        <div className="grid grid-cols-2 gap-4">
          
          <div className="space-y-1 text-left">
            <label htmlFor="stripe-expiry" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ngày Hết Hạn <span className="text-rose-500">*</span>
            </label>
            <input
              id="stripe-expiry"
              type="text"
              required
              value={cardExpiry}
              onChange={handleExpiryChange}
              onFocus={() => setIsFlipped(false)}
              placeholder="MM/YY"
              className={`w-full px-4 py-3 bg-slate-50 border ${
                errors.cardExpiry ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:bg-white focus:ring-4 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all text-center`}
            />
            {errors.cardExpiry && <span className="text-[10px] font-bold text-rose-500 block">{errors.cardExpiry}</span>}
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="stripe-cvc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mã Bảo Mật CVC <span className="text-rose-500">*</span>
            </label>
            <input
              id="stripe-cvc"
              type="password"
              required
              maxLength={4}
              value={cardCvc}
              onChange={handleCvcChange}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="123"
              className={`w-full px-4 py-3 bg-slate-50 border ${
                errors.cardCvc ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:bg-white focus:ring-4 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition-all text-center`}
            />
            {errors.cardCvc && <span className="text-[10px] font-bold text-rose-500 block">{errors.cardCvc}</span>}
          </div>

        </div>

        {/* Security / Stripe Branding footer */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="font-medium text-left">
            Thanh toán được xử lý bảo mật trực tiếp thông qua hạ tầng mã hóa cấp độ ngân hàng của <strong className="text-blue-600 font-extrabold">Stripe PCI-DSS Service Provider Level 1</strong>. Thông tin thẻ của quý khách không bao giờ được lưu trữ trên máy chủ của GrandStay.
          </p>
        </div>

        {/* Action and Demonstration buttons */}
        <div className="flex flex-col gap-3 pt-3">
          
          <button
            type="submit"
            disabled={paymentStatus === 'verifying'}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {paymentStatus === 'verifying' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                <span>Stripe Đang Xử Lý Thẻ...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Thanh Toán Với Stripe Secure</span>
              </>
            )}
          </button>

          {/* Demonstration mode auto fill trigger */}
          <div className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-[10px] text-amber-800 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Chế độ thử nghiệm Stripe:</span>
            </span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="px-2 py-1 bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              Tự động nhập thẻ test
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
