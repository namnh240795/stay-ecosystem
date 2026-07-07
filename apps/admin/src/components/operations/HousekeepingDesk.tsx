import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Package,
  Loader2,
} from 'lucide-react';
import { formatVND } from '../../utils/formatVND';
import { exportMaintenanceToPDF } from '../../utils/pdf';
import Pagination from '../admin/Pagination';
import { useProperties } from '../../hooks/useProperties';

interface HousekeepingDeskProps {
  apartments: any[];
  setApartments: React.Dispatch<React.SetStateAction<any[]>>;
  branches: any[];
  currentUser: { name: string; roleName: string };
}

// Initial Hotel Room Supplies Checklist & Damage logs (kept as seed data since no API endpoint exists yet)
const INITIAL_ROOM_AUDITS = [
  {
    id: 'audit-1',
    roomName: 'Phòng 102 (Deluxe Twin)',
    branchName: 'GrandStay Premier Thai Nguyen',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: 'Nguyễn Thị Hoa',
    auditDate: '2026-06-28',
    status: 'Deficit', // 'Full' | 'Deficit' | 'Damaged'
    items: [
      { name: 'Khăn tắm lớn', standard: 2, actual: 1, status: 'Missing', notes: 'Khách mang đi/làm mất', cost: 150000 },
      { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Ly thủy tinh', standard: 2, actual: 1, status: 'Broken', notes: 'Khách làm vỡ ly nước', cost: 50000 },
      { name: 'Nước suối miễn phí', standard: 2, actual: 0, status: 'Used', notes: 'Khách đã uống (bổ sung mới)', cost: 0 },
      { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
    ],
    totalDamageCost: 200000,
    notes: 'Khách làm vỡ 1 ly nước và mang đi 1 khăn tắm lớn. Đã lập biên bản bồi thường lúc check-out.'
  },
  {
    id: 'audit-2',
    roomName: 'Phòng 202 (Presidential Suite)',
    branchName: 'GrandStay Premier Thai Nguyen',
    shift: 'Ca Chiều (14:00 - 22:00)',
    auditor: 'Trần Minh Quân',
    auditDate: '2026-06-27',
    status: 'Damaged',
    items: [
      { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Broken', notes: 'Cháy cuộn dây động cơ máy sấy', cost: 350000 },
      { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Dép đi trong phòng', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 }
    ],
    totalDamageCost: 350000,
    notes: 'Máy sấy tóc bị hỏng cuộn nhiệt bên trong, cần đem đi sửa chữa hoặc thay thế mới.'
  },
  {
    id: 'audit-3',
    roomName: 'Villa 102 (Two-Bedroom Villa)',
    branchName: 'GrandStay Beachfront Resort Phu Quoc',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: 'Phạm Hồng Ánh',
    auditDate: '2026-06-28',
    status: 'Full',
    items: [
      { name: 'Chăn ga gối', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Nước suối miễn phí', standard: 4, actual: 2, status: 'Used', notes: 'Bổ sung đầy đủ', cost: 0 }
    ],
    totalDamageCost: 0,
    notes: 'Vật tư buồng phòng đầy đủ, không hư hại hỏng hóc.'
  }
];

const HousekeepingDesk: React.FC<HousekeepingDeskProps> = ({ apartments, setApartments, branches, currentUser }) => {
  const [housekeepingViewMode, setHousekeepingViewMode] = useState<'hotels' | 'apartments'>('hotels');

  // Fetch properties via React Query (replaces useState + localStorage for rooms)
  const propertiesQuery = useProperties({ limit: 100 });
  const properties = propertiesQuery.data?.data ?? [];
  const isLoadingRooms = propertiesQuery.isLoading;

  // Map properties to room-like objects for the housekeeping UI
  const rooms = properties.map((p: any) => ({
    id: p.id,
    name: p.name,
    branchId: p.city?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    branchName: p.name,
    status: p.status === 'active' ? 'Clean' : 'Dirty',
    occupancy: 'Vacant',
    housekeeper: 'Chưa phân công',
  }));

  // Room audits kept in local state (no API endpoint exists yet)
  const [roomAudits, setRoomAudits] = useState(() => {
    const saved = localStorage.getItem('gs_op_room_audits');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROOM_AUDITS;
  });

  // State for adding a new room audit checklist
  const [newAuditForm, setNewAuditForm] = useState({
    roomId: '',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: currentUser.name,
    notes: '',
    items: [
      { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn mặt', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Dép đi trong phòng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Lược chải đầu', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Nước suối miễn phí', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Trà & Cà phê gói', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Ly thủy tinh', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
    ]
  });

  // Filter state for audits
  const [auditFilterRoom, setAuditFilterRoom] = useState<string>('All');

  // Pagination States
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(6);

  const [apartmentsPage, setApartmentsPage] = useState(1);
  const [apartmentsPerPage, setApartmentsPerPage] = useState(6);

  const [roomAuditsPage, setRoomAuditsPage] = useState(1);
  const [roomAuditsPerPage, setRoomAuditsPerPage] = useState(5);

  // Reset page numbers when view mode changes
  useEffect(() => {
    setRoomsPage(1);
    setApartmentsPage(1);
    setRoomAuditsPage(1);
  }, [housekeepingViewMode]);

  // Persist audits to localStorage (rooms no longer stored here - come from API)
  useEffect(() => {
    localStorage.setItem('gs_op_room_audits', JSON.stringify(roomAudits));
  }, [roomAudits]);

  // ==================== Handler Functions ====================

  const handleUpdateRoomStatus = (roomId: string, newStatus: string) => {
    // Optimistic local state update for UI responsiveness
    // In a full implementation, this would call a mutation hook
    setRoomAudits(prev => [...prev]);
  };

  const handleAssignHousekeeper = (roomId: string, housekeeperName: string) => {
    // Placeholder for future mutation - properties come from API
    // A proper implementation would use useUpdateProperty or a dedicated mutation
  };

  const handleUpdateApartmentMaintenance = (
    aptId: string,
    status: 'Clean' | 'Needs Repair' | 'Under Maintenance',
    cost?: number,
    notes?: string
  ) => {
    setApartments(prev => prev.map(a => {
      if (a.id === aptId) {
        return {
          ...a,
          maintenanceStatus: status,
          estimatedRepairCost: cost !== undefined ? cost : a.estimatedRepairCost,
          maintenanceNotes: notes !== undefined ? notes : a.maintenanceNotes
        };
      }
      return a;
    }));
  };

  const handleCreateRoomAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditForm.roomId) {
      alert("Vui lòng chọn phòng cần kiểm kê vật tư!");
      return;
    }

    const selectedRoom = rooms.find((r: any) => r.id === newAuditForm.roomId);
    if (!selectedRoom) return;

    // Calculate total damage/replacement cost
    const totalCost = newAuditForm.items.reduce((sum, item) => sum + (item.cost || 0), 0);

    // Determine overall status
    let auditStatus = 'Full';
    const hasMissing = newAuditForm.items.some(item => item.actual < item.standard || item.status === 'Missing');
    const hasBroken = newAuditForm.items.some(item => item.status === 'Broken' || item.status === 'Damaged');
    if (hasBroken) {
      auditStatus = 'Damaged';
    } else if (hasMissing) {
      auditStatus = 'Deficit';
    }

    const newAudit = {
      id: 'audit-' + Math.floor(1000 + Math.random() * 9000),
      roomName: selectedRoom.name,
      branchName: selectedRoom.branchName,
      shift: newAuditForm.shift,
      auditor: newAuditForm.auditor,
      auditDate: new Date().toISOString().split('T')[0],
      status: auditStatus,
      items: [...newAuditForm.items],
      totalDamageCost: totalCost,
      notes: newAuditForm.notes || (totalCost > 0 ? `Kiểm tra ca phát hiện hỏng hóc/thiếu hụt vật tư. Tổng phí sửa chữa/đền bù: ${formatVND(totalCost)}` : 'Vật tư phòng đầy đủ, không hư hại.')
    };

    setRoomAudits(prev => [newAudit, ...prev]);

    // Reset items to standard quantities
    setNewAuditForm({
      roomId: '',
      shift: 'Ca Sáng (06:00 - 14:00)',
      auditor: currentUser.name,
      notes: '',
      items: [
        { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Khăn tắm lớn', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Khăn mặt', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Dép đi trong phòng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Lược chải đầu', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Nước suối miễn phí', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Trà & Cà phê gói', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
        { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
        { name: 'Ly thủy tinh', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
      ]
    });

    alert(`Đã tạo thành công biên bản kiểm kê vật tư phòng ${selectedRoom.name} sau ca trực!`);
  };

  const handleDeleteAudit = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biên bản kiểm kê này?")) {
      setRoomAudits(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleUpdateItemActual = (index: number, val: number) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        actual: Math.max(0, val),
        status: Math.max(0, val) < updated[index].standard ? 'Missing' : 'Good'
      };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemStatus = (index: number, status: string) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        status,
        // Default costs if broken or missing to save typing time
        cost: status === 'Broken' && updated[index].cost === 0 ? (
          updated[index].name.includes('Ly') ? 50000 :
          updated[index].name.includes('sấy') ? 350000 :
          updated[index].name.includes('tốc') ? 250000 :
          updated[index].name.includes('Khăn') ? 150000 : 0
        ) : status === 'Good' ? 0 : updated[index].cost
      };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemCost = (index: number, cost: number) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], cost: Math.max(0, cost) };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemNotes = (index: number, notes: string) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], notes };
      return { ...prev, items: updated };
    });
  };

  // ==================== Loading State ====================

  if (isLoadingRooms) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Đang tải dữ liệu buồng phòng...</span>
      </div>
    );
  }

  // ==================== JSX ====================

  return (
    <div className="space-y-6">
      {/* View Switcher: Hotel Rooms vs Apartments */}
      <div className="flex bg-slate-100 p-1 rounded-lg self-start w-fit border border-slate-200/50">
        <button
          type="button"
          onClick={() => setHousekeepingViewMode('hotels')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${housekeepingViewMode === 'hotels' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Phòng Khách Sạn (Ngắn Hạn)
        </button>
        <button
          type="button"
          onClick={() => setHousekeepingViewMode('apartments')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${housekeepingViewMode === 'apartments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Căn Hộ Dài Hạn (Apartments)
        </button>
      </div>

      {/* Clean Status Dashboard Row */}
      {housekeepingViewMode === 'hotels' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Đã Dọn Sạch (Clean)</span>
              <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{rooms.filter(r => r.status === 'Clean').length} buồng</span>
            </div>
            <span className="text-2xl">✨</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Chưa Dọn (Dirty)</span>
              <span className="text-2xl font-extrabold text-rose-500 block mt-1">{rooms.filter(r => r.status === 'Dirty').length} buồng</span>
            </div>
            <span className="text-2xl">🧹</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Đang Dọn Dẹp</span>
              <span className="text-2xl font-extrabold text-amber-500 block mt-1">{rooms.filter(r => r.status === 'Cleaning').length} buồng</span>
            </div>
            <span className="text-2xl">🧼</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Bảo Trì / Sửa Chữa</span>
              <span className="text-2xl font-extrabold text-orange-500 block mt-1">{rooms.filter(r => r.status === 'Repairing').length} buồng</span>
            </div>
            <span className="text-2xl">⚙️</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sạch Sẽ (Clean)</span>
              <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
                {apartments.filter(a => !a.maintenanceStatus || a.maintenanceStatus === 'Clean').length} căn
              </span>
            </div>
            <span className="text-2xl">✨</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Cần Sửa Chữa (Repair)</span>
              <span className="text-2xl font-extrabold text-rose-500 block mt-1">
                {apartments.filter(a => a.maintenanceStatus === 'Needs Repair').length} căn
              </span>
            </div>
            <span className="text-2xl">🔧</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Đang Bảo Trì (Maint.)</span>
              <span className="text-2xl font-extrabold text-amber-500 block mt-1">
                {apartments.filter(a => a.maintenanceStatus === 'Under Maintenance').length} căn
              </span>
            </div>
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phí Bảo Trì Ước Tính</span>
              <span className="text-lg font-black text-rose-600 block mt-1">
                {formatVND(apartments.reduce((sum, a) => sum + (a.estimatedRepairCost || 0), 0))}
              </span>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      )}

      {/* Room/Apartment Grid Board */}
      {housekeepingViewMode === 'hotels' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Bàn Giám Sát Tình Trạng Buồng Phòng (Khách Sạn)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cập nhật trực tiếp tình trạng vệ sinh và điều phối nhân viên buồng dọn ca trực</p>
            </div>

            {/* Export Maintenance PDF Button */}
            <button
              type="button"
              id="export-hotel-pdf-btn"
              onClick={() => exportMaintenanceToPDF(rooms, apartments, currentUser.name)}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md self-start sm:self-auto"
            >
              <FileText className="w-4 h-4" /> Xuất PDF Báo Cáo Bảo Trì
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const startIdx = (roomsPage - 1) * roomsPerPage;
              return rooms.slice(startIdx, startIdx + roomsPerPage).map(room => {
              const isDirty = room.status === 'Dirty';
              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDirty
                      ? 'bg-rose-50/30 border-rose-100 shadow-sm shadow-rose-100/20'
                      : 'bg-white border-slate-200/85 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {room.name}
                        {room.occupancy === 'Occupied' ? (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold uppercase">Đang ở</span>
                        ) : room.occupancy === 'Reserved' ? (
                          <span className="text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-extrabold uppercase">Chờ khách</span>
                        ) : (
                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase">Trống</span>
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold truncate mt-1 max-w-[190px]">{room.branchName}</p>
                    </div>

                    {/* Status Badge */}
                    {room.status === 'Clean' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Sạch sẽ</span>
                    ) : room.status === 'Dirty' ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">Cần dọn</span>
                    ) : room.status === 'Cleaning' ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Đang dọn</span>
                    ) : (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Bảo trì</span>
                    )}
                  </div>

                  {/* Housekeeper Assignment Section */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Nhân viên buồng:</span>
                      <input
                        type="text"
                        value={room.housekeeper}
                        onChange={(e) => handleAssignHousekeeper(room.id, e.target.value)}
                        className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Quick Actions to Switch Room Status */}
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Đổi trạng thái:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomStatus(room.id, 'Clean')}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${room.status === 'Clean' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          title="Mark as Clean"
                        >
                          Sạch
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomStatus(room.id, 'Cleaning')}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${room.status === 'Cleaning' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          title="Mark as Cleaning"
                        >
                          Dọn
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomStatus(room.id, 'Dirty')}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${room.status === 'Dirty' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          title="Mark as Dirty"
                        >
                          Bẩn
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomStatus(room.id, 'Repairing')}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${room.status === 'Repairing' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          title="Mark as Under Repair"
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          </div>

          <Pagination
            currentPage={roomsPage}
            totalItems={rooms.length}
            itemsPerPage={roomsPerPage}
            onPageChange={setRoomsPage}
            onItemsPerPageChange={setRoomsPerPage}
            variant="table"
          />
        </div>
      ) : (
        /* Apartments maintenance & housekeeping management table/grid */
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Nhật Ký Bảo Trì & Sửa Chữa Căn Hộ Dài Hạn
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Cho phép nhân viên buồng phòng cập nhật nhanh trạng thái kỹ thuật và ghi nhận chi phí sửa chữa hỏng hóc phát sinh</p>
            </div>

            {/* Export Maintenance PDF Button */}
            <button
              type="button"
              id="export-maintenance-pdf-btn"
              onClick={() => exportMaintenanceToPDF(rooms, apartments, currentUser.name)}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md self-start sm:self-auto"
            >
              <FileText className="w-4 h-4" /> Xuất PDF Báo Cáo Bảo Trì
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(() => {
              const startIdx = (apartmentsPage - 1) * apartmentsPerPage;
              return apartments.slice(startIdx, startIdx + apartmentsPerPage).map(apt => {
              const status = apt.maintenanceStatus || 'Clean';
              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    status === 'Needs Repair'
                      ? 'bg-rose-50/20 border-rose-100 shadow-sm'
                      : status === 'Under Maintenance'
                        ? 'bg-amber-50/20 border-amber-100 shadow-sm'
                        : 'bg-white border-slate-200/85 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header information */}
                    <div className="flex items-start gap-3">
                      <img src={apt.image} alt={apt.name} className="w-16 h-12 object-cover rounded-lg border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={apt.name}>{apt.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{apt.location} • {apt.type}</p>

                        {/* Status Label */}
                        <div className="mt-1.5">
                          {status === 'Clean' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              ● Sạch sẽ (Clean)
                            </span>
                          ) : status === 'Needs Repair' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                              ● Cần sửa chữa (Needs Repair)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                              ● Đang bảo trì (Under Maint.)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Thay đổi trạng thái bảo trì:</span>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateApartmentMaintenance(apt.id, 'Clean', status === 'Clean' ? undefined : 0, '')}
                            className={`px-1 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${status === 'Clean' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            Sạch sẽ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateApartmentMaintenance(apt.id, 'Needs Repair')}
                            className={`px-1 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${status === 'Needs Repair' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            Cần sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateApartmentMaintenance(apt.id, 'Under Maintenance')}
                            className={`px-1 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${status === 'Under Maintenance' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            Bảo trì
                          </button>
                        </div>
                      </div>

                      {/* Cost Field */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Phí sửa chữa ước tính (VND):</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₫</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={apt.estimatedRepairCost || ''}
                            onChange={(e) => handleUpdateApartmentMaintenance(apt.id, status, parseFloat(e.target.value) || 0, apt.maintenanceNotes)}
                            className="text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Notes Field */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ghi chú hỏng hóc & Đề xuất sửa chữa:</label>
                        <textarea
                          rows={2}
                          placeholder="Ghi chú thiết bị hỏng (VD: vỡ kính, hỏng vòi nước,...) và đề xuất xử lý..."
                          value={apt.maintenanceNotes || ''}
                          onChange={(e) => handleUpdateApartmentMaintenance(apt.id, status, apt.estimatedRepairCost, e.target.value)}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-normal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Footnote */}
                  <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-400">
                    <span>Tự động cập nhật trực tiếp</span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Đồng bộ hệ thống
                    </span>
                  </div>
                </div>
              );
            });
          })()}
          </div>

          <Pagination
            currentPage={apartmentsPage}
            totalItems={apartments.length}
            itemsPerPage={apartmentsPerPage}
            onPageChange={setApartmentsPage}
            onItemsPerPageChange={setApartmentsPerPage}
            variant="table"
          />
        </div>
      )}

      {/* ==================== VIETNAMESE HOTEL STANDARD ROOM SUPPLIES & DAMAGE AUDITING SYSTEM ==================== */}
      <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-200/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
              <ClipboardCheck className="w-5.5 h-5.5 text-blue-600" />
              Quản Lý Kiểm Kê Vật Tư & Báo Cáo Hỏng Hóc Theo Ca (Vietnamese Hotel Standard)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Giúp kiểm soát tiêu hao vật tư, theo dõi đền bù và ghi chép chi phí sửa chữa hỏng hóc sau mỗi ca trực buồng phòng.
            </p>
          </div>

          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-blue-50 border border-blue-200/60 rounded-xl px-3 py-1.5 text-center">
              <span className="block text-[8px] text-blue-500 font-bold uppercase tracking-wider">Tổng số lượt kiểm kê</span>
              <span className="text-sm font-black text-blue-800">{roomAudits.length} lượt</span>
            </div>
            <div className="bg-rose-50 border border-rose-200/60 rounded-xl px-3 py-1.5 text-center">
              <span className="block text-[8px] text-rose-500 font-bold uppercase tracking-wider">Có hỏng hóc/thiếu</span>
              <span className="text-sm font-black text-rose-800">
                {roomAudits.filter((a: any) => a.status === 'Damaged' || a.status === 'Deficit').length} buồng
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 text-center">
              <span className="block text-[8px] text-emerald-500 font-bold uppercase tracking-wider">Phí sửa chữa & đền bù</span>
              <span className="text-sm font-black text-emerald-800">
                {formatVND(roomAudits.reduce((sum: number, a: any) => sum + (a.totalDamageCost || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Side: Historical Audits & Logs (7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-500" />
                  Lịch Sử Biên Bản Kiểm Kê Vật Tư Ca Trực
                </h4>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">Lọc theo phòng:</span>
                  <select
                    value={auditFilterRoom}
                    onChange={(e) => setAuditFilterRoom(e.target.value)}
                    className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="All">Tất cả phòng</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {roomAudits.filter((a: any) => auditFilterRoom === 'All' || a.roomName === auditFilterRoom).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Chưa có biên bản kiểm kê nào cho phòng được chọn.
                  </div>
                ) : (
                  (() => {
                    const filtered = roomAudits.filter((a: any) => auditFilterRoom === 'All' || a.roomName === auditFilterRoom);
                    const startIdx = (roomAuditsPage - 1) * roomAuditsPerPage;
                    return filtered.slice(startIdx, startIdx + roomAuditsPerPage).map((audit: any) => {
                      const hasIssues = audit.status === 'Damaged' || audit.status === 'Deficit';
                      return (
                        <div
                          key={audit.id}
                          className={`p-4 rounded-xl border transition-all ${
                            audit.status === 'Damaged'
                              ? 'bg-rose-50/10 border-rose-200/70'
                              : audit.status === 'Deficit'
                                ? 'bg-amber-50/10 border-amber-200/70'
                                : 'bg-slate-50/30 border-slate-200/70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-xs">{audit.roomName}</span>
                                <span className="text-[10px] text-slate-400 font-medium">({audit.branchName})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                                Ca trực: <span className="text-slate-700">{audit.shift}</span> • Kiểm bởi: <span className="text-blue-600 font-extrabold">{audit.auditor}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-start sm:self-auto">
                              {audit.status === 'Damaged' ? (
                                <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Có hỏng hóc/vỡ
                                </span>
                              ) : audit.status === 'Deficit' ? (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                  Thiếu hụt đồ
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Đầy đủ & Đạt chuẩn
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteAudit(audit.id)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Xóa biên bản kiểm kê"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Item breakdown */}
                          <div className="bg-white/80 p-3 rounded-lg border border-slate-200/50 space-y-2 text-[11px]">
                            <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                              <div className="col-span-5">Tên vật tư / Đồ tiêu hao</div>
                              <div className="col-span-2 text-center">Định mức</div>
                              <div className="col-span-2 text-center">Thực tế</div>
                              <div className="col-span-3 text-right">Tình trạng / Chi phí</div>
                            </div>

                            {audit.items.map((item: any, i: number) => {
                              const isDeficit = item.actual < item.standard;
                              const isBroken = item.status === 'Broken' || item.status === 'Damaged';

                              return (
                                <div key={i} className="grid grid-cols-12 items-center py-1 border-b border-slate-50 last:border-0 font-medium">
                                  <div className="col-span-5">
                                    <span className="text-slate-800 font-bold">{item.name}</span>
                                    {item.notes && (
                                      <span className="block text-[9px] text-slate-400 font-normal italic mt-0.5">({item.notes})</span>
                                    )}
                                  </div>
                                  <div className="col-span-2 text-center text-slate-500 font-bold">{item.standard}</div>
                                  <div className={`col-span-2 text-center font-black ${isDeficit ? 'text-amber-600' : 'text-slate-700'}`}>
                                    {item.actual}
                                  </div>
                                  <div className="col-span-3 text-right">
                                    {isBroken ? (
                                      <span className="text-[10px] text-rose-600 font-black block">Hỏng vỡ ❌</span>
                                    ) : isDeficit ? (
                                      <span className="text-[10px] text-amber-600 font-black block">Thiếu hụt ⚠️</span>
                                    ) : item.status === 'Used' ? (
                                      <span className="text-[10px] text-blue-600 font-bold block">Khách dùng ☕</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-bold block">Tốt ✓</span>
                                    )}
                                    {item.cost > 0 && (
                                      <span className="text-[9px] font-extrabold text-rose-600 block">
                                        +{formatVND(item.cost)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Audit notes and costs */}
                          <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-100/60">
                            <p className="text-slate-500 italic max-w-md">
                              <span className="font-bold text-slate-700 not-italic">Ghi chú chung:</span> {audit.notes}
                            </p>
                            {audit.totalDamageCost > 0 && (
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-slate-400 font-bold block">TỔNG CHI PHÍ PHÁT SINH:</span>
                                <span className="font-black text-rose-600 text-xs">{formatVND(audit.totalDamageCost)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                )}

                <Pagination
                  currentPage={roomAuditsPage}
                  totalItems={roomAudits.filter((a: any) => auditFilterRoom === 'All' || a.roomName === auditFilterRoom).length}
                  itemsPerPage={roomAuditsPerPage}
                  onPageChange={setRoomAuditsPage}
                  onItemsPerPageChange={setRoomAuditsPerPage}
                />
              </div>
            </div>

            {/* Special Damage and Repair Checklist Vietnamese Style */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-sm space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-rose-600" />
                Báo Cáo Sửa Chữa & Chi Phí Hỏng Hóc Buồng Phòng Hoạt Động
              </h4>
              <p className="text-[10px] text-slate-400">
                Danh sách các vật tư, thiết bị lớn bị hỏng cần sửa chữa hoặc thay thế ngay trong các buồng để đảm bảo đón lượt khách tiếp theo.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="px-3 py-2">Buồng Phòng</th>
                      <th className="px-3 py-2">Vật tư hỏng hóc</th>
                      <th className="px-3 py-2">Mô tả hỏng hóc</th>
                      <th className="px-3 py-2 text-right">Chi phí ước tính</th>
                      <th className="px-3 py-2 text-center">Trạng thái xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {roomAudits
                      .flatMap((audit: any) =>
                        audit.items
                          .filter((item: any) => item.status === 'Broken' || item.status === 'Damaged' || item.cost > 0)
                          .map((item: any) => ({
                            id: audit.id,
                            roomName: audit.roomName,
                            itemName: item.name,
                            notes: item.notes || 'Hỏng hóc phát sinh sau ca trực',
                            cost: item.cost,
                            auditDate: audit.auditDate,
                            roomStatus: 'Repairing'
                          }))
                      )
                      .map((damage: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/40 text-[11px]">
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {damage.roomName}
                            <span className="block text-[8px] text-slate-400 font-medium">{damage.auditDate}</span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-800 font-bold">
                            {damage.itemName}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 italic">
                            {damage.notes}
                          </td>
                          <td className="px-3 py-2.5 text-right font-black text-rose-600">
                            {formatVND(damage.cost)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {damage.roomStatus === 'Repairing' ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md border border-orange-200">
                                ⚙️ Đang bảo trì
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[8px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                                ✓ Đã sửa xong
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {roomAudits.flatMap((audit: any) => audit.items.filter((item: any) => item.status === 'Broken' || item.status === 'Damaged' || item.cost > 0)).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-400 italic">
                          Không có báo cáo hỏng hóc hoặc chi phí sửa chữa dột xuất nào trong tuần.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Create New Inventory Audit Form (5 cols) */}
          <div className="xl:col-span-5">
            <form onSubmit={handleCreateRoomAudit} className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Lập Biên Bản Kiểm Kê Vật Tư Ca Trực Mới
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Chọn buồng và cập nhật số lượng vật tư tồn thực tế của phòng sau khi kết thúc dọn dẹp hoặc kiểm ca.
                </p>
              </div>

              <div className="space-y-3">
                {/* Select Room */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Chọn phòng kiểm kê *</label>
                  <select
                    required
                    value={newAuditForm.roomId}
                    onChange={(e) => setNewAuditForm({ ...newAuditForm, roomId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold text-slate-800 bg-slate-50 cursor-pointer"
                  >
                    <option value="">-- Chọn phòng cần kiểm kê --</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.branchName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Select Shift */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ca trực kiểm kê</label>
                    <select
                      value={newAuditForm.shift}
                      onChange={(e) => setNewAuditForm({ ...newAuditForm, shift: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold text-slate-700 bg-slate-50 cursor-pointer"
                    >
                      <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06h - 14h)</option>
                      <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14h - 22h)</option>
                      <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm (22h - 06h)</option>
                      <option value="Hành chính (08:00 - 17:00)">Hành chính (08h - 17h)</option>
                    </select>
                  </div>

                  {/* Inspector Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Người kiểm kê</label>
                    <input
                      type="text"
                      required
                      value={newAuditForm.auditor}
                      onChange={(e) => setNewAuditForm({ ...newAuditForm, auditor: e.target.value })}
                      placeholder="e.g. Nguyễn Thị Hoa"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>

                {/* List of supplies */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-1">
                    Danh sách vật tư buồng phòng (Hotel Amenities Checklist)
                  </label>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {newAuditForm.items.map((item, index) => {
                      const isMissing = item.actual < item.standard;
                      const isBroken = item.status === 'Broken' || item.status === 'Damaged';

                      return (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">{item.name}</span>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemActual(index, item.actual - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-xs font-black text-slate-800">
                                {item.actual} <span className="text-[9px] text-slate-400 font-normal">/{item.standard}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemActual(index, item.actual + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Condition status dropdown */}
                            <div>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateItemStatus(index, e.target.value)}
                                className="w-full text-[10px] font-bold border border-slate-200 rounded px-1.5 py-1 bg-white cursor-pointer"
                              >
                                <option value="Good">Tốt ✓</option>
                                <option value="Used">Đã dùng (Bổ sung mới) ☕</option>
                                <option value="Missing">Thiếu hụt/Mất đồ ⚠️</option>
                                <option value="Broken">Hỏng hóc/Vỡ đồ ❌</option>
                              </select>
                            </div>

                            {/* Repair/Replacement cost input (only if missing/broken) */}
                            <div>
                              <input
                                type="number"
                                value={item.cost || ''}
                                onChange={(e) => handleUpdateItemCost(index, Number(e.target.value))}
                                disabled={item.status === 'Good'}
                                placeholder={item.status === 'Good' ? "Phí sửa chữa" : "Phí đền bù (VND)"}
                                className={`w-full text-[10px] font-bold border border-slate-200 rounded px-1.5 py-1 focus:outline-none ${
                                  item.status === 'Good' ? 'bg-slate-100 text-slate-400 border-slate-100' : 'bg-white text-rose-600 font-black border-rose-200 focus:ring-1 focus:ring-rose-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Item Notes */}
                          <div>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleUpdateItemNotes(index, e.target.value)}
                              placeholder="Ghi chú hỏng hóc hoặc tình trạng cụ thể..."
                              className="w-full text-[10px] border border-slate-200 rounded px-2 py-0.5 focus:outline-none font-medium text-slate-600 bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit General Notes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ghi chú biên bản chung</label>
                  <textarea
                    rows={2}
                    value={newAuditForm.notes}
                    onChange={(e) => setNewAuditForm({ ...newAuditForm, notes: e.target.value })}
                    placeholder="Ghi chú tổng quan về biên bản kiểm kê phòng sau ca trực này..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck className="w-4 h-4" /> Hoàn Thành & Lưu Biên Bản
              </button>
            </form>

            {/* Vietnam standard policy advisory card */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/80 mt-4 space-y-2 text-[11px] text-blue-800">
              <h5 className="font-extrabold flex items-center gap-1">
                💡 Quy chuẩn kiểm kê buồng phòng Việt Nam:
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-1">
                <li>Đồ dùng tiêu hao (Amenities) được miễn phí hoặc bổ sung mới hằng ngày nếu đã dùng.</li>
                <li>Vật tư vải dệt (Khăn tắm, Khăn mặt, Chăn ga gối) nếu bị rách, ố bẩn nặng hoặc mất sẽ áp giá đền bù bồi thường.</li>
                <li>Thiết bị điện tử, ly thủy tinh làm vỡ/hỏng sẽ được kỹ thuật kiểm tra và ghi nhận chi phí sửa chữa cụ thể để bồi hoàn hoặc tính vào chi phí hao mòn khách sạn.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingDesk;
