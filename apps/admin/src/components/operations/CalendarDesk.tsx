import React, { useState, useEffect } from 'react';
import {
  Search,
  Check,
  XCircle,
  RefreshCw,
  Plus,
  Calendar
} from 'lucide-react';
import Pagination from '../admin/Pagination';
import { formatVND } from '../../utils/formatVND';

// Initial states for hotel operations
const INITIAL_ROOMS = [
  { id: 'rm-tn-101', name: 'Phòng 101 (Deluxe Double)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Clean', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Hoa' },
  { id: 'rm-tn-102', name: 'Phòng 102 (Deluxe Twin)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Dirty', occupancy: 'Occupied', housekeeper: 'Lê Văn Nam' },
  { id: 'rm-tn-201', name: 'Phòng 201 (Executive Suite)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Cleaning', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Hoa' },
  { id: 'rm-tn-202', name: 'Phòng 202 (Presidential Suite)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Repairing', occupancy: 'Vacant', housekeeper: 'Trần Minh Quân' },

  { id: 'rm-pq-101', name: 'Villa 101 (Ocean Pool Beachfront)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Phạm Hồng Ánh' },
  { id: 'rm-pq-102', name: 'Villa 102 (Two-Bedroom Villa)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Dirty', occupancy: 'Vacant', housekeeper: 'Phạm Hồng Ánh' },
  { id: 'rm-pq-201', name: 'Villa 201 (Royal Family Residence)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Clean', occupancy: 'Reserved', housekeeper: 'Chưa phân công' },

  { id: 'rm-dn-501', name: 'Phòng 501 (Grand Lux Skyline)', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Lê Thuỳ Trang' },
  { id: 'rm-dn-502', name: 'Phòng 502 (Premium River View)', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', status: 'Dirty', occupancy: 'Vacant', housekeeper: 'Chưa phân công' },

  { id: 'rm-sg-1502', name: 'Căn hộ 1502 (Studio)', branchId: 'apt-saigon-skyline', branchName: 'Metropolitan Luxury Studio - Saigon Central', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Trần Văn Kiên' },
  { id: 'rm-hn-301', name: 'Căn hộ 301 (Indochine Heritage)', branchId: 'apt-hanoi-indochine', branchName: 'Indochine Heritage 1BR Suite - Hoan Kiem', status: 'Cleaning', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Bình' }
];

const INITIAL_RESERVATIONS = [
  { id: 'BK-001', guestName: 'Nguyễn Lâm Anh', phone: '0981 123 456', email: 'lamanh.ng@gmail.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 102 (Deluxe Twin)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 9000000, rooms: 1, specialRequest: 'Yêu cầu phòng tầng cao, yên tĩnh.' },
  { id: 'BK-002', guestName: 'Phạm Quốc Bảo', phone: '0912 334 455', email: 'baopq@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 101 (Ocean Pool Beachfront)', checkIn: '2026-06-25', checkOut: '2026-06-28', status: 'CheckedIn', totalPrice: 13500000, rooms: 1, specialRequest: 'Chuẩn bị nến lãng mạn kỷ niệm ngày cưới.' },
  { id: 'BK-003', guestName: 'Trần Hoàng Long', phone: '0911 223 344', email: 'long.th@gmail.com', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', roomName: 'Phòng 501 (Grand Lux Skyline)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 11250000, rooms: 1, specialRequest: '' },
  { id: 'BK-004', guestName: 'Đỗ Thị Minh', phone: '0933 445 566', email: 'minhdt@outlook.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 101 (Deluxe Double)', checkIn: '2026-06-27', checkOut: '2026-06-30', status: 'Reserved', totalPrice: 6000000, rooms: 1, specialRequest: 'Check-in sớm lúc 11:00 nếu có thể.' },
  { id: 'BK-005', guestName: 'Lương Thế Vinh', phone: '0945 667 788', email: 'vinhlt@gmail.com', branchId: 'sapa', branchName: 'GrandStay Cloud Retreat Sapa', roomName: 'Biệt thự trên mây 302', checkIn: '2026-06-28', checkOut: '2026-07-02', status: 'Reserved', totalPrice: 16500000, rooms: 1, specialRequest: 'Đưa đón ga Sapa bằng xe Limousine.' },
  { id: 'BK-006', guestName: 'Lê Thuỳ Trang', phone: '0988 776 655', email: 'trang.lt@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 102 (Two-Bedroom Villa)', checkIn: '2026-06-24', checkOut: '2026-06-27', status: 'CheckedOut', totalPrice: 13500000, rooms: 1, specialRequest: 'Thanh toán bằng thẻ Visa doanh nghiệp.' }
];

interface CalendarDeskProps {
  branches: any[];
  apartments: any[];
  currentUser: { name: string; roleName: string; role?: string };
}

export default function CalendarDesk({ branches, apartments, currentUser }: CalendarDeskProps) {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('gs_op_rooms');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROOMS;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('gs_op_reservations');
    if (saved) return JSON.parse(saved);
    return INITIAL_RESERVATIONS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'sepay' | 'stripe'>('all');

  const [newResForm, setNewResForm] = useState({
    guestName: '',
    phone: '',
    email: '',
    branchId: 'thai-nguyen',
    roomName: 'Phòng 101 (Deluxe Double)',
    checkIn: '2026-06-27',
    checkOut: '2026-06-30',
    totalPrice: 6000000,
    specialRequest: ''
  });

  // Room Swap & Upgrade system states
  const [swappingReservation, setSwappingReservation] = useState<any | null>(null);
  const [selectedSwapRoomId, setSelectedSwapRoomId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<'no_vacant_clean' | 'room_issue' | 'guest_request_upgrade' | 'other'>('room_issue');
  const [swapSurcharge, setSwapSurcharge] = useState<number>(0);
  const [swapIsFoc, setSwapIsFoc] = useState<boolean>(true);
  const [swapNotes, setSwapNotes] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('gs_op_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('gs_op_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const handleCheckIn = (resId: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CheckedIn' } : r));

    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(res.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === res.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Occupied' };
      }
      return room;
    }));
  };

  const handleCheckOut = (resId: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CheckedOut' } : r));

    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(res.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === res.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Vacant', status: 'Dirty' };
      }
      return room;
    }));
  };

  const handleAddDirectReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.guestName || !newResForm.phone || !newResForm.email) return;

    const bName = branches.find(b => b.id === newResForm.branchId)?.name || 'GrandStay Apartment';

    const newRes = {
      id: 'BK-' + Math.floor(100 + Math.random() * 900),
      guestName: newResForm.guestName,
      phone: newResForm.phone,
      email: newResForm.email,
      branchId: newResForm.branchId,
      branchName: bName,
      roomName: newResForm.roomName,
      checkIn: newResForm.checkIn,
      checkOut: newResForm.checkOut,
      status: 'Reserved',
      totalPrice: Number(newResForm.totalPrice),
      rooms: 1,
      specialRequest: newResForm.specialRequest
    };

    setReservations(prev => [newRes, ...prev]);

    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(newResForm.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === newResForm.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Reserved' };
      }
      return room;
    }));

    setNewResForm({
      guestName: '',
      phone: '',
      email: '',
      branchId: 'thai-nguyen',
      roomName: 'Phòng 101 (Deluxe Double)',
      checkIn: '2026-06-27',
      checkOut: '2026-06-30',
      totalPrice: 6000000,
      specialRequest: ''
    });
  };

  const handlePerformRoomSwap = () => {
    if (!swappingReservation || !selectedSwapRoomId) return;

    const targetRoom = rooms.find((r: any) => r.id === selectedSwapRoomId);
    if (!targetRoom) return;

    const oldRoomName = swappingReservation.roomName;
    const newRoomName = targetRoom.name;

    // 1. Update reservation
    setReservations((prev: any[]) => prev.map(res => {
      if (res.id === swappingReservation.id) {
        return {
          ...res,
          roomName: newRoomName,
          totalPrice: res.totalPrice + (swapIsFoc ? 0 : swapSurcharge),
          specialRequest: res.specialRequest
            ? `${res.specialRequest} (Chuyển phòng: ${oldRoomName} ➔ ${newRoomName}. Lý do: ${
                swapReason === 'room_issue' ? 'Sự cố phòng cũ' :
                swapReason === 'no_vacant_clean' ? 'Hết phòng trống thực tế' :
                swapReason === 'guest_request_upgrade' ? 'Nâng cấp theo yêu cầu khách' : 'Lý do khác'
              }. Ghi chú: ${swapNotes})`
            : `Chuyển phòng: ${oldRoomName} ➔ ${newRoomName}. Lý do: ${
                swapReason === 'room_issue' ? 'Sự cố phòng cũ' :
                swapReason === 'no_vacant_clean' ? 'Hết phòng trống thực tế' :
                swapReason === 'guest_request_upgrade' ? 'Nâng cấp theo yêu cầu khách' : 'Lý do khác'
              }. Ghi chú: ${swapNotes}`
        };
      }
      return res;
    }));

    // 2. Update occupancy & status of both old and new rooms
    setRooms((prev: any[]) => prev.map(room => {
      const branchMatch = room.branchId === swappingReservation.branchId;

      // Old room matching
      const oldRoomMatch = room.name.toLowerCase().includes(oldRoomName.split(' ')[0].toLowerCase());

      // Target room matching
      const targetRoomMatch = room.id === targetRoom.id;

      if (branchMatch) {
        if (targetRoomMatch) {
          const newOccupancy = swappingReservation.status === 'CheckedIn' ? 'Occupied' : 'Reserved';
          return {
            ...room,
            occupancy: newOccupancy,
            status: 'Clean'
          };
        }
        if (oldRoomMatch) {
          const nextStatus = swapReason === 'room_issue' ? 'Repairing' : 'Dirty';
          return {
            ...room,
            occupancy: 'Vacant',
            status: nextStatus
          };
        }
      }
      return room;
    }));

    // Reset states
    setSwappingReservation(null);
    setSelectedSwapRoomId('');
    setSwapReason('room_issue');
    setSwapSurcharge(0);
    setSwapIsFoc(true);
    setSwapNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Reservation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Số Đặt Phòng</span>
          <span className="text-2xl font-extrabold text-slate-900 block mt-1">{reservations.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Đang Ở (Checked In)</span>
          <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{reservations.filter(r => r.status === 'CheckedIn').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-blue-600 font-bold uppercase block">Chờ Nhận Phòng</span>
          <span className="text-2xl font-extrabold text-blue-600 block mt-1">{reservations.filter(r => r.status === 'Reserved').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Đã Trả Phòng</span>
          <span className="text-2xl font-extrabold text-slate-500 block mt-1">{reservations.filter(r => r.status === 'CheckedOut').length}</span>
        </div>
      </div>

      {/* Interactive Timeline Calendar Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Sơ Đồ Đặt Phòng Trực Quan (Timeline Calendar)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Hiển thị lịch cư trú của khách hàng từ 24/06 đến 02/07/2026</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Hôm nay: 27/06/2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {/* Timeline Header Row */}
            <div className="flex bg-slate-50/60 font-bold text-slate-500 text-[10px] uppercase">
              <div className="w-56 p-3 border-r border-slate-100 shrink-0">Vị Trí / Buồng Phòng</div>
              <div className="flex-grow grid grid-cols-9 divide-x divide-slate-100 text-center">
                {[
                  { label: '24/06', dateStr: '2026-06-24' },
                  { label: '25/06', dateStr: '2026-06-25' },
                  { label: '26/06', dateStr: '2026-06-26' },
                  { label: '27/06', dateStr: '2026-06-27', isToday: true },
                  { label: '28/06', dateStr: '2026-06-28' },
                  { label: '29/06', dateStr: '2026-06-29' },
                  { label: '30/06', dateStr: '2026-06-30' },
                  { label: '01/07', dateStr: '2026-07-01' },
                  { label: '02/07', dateStr: '2026-07-02' }
                ].map(day => (
                  <div key={day.dateStr} className={`p-3 relative ${day.isToday ? 'bg-amber-50 text-amber-700 font-extrabold' : ''}`}>
                    {day.label}
                    {day.isToday && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Rows for each room */}
            {rooms.map(room => (
              <div key={room.id} className="flex hover:bg-slate-50/20 transition-colors text-xs font-medium">
                <div className="w-56 p-3 border-r border-slate-100 shrink-0 flex flex-col justify-center">
                  <strong className="text-slate-800 text-xs font-bold">{room.name}</strong>
                  <span className="text-[9px] text-slate-400 font-bold truncate max-w-[200px]" title={room.branchName}>{room.branchName}</span>
                </div>

                <div className="flex-grow grid grid-cols-9 divide-x divide-slate-100 relative h-14 bg-slate-50/10">
                  {[
                    '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'
                  ].map(dayStr => {
                    // Find reservation covering this day for this room
                    const activeRes = reservations.find(res => {
                      if (res.status === 'Cancelled') return false;
                      const branchMatch = res.branchId === room.branchId;
                      // Room name match
                      const roomNum = room.name.match(/\d+/)?.[0];
                      const resRoomNum = res.roomName.match(/\d+/)?.[0];
                      const rMatch = roomNum && resRoomNum && roomNum === resRoomNum;
                      const dateMatch = dayStr >= res.checkIn && dayStr <= res.checkOut;
                      return branchMatch && rMatch && dateMatch;
                    });

                    if (activeRes) {
                      const isStart = activeRes.checkIn === dayStr;
                      const isCheckedIn = activeRes.status === 'CheckedIn';
                      return (
                        <div
                          key={dayStr}
                          className={`p-1.5 flex items-center justify-center transition-all overflow-hidden relative ${
                            isCheckedIn
                              ? 'bg-emerald-50 text-emerald-800 border-y border-emerald-200/50'
                              : 'bg-blue-50 text-blue-800 border-y border-blue-200/50'
                          }`}
                          title={`${activeRes.guestName} (${activeRes.checkIn} đến ${activeRes.checkOut})`}
                        >
                          <div className="text-center w-full select-none">
                            {isStart && (
                              <div className="font-extrabold text-[9px] truncate">
                                🔑 {activeRes.guestName}
                              </div>
                            )}
                            <div className="text-[8px] opacity-75 font-mono">
                              {activeRes.status === 'CheckedIn' ? 'Đang ở' : 'Chờ nhận'}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={dayStr} className="p-1 text-[10px] text-slate-300 font-mono text-center flex items-center justify-center bg-transparent">
                        -
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations List & Receptionist Desk */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4">Danh Sách Nhận/Trả Phòng (Frontdesk Console)</h3>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm khách đặt theo tên hoặc mã..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>

          {/* Payment Method filter tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilterPaymentMethod('all')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${filterPaymentMethod === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tất cả cổng thanh toán
            </button>
            <button
              type="button"
              onClick={() => setFilterPaymentMethod('sepay')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${filterPaymentMethod === 'sepay' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              SePay ({reservations.filter(r => r.paymentMethod === 'sepay' || !r.paymentMethod).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPaymentMethod('stripe')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${filterPaymentMethod === 'stripe' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Stripe ({reservations.filter(r => r.paymentMethod === 'stripe').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Mã Booking / Khách Hàng</th>
                <th className="px-4 py-3">Vị Trí Cư Trú</th>
                <th className="px-4 py-3">Phòng Gán</th>
                <th className="px-4 py-3">Thời Gian Cư Trú</th>
                <th className="px-4 py-3">Trạng Thức & Thanh Toán</th>
                <th className="px-4 py-3 text-right">Tương Tác Ca Trực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reservations
                .filter(r => r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(r => {
                  if (filterPaymentMethod === 'all') return true;
                  if (filterPaymentMethod === 'sepay') return r.paymentMethod === 'sepay' || !r.paymentMethod;
                  if (filterPaymentMethod === 'stripe') return r.paymentMethod === 'stripe';
                  return true;
                })
                .map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3.5 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                      <div className="font-bold text-slate-900">{res.guestName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{res.id} • {res.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {res.branchName}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md font-bold text-[11px] inline-block w-max">
                          {res.roomName}
                        </span>
                        {res.specialRequest && (res.specialRequest.includes('Chuyển phòng:') || res.specialRequest.includes('chuyển phòng:')) && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200/50 w-max" title={res.specialRequest}>
                            🔄 Đã đổi & nâng cấp
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="text-slate-800 font-bold text-[10px]">CHECK-IN: {res.checkIn}</div>
                        <div className="text-slate-500 font-bold text-[10px]">CHECK-OUT: {res.checkOut}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {res.status === 'Reserved' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 w-max">
                            Chờ Nhận Phòng
                          </span>
                        ) : res.status === 'CheckedIn' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-pulse w-max">
                            ● Đang Ở
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-max">
                            Đã Trả Phòng
                          </span>
                        )}

                        {res.paymentMethod === 'stripe' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded" title={`Thanh toán qua Stripe (•••• ${res.cardNumberLast4 || '4242'})`}>
                            💳 Stripe (•••• {res.cardNumberLast4 || '4242'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            📱 SePay Chuyển khoản
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {res.status === 'Reserved' && (
                          <button
                            onClick={() => handleCheckIn(res.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Check-In
                          </button>
                        )}
                        {res.status === 'CheckedIn' && (
                          <button
                            onClick={() => handleCheckOut(res.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Check-Out
                          </button>
                        )}
                        {res.status !== 'CheckedOut' && (
                          <button
                            onClick={() => {
                              setSwappingReservation(res);
                              const bRooms = rooms.filter((room: any) => room.branchId === res.branchId && room.name !== res.roomName);
                              const defRoom = bRooms.find((room: any) => room.status === 'Clean' && room.occupancy === 'Vacant') || bRooms[0];
                              setSelectedSwapRoomId(defRoom?.id || '');
                              setSwapReason('room_issue');
                              setSwapSurcharge(0);
                              setSwapIsFoc(true);
                              setSwapNotes('');
                            }}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Đổi phòng hoặc Nâng cấp dịch vụ"
                          >
                            <RefreshCw className="w-3 h-3" /> Đổi/Nâng Cấp
                          </button>
                        )}
                        {res.status === 'CheckedOut' && (
                          <span className="text-[10px] text-slate-400 font-bold">Giao dịch hoàn tất</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Booking Form */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
        <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Đăng Ký Đặt Phòng Trực Tiếp (Walk-In Booking Desk)
        </h3>
        <form onSubmit={handleAddDirectReservation} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên Khách Hàng</label>
            <input
              type="text"
              required
              value={newResForm.guestName}
              onChange={(e) => setNewResForm({ ...newResForm, guestName: e.target.value })}
              placeholder="e.g. Hoàng Minh Châu"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số Điện Thoại</label>
            <input
              type="text"
              required
              value={newResForm.phone}
              onChange={(e) => setNewResForm({ ...newResForm, phone: e.target.value })}
              placeholder="e.g. 0914 999 888"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Địa Chỉ Email</label>
            <input
              type="email"
              required
              value={newResForm.email}
              onChange={(e) => setNewResForm({ ...newResForm, email: e.target.value })}
              placeholder="e.g. chau.hm@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Thương Hiệu / Chi Nhánh</label>
            <select
              value={newResForm.branchId}
              onChange={(e) => {
                const bid = e.target.value;
                const matchingRooms = rooms.filter(r => r.branchId === bid);
                const rName = matchingRooms[0]?.name || 'Room 101';
                setNewResForm({ ...newResForm, branchId: bid, roomName: rName });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              {apartments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Chọn Buồng Phòng Trống</label>
            <select
              value={newResForm.roomName}
              onChange={(e) => setNewResForm({ ...newResForm, roomName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
            >
              {rooms
                .filter(r => r.branchId === newResForm.branchId)
                .map(r => (
                  <option key={r.id} value={r.name}>{r.name} ({r.status === 'Clean' ? 'Sạch' : 'Bẩn'} - {r.occupancy === 'Vacant' ? 'Trống' : 'Bận'})</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tổng Giá Trị Thanh Toán (VND)</label>
            <input
              type="number"
              required
              value={newResForm.totalPrice}
              onChange={(e) => setNewResForm({ ...newResForm, totalPrice: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Yêu Cầu Thêm Của Khách</label>
            <input
              type="text"
              value={newResForm.specialRequest}
              onChange={(e) => setNewResForm({ ...newResForm, specialRequest: e.target.value })}
              placeholder="Ghi chú về đưa đón Limousine, trà thảo mộc phòng khách..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="md:col-span-3 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Đăng Ký Đặt Phòng Thành Công
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
