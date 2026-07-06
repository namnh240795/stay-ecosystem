import React from 'react';
import { Edit2, Trash2, Building } from 'lucide-react';
import { Branch } from '../../types';
import { formatVND } from '../../data';

interface AdminHotelsTabProps {
  branches: Branch[];
  searchTerm: string;
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  setEditingHotel: (hotel: any) => void;
  setHotelForm: (form: any) => void;
  setShowHotelModal: (show: boolean) => void;
}

export default function AdminHotelsTab({
  branches,
  searchTerm,
  setBranches,
  setEditingHotel,
  setHotelForm,
  setShowHotelModal,
}: AdminHotelsTabProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm">Danh Sách Chi Nhánh Khách Sạn</h3>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          {branches.length} Cơ sở
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 font-bold uppercase tracking-wider">
              <th className="px-5 py-3 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                Khách Sạn / Chi Nhánh
              </th>
              <th className="px-5 py-3">Thương Hiệu & Vùng Miền</th>
              <th className="px-5 py-3">Giá Đêm Định Mức</th>
              <th className="px-5 py-3">Đánh Giá</th>
              <th className="px-5 py-3">Tiện Ích Nổi Bật</th>
              <th className="px-5 py-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {branches
              .filter(
                (b) =>
                  b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  b.region.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-14 h-10 object-cover rounded-lg shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 leading-snug">{hotel.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {hotel.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-bold text-slate-800">{hotel.brand}</span>
                    <span className="text-[10px] text-slate-500">{hotel.region}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-blue-600">{formatVND(hotel.pricePerNight)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">/đêm</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800">{hotel.rating}</span>
                      <span className="text-slate-400">({hotel.reviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {hotel.amenities.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="text-[9px] text-slate-400">
                          +{hotel.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => {
                          setEditingHotel(hotel);
                          setHotelForm({
                            id: hotel.id,
                            name: hotel.name,
                            region: hotel.region,
                            brand: hotel.brand,
                            description: hotel.description,
                            image: hotel.image,
                            pricePerNight: hotel.pricePerNight,
                            amenities: hotel.amenities,
                            virtualTourUrl: hotel.virtualTourUrl || '',
                          });
                          setShowHotelModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xoá cơ sở: ${hotel.name}?`)) {
                            setBranches((prev) => prev.filter((b) => b.id !== hotel.id));
                          }
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600 cursor-pointer"
                        title="Xoá chi nhánh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
