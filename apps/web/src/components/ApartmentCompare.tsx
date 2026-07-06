import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Trash2, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Bed, 
  Bath, 
  Maximize2, 
  DollarSign, 
  Star, 
  Dog, 
  Compass,
  Calendar
} from 'lucide-react';
import { Apartment } from '../types';
import { formatVND } from '../data';

// Helper function to render amenity icons inside the comparison table
function renderAmenityIcon(amenity: string) {
  const norm = amenity.toLowerCase();
  if (norm.includes('wifi') || norm.includes('internet')) return '🌐';
  if (norm.includes('pool') || norm.includes('bể bơi') || norm.includes('hồ bơi')) return '🏊';
  if (norm.includes('gym') || norm.includes('thể hình') || norm.includes('fitness')) return '🏋️';
  if (norm.includes('park') || norm.includes('đỗ xe') || norm.includes('parking')) return '🅿️';
  if (norm.includes('kitchen') || norm.includes('bếp')) return '🍳';
  if (norm.includes('tv') || norm.includes('smart tv') || norm.includes('truyền hình')) return '📺';
  if (norm.includes('condition') || norm.includes('điều hòa') || norm.includes('ac')) return '❄️';
  if (norm.includes('balcony') || norm.includes('ban công')) return '🌅';
  if (norm.includes('security') || norm.includes('bảo vệ') || norm.includes('camera')) return '🛡️';
  if (norm.includes('washing') || norm.includes('giặt') || norm.includes('dryer')) return '🧺';
  if (norm.includes('fridge') || norm.includes('tủ lạnh')) return '🧊';
  if (norm.includes('sofa') || norm.includes('ghế')) return '🛋️';
  return '✨';
}

