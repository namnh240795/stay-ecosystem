import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Home,
  MapPin,
  Compass,
  Eye,
  Sparkles,
  AlertTriangle,
  Wrench,
  Edit2,
  Trash2,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { Apartment } from '../../types';
import { formatVND } from '../../utils/formatVND';
import { useApartments, useCreateApartment, useUpdateApartment, useDeleteApartment } from '../../hooks/useApartments';
import ApartmentForm from '../forms/ApartmentForm';

type StatusFilter = 'all' | 'Clean' | 'Needs Repair' | 'Under Maintenance';

/** Map API apartment shape to the frontend Apartment type */
function mapApiApt(apiApt: any): Apartment {
  return {
    id: apiApt.id,
    name: apiApt.name || `Unit ${apiApt.unitNumber || apiApt.id}`,
    location: apiApt.location || '',
    type: apiApt.type || 'Studio',
    area: apiApt.area || 0,
    bedrooms: apiApt.bedrooms || 0,
    bathrooms: apiApt.bathrooms || 0,
    monthlyPrice: apiApt.monthlyPrice ?? apiApt.monthlyRent ?? 0,
    rating: apiApt.rating || 0,
    reviews: apiApt.reviews || 0,
    image: apiApt.image || '',
    images: apiApt.images || [],
    description: apiApt.description || '',
    amenities: apiApt.amenities || [],
    availableFrom: apiApt.availableFrom || '',
    hasVirtualTour: apiApt.hasVirtualTour ?? false,
    virtualTourUrl: apiApt.virtualTourUrl,
    petFriendly: apiApt.petFriendly ?? false,
    maintenanceStatus: apiApt.maintenanceStatus || 'Clean',
    estimatedRepairCost: apiApt.estimatedRepairCost,
    maintenanceNotes: apiApt.maintenanceNotes,
  };
}

