import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Coffee,
  Wifi,
  Waves,
  Compass,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Map as MapIcon,
  List,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Branch, SearchQuery } from '../types';
import { POPULAR_AMENITIES, formatVND } from '../data';
import { useBranches } from '../hooks/useBranches';
import BranchMap from './BranchMap';

/**
 * Maps an API Branch object (from the backend) to the app's Branch type
 * used by the frontend components.
 */
function mapApiBranchToAppBranch(apiBranch: {
  id: string;
  name: string;
  brand?: string;
  location?: string;
  address?: string;
  description?: string;
  image_url?: string;
  amenities?: string;
}): Branch {
  let amenities: string[] = ['Free Wi-Fi'];
  if (apiBranch.amenities) {
    try {
      const parsed = JSON.parse(apiBranch.amenities);
      if (Array.isArray(parsed)) amenities = parsed;
    } catch {
      // If not JSON, treat as comma-separated
      amenities = apiBranch.amenities.split(',').map((a) => a.trim()).filter(Boolean);
    }
  }

  return {
    id: apiBranch.id,
    name: apiBranch.name,
    region: apiBranch.location || 'Vietnam',
    brand: apiBranch.brand || 'GrandStay',
    description: apiBranch.description || '',
    image: apiBranch.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    rating: 4.5,
    reviews: 128,
    pricePerNight: 3_000_000,
    amenities,
    popularFor: 'GrandStay Experience',
  };
}

interface RoomListProps {
  searchQuery: SearchQuery;
  onBook: (branch: Branch) => void;
}

