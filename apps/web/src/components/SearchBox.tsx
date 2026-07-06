import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ChevronDown, 
  Search, 
  Building, 
  Plus, 
  Minus, 
  Sparkles, 
  X,
  Palmtree,
  Compass,
  ArrowRight
} from 'lucide-react';
import { SearchQuery } from '../types';
import { LOCATIONS, BRANDS, POPULAR_AMENITIES } from '../data';

interface SearchBoxProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery: SearchQuery;
}

export default function SearchBox({ onSearch, initialQuery }: SearchBoxProps) {
  const [query, setQuery] = useState<SearchQuery>(initialQuery);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // References for handling clicks outside
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent state as query changes
  const triggerSearch = (updatedQuery: SearchQuery) => {
    setQuery(updatedQuery);
    onSearch(updatedQuery);
  };

  // Helper to change check-in / check-out dates
  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    const updated = { ...query, [field]: value };
    triggerSearch(updated);
  };

  // Guest counters modifier
  const adjustCount = (field: 'adults' | 'children' | 'rooms', type: 'inc' | 'dec') => {
    let val = query[field];
    if (type === 'inc') {
      val += 1;
    } else {
      val = Math.max(field === 'adults' || field === 'rooms' ? 1 : 0, val - 1);
    }
    const updated = { ...query, [field]: val };
    triggerSearch(updated);
  };

  // Tab switcher
  const handleTabChange = (tab: 'stay' | 'longTerm' | 'experience') => {
    const updated = { ...query, activeTab: tab };
    triggerSearch(updated);
  };

  // Calculate duration of stay
  const getNightsCount = () => {
    if (!query.checkIn || !query.checkOut) return 0;
    const start = new Date(query.checkIn);
    const end = new Date(query.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : diffDays;
  };

  // Location suggestions metadata with images
  const locationDetails = [
    { name: 'Thai Nguyen', desc: 'Trà xanh & đồi chè thơ mộng', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Phu Quoc', desc: 'Cát trắng & hoàng hôn rực rỡ', img: 'https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Da Nang', desc: 'Cầu Rồng & bãi biển Mỹ Khê', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Hanoi', desc: 'Hồ Gươm cổ kính & văn hóa ẩm thực', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Saigon', desc: 'Sầm uất, nhộn nhịp & hiện đại', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Sapa', desc: 'Ruộng bậc thang & sương mờ', img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=80&h=80&q=80' },
  ];

  // Brand segments explanations
  const brandDetails = [
    { name: 'GrandStay Premier', desc: 'Dịch vụ thượng hạng & chăm sóc chuyên biệt', badge: 'Premier' },
    { name: 'GrandStay Resort', desc: 'Biệt thự bãi biển & thiên nhiên hoang sơ', badge: 'Resort' },
    { name: 'GrandStay Lux', desc: 'Phong cách sống đẳng cấp & skybar rực rỡ', badge: 'Lux' },
    { name: 'GrandStay Heritage', desc: 'Kiến trúc Indochine cổ kính & yên bình', badge: 'Heritage' },
    { name: 'GrandStay Suites', desc: 'Căn hộ thông minh tại trung tâm đô thị', badge: 'Suites' },
  ];

  const handleQuickSearch = (location: string, brand: string = 'All Brands') => {
    const updated = {
      ...query,
      location: location === 'All Locations' ? 'All Locations' : location,
      brand: brand
    };
    triggerSearch(updated);
  };

  const nights = getNightsCount();

  return (
    <div 
      id="search-panel" 
      ref={containerRef}
      className="relative max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 z-30 mb-12"
    >
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-t-2xl w-fit border border-white/15 border-b-0 ml-4">
        <button
          onClick={() => handleTabChange('stay')}
          className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            query.activeTab === 'stay' 
              ? 'bg-white text-slate-950 shadow-md' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {query.activeTab === 'stay' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 rounded-xl bg-white -z-10" />
          )}
          <span className="flex items-center gap-1.5">
            <Palmtree className="w-4 h-4 text-brand-gold" />
            Nghỉ Dưỡng Stay
          </span>
        </button>

        <button
          onClick={() => handleTabChange('longTerm')}
          className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            query.activeTab === 'longTerm' 
              ? 'bg-white text-slate-950 shadow-md' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {query.activeTab === 'longTerm' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 rounded-xl bg-white -z-10" />
          )}
          <span className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Dài Hạn Co-living
          </span>
        </button>

        <button
          onClick={() => handleTabChange('experience')}
          className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            query.activeTab === 'experience' 
              ? 'bg-white text-slate-950 shadow-md' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {query.activeTab === 'experience' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 rounded-xl bg-white -z-10" />
          )}
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            Trải Nghiệm Độc Bản
          </span>
        </button>
      </div>

      {/* Redesigned Search Panel Wrapper */}
      <div className="bg-white rounded-2xl rounded-tl-none shadow-2xl border border-slate-100 p-5 sm:p-7 transition-all duration-300 hover:shadow-blue-500/5">
        
        {/* Main Ribbon Search Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
          
          {/* FIELD 1: WHERE / LOCATION */}
          <div className="relative lg:col-span-3">
            <div 
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
              className={`flex items-center gap-3.5 px-4 py-3 sm:py-4 rounded-xl cursor-pointer hover:bg-white transition-all duration-200 border border-transparent ${
                activeDropdown === 'location' ? 'bg-white border-blue-100 shadow-sm' : ''
              }`}
            >
              <div className="p-2.5 bg-blue-50 text-brand-blue rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Địa điểm nghỉ dưỡng</span>
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {query.location === 'All Locations' ? 'Tất cả chi nhánh' : query.location}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown: Location */}
            <AnimatePresence>
              {activeDropdown === 'location' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-3 w-full sm:w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 z-40"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gợi ý địa điểm hot</span>
                    <button onClick={() => setActiveDropdown(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                    <button
                      onClick={() => {
                        triggerSearch({ ...query, location: 'All Locations' });
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${
                        query.location === 'All Locations' ? 'bg-blue-50/50 text-brand-blue' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm">Tất cả chi nhánh</span>
                        <span className="block text-[11px] text-slate-400 font-normal">Khám phá toàn bộ hệ thống GrandStay</span>
                      </div>
                    </button>
                    {locationDetails.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          triggerSearch({ ...query, location: loc.name });
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${
                          query.location === loc.name ? 'bg-blue-50/50 text-brand-blue' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img src={loc.img} alt={loc.name} className="w-9 h-9 rounded-lg object-cover" />
                        <div>
                          <span className="block text-sm">{loc.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">{loc.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FIELD 2: BRAND */}
          <div className="relative lg:col-span-3">
            <div 
              onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
              className={`flex items-center gap-3.5 px-4 py-3 sm:py-4 rounded-xl cursor-pointer hover:bg-white transition-all duration-200 border border-transparent ${
                activeDropdown === 'brand' ? 'bg-white border-blue-100 shadow-sm' : ''
              }`}
            >
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hạng thương hiệu</span>
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {query.brand === 'All Brands' ? 'Tất cả phân khúc' : query.brand}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown: Brand */}
            <AnimatePresence>
              {activeDropdown === 'brand' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-3 w-full sm:w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 z-40"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phân khúc cao cấp</span>
                    <button onClick={() => setActiveDropdown(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                    <button
                      onClick={() => {
                        triggerSearch({ ...query, brand: 'All Brands' });
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                        query.brand === 'All Brands' ? 'bg-blue-50/50 text-brand-blue' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="block text-sm">Tất cả phân khúc</span>
                        <span className="block text-[11px] text-slate-400 font-normal">Hiển thị mọi hạng phòng</span>
                      </div>
                    </button>
                    {brandDetails.map((br) => (
                      <button
                        key={br.name}
                        onClick={() => {
                          triggerSearch({ ...query, brand: br.name });
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-start justify-between gap-2 ${
                          query.brand === br.name ? 'bg-blue-50/50 text-brand-blue' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex-1">
                          <span className="block text-sm">{br.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">{br.desc}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded text-slate-500 uppercase tracking-wider">
                          {br.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FIELD 3: DATES (CHECK-IN & CHECK-OUT) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-1 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-100/80 px-1">
            
            {/* Check In */}
            <div className="relative">
              <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-white transition-all duration-200">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <label htmlFor="check-in-date" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer">Ngày đến</label>
                  <input
                    id="check-in-date"
                    type="date"
                    value={query.checkIn}
                    onChange={(e) => handleDateChange('checkIn', e.target.value)}
                    className="block w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Check Out */}
            <div className="relative">
              <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-white transition-all duration-200">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl hidden sm:block">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <label htmlFor="check-out-date" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer">Ngày đi</label>
                  <input
                    id="check-out-date"
                    type="date"
                    value={query.checkOut}
                    onChange={(e) => handleDateChange('checkOut', e.target.value)}
                    className="block w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Nights indicator overlay */}
            <div className="col-span-2 flex items-center justify-between px-3 pb-1 -mt-1 text-[11px]">
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {nights > 0 ? `Thời gian lưu trú: ${nights} đêm` : 'Chọn ngày'}
              </span>
              <div className="flex gap-1.5 text-slate-400">
                <button 
                  onClick={() => {
                    const today = new Date();
                    const next = new Date();
                    next.setDate(today.getDate() + 3);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const inStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
                    const outStr = `${next.getFullYear()}-${pad(next.getMonth()+1)}-${pad(next.getDate())}`;
                    triggerSearch({ ...query, checkIn: inStr, checkOut: outStr });
                  }}
                  className="hover:text-brand-blue hover:underline"
                >
                  +3 ngày
                </button>
                <span>•</span>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const next = new Date();
                    next.setDate(today.getDate() + 7);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const inStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
                    const outStr = `${next.getFullYear()}-${pad(next.getMonth()+1)}-${pad(next.getDate())}`;
                    triggerSearch({ ...query, checkIn: inStr, checkOut: outStr });
                  }}
                  className="hover:text-brand-blue hover:underline"
                >
                  +1 tuần
                </button>
              </div>
            </div>

          </div>

          {/* FIELD 4: GUESTS & ROOMS */}
          <div className="relative lg:col-span-2">
            <div 
              onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
              className={`flex items-center gap-3 px-3 py-2.5 sm:py-4 rounded-xl cursor-pointer hover:bg-white transition-all duration-200 border border-transparent ${
                activeDropdown === 'guests' ? 'bg-white border-blue-100 shadow-sm' : ''
              }`}
            >
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Số khách</span>
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {query.adults + query.children} Khách, {query.rooms} Phòng
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'guests' ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown: Guests */}
            <AnimatePresence>
              {activeDropdown === 'guests' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-40"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cấu hình phòng lưu trú</span>
                    <button onClick={() => setActiveDropdown(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Adults */}
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Người lớn</span>
                      <span className="block text-xs text-slate-400">Từ 13 tuổi trở lên</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustCount('adults', 'dec')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center font-bold text-slate-800">{query.adults}</span>
                      <button 
                        onClick={() => adjustCount('adults', 'inc')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-2.5 border-t border-slate-50">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Trẻ em</span>
                      <span className="block text-xs text-slate-400">Độ tuổi từ 2 - 12</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustCount('children', 'dec')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center font-bold text-slate-800">{query.children}</span>
                      <button 
                        onClick={() => adjustCount('children', 'inc')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between py-2.5 border-t border-slate-50">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Số phòng</span>
                      <span className="block text-xs text-slate-400">Yêu cầu phòng riêng biệt</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustCount('rooms', 'dec')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center font-bold text-slate-800">{query.rooms}</span>
                      <button 
                        onClick={() => adjustCount('rooms', 'inc')}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Popular Amenities Filter Selection */}
        <div className="mt-5 pt-5 border-t border-slate-100" id="amenities-filter-container">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5" id="amenities-filter-title">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            Lọc theo tiện ích phòng phổ biến:
          </span>
          <div className="flex flex-wrap gap-3" id="amenities-checkboxes-wrapper">
            {[
              { id: 'Free Wi-Fi', label: 'Wifi miễn phí' },
              { id: 'Pool', label: 'Hồ bơi' },
              { id: 'Spa', label: 'Spa' },
              { id: 'Gym', label: 'Gym' }
            ].map((amenity) => {
              const isChecked = query.amenities?.includes(amenity.id) || false;
              return (
                <button
                  key={amenity.id}
                  type="button"
                  id={`btn-amenity-${amenity.id.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    const currentSelected = query.amenities || [];
                    let updatedSelected: string[];
                    if (currentSelected.includes(amenity.id)) {
                      updatedSelected = currentSelected.filter(id => id !== amenity.id);
                    } else {
                      updatedSelected = [...currentSelected, amenity.id];
                    }
                    const updated = { ...query, amenities: updatedSelected };
                    triggerSearch(updated);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50 border-brand-blue text-brand-blue shadow-sm'
                      : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div 
                    id={`checkbox-indicator-${amenity.id.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked 
                        ? 'bg-brand-blue border-brand-blue text-white' 
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" id={`svg-check-${amenity.id.replace(/\s+/g, '-').toLowerCase()}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span id={`label-amenity-${amenity.id.replace(/\s+/g, '-').toLowerCase()}`}>{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Action row & Trending Tags */}
        <div className="mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Quick Filter Tags (Gợi ý nhanh) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
              Gợi ý nhanh:
            </span>
            <button
              onClick={() => handleQuickSearch('Thai Nguyen', 'GrandStay Premier')}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 hover:bg-blue-50/50 hover:text-brand-blue hover:border-blue-100 transition-all duration-200"
            >
              Nghỉ dưỡng Thái Nguyên
            </button>
            <button
              onClick={() => handleQuickSearch('Phu Quoc', 'GrandStay Resort')}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 hover:bg-blue-50/50 hover:text-brand-blue hover:border-blue-100 transition-all duration-200"
            >
              Phú Quốc Resort sát biển
            </button>
            <button
              onClick={() => handleQuickSearch('Sapa')}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 hover:bg-blue-50/50 hover:text-brand-blue hover:border-blue-100 transition-all duration-200"
            >
              Săn mây đỉnh Sapa
            </button>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={() => onSearch(query)}
            className="w-full md:w-auto self-stretch md:self-auto bg-brand-blue hover:bg-brand-blue-hover text-white px-8 h-14 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/30 transform active:scale-98 transition-all duration-300 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>
              {query.activeTab === 'experience' 
                ? 'Tìm Tour Trải Nghiệm' 
                : query.activeTab === 'longTerm' 
                ? 'Tìm Co-living Dài Hạn' 
                : 'Tìm Kiếm Phòng Trống'}
            </span>
            <ArrowRight className="w-4 h-4 text-white/80" />
          </button>

        </div>

      </div>

    </div>
  );
}
