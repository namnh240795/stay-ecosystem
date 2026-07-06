import React, { useState, useEffect } from 'react';
import { Compass, Landmark, Shield, Leaf, Quote, Award, Globe } from 'lucide-react';

export default function AboutSection() {
  // About GrandStay Content States
  const [aboutTagline, setAboutTagline] = useState<string>(() => {
    return localStorage.getItem('gs_about_tagline') || 'HÀNH TRÌNH KIẾN TẠO KIỆT TÁC';
  });
  const [aboutTitle, setAboutTitle] = useState<string>(() => {
    return localStorage.getItem('gs_about_title') || 'Về GrandStay Hospitality Group';
  });
  const [aboutDesc, setAboutDesc] = useState<string>(() => {
    return localStorage.getItem('gs_about_desc') || 'Được thành lập từ năm 2018 với khát vọng tái định nghĩa chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam, GrandStay không ngừng kiến tạo những không gian sống đầy nghệ thuật, kết hợp hoàn hảo giữa tiện nghi thượng hạng và văn hóa bản địa đặc sắc.';
  });
  const [aboutVisionTitle, setAboutVisionTitle] = useState<string>(() => {
    return localStorage.getItem('gs_about_vision_title') || 'Sứ mệnh bảo tồn & phát triển trải nghiệm bản địa thượng lưu';
  });
  const [aboutVisionDesc, setAboutVisionDesc] = useState<string>(() => {
    return localStorage.getItem('gs_about_vision_desc') || 'Mỗi điểm đến của GrandStay không chỉ là một nơi lưu trú, mà là một tác phẩm kiến trúc tôn vinh tinh hoa vùng miền. Từ những thửa ruộng bậc thang mờ sương tại Sapa, bờ cát trắng hoang sơ Phú Quốc, đến nhịp sống tinh tế tại Tràng An Hà Nội, chúng tôi gìn giữ linh hồn của đất mẹ và mang đến trải nghiệm nghỉ dưỡng xa xỉ đích thực cho quý khách.';
  });
  const [aboutStats, setAboutStats] = useState<{ value: string; label: string }[]>(() => {
    const saved = localStorage.getItem('gs_about_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { value: '06', label: 'Tỉnh thành trọng điểm' },
      { value: '150k+', label: 'Lượt khách lưu trú' },
      { value: '15+', label: 'Giải thưởng quốc tế' }
    ];
  });
  const [aboutPillars, setAboutPillars] = useState<{ title: string; desc: string }[]>(() => {
    const saved = localStorage.getItem('gs_about_pillars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { title: 'Kiến Trúc Độc Bản', desc: 'Thiết kế hòa quyện giữa nét hiện đại phương Tây và họa tiết nghệ thuật truyền thống Việt Nam.' },
      { title: 'An Ninh & Bảo Mật Tuyệt Đối', desc: 'Đảm bảo sự riêng tư tuyệt đối cho kỳ nghỉ của giới thượng lưu với công nghệ quản lý an ninh đa lớp.' },
      { title: 'Lối Sống Xanh & Chữa Lành', desc: 'Ưu tiên nông sản hữu cơ địa phương, không rác thải nhựa, kết hợp liệu trình spa thảo dược truyền thống.' }
    ];
  });
  const [aboutQuote, setAboutQuote] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote') || 'Tại GrandStay, chúng tôi tin rằng xa xỉ không chỉ nằm ở những phiến đá marble đắt tiền hay ánh đèn pha lê lấp lánh, mà xa xỉ đích thực là sự thấu hiểu sâu sắc tâm hồn của người lữ hành, mang đến cho họ những phút giây tĩnh lặng vô giá bên gia đình.';
  });
  const [aboutQuoteAuthor, setAboutQuoteAuthor] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote_author') || 'Trần Hoàng Sơn';
  });
  const [aboutQuoteRole, setAboutQuoteRole] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote_role') || 'Người Sáng Lập & Chủ Tịch GrandStay Group';
  });

  useEffect(() => {
    const handleSyncAbout = () => {
      setAboutTagline(localStorage.getItem('gs_about_tagline') || 'HÀNH TRÌNH KIẾN TẠO KIỆT TÁC');
      setAboutTitle(localStorage.getItem('gs_about_title') || 'Về GrandStay Hospitality Group');
      setAboutDesc(localStorage.getItem('gs_about_desc') || 'Được thành lập từ năm 2018 với khát vọng tái định nghĩa chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam, GrandStay không ngừng kiến tạo những không gian sống đầy nghệ thuật, kết hợp hoàn hảo giữa tiện nghi thượng hạng và văn hóa bản địa đặc sắc.');
      setAboutVisionTitle(localStorage.getItem('gs_about_vision_title') || 'Sứ mệnh bảo tồn & phát triển trải nghiệm bản địa thượng lưu');
      setAboutVisionDesc(localStorage.getItem('gs_about_vision_desc') || 'Mỗi điểm đến của GrandStay không chỉ là một nơi lưu trú, mà là một tác phẩm kiến trúc tôn vinh tinh hoa vùng miền. Từ những thửa ruộng bậc thang mờ sương tại Sapa, bờ cát trắng hoang sơ Phú Quốc, đến nhịp sống tinh tế tại Tràng An Hà Nội, chúng tôi gìn giữ linh hồn của đất mẹ và mang đến trải nghiệm nghỉ dưỡng xa xỉ đích thực cho quý khách.');
      
      const statsSaved = localStorage.getItem('gs_about_stats');
      if (statsSaved) {
        try {
          const parsed = JSON.parse(statsSaved);
          if (Array.isArray(parsed) && parsed.length > 0) setAboutStats(parsed);
        } catch (e) {}
      } else {
        setAboutStats([
          { value: '06', label: 'Tỉnh thành trọng điểm' },
          { value: '150k+', label: 'Lượt khách lưu trú' },
          { value: '15+', label: 'Giải thưởng quốc tế' }
        ]);
      }

      const pillarsSaved = localStorage.getItem('gs_about_pillars');
      if (pillarsSaved) {
        try {
          const parsed = JSON.parse(pillarsSaved);
          if (Array.isArray(parsed) && parsed.length > 0) setAboutPillars(parsed);
        } catch (e) {}
      } else {
        setAboutPillars([
          { title: 'Kiến Trúc Độc Bản', desc: 'Thiết kế hòa quyện giữa nét hiện đại phương Tây và họa tiết nghệ thuật truyền thống Việt Nam.' },
          { title: 'An Ninh & Bảo Mật Tuyệt Đối', desc: 'Đảm bảo sự riêng tư tuyệt đối cho kỳ nghỉ của giới thượng lưu với công nghệ quản lý an ninh đa lớp.' },
          { title: 'Lối Sống Xanh & Chữa Lành', desc: 'Ưu tiên nông sản hữu cơ địa phương, không rác thải nhựa, kết hợp liệu trình spa thảo dược truyền thống.' }
        ]);
      }

      setAboutQuote(localStorage.getItem('gs_about_quote') || 'Tại GrandStay, chúng tôi tin rằng xa xỉ không chỉ nằm ở những phiến đá marble đắt tiền hay ánh đèn pha lê lấp lánh, mà xa xỉ đích thực là sự thấu hiểu sâu sắc tâm hồn của người lữ hành, mang đến cho họ những phút giây tĩnh lặng vô giá bên gia đình.');
      setAboutQuoteAuthor(localStorage.getItem('gs_about_quote_author') || 'Trần Hoàng Sơn');
      setAboutQuoteRole(localStorage.getItem('gs_about_quote_role') || 'Người Sáng Lập & Chủ Tịch GrandStay Group');
    };

    window.addEventListener('storage', handleSyncAbout);
    window.addEventListener('about_content_updated', handleSyncAbout);
    return () => {
      window.removeEventListener('storage', handleSyncAbout);
      window.removeEventListener('about_content_updated', handleSyncAbout);
    };
  }, []);

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100 text-left">
      <div className="space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-brand-gold text-xs font-black uppercase tracking-widest block">
            {aboutTagline}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {aboutTitle}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-brand-gold mx-auto rounded-full" />
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-light">
            {aboutDesc}
          </p>
        </div>

        {/* Bento Grid: Pillars & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Vision Card - Left Big */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/5 flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-gold border border-white/10">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {aboutVisionTitle}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {aboutVisionDesc}
              </p>
            </div>

            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 relative z-10 text-center">
              {aboutStats.map((stat, idx) => (
                <div key={idx}>
                  <span className="block text-2xl sm:text-3xl font-black text-brand-gold">{stat.value}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillars list - Right Columns */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            
            {aboutPillars.map((pillar, idx) => {
              let IconComponent = Landmark;
              let bgClass = "bg-amber-50 text-brand-gold border border-amber-100";
              if (idx === 1) {
                IconComponent = Shield;
                bgClass = "bg-blue-50 text-blue-600 border border-blue-100";
              } else if (idx === 2) {
                IconComponent = Leaf;
                bgClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
              }
              
              return (
                <div key={idx} className="bg-slate-50/70 hover:bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-300 flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${bgClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{pillar.title}</h4>
                    <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* CEO Quote Card with background decoration */}
        <div className="bg-slate-50/50 rounded-3xl p-8 sm:p-12 border border-slate-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="absolute top-10 right-10 opacity-5 text-slate-900 pointer-events-none">
            <Quote className="w-32 h-32" />
          </div>
          
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-900 to-amber-950 shrink-0 flex items-center justify-center border-2 border-brand-gold text-brand-gold text-2xl font-black shadow-md">
            CEO
          </div>

          <div className="space-y-4 text-left relative z-10">
            <p className="text-slate-700 text-sm sm:text-base italic leading-relaxed font-medium">
              "{aboutQuote}"
            </p>
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">{aboutQuoteAuthor}</h4>
              <span className="text-xs text-brand-gold font-bold uppercase tracking-wider block">{aboutQuoteRole}</span>
            </div>
          </div>
        </div>

        {/* Award Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
            <Award className="w-8 h-8 text-brand-gold" />
            <span className="text-xs text-slate-400 font-mono">WORLD LUXURY AWARDS</span>
            <strong className="text-xs sm:text-sm text-slate-800 font-bold block">Chuỗi Khách Sạn Sang Trọng Hàng Đầu 2025</strong>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
            <Globe className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-slate-400 font-mono">GREEN HOTEL CERTIFICATE</span>
            <strong className="text-xs sm:text-sm text-slate-800 font-bold block">Chứng Nhận Kiến Trúc Xanh Phát Triển Bền Vững</strong>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
            <Award className="w-8 h-8 text-brand-gold" />
            <span className="text-xs text-slate-400 font-mono">VIETNAM TRAVEL NOMINEE</span>
            <strong className="text-xs sm:text-sm text-slate-800 font-bold block">Thương Hiệu Nghỉ Dưỡng Được Yêu Thích Nhất</strong>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
            <Compass className="w-8 h-8 text-emerald-500" />
            <span className="text-xs text-slate-400 font-mono">HERITAGE PRESERVATION</span>
            <strong className="text-xs sm:text-sm text-slate-800 font-bold block">Bảo Tồn Bản Sắc Văn Hóa Địa Phương Xuất Sắc</strong>
          </div>
        </div>

      </div>
    </section>
  );
}