export default function RoomList({ searchQuery, onBook }: RoomListProps) {
  const { data: apiResponse, isLoading, error } = useBranches({});
  const apiBranches = apiResponse?.data ?? [];
  const branches = apiBranches.map(mapApiBranchToAppBranch);
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);

  // Core filtering logic based on Location, Brand, and Optional Amenity Tag
  const filteredBranches = branches.filter((branch) => {
    // 1. Filter by Location
    if (searchQuery.location !== 'All Locations' && searchQuery.location !== '') {
      // Check if branch name or region contains query location
      const queryLoc = searchQuery.location.toLowerCase();
      const matchLoc = branch.name.toLowerCase().includes(queryLoc) || 
                       branch.region.toLowerCase().includes(queryLoc) ||
                       branch.id.toLowerCase().includes(queryLoc);
      if (!matchLoc) return false;
    }

    // 2. Filter by Brand
    if (searchQuery.brand !== 'All Brands' && searchQuery.brand !== '') {
      if (branch.brand !== searchQuery.brand) return false;
    }

    // 3. Filter by Selected Amenity Chip
    if (selectedAmenity) {
      if (!branch.amenities.includes(selectedAmenity)) return false;
    }

    // 4. Filter by Search Query Amenities Checklist
    if (searchQuery.amenities && searchQuery.amenities.length > 0) {
      const matchAll = searchQuery.amenities.every(am => branch.amenities.includes(am));
      if (!matchAll) return false;
    }

    return true;
  });

  // Render amenity icon dynamically
  const getAmenityIcon = (name: string) => {
    switch (name) {
      case 'Pool':
      case 'Heated Pool':
      case 'Infinity Pool':
        return <Waves className="w-4 h-4 text-sky-500" />;
      case 'Spa':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'Free Wi-Fi':
        return <Wifi className="w-4 h-4 text-emerald-500" />;
      default:
        return <Coffee className="w-4 h-4 text-amber-500" />;
    }
  };

  // Loading state while fetching branches from API
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-brand-gold" />
            Hệ Thống Nghỉ Dưỡng GrandStay
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Unique experiences at top GrandStay branches
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Choose your favorite location and enjoy your vacation in absolute luxury, tailored specifically to your stay preferences.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải danh sách chi nhánh...</p>
        </div>
      </section>
    );
  }

  // Error state when API call fails
  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-brand-gold" />
            Hệ Thống Nghỉ Dưỡng GrandStay
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Unique experiences at top GrandStay branches
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-xl mx-auto px-6">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Không thể tải dữ liệu chi nhánh</h3>
          <p className="text-slate-500 text-sm mb-6">
            Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5 text-brand-gold" />
          Hệ Thống Nghỉ Dưỡng GrandStay
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          Unique experiences at top GrandStay branches
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Choose your favorite location and enjoy your vacation in absolute luxury, tailored specifically to your stay preferences.
        </p>
      </div>

      {/* Amenity Filter Chips Row */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 pb-2 border-b border-slate-100/60 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedAmenity(null)}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            selectedAmenity === null
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100/70'
          }`}
        >
          Tất cả dịch vụ
        </button>
        {POPULAR_AMENITIES.map((amenity) => (
          <button
            key={amenity.id}
            onClick={() => setSelectedAmenity(selectedAmenity === amenity.id ? null : amenity.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              selectedAmenity === amenity.id
                ? 'bg-brand-blue text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <span>{amenity.label}</span>
          </button>
        ))}
      </div>

      {/* Filtering Status Feed */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 max-w-7xl mx-auto bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            Đang hiển thị kết quả tìm kiếm cho:{' '}
            <strong className="text-slate-700">
              {searchQuery.location === 'All Locations' ? 'Mọi chi nhánh' : searchQuery.location}
            </strong>{' '}
            • Phân khúc:{' '}
            <strong className="text-slate-700">
              {searchQuery.brand === 'All Brands' ? 'Mọi thương hiệu' : searchQuery.brand}
            </strong>
            {selectedAmenity && (
              <>
                {' '}
                • Dịch vụ:{' '}
                <strong className="text-brand-blue">
                  {POPULAR_AMENITIES.find((a) => a.id === selectedAmenity)?.label}
                </strong>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="font-semibold text-slate-700">
            Tìm thấy {filteredBranches.length} chi nhánh phù hợp
          </div>

          {/* Toggle View Mode: Grid vs. Map Split View */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Dạng lưới</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split' 
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Bản đồ vệ tinh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cards list */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-500 w-full`}>
          <AnimatePresence mode="popLayout">
            {filteredBranches.length > 0 ? (
              <motion.div 
                layout
                className={`grid grid-cols-1 ${viewMode === 'split' ? 'sm:grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}
              >
                {filteredBranches.map((branch, index) => (
                  <motion.div
                    layout
                    key={branch.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredBranchId(branch.id)}
                    onMouseLeave={() => setHoveredBranchId(null)}
                    className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col h-full ${
                      hoveredBranchId === branch.id 
                        ? 'border-blue-300 shadow-xl scale-[1.01] bg-slate-50/30' 
                        : 'border-slate-100 shadow-lg hover:shadow-xl hover:border-slate-200/80'
                    }`}
                  >
                    
                    {/* Branch Image Container */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <img
                        src={branch.image}
                        alt={branch.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Category Pill Tag */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                        <span className="bg-slate-950/85 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border border-white/10">
                          {branch.brand}
                        </span>
                        <span className="bg-amber-500/90 backdrop-blur-sm text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {branch.popularFor}
                        </span>
                      </div>

                      {/* Rating Overlay */}
                      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 border border-slate-100">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-extrabold text-slate-800">{branch.rating}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({branch.reviews})</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      
                      {/* Title & Desc */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold tracking-wider uppercase mb-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{branch.region}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-brand-blue transition-colors duration-200 line-clamp-1 mb-2.5">
                          {branch.name}
                        </h3>
                        <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-3 mb-5">
                          {branch.description}
                        </p>
                      </div>

                      {/* Amenities Tags */}
                      <div className="mb-6">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tiện ích nổi bật</span>
                        <div className="flex flex-wrap gap-1.5">
                          {branch.amenities.map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600 hover:bg-white hover:border-slate-200 transition-colors"
                            >
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-5 border-t border-slate-100/80 mt-auto space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Giá khởi điểm</span>
                            <span className="text-xs text-slate-400 font-medium">Bao gồm buffet sáng</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatVND(branch.pricePerNight)}</span>
                            <span className="text-xs text-slate-500 font-medium block">/ đêm nghỉ</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onBook(branch)}
                          className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/15 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-300 transition-transform group-hover/btn:scale-110" />
                          <span>Đặt Phòng Ngay</span>
                        </button>
                      </div>

                    </div>

                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-xl mx-auto px-6"
              >
                <Compass className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy chi nhánh phù hợp</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Vui lòng thử thay đổi điều kiện lọc, địa điểm nghỉ dưỡng hoặc phân khúc thương hiệu khác để tiếp tục tìm kiếm.
                </p>
                <button
                  onClick={() => {
                    // reset search query to all
                    onBook({} as any); // hacky way to notify reset parent state
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Reset bộ lọc tìm kiếm
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Sticky Interactive Map */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 h-[580px] sticky top-24 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 flex flex-col relative z-20">
            <BranchMap 
              branches={filteredBranches}
              selectedLocation={searchQuery.location}
              onBook={onBook}
              hoveredBranchId={hoveredBranchId}
              setHoveredBranchId={setHoveredBranchId}
            />
          </div>
        )}
      </div>

    </section>
  );
}
