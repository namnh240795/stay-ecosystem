import React from 'react';
import { Sparkles, ArrowRight, Check, Percent } from 'lucide-react';

interface BenefitsSectionProps {
  onSearchClick: () => void;
}

export default function BenefitsSection({ onSearchClick }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100 text-left">
      <div className="bg-slate-900 rounded-3xl overflow-hidden p-8 sm:p-12 text-white relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-50/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              X Member Exclusive Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tận hưởng đặc quyền lưu trú thượng hạng cùng GrandStay
            </h2>
            <p className="text-slate-300 font-light leading-relaxed">
              Đăng ký tài khoản thành viên để nâng tầm chuyến du lịch của bạn với hàng loạt tiện ích miễn phí: từ đón tiễn sân bay bằng xe hạng sang, nâng hạng phòng tự động đến quyền vào sảnh chờ thương gia Premium Lounge.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200">Đưa đón sân bay 0đ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200">Bữa sáng thượng hạng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200">Nâng hạng phòng free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200">Hủy phòng linh hoạt</span>
              </div>
            </div>
            <button 
              onClick={onSearchClick}
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-slate-950 px-6 h-12 rounded-xl text-sm font-bold shadow-md transition-all duration-300 transform active:scale-98"
            >
              <span>Tìm phòng trống ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Promo Interactive Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Thành viên hạng kim cương</span>
              <div className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg uppercase border border-amber-500/20">
                Diamond VIP
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-brand-gold text-lg font-bold border border-brand-gold/30">
                TM
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Trần Minh Anh</h3>
                <span className="text-slate-400 text-xs font-mono">ID: GS-889-2026</span>
              </div>
            </div>
            <div className="space-y-3.5 pt-4 border-t border-white/5 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Mã giảm giá áp dụng tự động:</span>
                <span className="font-bold text-brand-gold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  GOLDSTAY15
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Số đêm tích lũy năm 2026:</span>
                <span className="font-bold text-white">24 đêm</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed font-light">
              "Từ ngày sử dụng GrandStay, mọi kỳ nghỉ của gia đình tôi luôn trọn vẹn và an tâm nhất. Dịch vụ chăm sóc khách hàng vô cùng chuyên nghiệp!"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
