import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, FileText, ShieldAlert, Clock, CalendarDays, Lock } from 'lucide-react';
import CalendarDesk from './CalendarDesk';
import HousekeepingDesk from './HousekeepingDesk';
import GuestRequests from './GuestRequests';
import ComplaintsHandling from './ComplaintsHandling';
import DailyLogs from './DailyLogs';
import ScheduleShiftSwap from './ScheduleShiftSwap';
import RoomAvailability from '../RoomAvailability';

interface OperationsLayoutProps {
  branches: any[];
  apartments: any[];
  setApartments: React.Dispatch<React.SetStateAction<any[]>>;
  rooms: any[];
  reservations: any[];
  currentUser: { name: string; roleName: string; role: string };
}

const subNavItems = [
  { path: 'calendar', label: 'Lịch Đặt & Quầy Lễ Tân', icon: Calendar },
  { path: 'housekeeping', label: 'Buồng Phòng', icon: Sparkles },
  { path: 'requests', label: 'Yêu Cầu Khách', icon: FileText },
  { path: 'complaints', label: 'Khiếu Nại', icon: ShieldAlert },
  { path: 'dailylogs', label: 'Nhật Ký Ca Trực', icon: Clock },
  { path: 'schedule', label: 'Nghỉ Phép & Đổi Ca', icon: CalendarDays },
  { path: 'availability', label: 'Lịch Trống & Khóa Phòng', icon: Lock },
];

export default function OperationsLayout({ branches, apartments, setApartments, rooms, reservations, currentUser }: OperationsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSub = location.pathname.split('/operations/')[1] || 'calendar';

  return (
    <div className="space-y-6">
      {/* Operations Hub Header and Sub-nav selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Hệ Thống Phân Hệ Vận Hành</span>
          <h2 className="text-xl font-extrabold tracking-tight">Trung Tâm Vận Hành & Dịch Vụ Khách Sạn</h2>
          <p className="text-xs text-slate-300 mt-1">Quản lý nhận/trả phòng, trạng thái buồng dọn dẹp, điều phối yêu cầu & giải quyết khiếu nại thời gian thực.</p>
        </div>

        {/* Sub-nav route links */}
        <div className="flex flex-wrap gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSub === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(`/admin/operations/${item.path}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nested routes for each operations sub-page */}
      <Routes>
        <Route path="/" element={<Navigate to="calendar" replace />} />
        <Route path="calendar" element={<CalendarDesk branches={branches} apartments={apartments} currentUser={currentUser} />} />
        <Route path="housekeeping" element={<HousekeepingDesk apartments={apartments} setApartments={setApartments} branches={branches} currentUser={currentUser} />} />
        <Route path="requests" element={<GuestRequests />} />
        <Route path="complaints" element={<ComplaintsHandling />} />
        <Route path="dailylogs" element={<DailyLogs currentUser={currentUser} />} />
        <Route path="schedule" element={<ScheduleShiftSwap currentUser={currentUser} />} />
        <Route path="availability" element={<RoomAvailability rooms={rooms} reservations={reservations} branches={branches} currentUser={currentUser as any} />} />
        <Route path="*" element={<Navigate to="calendar" replace />} />
      </Routes>
    </div>
  );
}