export default function AdminApartmentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Apartment | null>(null);
  const [activeTourUrl, setActiveTourUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const statusParam = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading, isError } = useApartments({
    search: searchTerm || undefined,
    page,
    limit,
    status: statusParam,
  });

  const createMutation = useCreateApartment();
  const updateMutation = useUpdateApartment();
  const deleteMutation = useDeleteApartment();

  const rawApartments = data?.data ?? [];
  const apartments = rawApartments.map(mapApiApt);
  const totalCount = data?.total ?? 0;

  const handleDelete = (apt: Apartment) => {
    if (window.confirm(`Ban co chac chan muon xoa can ho: ${apt.name}?`)) {
      deleteMutation.mutate(apt.id);
    }
  };

  const handleEdit = (apt: Apartment) => {
    setEditingItem(apt);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingItem) {
      updateMutation.mutate(editingItem.id, {
        ...formData,
        id: editingItem.id,
      });
      setShowModal(false);
      setEditingItem(null);
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { setShowModal(false); setEditingItem(null); },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Unified Header with Icon, Title, Subtitle, Search, and Filter Pills */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/10">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh Muc Can Ho Cho Thue Dai Han</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Quan ly trang thai, gia thue, bao tri & VR 3D Tour</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <input
              type="text"
              placeholder="Tim kiem can ho..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none w-48"
            />

            {/* Create button */}
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Them Can Ho
            </button>

            {/* Quick filter pill buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/40 shrink-0">
              <button
                type="button"
                onClick={() => { setStatusFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tat ca ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter('Clean'); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Clean'
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Sach se
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter('Needs Repair'); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Needs Repair'
                    ? 'bg-white text-rose-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-rose-700'
                }`}
              >
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                Can sua
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter('Under Maintenance'); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Under Maintenance'
                    ? 'bg-white text-amber-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Bao tri
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Dang tai du lieu...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-red-500 font-medium">Co loi xay ra khi tai du lieu. Vui long thu lai.</span>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4 sticky left-0 bg-slate-50 z-20 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Can Ho / Phong</th>
                  <th className="px-6 py-4">Vi Tri & Loai Can</th>
                  <th className="px-6 py-4">Dien Tich / Thiet Ke</th>
                  <th className="px-6 py-4">Gia Thue / Thang</th>
                  <th className="px-6 py-4">Tinh Nang / VR Tour</th>
                  <th className="px-6 py-4">Trang Thai Van Hanh</th>
                  <th className="px-6 py-4 text-right">Thao Tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {apartments.map((apt) => {
                  const status = apt.maintenanceStatus || 'Clean';
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Can ho / Phong */}
                      <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-11 rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm relative bg-slate-50 group-hover:border-slate-300 transition-colors">
                            <img
                              src={apt.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=150&q=80'}
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

                      {/* Vi Tri & Loai Can */}
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

                      {/* Dien Tich & Thiet Ke */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="block font-semibold text-slate-800 text-[12px]">{apt.area} m2</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span>{apt.bedrooms} PN</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{apt.bathrooms} WC</span>
                          </div>
                        </div>
                      </td>

                      {/* Gia Thue */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 text-[13px] tracking-tight">{formatVND(apt.monthlyPrice)}</span>
                          <span className="block text-[9px] text-slate-400 font-medium">/ thang</span>
                        </div>
                      </td>

                      {/* Tien Ich Smart / VR */}
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
                              Xem thu 3D VR
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Trang Thai Van Hanh */}
                      <td className="px-6 py-4">
                        <div>
                          {status === 'Clean' ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/50">
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              Sach se / San sang
                            </div>
                          ) : status === 'Needs Repair' ? (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-full border border-rose-200/50">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                Can Sua Chua
                              </div>
                              {apt.estimatedRepairCost && apt.estimatedRepairCost > 0 ? (
                                <span className="block text-[10px] text-rose-600 font-semibold">Uoc tinh: {formatVND(apt.estimatedRepairCost)}</span>
                              ) : null}
                              {apt.maintenanceNotes && (
                                <p className="text-[10px] text-slate-500 font-medium italic bg-slate-50 border border-slate-100 p-1.5 rounded-lg max-w-[170px] line-clamp-2" title={apt.maintenanceNotes}>
                                  &quot;{apt.maintenanceNotes}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200/50">
                                <Wrench className="w-3 h-3 text-amber-500" />
                                Dang Bao Tri
                              </div>
                              {apt.estimatedRepairCost && apt.estimatedRepairCost > 0 ? (
                                <span className="block text-[10px] text-amber-600 font-semibold">Uoc tinh: {formatVND(apt.estimatedRepairCost)}</span>
                              ) : null}
                              {apt.maintenanceNotes && (
                                <p className="text-[10px] text-slate-500 font-medium italic bg-slate-50 border border-slate-100 p-1.5 rounded-lg max-w-[170px] line-clamp-2" title={apt.maintenanceNotes}>
                                  &quot;{apt.maintenanceNotes}&quot;
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Thao Tac */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(apt)}
                            className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-slate-400 transition-all cursor-pointer active:scale-90"
                            title="Chinh sua thong tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(apt)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-all cursor-pointer active:scale-90 disabled:opacity-50"
                            title="Xoa can ho"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {apartments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs">
                      Khong tim thay can ho nao khop voi tieu chi tim kiem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalCount > limit && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Hien thi {Math.min((page - 1) * limit + 1, totalCount)} - {Math.min(page * limit, totalCount)} / {totalCount}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Truoc
                  </button>
                  <span className="text-[11px] font-bold text-slate-600">Trang {page}</span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={apartments.length < limit}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingItem ? 'Chinh Sua Can Ho' : 'Them Can Ho Moi'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingItem(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <ApartmentForm
                initialData={editingItem ? {
                  name: editingItem.name,
                  location: editingItem.location,
                  type: editingItem.type,
                  area: editingItem.area,
                  bedrooms: editingItem.bedrooms,
                  bathrooms: editingItem.bathrooms,
                  monthlyPrice: editingItem.monthlyPrice,
                  description: editingItem.description,
                  petFriendly: editingItem.petFriendly,
                  hasVirtualTour: editingItem.hasVirtualTour,
                  availableFrom: editingItem.availableFrom,
                } : undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowModal(false); setEditingItem(null); }}
                isLoading={isSubmitting}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* VR Tour Dialog */}
      {activeTourUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-950/80 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <h4 className="font-black text-white text-sm">Xem Thu Khong Gian 3D Virtual Tour VR</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Truc quan hoa phong ngu & thiet ke noi that thuc te ao.</p>
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
