import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  User,
  Info,
  Layers,
  Sparkles,
  Building,
  HelpCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { Branch, UserSim } from '../types';
import { formatVND } from '../utils/formatVND';

interface RoomAvailabilityProps {
  rooms: any[];
  setRooms?: React.Dispatch<React.SetStateAction<any[]>>;
  reservations: any[];
  branches: Branch[];
  currentUser: UserSim;
}

interface LockLog {
  id: string;
  roomId: string;
  roomName: string;
  branchName: string;
  dateStr: string;
  action: 'lock' | 'unlock';
  reason?: string;
  user: string;
  time: string;
}

export default function RoomAvailability({ 
  rooms, 
  reservations, 
  branches, 
  currentUser 
}: RoomAvailabilityProps) {
  // Navigation & Filtering States
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [viewDays, setViewDays] = useState<7 | 14 | 30 | 45 | 60>(30);
  const [startDateStr, setStartDateStr] = useState<string>('2026-06-25'); // Anchored around the main reservation data (June-July 2026)
  const [endDateStr, setEndDateStr] = useState<string>('2026-07-24'); // Default end date is 30 days of June 25th 2026
  
  // Lock/Unlock Core Persistence
  const [lockedRoomDates, setLockedRoomDates] = useState<{ 
    [roomId: string]: { 
      dates: string[]; 
      reasons: { [date: string]: string }; 
      lockedBy: { [date: string]: string }; 
      timestamp: { [date: string]: string };
    } 
  }>(() => {
    const saved = localStorage.getItem('gs_locked_room_dates_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    
    // Initial Seed Data to make it look active immediately
    return {
      'rm-tn-202': {
        dates: ['2026-06-28', '2026-06-29', '2026-06-30'],
        reasons: { 
          '2026-06-28': 'Bảo trì hệ thống lạnh tổng', 
          '2026-06-29': 'Bảo trì hệ thống lạnh tổng',
          '2026-06-30': 'Bảo trì hệ thống lạnh tổng'
        },
        lockedBy: { 
          '2026-06-28': 'Nguyễn Văn Quyết', 
          '2026-06-29': 'Nguyễn Văn Quyết',
          '2026-06-30': 'Nguyễn Văn Quyết'
        },
        timestamp: { 
          '2026-06-28': '2026-06-27 14:30', 
          '2026-06-29': '2026-06-27 14:30',
          '2026-06-30': '2026-06-27 14:30'
        }
      },
      'rm-pq-102': {
        dates: ['2026-06-29', '2026-06-30'],
        reasons: { 
          '2026-06-29': 'Deep cleaning chuẩn bị đón đoàn ngoại giao Pháp',
          '2026-06-30': 'Deep cleaning chuẩn bị đón đoàn ngoại giao Pháp'
        },
        lockedBy: { 
          '2026-06-29': 'Lê Thị Khánh Mai',
          '2026-06-30': 'Lê Thị Khánh Mai'
        },
        timestamp: { 
          '2026-06-29': '2026-06-28 09:15',
          '2026-06-30': '2026-06-28 09:15'
        }
      }
    };
  });

  // Action Audit Logs Persistence
  const [actionLogs, setActionLogs] = useState<LockLog[]>(() => {
    const saved = localStorage.getItem('gs_locked_room_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log-seed-1',
        roomId: 'rm-tn-202',
        roomName: 'Phòng 202 (Presidential Suite)',
        branchName: 'GrandStay Premier Thai Nguyen',
        dateStr: '2026-06-28',
        action: 'lock',
        reason: 'Bảo trì hệ thống lạnh tổng',
        user: 'Nguyễn Văn Quyết',
        time: '2026-06-27 14:30'
      },
      {
        id: 'log-seed-2',
        roomId: 'rm-pq-102',
        roomName: 'Villa 102 (Two-Bedroom Villa)',
        branchName: 'GrandStay Beachfront Resort Phu Quoc',
        dateStr: '2026-06-29',
        action: 'lock',
        reason: 'Deep cleaning chuẩn bị đón đoàn ngoại giao Pháp',
        user: 'Lê Thị Khánh Mai',
        time: '2026-06-28 09:15'
      }
    ];
  });

  // Selected cell for Modal action
  const [selectedCell, setSelectedCell] = useState<{
    room: any;
    date: string;
    displayDate: string;
    reservation?: any;
    isLocked: boolean;
    lockInfo?: {
      reason: string;
      lockedBy: string;
      timestamp: string;
    };
  } | null>(null);

  // New lock reason input
  const [lockReason, setLockReason] = useState<string>('');

  // Persist states
  useEffect(() => {
    localStorage.setItem('gs_locked_room_dates_v2', JSON.stringify(lockedRoomDates));
  }, [lockedRoomDates]);

  useEffect(() => {
    localStorage.setItem('gs_locked_room_logs', JSON.stringify(actionLogs));
  }, [actionLogs]);

  // Generates array of date info
  const datesRange = (() => {
    const dates = [];
    const start = new Date(startDateStr);
    
    let daysToRender = viewDays;
    if (rangeMode === 'custom' && endDateStr) {
      const end = new Date(endDateStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
        // Limit custom range between 1 and 90 days for client performance
        daysToRender = Math.max(1, Math.min(90, diffDays)) as any;
      }
    }

    for (let i = 0; i < daysToRender; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + i);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const dayName = (() => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[nextDate.getDay()];
      })();

      dates.push({
        dateStr,
        dayName,
        displayDate: `${dd}/${mm}`,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6
      });
    }
    return dates;
  })();

  // Shift start dates
  const handleShiftDate = (days: number) => {
    const current = new Date(startDateStr);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setStartDateStr(`${yyyy}-${mm}-${dd}`);

    if (rangeMode === 'custom' && endDateStr) {
      const end = new Date(endDateStr);
      end.setDate(end.getDate() + days);
      const eyyyy = end.getFullYear();
      const emm = String(end.getMonth() + 1).padStart(2, '0');
      const edd = String(end.getDate()).padStart(2, '0');
      setEndDateStr(`${eyyyy}-${emm}-${edd}`);
    }
  };

  const handleSetToday = () => {
    setStartDateStr('2026-06-29'); // Align with application's current simulated date
    
    // Reset endDateStr to 30 days ahead of June 29th
    const end = new Date('2026-06-29');
    end.setDate(end.getDate() + 29);
    const yyyy = end.getFullYear();
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    const dd = String(end.getDate()).padStart(2, '0');
    setEndDateStr(`${yyyy}-${mm}-${dd}`);
  };

  // Check if room has active reservation for a date
  const getActiveReservation = (roomName: string, dateStr: string) => {
    return reservations.find(res => {
      // Cross-referencing rooms by comparing sub-names
      const isMatchRoom = res.roomName === roomName || 
                          roomName.toLowerCase().includes(res.roomName.toLowerCase()) || 
                          res.roomName.toLowerCase().includes(roomName.toLowerCase());
      if (!isMatchRoom) return false;

      const cellDate = new Date(dateStr);
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);

      cellDate.setHours(0,0,0,0);
      checkIn.setHours(0,0,0,0);
      checkOut.setHours(0,0,0,0);

      // Bookings stay up to the morning of CheckOut
      return cellDate >= checkIn && cellDate < checkOut && res.status !== 'CheckedOut' && res.status !== 'Cancelled';
    });
  };

  // Helper to retrieve lock info for room and date
  const getRoomLockInfo = (roomId: string, dateStr: string) => {
    const roomLock = lockedRoomDates[roomId];
    if (roomLock && roomLock.dates.includes(dateStr)) {
      return {
        isLocked: true,
        reason: roomLock.reasons[dateStr] || 'Khóa hệ thống',
        lockedBy: roomLock.lockedBy[dateStr] || 'Hệ thống',
        timestamp: roomLock.timestamp[dateStr] || 'Không rõ'
      };
    }
    return { isLocked: false };
  };

  // Filtered Room List
  const filteredRooms = rooms.filter(room => {
    const matchBranch = selectedBranchId === 'all' || room.branchId === selectedBranchId;
    const matchSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        room.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBranch && matchSearch;
  });

  // Lock specific date for a room
  const handleLockRoomDate = () => {
    if (!selectedCell) return;
    const { room, date } = selectedCell;
    const reasonText = lockReason.trim() || 'Khóa điều phối thủ công';
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setLockedRoomDates(prev => {
      const roomLock = prev[room.id] || { dates: [], reasons: {}, lockedBy: {}, timestamp: {} };
      
      if (!roomLock.dates.includes(date)) {
        const updatedDates = [...roomLock.dates, date];
        const updatedReasons = { ...roomLock.reasons, [date]: reasonText };
        const updatedLockedBy = { ...roomLock.lockedBy, [date]: currentUser.name };
        const updatedTimestamps = { ...roomLock.timestamp, [date]: nowTime };
        
        return {
          ...prev,
          [room.id]: {
            dates: updatedDates,
            reasons: updatedReasons,
            lockedBy: updatedLockedBy,
            timestamp: updatedTimestamps
          }
        };
      }
      return prev;
    });

    // Append log
    const newLog: LockLog = {
      id: `log-${Date.now()}`,
      roomId: room.id,
      roomName: room.name,
      branchName: room.branchName,
      dateStr: date,
      action: 'lock',
      reason: reasonText,
      user: currentUser.name,
      time: nowTime
    };

    setActionLogs(prev => [newLog, ...prev]);
    setSelectedCell(null);
    setLockReason('');
  };

  // Unlock specific date for a room
  const handleUnlockRoomDate = () => {
    if (!selectedCell) return;
    const { room, date } = selectedCell;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setLockedRoomDates(prev => {
      const roomLock = prev[room.id];
      if (roomLock) {
        const updatedDates = roomLock.dates.filter(d => d !== date);
        const updatedReasons = { ...roomLock.reasons };
        delete updatedReasons[date];
        const updatedLockedBy = { ...roomLock.lockedBy };
        delete updatedLockedBy[date];
        const updatedTimestamps = { ...roomLock.timestamp };
        delete updatedTimestamps[date];

        return {
          ...prev,
          [room.id]: {
            dates: updatedDates,
            reasons: updatedReasons,
            lockedBy: updatedLockedBy,
            timestamp: updatedTimestamps
          }
        };
      }
      return prev;
    });

    // Append log
    const newLog: LockLog = {
      id: `log-${Date.now()}`,
      roomId: room.id,
      roomName: room.name,
      branchName: room.branchName,
      dateStr: date,
      action: 'unlock',
      user: currentUser.name,
      time: nowTime
    };

    setActionLogs(prev => [newLog, ...prev]);
    setSelectedCell(null);
  };

  // Stats calculation over selected date range
  const totalSlots = filteredRooms.length * datesRange.length;
  let occupiedCount = 0;
  let lockedCount = 0;

  filteredRooms.forEach(room => {
    datesRange.forEach(d => {
      if (getActiveReservation(room.name, d.dateStr)) {
        occupiedCount++;
      } else if (getRoomLockInfo(room.id, d.dateStr).isLocked) {
        lockedCount++;
      }
    });
  });

  const availableCount = Math.max(0, totalSlots - occupiedCount - lockedCount);
  const occupancyPercent = totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0;
  const lockPercent = totalSlots > 0 ? Math.round((lockedCount / totalSlots) * 100) : 0;

  return (
    <div className="space-y-6" id="room-availability-system">
      {/* Overview Cards & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Bộ Lọc Hiện Tại</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5">{filteredRooms.length} Phòng</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Tổng quan quỹ phòng kiểm soát</span>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block">Công Suất Trung Bình</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">{occupancyPercent}%</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              {occupiedCount} phòng-ngày có khách ở
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Locked Slots */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider block">Tỷ Lệ Khóa Lịch</span>
            <span className="text-xl font-black text-rose-600 block mt-0.5">{lockPercent}%</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              {lockedCount} phòng-ngày bị khóa hành chính
            </span>
          </div>
          <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">Số Phòng Khả Dụng</span>
            <span className="text-xl font-black text-blue-600 block mt-0.5">{availableCount}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              phòng-ngày sẵn sàng đón khách
            </span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Toolbar Area */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col gap-5">
        
        {/* Row 1: Filters (Branch, Search Room) and Range Switcher */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter dropdown */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Building className="w-4 h-4" />
              </span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="pl-9.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả chi nhánh ({rooms.length} phòng)</option>
                {branches.map(br => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[8px] font-bold">▼</span>
            </div>

            {/* Room Search input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm phòng theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white w-full transition-all"
              />
            </div>
          </div>

          {/* Range Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start xl:self-auto shrink-0">
            <button
              onClick={() => setRangeMode('preset')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${rangeMode === 'preset' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Cài đặt sẵn (Presets)
            </button>
            <button
              onClick={() => setRangeMode('custom')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${rangeMode === 'custom' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Tùy chọn khoảng ngày
            </button>
          </div>
        </div>

        {/* Row 2: Range values controls based on rangeMode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Controls column */}
          <div className="flex flex-wrap items-center gap-3">
            {rangeMode === 'preset' ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Số ngày:</span>
                {[7, 14, 30, 45, 60].map((days) => (
                  <button
                    key={days}
                    onClick={() => setViewDays(days as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewDays === days 
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600'
                    }`}
                  >
                    {days} ngày
                    {days === 30 && (
                      <span className="ml-1 text-[8px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">Mặc định</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Từ ngày</span>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => e.target.value && setStartDateStr(e.target.value)}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer h-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đến ngày</span>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => {
                      if (e.target.value) {
                        // Ensure end date is not before start date
                        if (new Date(e.target.value) >= new Date(startDateStr)) {
                          setEndDateStr(e.target.value);
                        }
                      }
                    }}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer h-9"
                  />
                </div>
                {(() => {
                  const s = new Date(startDateStr);
                  const e = new Date(endDateStr);
                  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
                  return (
                    <span className="text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1.5 rounded-xl">
                      {isNaN(diff) ? 'Chọn ngày hợp lệ' : `Khoảng cách: ${diff} ngày`}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Stepper shift navigation buttons */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">Di chuyển nhanh:</span>
            <button
              onClick={() => handleShiftDate(-7)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Lùi 7 ngày"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSetToday}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
            >
              Hôm nay
            </button>

            {rangeMode === 'preset' && (
              <div className="relative">
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => e.target.value && setStartDateStr(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer h-9"
                />
              </div>
            )}

            <button
              onClick={() => handleShiftDate(7)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Tiến 7 ngày"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 3: Active details & Summary bar */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Timeline đang xem</span>
            <span className="text-slate-800">
              Từ <strong>{(() => {
                const s = new Date(startDateStr);
                return `${String(s.getDate()).padStart(2, '0')}/${String(s.getMonth() + 1).padStart(2, '0')}/${s.getFullYear()}`;
              })()}</strong> đến <strong>{(() => {
                const dates = datesRange;
                if (dates.length === 0) return '';
                const last = new Date(dates[dates.length - 1].dateStr);
                return `${String(last.getDate()).padStart(2, '0')}/${String(last.getMonth() + 1).padStart(2, '0')}/${last.getFullYear()}`;
              })()}</strong> ({datesRange.length} ngày)
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-400 font-normal self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Cuộn ngang bảng để xem tất cả các ngày</span>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-start text-[11px] text-slate-500 font-bold">
          <span className="uppercase text-[9px] text-slate-400 tracking-wider mr-1">Trạng thái:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-emerald-50 border border-emerald-200 inline-block" />
            <span>Phòng trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-amber-100 border border-amber-300 inline-block" />
            <span>Đã đặt trước (Reserved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 inline-block" />
            <span>Khách đang ở (Checked In)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-slate-900 text-slate-100 flex items-center justify-center inline-block bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[size:10px_10px]" />
            <span>Bị khóa (Locked)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-slate-400 font-normal">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Click vào ô để thay đổi khóa hoặc xem chi tiết đặt phòng</span>
          </div>
        </div>
      </div>

      {/* Main Grid View Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full border-collapse text-left table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                {/* Sticky Room column */}
                <th className="p-3.5 w-60 sticky left-0 bg-slate-100/90 backdrop-blur z-20 border-r border-slate-200 shadow-[3px_0_10px_rgba(0,0,0,0.04)]">
                  Phòng / Chi nhánh
                </th>
                {/* Scrollable days columns */}
                {datesRange.map(d => (
                  <th 
                    key={d.dateStr} 
                    className={`p-3 text-center min-w-[95px] w-[95px] border-r border-slate-200 z-10 transition-all ${
                      d.isWeekend 
                        ? 'bg-amber-50/70 text-amber-850 border-b-2 border-b-amber-300' 
                        : 'bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">{d.dayName}</div>
                    <div className="text-[14px] font-black mt-1 text-slate-800">{d.displayDate}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={datesRange.length + 1} className="p-12 text-center text-slate-400 font-medium">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy phòng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Sticky Room Info Cell */}
                    <td className="p-3 sticky left-0 bg-white z-20 border-r border-slate-200 shadow-[3px_0_10px_rgba(0,0,0,0.03)] hover:bg-slate-50">
                      <div className="max-w-[210px]">
                        <div className="font-extrabold text-slate-800 text-xs truncate" title={room.name}>
                          {room.name}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold truncate mt-0.5" title={room.branchName}>
                          {room.branchName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                            room.status === 'Clean' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' :
                            room.status === 'Dirty' ? 'bg-rose-100 text-rose-800 border border-rose-200/50' :
                            room.status === 'Cleaning' ? 'bg-blue-100 text-blue-800 border border-blue-200/50' :
                            'bg-amber-100 text-amber-800 border border-amber-200/50'
                          }`}>
                            {room.status}
                          </span>
                          <span className="text-[8px] text-slate-400 font-medium truncate max-w-[100px]">
                            {room.housekeeper}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Render days grids */}
                    {datesRange.map(d => {
                      const activeRes = getActiveReservation(room.name, d.dateStr);
                      const lockInfo = getRoomLockInfo(room.id, d.dateStr);
                      
                      let cellClass = '';
                      let cellIcon = null;
                      let cellLabel = '';
                      let subLabel = '';

                      if (lockInfo.isLocked) {
                        cellClass = 'bg-slate-900 border-slate-950 text-slate-100 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:8px_8px] shadow-sm hover:brightness-110';
                        cellIcon = <Lock className="w-3 h-3 text-rose-400 shrink-0" />;
                        cellLabel = 'Đang khóa';
                        subLabel = lockInfo.reason ? (lockInfo.reason.length > 10 ? lockInfo.reason.substring(0, 10) + '...' : lockInfo.reason) : 'Bảo trì';
                      } else if (activeRes) {
                        if (activeRes.status === 'CheckedIn') {
                          cellClass = 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-700 shadow-md shadow-blue-500/10 hover:shadow-indigo-500/20 hover:brightness-105';
                          cellIcon = <User className="w-3 h-3 text-blue-200 shrink-0" />;
                          cellLabel = activeRes.guestName ? activeRes.guestName.split(' ').pop() || 'Đang ở' : 'Đang ở';
                          subLabel = 'Đang ở';
                        } else {
                          // Reserved
                          cellClass = 'bg-amber-100 text-amber-900 border-amber-200 shadow-sm hover:bg-amber-150';
                          cellIcon = <CalendarDays className="w-3 h-3 text-amber-600 shrink-0" />;
                          cellLabel = activeRes.guestName ? activeRes.guestName.split(' ').pop() || 'Đặt trước' : 'Chờ khách';
                          subLabel = 'Đặt trước';
                        }
                      } else {
                        // Available
                        cellClass = `bg-emerald-50/40 text-emerald-850 border-emerald-100/30 hover:bg-emerald-100/75 hover:border-emerald-200 ${d.isWeekend ? 'bg-amber-50/20' : ''}`;
                        cellIcon = <CheckCircle2 className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform shrink-0" />;
                        cellLabel = 'Sẵn sàng';
                        subLabel = 'Trống';
                      }

                      return (
                        <td 
                          key={d.dateStr} 
                          onClick={() => setSelectedCell({
                            room,
                            date: d.dateStr,
                            displayDate: d.displayDate,
                            reservation: activeRes,
                            isLocked: lockInfo.isLocked,
                            lockInfo: lockInfo.isLocked ? lockInfo : undefined
                          })}
                          className={`p-1.5 text-center min-h-[72px] h-[72px] relative group select-none cursor-pointer border-r border-slate-100 transition-colors ${d.isWeekend ? 'bg-amber-50/10' : ''}`}
                        >
                          <div className={`h-full w-full flex flex-col justify-between items-center p-2 rounded-xl border text-center transition-all duration-200 ${cellClass}`}>
                            <div className="flex items-center gap-1 w-full justify-center">
                              {cellIcon}
                              <span className="text-[9px] font-extrabold uppercase tracking-wider block truncate max-w-[65px]">
                                {cellLabel}
                              </span>
                            </div>
                            <span className="text-[8px] font-semibold opacity-85 block truncate max-w-[75px]">
                              {subLabel}
                            </span>
                          </div>
                          
                          {/* Rich hover details tooltip (desktop) */}
                          <div className="absolute hidden group-hover:block bottom-[85%] left-1/2 -translate-x-1/2 mb-2 bg-slate-950 text-white text-[10px] rounded-xl p-3 shadow-xl w-52 z-40 border border-slate-800">
                            <div className="font-extrabold border-b border-white/10 pb-1.5 mb-1.5 text-slate-200 flex justify-between">
                              <span className="text-blue-400">{room.name}</span>
                              <span className="text-amber-400 font-black">{d.displayDate}</span>
                            </div>
                            {lockInfo.isLocked ? (
                              <div className="space-y-1">
                                <span className="text-rose-400 font-extrabold block text-xs flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> ✓ Đang khóa phòng
                                </span>
                                <p className="text-slate-300">Lý do: <strong className="text-white">{lockInfo.reason}</strong></p>
                                <span className="text-slate-400 block text-[9px]">Người khóa: {lockInfo.lockedBy}</span>
                                <span className="text-slate-400 block text-[9px] opacity-75">Lúc: {lockInfo.timestamp}</span>
                              </div>
                            ) : activeRes ? (
                              <div className="space-y-1">
                                <span className={`font-extrabold block text-xs flex items-center gap-1 ${
                                  activeRes.status === 'CheckedIn' ? 'text-blue-400' : 'text-amber-400'
                                }`}>
                                  {activeRes.status === 'CheckedIn' ? <User className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                                  {activeRes.status === 'CheckedIn' ? '✓ Đang lưu trú' : '✓ Đã đặt trước'}
                                </span>
                                <p className="text-slate-200 font-extrabold">Khách: {activeRes.guestName}</p>
                                <p className="text-[9px] text-slate-300">
                                  Thời gian: {activeRes.checkIn} → {activeRes.checkOut}
                                </p>
                                <p className="text-[9px] text-slate-400">
                                  Hóa đơn: {formatVND(activeRes.totalAmount || 0)} ({activeRes.paymentStatus})
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-emerald-400 font-extrabold block text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> ✓ Phòng khả dụng
                                </span>
                                <p className="text-slate-300">Bấm vào ô để thiết lập khóa hành chính hoặc thêm các tùy chọn đóng lịch.</p>
                              </div>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Audit Trail Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-600" />
          Nhật ký đóng/mở khóa phòng gần đây
        </h3>
        
        {actionLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Chưa có hoạt động quản trị khóa lịch nào trong ca trực.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
            {actionLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4 text-xs bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    log.action === 'lock' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {log.action === 'lock' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {log.action === 'lock' ? 'Khóa lịch' : 'Mở khóa'} phòng: <span className="font-extrabold text-slate-900">{log.roomName}</span> ({log.dateStr})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Người làm: <strong>{log.user}</strong></span>
                      <span>•</span>
                      <span>Chi nhánh: {log.branchName}</span>
                      {log.reason && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500">Lý do: "{log.reason}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action / Detail Modal Dialog */}
      <AnimatePresence>
        {selectedCell && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-4 sm:p-5 text-white flex justify-between items-center">
                <div>
                  <span className="text-amber-400 text-[9px] font-black uppercase tracking-wider block">
                    CẤU HÌNH TRẠNG THÁI PHÒNG • {selectedCell.displayDate}
                  </span>
                  <h3 className="text-sm font-extrabold truncate max-w-xs">{selectedCell.room.name}</h3>
                </div>
                <button
                  onClick={() => { setSelectedCell(null); setLockReason(''); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Condition 1: Occupied Room Details */}
                {selectedCell.reservation ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 flex gap-3">
                      <Info className="w-5 h-5 shrink-0 text-blue-600" />
                      <div>
                        <h4 className="font-extrabold text-xs">Phòng đã có khách đặt trước hoặc lưu trú</h4>
                        <p className="text-[11px] text-blue-700 font-light mt-0.5">
                          Quỹ phòng đã được ghi nhận trong hợp đồng phòng chính thức. Không thể thực hiện khóa hành chính cho ô thời gian này.
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                      <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Chi tiết đặt phòng #{selectedCell.reservation.id}
                      </div>
                      
                      {/* Guest name */}
                      <div className="p-3 grid grid-cols-3 gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Khách hàng:</span>
                        <span className="col-span-2 text-slate-800 font-bold">{selectedCell.reservation.guestName}</span>
                      </div>

                      {/* Phone / Email */}
                      <div className="p-3 grid grid-cols-3 gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Liên hệ:</span>
                        <span className="col-span-2 text-slate-800 font-medium">
                          {selectedCell.reservation.phone} <br />
                          <span className="text-[10px] text-slate-400">{selectedCell.reservation.email}</span>
                        </span>
                      </div>

                      {/* Period */}
                      <div className="p-3 grid grid-cols-3 gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Thời gian:</span>
                        <span className="col-span-2 text-slate-800 font-bold">
                          {selectedCell.reservation.checkIn} <span className="text-slate-400">đến</span> {selectedCell.reservation.checkOut}
                        </span>
                      </div>

                      {/* Value */}
                      <div className="p-3 grid grid-cols-3 gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Doanh thu:</span>
                        <span className="col-span-2 text-emerald-600 font-extrabold">
                          {formatVND(selectedCell.reservation.totalPrice)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="p-3 grid grid-cols-3 gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Trạng thái:</span>
                        <span className="col-span-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            selectedCell.reservation.status === 'CheckedIn' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {selectedCell.reservation.status === 'CheckedIn' ? 'Đã nhận phòng' : 'Chờ nhận phòng'}
                          </span>
                        </span>
                      </div>

                      {/* Special Request */}
                      {selectedCell.reservation.specialRequest && (
                        <div className="p-3 text-xs">
                          <span className="text-slate-400 font-semibold block mb-0.5">Yêu cầu đặc biệt:</span>
                          <span className="text-slate-700 italic font-light font-sans">
                            "{selectedCell.reservation.specialRequest}"
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedCell(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Đóng cửa sổ
                    </button>
                  </div>
                ) : selectedCell.isLocked ? (
                  /* Condition 2: Locked details and Unlock button */
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex gap-3">
                      <Lock className="w-5 h-5 shrink-0 text-amber-400" />
                      <div>
                        <h4 className="font-extrabold text-xs text-amber-400">PHÒNG ĐANG KHÓA HÀNH CHÍNH</h4>
                        <p className="text-[11px] text-slate-300 font-light mt-0.5">
                          Khóa hành chính sẽ tạm thời ẩn phòng khỏi trang tìm kiếm của khách hàng trên hệ thống để phục vụ công tác kỹ thuật hoặc điều phối nội bộ.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block">Lý do khóa:</span>
                        <strong className="text-slate-900 text-sm block mt-0.5 font-extrabold">
                          {selectedCell.lockInfo?.reason}
                        </strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-semibold block">Người thực hiện:</span>
                          <span className="text-slate-700 font-bold">{selectedCell.lockInfo?.lockedBy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Thời gian lưu:</span>
                          <span className="text-slate-700 font-mono font-medium">{selectedCell.lockInfo?.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCell(null)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Bỏ qua
                      </button>
                      
                      <button
                        onClick={handleUnlockRoomDate}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Mở khóa phòng
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Condition 3: Available room and Lock form */
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <div>
                        <h4 className="font-extrabold text-xs">Phòng đang khả dụng ngày {selectedCell.displayDate}</h4>
                        <p className="text-[11px] text-emerald-700 font-light mt-0.5">
                          Bạn có thể khóa phòng này. Việc khóa phòng sẽ ngăn khách hàng tự đặt phòng trên website GrandStay vào ngày này.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Lý do khóa phòng <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Bảo trì vòi sen, dọn dẹp sâu, khách đặt trực tiếp..."
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Người thực hiện
                      </label>
                      <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600">
                        {currentUser.name} ({currentUser.roleName || 'Quản lý'})
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => { setSelectedCell(null); setLockReason(''); }}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Bỏ qua
                      </button>
                      
                      <button
                        onClick={handleLockRoomDate}
                        disabled={!lockReason.trim()}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-white ${
                          lockReason.trim() 
                            ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/10' 
                            : 'bg-slate-300 text-slate-100 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Khóa phòng ngày này
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple absolute close button
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
