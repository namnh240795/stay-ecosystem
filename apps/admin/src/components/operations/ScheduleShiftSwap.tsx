import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle, User, Plus, Shuffle, FileText, Check, X } from 'lucide-react';
import Pagination from '../admin/Pagination';
import { exportRosterToPDF } from '../../utils/pdf';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScheduleShiftSwapProps {
  currentUser: { name: string; roleName: string; role: string };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

// Initial Schedule / Leave / Swap requests
const INITIAL_SCHEDULE_REQUESTS = [
  {
    id: 'req-sch-1',
    type: 'leave', // 'leave' | 'swap'
    staffName: 'Nguyễn Thị Hoa',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    leaveStartDate: '2026-07-01',
    leaveEndDate: '2026-07-03',
    leaveType: 'annual', // 'annual' | 'sick' | 'unpaid'
    reason: 'Xin nghỉ phép thường niên về quê ăn giỗ gia đình',
    status: 'Pending',
    createdAt: '2026-06-27'
  },
  {
    id: 'req-sch-2',
    type: 'swap',
    staffName: 'Phạm Hồng Nhung',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    originalShiftDate: '2026-06-29',
    originalShiftName: 'Ca Sáng (06:00 - 14:00)',
    targetShiftDate: '2026-06-29',
    targetShiftName: 'Ca Đêm (22:00 - 06:00)',
    targetStaffName: 'Hoàng Quốc Việt',
    reason: 'Trùng lịch khám sức khoẻ định kì buổi sáng, muốn đổi ca với đồng nghiệp',
    status: 'Pending',
    createdAt: '2026-06-28'
  },
  {
    id: 'req-sch-3',
    type: 'leave',
    staffName: 'Trần Minh Tuấn',
    roleName: 'Quản Lý Dự Án',
    branchName: 'GrandStay Premier Thai Nguyen',
    leaveStartDate: '2026-06-25',
    leaveEndDate: '2026-06-25',
    leaveType: 'sick',
    reason: 'Xin nghỉ ốm đột xuất do bị sốt siêu vi',
    status: 'Approved',
    approvedBy: 'Nguyễn Văn Quyết',
    responseNotes: 'Đã duyệt nghỉ đột xuất. Đã giao Tuấn Anh bàn giao ca.',
    createdAt: '2026-06-25'
  }
];

// Initial Staff Weekly Shift Roster
const INITIAL_ROSTER = [
  {
    staffId: 'staff-1',
    staffName: 'Nguyễn Văn Quyết',
    roleName: 'Giám Đốc Vận Hành',
    branchName: 'Tất Cả Chi Nhánh',
    shifts: {
      '2026-06-25': 'Hành chính (08:00 - 17:00)',
      '2026-06-26': 'Hành chính (08:00 - 17:00)',
      '2026-06-27': 'Hành chính (08:00 - 17:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Hành chính (08:00 - 17:00)',
      '2026-06-30': 'Hành chính (08:00 - 17:00)',
      '2026-07-01': 'Hành chính (08:00 - 17:00)'
    }
  },
  {
    staffId: 'staff-3',
    staffName: 'Trần Minh Tuấn',
    roleName: 'Quản Lý Dự Án',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'OFF (Nghỉ ốm)',
      '2026-06-26': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-27': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Sáng (06:00 - 14:00)',
      '2026-07-01': 'Ca Chiều (14:00 - 22:00)'
    }
  },
  {
    staffId: 'staff-4',
    staffName: 'Phạm Hồng Nhung',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-26': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-27': 'OFF',
      '2026-06-28': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Chiều (14:00 - 22:00)',
      '2026-07-01': 'Ca Chiều (14:00 - 22:00)'
    }
  },
  {
    staffId: 'staff-5',
    staffName: 'Hoàng Quốc Việt',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-26': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-27': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-28': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-29': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-30': 'OFF',
      '2026-07-01': 'Ca Đêm (22:00 - 06:00)'
    }
  },
  {
    staffId: 'staff-6',
    staffName: 'Nguyễn Thị Hoa',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-26': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-27': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Chiều (14:00 - 22:00)',
      '2026-07-01': 'OFF (Xin nghỉ phép)'
    }
  },
  {
    staffId: 'staff-7',
    staffName: 'Lê Văn Nam',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-26': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-27': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-30': 'Ca Sáng (06:00 - 14:00)',
      '2026-07-01': 'Ca Sáng (06:00 - 14:00)'
    }
  }
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ScheduleShiftSwap: React.FC<ScheduleShiftSwapProps> = ({ currentUser }) => {
  const [scheduleRequests, setScheduleRequests] = useState(() => {
    const saved = localStorage.getItem('gs_op_schedule_requests');
    if (saved) return JSON.parse(saved);
    return INITIAL_SCHEDULE_REQUESTS;
  });

  const [roster, setRoster] = useState(() => {
    const saved = localStorage.getItem('gs_op_roster');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROSTER;
  });

  const [scheduleRequestsPage, setScheduleRequestsPage] = useState(1);
  const [scheduleRequestsPerPage, setScheduleRequestsPerPage] = useState(5);

  const [newLeaveForm, setNewLeaveForm] = useState({
    startDate: '',
    endDate: '',
    type: 'annual' as 'annual' | 'sick' | 'unpaid',
    reason: ''
  });

  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    date: string;
    currentShift: string;
  } | null>(null);

  const [rosterRoleFilter, setRosterRoleFilter] = useState<string>('All');

  const [newSwapForm, setNewSwapForm] = useState({
    originalDate: '',
    originalShift: 'Ca Sáng (06:00 - 14:00)',
    targetDate: '',
    targetShift: 'Ca Sáng (06:00 - 14:00)',
    targetStaff: '',
    reason: ''
  });

  const [responseNotesState, setResponseNotesState] = useState<{ [key: string]: string }>({});

  // Persistence
  useEffect(() => {
    localStorage.setItem('gs_op_schedule_requests', JSON.stringify(scheduleRequests));
  }, [scheduleRequests]);

  useEffect(() => {
    localStorage.setItem('gs_op_roster', JSON.stringify(roster));
  }, [roster]);

  // --- Handlers ---

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveForm.startDate || !newLeaveForm.endDate || !newLeaveForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin ngày nghỉ và lý do!');
      return;
    }

    const newReq = {
      id: 'req-sch-' + Math.random().toString(36).substr(2, 5),
      type: 'leave' as 'leave' | 'swap',
      staffName: currentUser.name,
      roleName: currentUser.roleName,
      branchName: 'GrandStay Premier Thai Nguyen', // default branch
      leaveStartDate: newLeaveForm.startDate,
      leaveEndDate: newLeaveForm.endDate,
      leaveType: newLeaveForm.type,
      reason: newLeaveForm.reason,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setScheduleRequests(prev => [newReq, ...prev]);
    setNewLeaveForm({
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: ''
    });
    alert('Đã gửi yêu cầu xin nghỉ phép thành công!');
  };

  const handleCreateSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwapForm.originalDate || !newSwapForm.targetDate || !newSwapForm.reason || !newSwapForm.targetStaff) {
      alert('Vui lòng điền đầy đủ thông tin ngày, đồng nghiệp đổi ca và lý do!');
      return;
    }

    const newReq = {
      id: 'req-sch-' + Math.random().toString(36).substr(2, 5),
      type: 'swap' as 'leave' | 'swap',
      staffName: currentUser.name,
      roleName: currentUser.roleName,
      branchName: 'GrandStay Premier Thai Nguyen',
      originalShiftDate: newSwapForm.originalDate,
      originalShiftName: newSwapForm.originalShift,
      targetShiftDate: newSwapForm.targetDate,
      targetShiftName: newSwapForm.targetShift,
      targetStaffName: newSwapForm.targetStaff,
      reason: newSwapForm.reason,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setScheduleRequests(prev => [newReq, ...prev]);
    setNewSwapForm({
      originalDate: '',
      originalShift: 'Ca Sáng (06:00 - 14:00)',
      targetDate: '',
      targetShift: 'Ca Sáng (06:00 - 14:00)',
      targetStaff: '',
      reason: ''
    });
    alert('Đã gửi yêu cầu xin đổi ca làm việc thành công!');
  };

  const handleActionScheduleRequest = (id: string, action: 'Approved' | 'Rejected') => {
    const notes = responseNotesState[id] || '';
    setScheduleRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: action,
          approvedBy: currentUser.name,
          responseNotes: notes || (action === 'Approved' ? 'Đã phê duyệt.' : 'Không phê duyệt yêu cầu.')
        };
      }
      return req;
    }));
    alert(action === 'Approved' ? 'Đã phê duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu.');
  };

  const handleUpdateShift = (staffId: string, date: string, newShift: string) => {
    setRoster(prev => prev.map(item => {
      if (item.staffId === staffId) {
        return {
          ...item,
          shifts: {
            ...item.shifts,
            [date]: newShift
          }
        };
      }
      return item;
    }));
    setEditingCell(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Số Yêu Cầu</span>
            <span className="text-xl font-extrabold text-slate-950 block mt-1">{scheduleRequests.length}</span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đang Chờ Phê Duyệt</span>
            <span className="text-xl font-extrabold text-amber-500 block mt-1">
              {scheduleRequests.filter((r: any) => r.status === 'Pending').length}
            </span>
          </div>
          <div className="bg-amber-50 text-amber-500 p-2.5 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đã Chấp Thuận</span>
            <span className="text-xl font-extrabold text-emerald-600 block mt-1">
              {scheduleRequests.filter((r: any) => r.status === 'Approved').length}
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đơn của tôi</span>
            <span className="text-xl font-extrabold text-indigo-600 block mt-1">
              {scheduleRequests.filter((r: any) => r.staffName === currentUser.name).length}
            </span>
          </div>
          <div className="bg-indigo-50 text-indigo-500 p-2.5 rounded-lg">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ==================== WORK ROSTER & SHIFT BOARD ==================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Bảng Phân Ca Làm Việc & Trực Nhật Tuần (Staff Weekly Roster)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quản lý, theo dõi lịch trực của Lễ tân, Buồng phòng và xử lý đổi ca làm việc
            </p>
          </div>

          {/* Filters & Quick Keys */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Lọc vị trí:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRosterRoleFilter('All')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${rosterRoleFilter === 'All' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setRosterRoleFilter('receptionist')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${rosterRoleFilter === 'receptionist' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Lễ Tân
              </button>
              <button
                type="button"
                onClick={() => setRosterRoleFilter('housekeeping')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${rosterRoleFilter === 'housekeeping' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Buồng Phòng
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              type="button"
              id="export-roster-pdf-btn"
              onClick={() => exportRosterToPDF(roster, scheduleRequests, currentUser.name)}
              className="px-3.5 py-1.5 text-[10px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md"
            >
              <FileText className="w-3.5 h-3.5" /> Xuất PDF Lịch Trực
            </button>
          </div>
        </div>

        {/* Quick Shift Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500">
          <span className="text-slate-400 uppercase mr-1">Phân loại ca:</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded" /> Ca Sáng (06h - 14h)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded" /> Ca Chiều (14h - 22h)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded" /> Ca Đêm (22h - 06h)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Hành Chính (08h - 17h)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded" /> OFF / Nghỉ phép</span>
        </div>

        {/* Interactive Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200/60 rounded-xl overflow-hidden divide-y divide-slate-100 min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-48">Nhân Viên & Vị Trí</th>
                {[
                  { key: '2026-06-25', label: 'T5 (25/06)' },
                  { key: '2026-06-26', label: 'T6 (26/06)' },
                  { key: '2026-06-27', label: 'T7 (27/06)', isToday: true },
                  { key: '2026-06-28', label: 'CN (28/06)' },
                  { key: '2026-06-29', label: 'T2 (29/06)' },
                  { key: '2026-06-30', label: 'T3 (30/06)' },
                  { key: '2026-07-01', label: 'T4 (01/07)' }
                ].map(day => (
                  <th
                    key={day.key}
                    className={`p-3 text-center text-[10px] font-extrabold uppercase tracking-wider border-l border-slate-200/60 ${
                      day.isToday ? 'bg-amber-50 text-amber-800 font-black' : 'text-slate-400'
                    }`}
                  >
                    {day.label}
                    {day.isToday && <span className="block text-[8px] text-amber-500 font-extrabold">(Hôm Nay)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {roster
                .filter(item => {
                  if (rosterRoleFilter === 'All') return true;
                  if (rosterRoleFilter === 'receptionist') return item.roleName.toLowerCase().includes('lễ tân');
                  if (rosterRoleFilter === 'housekeeping') return item.roleName.toLowerCase().includes('buồng phòng');
                  return true;
                })
                .map(item => {
                  const isMe = item.staffName === currentUser.name;
                  return (
                    <tr
                      key={item.staffId}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        isMe ? 'bg-blue-50/15 border-l-2 border-l-blue-500' : ''
                      }`}
                    >
                      {/* Staff Detail Cell */}
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          {item.staffName}
                          {isMe && (
                            <span className="text-[8px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded">Tôi</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{item.roleName}</div>
                        <div className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">{item.branchName}</div>
                      </td>

                      {/* Shift Cells for each day */}
                      {[
                        '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01'
                      ].map(dateStr => {
                        const rawShift = item.shifts[dateStr as keyof typeof item.shifts] || 'OFF';

                        // Classify shifts for premium badge styling
                        let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                        let shortLabel = rawShift;

                        if (rawShift.includes('Ca Sáng')) {
                          badgeColor = "bg-blue-50 text-blue-700 border-blue-200/50";
                          shortLabel = "Ca Sáng";
                        } else if (rawShift.includes('Ca Chiều')) {
                          badgeColor = "bg-amber-50 text-amber-700 border-amber-200/50";
                          shortLabel = "Ca Chiều";
                        } else if (rawShift.includes('Ca Đêm')) {
                          badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200/50";
                          shortLabel = "Ca Đêm";
                        } else if (rawShift.includes('Hành chính')) {
                          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                          shortLabel = "Hành chính";
                        } else if (rawShift.includes('OFF') || rawShift.includes('Nghỉ')) {
                          badgeColor = "bg-rose-50 text-rose-700 border-rose-200/50";
                          shortLabel = "Nghỉ";
                          if (rawShift.includes('ốm')) shortLabel = "Nghỉ ốm 🤒";
                          if (rawShift.includes('phép')) shortLabel = "Nghỉ phép ✈️";
                        }

                        // Find pending requests from this user on this day
                        const dayPendingRequest = scheduleRequests.find((r: any) =>
                          r.status === 'Pending' &&
                          r.staffName === item.staffName && (
                            (r.type === 'leave' && dateStr >= r.leaveStartDate && dateStr <= r.leaveEndDate) ||
                            (r.type === 'swap' && r.originalShiftDate === dateStr)
                          )
                        );

                        // Is editing active for this cell?
                        const isEditingThis = editingCell?.staffId === item.staffId && editingCell?.date === dateStr;

                        // Managers (role-1 / role-2) can edit
                        const isManager = currentUser.role === 'role-1' || currentUser.role === 'role-2';

                        return (
                          <td
                            key={dateStr}
                            className="p-2 border-l border-slate-100 text-center relative min-w-[110px]"
                          >
                            {isEditingThis ? (
                              /* Dropdown editor overlay */
                              <div className="absolute inset-1 bg-white z-10 flex flex-col items-center justify-center border border-blue-400 rounded-lg shadow-md p-1 animate-scale-in">
                                <select
                                  value={rawShift}
                                  onChange={(e) => handleUpdateShift(item.staffId, dateStr, e.target.value)}
                                  className="w-full text-[10px] font-bold border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 cursor-pointer"
                                >
                                  <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng</option>
                                  <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều</option>
                                  <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm</option>
                                  <option value="Hành chính (08:00 - 17:00)">Hành chính</option>
                                  <option value="OFF">Nghỉ (OFF)</option>
                                  <option value="OFF (Xin nghỉ phép)">Nghỉ phép</option>
                                  <option value="OFF (Xin nghỉ ốm)">Nghỉ ốm</option>
                                </select>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="mt-1 text-[8px] text-slate-400 hover:text-slate-600 font-bold underline"
                                >
                                  Hủy bỏ
                                </button>
                              </div>
                            ) : (
                              /* Standard View representation */
                              <div
                                onClick={() => {
                                  if (isManager) {
                                    setEditingCell({
                                      staffId: item.staffId,
                                      date: dateStr,
                                      currentShift: rawShift
                                    });
                                  } else if (isMe) {
                                    // Quick auto-populate for trade/leave!
                                    setNewSwapForm(prev => ({
                                      ...prev,
                                      originalDate: dateStr,
                                      originalShift: rawShift
                                    }));
                                    setNewLeaveForm(prev => ({
                                      ...prev,
                                      startDate: dateStr,
                                      endDate: dateStr
                                    }));
                                    alert(`Đã tự động chọn ca làm việc ngày ${dateStr} (${shortLabel}) vào biểu mẫu Đăng Ký nghỉ/đổi ca bên dưới!`);
                                  }
                                }}
                                className={`py-2 px-1 rounded-lg border cursor-pointer select-none transition-all ${badgeColor} ${
                                  isManager ? 'hover:scale-[1.03] hover:shadow-sm hover:border-slate-300' :
                                  isMe ? 'hover:bg-blue-100/30' : ''
                                }`}
                                title={isManager ? "Click để Quản lý thay đổi ca trực trực tiếp" : isMe ? "Click để tự động nhập đơn xin nghỉ/đổi ca này" : rawShift}
                              >
                                <span className="text-[10px] font-bold block">{shortLabel}</span>
                                <span className="text-[8px] text-slate-400 font-medium block mt-0.5">
                                  {rawShift.includes('(') ? rawShift.substring(rawShift.indexOf('(')+1, rawShift.indexOf(')')) : ''}
                                </span>

                                {/* Pending request flag */}
                                {dayPendingRequest && (
                                  <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full animate-pulse ${
                                    dayPendingRequest.type === 'leave' ? 'bg-rose-500' : 'bg-amber-500'
                                  }`} title={dayPendingRequest.type === 'leave' ? 'Có đơn xin nghỉ phép chờ duyệt' : 'Có đơn đổi ca chờ duyệt'} />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-slate-400 italic font-bold flex items-center gap-1">
          <span>Mẹo thao tác:</span>
          <span>
            {currentUser.role === 'role-1' || currentUser.role === 'role-2'
              ? 'Bạn là Quản lý, click trực tiếp vào ca trực bất kỳ để điều phối lại hoặc đổi lịch làm việc tức thì.'
              : 'Click vào ca trực bất kỳ của bạn để tự động nhập nhanh thông tin vào đơn xin nghỉ/đổi ca.'}
          </span>
        </div>
      </div>

      {/* Interactive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Submission Forms */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-500" />
              Đăng Ký Đơn Xin Nghỉ / Đổi Ca
            </h3>

            {/* Simple selector for form type */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setNewLeaveForm(prev => ({ ...prev, type: 'annual' }));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${newLeaveForm.type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Xin Nghỉ Phép
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewLeaveForm(prev => ({ ...prev, type: '' as any }));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!newLeaveForm.type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Đổi Ca Làm Việc
              </button>
            </div>

            {newLeaveForm.type ? (
              /* Leave Form */
              <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Loại hình nghỉ phép</label>
                  <select
                    value={newLeaveForm.type}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, type: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="annual">Nghỉ phép thường niên (Có lương)</option>
                    <option value="sick">Nghỉ ốm / Khám bệnh (Có bảo hiểm)</option>
                    <option value="unpaid">Nghỉ việc riêng (Không lương)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      required
                      value={newLeaveForm.startDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Đến hết ngày</label>
                    <input
                      type="date"
                      required
                      value={newLeaveForm.endDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lý do xin nghỉ phép</label>
                  <textarea
                    required
                    rows={4}
                    value={newLeaveForm.reason}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                    placeholder="Mô tả lý do xin nghỉ chi tiết..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CalendarDays className="w-4 h-4" /> Gửi Đơn Xin Nghỉ Phép
                  </button>
                </div>
              </form>
            ) : (
              /* Shift Swap Form */
              <form onSubmit={handleCreateSwapRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ngày ca làm hiện tại</label>
                    <input
                      type="date"
                      required
                      value={newSwapForm.originalDate}
                      onChange={(e) => setNewSwapForm({ ...newSwapForm, originalDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ca làm hiện tại</label>
                    <select
                      value={newSwapForm.originalShift}
                      onChange={(e) => setNewSwapForm({ ...newSwapForm, originalShift: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                      <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                      <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ngày muốn đổi sang</label>
                    <input
                      type="date"
                      required
                      value={newSwapForm.targetDate}
                      onChange={(e) => setNewSwapForm({ ...newSwapForm, targetDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ca muốn đổi sang</label>
                    <select
                      value={newSwapForm.targetShift}
                      onChange={(e) => setNewSwapForm({ ...newSwapForm, targetShift: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                      <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                      <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Đồng nghiệp đổi ca cùng</label>
                  <input
                    type="text"
                    required
                    value={newSwapForm.targetStaff}
                    onChange={(e) => setNewSwapForm({ ...newSwapForm, targetStaff: e.target.value })}
                    placeholder="Ví dụ: Hoàng Quốc Việt, Trần Minh Tuấn..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lý do đổi ca</label>
                  <textarea
                    required
                    rows={3}
                    value={newSwapForm.reason}
                    onChange={(e) => setNewSwapForm({ ...newSwapForm, reason: e.target.value })}
                    placeholder="Giải trình lý do đổi ca làm việc..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Shuffle className="w-4 h-4" /> Gửi Đơn Xin Đổi Ca
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Informational Guidelines card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl">
            <span className="text-blue-800 text-[10px] font-bold uppercase tracking-widest block mb-2">Quy Trình Phê Duyệt</span>
            <h4 className="text-xs font-extrabold text-blue-950">Chính sách nghỉ phép & đổi ca</h4>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              1. Đơn xin nghỉ phép cần gửi trước **48 giờ** để Giám Đốc/Quản Lý sắp xếp nhân viên thay thế.<br />
              2. Đổi ca trực tự thỏa thuận cần có tên đồng nghiệp phối hợp rõ ràng và sự chấp thuận từ Quản Lý.<br />
              3. Trường hợp ốm đau hoặc sự cố khẩn cấp sẽ được ban quản lý phê duyệt trực tuyến sớm nhất.
            </p>
          </div>
        </div>

        {/* Column 2: Requests feed & Management operations */}
        <div className="lg:col-span-7 space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-950 text-sm">
                Hồ Sơ Đơn Từ & Đơn Đề Nghị Của Nhân Sự
              </h3>

              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
                Vai trò: {currentUser.name} ({currentUser.roleName})
              </span>
            </div>

            {scheduleRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có yêu cầu xin nghỉ hoặc đổi ca nào.
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {(() => {
                  const startIdx = (scheduleRequestsPage - 1) * scheduleRequestsPerPage;
                  return scheduleRequests.slice(startIdx, startIdx + scheduleRequestsPerPage).map((req: any) => {
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';

                  // Check if current user is manager (role-1 / role-2) to decide whether to show action items
                  const isManager = currentUser.role === 'role-1' || currentUser.role === 'role-2';

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isPending ? 'bg-amber-50/25 border-amber-200/80' :
                        isApproved ? 'bg-emerald-50/10 border-emerald-200/60' : 'bg-slate-50/40 border-slate-200'
                      }`}
                    >
                      {/* Row 1: Header of request */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1.5 ${
                            req.type === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {req.type === 'leave' ? (
                              <><CalendarDays className="w-3 h-3" /> ĐƠN XIN NGHỈ PHÉP</>
                            ) : (
                              <><Shuffle className="w-3 h-3" /> ĐƠN XIN ĐỔI CA</>
                            )}
                          </span>

                          <h4 className="text-xs font-extrabold text-slate-900">
                            {req.staffName} <span className="text-slate-400 font-medium">({req.roleName})</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{req.branchName}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isPending ? 'bg-amber-100 text-amber-700 font-extrabold' :
                          isApproved ? 'bg-emerald-100 text-emerald-700 font-extrabold' : 'bg-rose-100 text-rose-700 font-extrabold'
                        }`}>
                          {isPending ? 'Chờ Duyệt' : isApproved ? 'Chấp Thuận' : 'Từ Chối'}
                        </span>
                      </div>

                      {/* Row 2: Details of request */}
                      <div className="mt-3 bg-white border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                        {req.type === 'leave' ? (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-bold block text-[10px]">THỜI GIAN NGHỈ</span>
                              <span className="font-extrabold text-slate-800">Từ {req.leaveStartDate} đến {req.leaveEndDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block text-[10px]">CHẾ ĐỘ NGHỈ</span>
                              <span className="font-extrabold text-blue-600">
                                {req.leaveType === 'annual' ? 'Nghỉ phép năm' : req.leaveType === 'sick' ? 'Nghỉ ốm đau' : 'Nghỉ không lương'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-bold block text-[10px]">CA HIỆN TẠI</span>
                              <span className="font-extrabold text-slate-800">{req.originalShiftDate} - {req.originalShiftName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block text-[10px]">MUỐN ĐỔI SANG</span>
                              <span className="font-extrabold text-indigo-600">{req.targetShiftDate} - {req.targetShiftName}</span>
                            </div>
                            <div className="col-span-2 border-t border-slate-50 pt-1.5 mt-0.5">
                              <span className="text-slate-400 font-bold block text-[10px]">ĐỒNG NGHIỆP ĐỔI CA</span>
                              <span className="font-extrabold text-slate-700">{req.targetStaffName}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-50">
                          <span className="text-slate-400 font-bold block text-[10px]">LÝ DO</span>
                          <p className="font-medium text-slate-700 italic mt-0.5">"{req.reason}"</p>
                        </div>
                      </div>

                      {/* Row 3: Management Response / Actions */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        {!isPending ? (
                          /* Render processed result */
                          <div className="bg-slate-50 rounded-lg p-3 text-[11px] space-y-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Ý kiến cấp quản lý ({req.approvedBy}):</span>
                            </div>
                            <p className="font-extrabold text-slate-800">{req.responseNotes}</p>
                          </div>
                        ) : (
                          /* Render actions if manager, else show pending message */
                          isManager ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú phê duyệt / Từ chối</label>
                                <input
                                  type="text"
                                  placeholder="Nhập ghi chú phản hồi..."
                                  value={responseNotesState[req.id] || ''}
                                  onChange={(e) => setResponseNotesState({ ...responseNotesState, [req.id]: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleActionScheduleRequest(req.id, 'Approved')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Phê duyệt đơn
                                </button>
                                <button
                                  onClick={() => handleActionScheduleRequest(req.id, 'Rejected')}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" /> Từ chối đơn
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-amber-600 font-extrabold flex items-center gap-1.5 bg-amber-500/10 px-3 py-2 rounded-lg">
                              <Clock className="w-4 h-4 animate-pulse" /> Đang đợi ban quản lý (Giám Đốc/Quản Lý) phê duyệt
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
              </div>
            )}

            <Pagination
              currentPage={scheduleRequestsPage}
              totalItems={scheduleRequests.length}
              itemsPerPage={scheduleRequestsPerPage}
              onPageChange={setScheduleRequestsPage}
              onItemsPerPageChange={setScheduleRequestsPerPage}
              variant="table"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleShiftSwap;
