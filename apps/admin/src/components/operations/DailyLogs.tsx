import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Pagination from '../admin/Pagination';

const INITIAL_DAILY_LOGS = [
  { id: 'log-1', author: 'Nguyễn Văn Quyết', roleName: 'Giám Đốc Vận Hành', shift: 'Ca Sáng (06:00 - 14:00)', date: '2026-06-27', content: 'Vận hành đầu ngày ổn định. Đã tổ chức họp ngắn bàn giao với nhân viên buồng phòng. Nhắc nhở tập trung dọn dẹp sớm các phòng check-out trước 12:00 để kịp đón đoàn khách VIP chiều nay.', issues: 'Không có sự cố lớn.', time: '2026-06-27 08:45' },
  { id: 'log-2', author: 'Phạm Hồng Nhung', roleName: 'Nhân Viên Lễ Tân', shift: 'Ca Chiều (14:00 - 22:00)', date: '2026-06-26', content: 'Ca chiều đón 15 lượt check-in và tiễn 8 lượt check-out. Có khiếu nại từ phòng 202 về điều hòa đã được chuyển kỹ thuật dọn dẹp và xử lý kịp thời.', issues: 'Phòng 202 hỏng điều hòa, đã điều chuyển kỹ thuật kiểm tra và tặng voucher bồi hoàn cho khách.', time: '2026-06-26 21:55' }
];

interface DailyLogsProps {
  currentUser: { name: string; roleName: string };
}

export default function DailyLogs({ currentUser }: DailyLogsProps) {
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('gs_op_daily_logs');
    if (saved) return JSON.parse(saved);
    return INITIAL_DAILY_LOGS;
  });

  const [dailyLogsPage, setDailyLogsPage] = useState(1);
  const [dailyLogsPerPage, setDailyLogsPerPage] = useState(5);

  const [newLogForm, setNewLogForm] = useState({
    shift: 'Ca Sáng (06:00 - 14:00)',
    content: '',
    issues: ''
  });

  useEffect(() => {
    localStorage.setItem('gs_op_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogForm.content) return;

    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 5),
      author: currentUser.name,
      roleName: currentUser.roleName,
      shift: newLogForm.shift,
      date: new Date().toISOString().slice(0, 10),
      content: newLogForm.content,
      issues: newLogForm.issues || 'Không có sự cố lớn.',
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' ')
    };

    setDailyLogs(prev => [newLog, ...prev]);
    setNewLogForm({
      shift: 'Ca Sáng (06:00 - 14:00)',
      content: '',
      issues: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Write new log form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-500" />
          Ghi Nhật Ký Nhật Trình & Bàn Giao Ca Vận Hành
        </h3>
        <form onSubmit={handleAddDailyLog} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Người trực ghi nhật ký</label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.roleName})`}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Chọn Ca Làm Việc</label>
              <select
                value={newLogForm.shift}
                onChange={(e) => setNewLogForm({ ...newLogForm, shift: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
              >
                <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm (22:00 - 06:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sự cố kỹ thuật / Ghi nhận khẩn</label>
              <input
                type="text"
                value={newLogForm.issues}
                onChange={(e) => setNewLogForm({ ...newLogForm, issues: e.target.value })}
                placeholder="e.g. Hỏng bóng đèn hành lang tầng 3, đứt dây mạng..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nội dung tóm tắt ca trực / Bàn giao ca</label>
            <textarea
              required
              rows={3}
              value={newLogForm.content}
              onChange={(e) => setNewLogForm({ ...newLogForm, content: e.target.value })}
              placeholder="Nhập tóm tắt tiến độ, số phòng check-in/out, lưu ý bàn giao cho ca tiếp theo..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Đăng Nhật Ký Ca Trực
            </button>
          </div>
        </form>
      </div>

      {/* Logs Timeline Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4">Nhật Ký Lịch Sử Trực Vận Hành</h3>

        <div className="relative border-l border-slate-100 pl-6 space-y-6">
          {(() => {
            const startIdx = (dailyLogsPage - 1) * dailyLogsPerPage;
            return dailyLogs.slice(startIdx, startIdx + dailyLogsPerPage).map(log => (
            <div key={log.id} className="relative">
              {/* Dot indicator */}
              <span className="absolute -left-[30px] top-1.5 w-4.5 h-4.5 bg-blue-100 border border-blue-500 rounded-full flex items-center justify-center text-[10px]">
                📝
              </span>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-bold gap-1">
                  <span className="text-slate-900 font-extrabold">{log.author} <span className="text-slate-400 font-medium">({log.roleName})</span></span>
                  <span className="font-mono">{log.time}</span>
                </div>
                <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                  <span>{log.shift}</span>
                  <span>•</span>
                  <span>Ngày: {log.date}</span>
                </div>
                <p className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-2">
                  {log.content}
                </p>

                <div className="mt-2 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                  <span>🚨 Ghi nhận sự cố:</span>
                  <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{log.issues}</span>
                </div>
              </div>
            </div>
          ));
          })()}
        </div>

        <Pagination
          currentPage={dailyLogsPage}
          totalItems={dailyLogs.length}
          itemsPerPage={dailyLogsPerPage}
          onPageChange={setDailyLogsPage}
          onItemsPerPageChange={setDailyLogsPerPage}
          variant="table"
        />
      </div>
    </div>
  );
}