interface ApartmentCompareBarProps {
  selectedApartments: Apartment[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export function ApartmentCompareBar({
  selectedApartments,
  onRemove,
  onClear,
  onOpenCompare
}: ApartmentCompareBarProps) {
  if (selectedApartments.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-t-2xl" />

      {/* Selected Items Previews */}
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            So Sánh Căn Hộ
          </span>
          <span className="text-xs text-slate-300 font-medium">
            ({selectedApartments.length}/3 đã chọn)
          </span>
        </div>
        
        {/* Thumbnails list */}
        <div className="flex items-center gap-2.5 mt-2 overflow-x-auto max-w-full py-1">
          {selectedApartments.map((apt) => (
            <div 
              key={apt.id} 
              className="relative group shrink-0 w-12 h-12 bg-slate-950 rounded-xl overflow-hidden border border-slate-800"
            >
              <img 
                src={apt.image} 
                alt={apt.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => onRemove(apt.id)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 transition-opacity cursor-pointer"
                title="Xóa khỏi danh sách"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {selectedApartments.length < 3 && (
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-[10px] font-bold">
              +{3 - selectedApartments.length}
            </div>
          )}
        </div>
      </div>

      {/* Actions suite */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
        <button
          onClick={onClear}
          className="px-3.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Xóa tất cả
        </button>

        <button
          disabled={selectedApartments.length < 2}
          onClick={onOpenCompare}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
            selectedApartments.length >= 2
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/15 cursor-pointer active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <span>So Sánh Ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

interface ApartmentCompareModalProps {
  selectedApartments: Apartment[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onBook: (apartment: Apartment) => void;
  onOpenTour?: (apartment: Apartment) => void;
}

export function ApartmentCompareModal({
  selectedApartments,
  onClose,
  onRemove,
  onBook,
  onOpenTour
}: ApartmentCompareModalProps) {
  // All unique amenities across selected apartments for comparison row matching
  const allAmenities = Array.from(
    new Set(selectedApartments.flatMap(apt => apt.amenities))
  );

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-800 text-white max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Dynamic header styling */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          
          <div className="space-y-1 text-left">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block">
              Chi Tiết So Sánh
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
              Bảng So Sánh Các Căn Hộ Đã Chọn
            </h3>
            <p className="text-xs text-slate-400">
              Phân tích các đặc điểm, giá cả, và tiện nghi để chọn được không gian ưng ý nhất.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable table container */}
        <div className="flex-grow overflow-x-auto p-4 sm:p-6">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 pr-4 text-xs font-black uppercase tracking-wider text-slate-400 w-1/4">
                  Đặc điểm căn hộ
                </th>
                {selectedApartments.map((apt) => (
                  <th key={apt.id} className="py-4 px-4 w-1/4 relative group">
                    <div className="flex flex-col gap-2">
                      <div className="h-32 w-full rounded-2xl overflow-hidden relative border border-slate-800 bg-slate-950">
                        <img 
                          src={apt.image} 
                          alt={apt.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => onRemove(apt.id)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors cursor-pointer border border-slate-800"
                          title="Xóa khỏi bảng so sánh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                          ★ {apt.rating} ({apt.reviews} đánh giá)
                        </span>
                      </div>

                      <div className="text-left space-y-0.5 mt-1">
                        <span className="text-[9px] text-amber-400 font-extrabold uppercase block tracking-wider leading-tight">
                          {apt.type}
                        </span>
                        <strong className="text-sm font-black text-white block line-clamp-1" title={apt.name}>
                          {apt.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {apt.location}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}

                {/* Fill empty cells if comparing less than 3 */}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="py-4 px-4 w-1/4">
                    <div className="h-full min-h-[180px] rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-3xl mb-1 text-slate-700">＋</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Thêm Căn Hộ
                      </p>
                      <span className="text-[9px] text-slate-600 font-light mt-1">
                        Đóng bảng và click "Thêm so sánh" ở các căn khác
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-850 text-xs">
              {/* Row: Monthly Rent */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Giá Thuê Chi Nhánh</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4 font-black text-amber-400 text-sm">
                    {formatVND(apt.monthlyPrice)} <span className="text-[10px] text-slate-500 font-normal">/tháng</span>
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-price-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Row: Size */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Diện Tích Sử Dụng</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4 font-semibold text-slate-200">
                    {apt.area} m²
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-size-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Row: Rooms arrangement */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Số Lượng Phòng</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4 text-slate-200">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-500" /> {apt.bedrooms} Phòng Ngủ
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-500" /> {apt.bathrooms} Nhà Vệ Sinh
                      </span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-rooms-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Row: Pet Friendliness */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Chính Sách Thú Cưng</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4">
                    {apt.petFriendly ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        <Dog className="w-3.5 h-3.5" />
                        Có cho phép nuôi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-850 px-2.5 py-1 rounded-lg">
                        Không hỗ trợ
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-pets-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Row: 3D Tour Presence */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Tham Quan 3D (VR)</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4">
                    {apt.hasVirtualTour ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        <Compass className="w-3.5 h-3.5 animate-pulse" />
                        Sẵn sàng
                      </span>
                    ) : (
                      <span className="text-slate-500 font-light">Không khả dụng</span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-tour-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Row: Available From */}
              <tr>
                <td className="py-3.5 pr-4 font-bold text-slate-400">Ngày Bàn Giao Căn Hộ</td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-3.5 px-4 text-slate-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {apt.availableFrom}
                    </span>
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-avail-${i}`} className="py-3.5 px-4 text-slate-700">—</td>
                ))}
              </tr>

              {/* Section Header: AMENITIES COMPARISON */}
              <tr className="bg-slate-950/40">
                <td colSpan={4} className="py-2.5 px-3 font-black text-[10px] uppercase tracking-wider text-emerald-400">
                  Phân Tích Tiện Nghi Chi Tiết (Amenities)
                </td>
              </tr>

              {allAmenities.map((amenity) => (
                <tr key={amenity}>
                  <td className="py-3 pr-4 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span>{renderAmenityIcon(amenity)}</span>
                    <span>{amenity}</span>
                  </td>
                  {selectedApartments.map((apt) => {
                    const hasAmenity = apt.amenities.includes(amenity);
                    return (
                      <td key={apt.id} className="py-3 px-4">
                        {hasAmenity ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800/20 border border-slate-800 flex items-center justify-center text-slate-600">
                            <span className="text-[10px]">✕</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                    <td key={`empty-amenity-${i}`} className="py-3 px-4 text-slate-700">—</td>
                  ))}
                </tr>
              ))}

              {/* Action Buttons Row */}
              <tr className="bg-slate-900 sticky bottom-0">
                <td className="py-6 pr-4"></td>
                {selectedApartments.map((apt) => (
                  <td key={apt.id} className="py-6 px-4">
                    <div className="flex flex-col gap-2">
                      {apt.hasVirtualTour && onOpenTour && (
                        <button
                          onClick={() => {
                            onOpenTour(apt);
                          }}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-700/50 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-500" />
                          Xem 3D Tour
                        </button>
                      )}

                      <button
                        onClick={() => onBook(apt)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-center"
                      >
                        Đăng ký thuê ngay
                      </button>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - selectedApartments.length }).map((_, i) => (
                  <td key={`empty-action-${i}`} className="py-6 px-4"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
