import React from 'react';
import { motion } from 'motion/react';
import { Home, MapPin, Compass, Eye, Sparkles, AlertTriangle, Wrench, Edit2, Trash2, X } from 'lucide-react';
import { Apartment } from '../../types';
import { formatVND } from '../../data';

interface AdminApartmentsTabProps {
  apartments: Apartment[];
  searchTerm: string;
  aptStatusFilter: 'all' | 'Clean' | 'Needs Repair' | 'Under Maintenance';
  setAptStatusFilter: (filter: 'all' | 'Clean' | 'Needs Repair' | 'Under Maintenance') => void;
  activeTourUrl: string | null;
  setActiveTourUrl: (url: string | null) => void;
  setEditingApt: (apt: any) => void;
  setAptForm: (form: any) => void;
  setShowAptModal: (show: boolean) => void;
  setApartments: React.Dispatch<React.SetStateAction<Apartment[]>>;
}

export default function AdminApartmentsTab({
  apartments,
  searchTerm,
  aptStatusFilter,
  setAptStatusFilter,
  activeTourUrl,
  setActiveTourUrl,
  setEditingApt,
  setAptForm,
  setShowAptModal,
  setApartments,
}: AdminApartmentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Unified Header with Icon, Title, Subtitle, and Filter Pills */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/10">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh Mục Căn Hộ Cho Thuê Dài Hạn</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Quản lý trạng thái, giá thuê, bảo trì & VR 3D Tour</p>
            </div>
          </div>

          {/* Quick filter pill buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/40 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setAptStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                aptStatusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({apartments.length})
            </button>
            <button
              type="button"
              onClick={() => setAptStatusFilter('Clean')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                aptStatusFilter === 'Clean'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Sạch sẽ ({apartments.filter(a => !a.maintenanceStatus || a.maintenanceStatus === 'Clean').length})
            </button>
            <button
              type="button"
              onClick={() => setAptStatusFilter('Needs Repair')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                aptStatusFilter === 'Needs Repair'
                  ? 'bg-white text-rose-700 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              Cần sửa ({apartments.filter(a => a.maintenanceStatus === 'Needs Repair').length})
            </button>
            <button
              type="button"
              onClick={() => setAptStatusFilter('Under Maintenance')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                aptStatusFilter === 'Under Maintenance'
                  ? 'bg-white text-amber-700 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              Bảo trì ({apartments.filter(a => a.maintenanceStatus === 'Under Maintenance').length})
            </button>
          </div>
        </div>

        {/* Table stage */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4 sticky left-0 bg-slate-50 z-20 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Căn Hộ / Phòng</th>
                <th className="px-6 py-4">Vị Trí & Loại Căn</th>
                <th className="px-6 py-4">Diện Tích / Thiết Kế</th>
                <th className="px-6 py-4">Giá Thuê / Tháng</th>
                <th className="px-6 py-4">Tính Năng / VR Tour</th>
                <th className="px-6 py-4">Trạng Thái Vận Hành</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {apartments
                .filter(a => {
                  const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.location.toLowerCase().includes(searchTerm.toLowerCase());
                  const status = a.maintenanceStatus || 'Clean';
                  if (aptStatusFilter === 'all') return matchesSearch;
                  return matchesSearch && status === aptStatusFilter;
                })
                .map((apt) => {
                  const status = apt.maintenanceStatus || 'Clean';
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Căn hộ / Phòng */}
                      <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-11 rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm relative bg-slate-50 group-hover:border-slate-300 transition-colors">
                            <img 
                              src={apt.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=150&q=80"} 
                              alt={apt.name} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors">{apt.name}</h4>
                            <span className="inline-block text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded mt-1">ID: {apt.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vị Trí & Loại Căn */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                            {apt.type}
                          </span>
                          <div className="flex items-center gap-1 text-slate-500 font-medium text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {apt.location}
                          </div>
                        </div>
                      </td>

                      {/* Diện Tích & Thiết Kế */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="block font-semibold text-slate-800 text-[12px]">{apt.area} m²</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span>{apt.bedrooms} PN</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{apt.bathrooms} WC</span>
                          </div>
                        </div>
                      </td>

                      {/* Giá Thuê */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 text-[13px] tracking-tight">{formatVND(apt.monthlyPrice)}</span>
                          <span className="block text-[9px] text-slate-400 font-medium">/ tháng</span>
                        </div>
                      </td>

                      {/* Tiện Ích Smart / VR */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className="flex flex-wrap gap-1">
                            {apt.petFriendly ? (
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Pet Friendly
                              </span>
                            ) : (
                              <span className="text-[8px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                                No Pets
                              </span>
                            )}
                            {apt.hasVirtualTour && (
                              <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                                <Compass className="w-2.5 h-2.5" />
                                VR 3D
                              </span>
                            )}
                          </div>

                          {apt.virtualTourUrl && (
                            <button
                              type="button"
                              onClick={() => setActiveTourUrl(apt.virtualTourUrl || '')}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer transition-all active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem thử 3D VR
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Trạng Thế Vận Hành */}
                      <td className="px-6 py-4">
                        <div>
                          {status === 'Clean' ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/50">
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              Sạch sẽ / Sẵn sàng
                            </div>
                          ) : status === 'Needs Repair' ? (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-full border border-rose-200/50">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                Cần Sửa Chữa
                              </div>
                              {apt.estimatedRepairCost && apt.estimatedRepairCost > 0 ? (
                                <span className="block text-[10px] text-rose-600 font-semibold">Ước tính: {formatVND(apt.estimatedRepairCost)}</span>
                              ) : null}
                              {apt.maintenanceNotes && (
                                <p className="text-[10px] text-slate-500 font-medium italic bg-slate-50 border border-slate-100 p-1.5 rounded-lg max-w-[170px] line-clamp-2" title={apt.maintenanceNotes}>
                                  "{apt.maintenanceNotes}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200/50">
                                <Wrench className="w-3 h-3 text-amber-500" />
                                Đang Bảo Trì
                              </div>
                              {apt.estimatedRepairCost && apt.estimatedRepairCost > 0 ? (
                                <span className="block text-[10px] text-amber-600 font-semibold">Ướn tính: {formatVND(apt.estimatedRepairCost)}</span>
                              ) : null}
                              {apt.maintenanceNotes && (
                                <p className="text-[10px] text-slate-500 font-medium italic bg-slate-50 border border-slate-100 p-1.5 rounded-lg max-w-[170px] line-clamp-2" title={apt.maintenanceNotes}>
                                  "{apt.maintenanceNotes}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Thao Tác */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingApt(apt);
                              setAptForm({
                                id: apt.id,
                                name: apt.name,
                                location: apt.location,
                                type: apt.type,
                                area: apt.area,
                                bedrooms: apt.bedrooms,
                                bathrooms: apt.bathrooms,
                                monthlyPrice: apt.monthlyPrice,
                                image: apt.image,
                                description: apt.description,
                                amenities: apt.amenities,
                                petFriendly: apt.petFriendly,
                                hasVirtualTour: apt.hasVirtualTour,
                                virtualTourUrl: apt.virtualTourUrl || ''
                              });
                              setShowAptModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-slate-400 transition-all cursor-pointer active:scale-90"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa căn hộ: ${apt.name}?`)) {
                                setApartments(prev => prev.filter(a => a.id !== apt.id));
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-all cursor-pointer active:scale-90"
                            title="Xóa căn hộ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {apartments.filter(a => {
                const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.location.toLowerCase().includes(searchTerm.toLowerCase());
                const status = a.maintenanceStatus || 'Clean';
                if (aptStatusFilter === 'all') return matchesSearch;
                return matchesSearch && status === aptStatusFilter;
              }).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs">
                    Không tìm thấy căn hộ nào khớp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elegant full screen VR dialog directly in dashboard */}
      {activeTourUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950/80 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <h4 className="font-black text-white text-sm">Xem Thử Không Gian 3D Virtual Tour VR</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Trực quan hóa phòng ngủ & thiết kế nội thất thực tế ảo.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTourUrl(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Iframe container */}
            <div className="bg-slate-950 aspect-video relative flex items-center justify-center p-8">
              <iframe 
                src={activeTourUrl} 
                className="absolute inset-0 w-full h-full border-0" 
                title="VR Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
