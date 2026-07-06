import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Sparkles, Send, ShieldCheck, Heart } from 'lucide-react';

interface FooterSettings {
  newsletterTitle: string;
  newsletterDesc: string;
  brandDesc: string;
  affiliateText: string;
  branchesTitle: string;
  branchesLinks: { label: string; href: string }[];
  servicesTitle: string;
  servicesLinks: { label: string; href: string }[];
  contactTitle: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  copyrightText: string;
}

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  newsletterTitle: "Đăng ký đặc quyền X Member",
  newsletterDesc: "Nhận ngay ưu đãi giảm giá 15% cho phòng đầu tiên và thông báo các đợt mở bán độc quyền.",
  brandDesc: "GrandStay định nghĩa lại chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam. Mỗi chi nhánh là một tác phẩm kiến trúc hòa quyện cùng thiên nhiên bản địa.",
  affiliateText: "Thành viên trực thuộc GrandStay Hospitality Group",
  branchesTitle: "Hệ thống Chi nhánh",
  branchesLinks: [
    { label: "GrandStay Premier Thái Nguyên", href: "#search-panel" },
    { label: "GrandStay Beachfront Phú Quốc", href: "#search-panel" },
    { label: "GrandStay Lux Đà Nẵng", href: "#search-panel" },
    { label: "GrandStay Cloud Retreat Sapa", href: "#search-panel" },
    { label: "GrandStay Heritage Hà Nội", href: "#search-panel" }
  ],
  servicesTitle: "Dịch vụ & Đặc quyền",
  servicesLinks: [
    { label: "Thẻ X Member Đặc quyền", href: "#benefits" },
    { label: "Căn hộ dịch vụ Dài hạn", href: "#long-term" },
    { label: "Dịch vụ Spa & Chăm sóc trị liệu", href: "#spa" },
    { label: "Ẩm thực hữu cơ chuẩn 5 sao", href: "#dining" },
    { label: "Hội nghị & Tiệc cưới Thượng lưu", href: "#events" }
  ],
  contactTitle: "Liên hệ GrandStay",
  contactAddress: "Đại lộ Hùng Vương, Thành phố Thái Nguyên, Việt Nam",
  contactPhone: "+84 (0) 24 1234 5678",
  contactEmail: "contact@grandstay.com.vn",
  copyrightText: "GrandStay. All rights reserved. Designed for ultra-premium hospitality experience."
};

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(() => {
    const saved = localStorage.getItem('gs_footer_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return DEFAULT_FOOTER_SETTINGS;
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('gs_footer_settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      } else {
        setSettings(DEFAULT_FOOTER_SETTINGS);
      }
    };

    window.addEventListener('footer_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('footer_settings_updated', handleUpdate);
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Upper Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left">
          <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-1.5 justify-start">
            <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
            {settings.newsletterTitle}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            {settings.newsletterDesc}
          </p>
        </div>
        <form onSubmit={handleSubscribe} className="w-full md:w-auto max-w-md flex items-center bg-slate-800/80 rounded-xl p-1.5 border border-slate-700 focus-within:border-brand-blue transition-all">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder={subscribed ? "Đăng ký thành công! Cảm ơn bạn." : "Địa chỉ email của bạn..."}
            disabled={subscribed}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder-slate-500 disabled:text-emerald-400"
            required
          />
          <button 
            type="submit"
            disabled={subscribed}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              subscribed 
                ? 'bg-emerald-600 text-white' 
                : 'bg-brand-blue hover:bg-brand-blue-hover text-white'
            }`}
          >
            <span>{subscribed ? 'Đã lưu' : 'Đăng ký'}</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Col */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-900 font-bold text-base shadow-sm">
              G
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Grand<span className="text-brand-blue">Stay</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed font-light">
            {settings.brandDesc}
          </p>
          {settings.affiliateText && (
            <div className="flex items-center gap-2 text-xs text-brand-gold font-semibold justify-start">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{settings.affiliateText}</span>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="text-left">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">{settings.branchesTitle}</h4>
          <ul className="space-y-3.5 text-sm font-light">
            {settings.branchesLinks && settings.branchesLinks.length > 0 ? (
              settings.branchesLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200 block truncate">{link.label}</a>
                </li>
              ))
            ) : (
              <li className="text-slate-500 text-xs italic">Không có liên kết</li>
            )}
          </ul>
        </div>

        {/* Brand Services */}
        <div className="text-left">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">{settings.servicesTitle}</h4>
          <ul className="space-y-3.5 text-sm font-light">
            {settings.servicesLinks && settings.servicesLinks.length > 0 ? (
              settings.servicesLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200 block truncate">{link.label}</a>
                </li>
              ))
            ) : (
              <li className="text-slate-500 text-xs italic">Không có liên kết</li>
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 text-left">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">{settings.contactTitle}</h4>
          <div className="space-y-3 text-sm font-light text-slate-400">
            {settings.contactAddress && (
              <div className="flex items-start gap-3 justify-start">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{settings.contactAddress}</span>
              </div>
            )}
            {settings.contactPhone && (
              <div className="flex items-center gap-3 justify-start">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition-colors">{settings.contactPhone}</a>
              </div>
            )}
            {settings.contactEmail && (
              <div className="flex items-center gap-3 justify-start">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors block truncate">{settings.contactEmail}</a>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Copy */}
      <div className="bg-slate-950 py-6 text-center text-xs text-slate-500 font-light border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {settings.copyrightText}</span>
          <span className="flex items-center gap-1 justify-center sm:justify-end">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in Vietnam
          </span>
        </div>
      </div>

    </footer>
  );
}
