import { useState } from 'react';
import { Edit2, Trash2, Building, Loader2 } from 'lucide-react';
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from '../../hooks/useProperties';
import PropertyForm from '../forms/PropertyForm';

export default function AdminHotelsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useProperties({ search: searchTerm, page, limit });
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const properties = data?.items ?? [];

  const handleDelete = (item: any) => {
    if (window.confirm(`Ban co chac muon xoa co so: ${item.name}?`)) {
      deleteProperty.mutate(item.id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm">Danh Sach Chi Nhanh Khach San</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tim kiem..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none w-48"
          />
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            + Them
          </button>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {data?.total ?? properties.length} Co so
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-slate-500 font-medium">Dang tai du lieu...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  Khach San / Chi Nhanh
                </th>
                <th className="px-5 py-3">Thuong Hieu & Vung Mien</th>
                <th className="px-5 py-3">Gia Dem Dinh Muc</th>
                <th className="px-5 py-3">Danh Gia</th>
                <th className="px-5 py-3">Tien Ich Noi Bat</th>
                <th className="px-5 py-3 text-right">Thao Tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Khong co khach san nao.</p>
                  </td>
                </tr>
              ) : (
                properties.map((hotel: any) => (
                  <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                      <div className="flex items-center gap-3.5">
                        {hotel.image ? (
                          <img
                            src={hotel.image}
                            alt={hotel.title}
                            className="w-14 h-10 object-cover rounded-lg shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 leading-snug">{hotel.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ID: {hotel.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-bold text-slate-800">{hotel.propertyType}</span>
                      <span className="text-[10px] text-slate-500">{hotel.city}, {hotel.country}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-blue-600">{hotel.pricePerNight?.toLocaleString()} VND</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">/dem</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800">{hotel.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                          {hotel.maxGuests} khach
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                          {hotel.bedrooms} phong ngu
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                          {hotel.bathrooms} phong tam
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setEditingItem(hotel);
                            setShowModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 cursor-pointer"
                          title="Chinh sua"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hotel)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600 cursor-pointer"
                          title="Xoa chi nhanh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {data?.total && data.total > limit && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Trang {page} / {Math.ceil(data.total / limit)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Truoc
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= data.total}
                  className="px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">
                {editingItem ? 'Chinh Sua Khach San' : 'Them Khach San Moi'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <PropertyForm
                initialData={editingItem}
                onSubmit={(formData) => {
                  if (editingItem) {
                    updateProperty.mutate(
                      { id: editingItem.id, ...formData },
                      {
                        onSuccess: () => {
                          setShowModal(false);
                          setEditingItem(null);
                        },
                      }
                    );
                  } else {
                    createProperty.mutate(formData as any, {
                      onSuccess: () => {
                        setShowModal(false);
                        setEditingItem(null);
                      },
                    });
                  }
                }}
                onCancel={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                isLoading={createProperty.isPending || updateProperty.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
