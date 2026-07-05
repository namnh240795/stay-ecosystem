import { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import Pagination from '../admin/Pagination';

const INITIAL_COMPLAINTS = [
  { id: 'comp-1', guestName: 'Lê Văn Hoàng', roomName: 'Phòng 202', branchName: 'GrandStay Premier Thai Nguyen', title: 'Điều hòa không mát', detail: 'Máy điều hòa bật 16 độ nhưng chỉ có gió, phòng rất nóng và bí.', priority: 'High', time: '2026-06-26 19:40', status: 'Investigating', notes: 'Kỹ thuật viên đang kiểm tra gas và block máy ngoài ban công.' },
  { id: 'comp-2', guestName: 'Nguyễn Thị Lan', roomName: 'Căn hộ 1502', branchName: 'Metropolitan Luxury Studio - Saigon Central', title: 'Wifi không kết nối được', detail: 'Mạng Wifi báo sóng căng nhưng không vào mạng được, ảnh hưởng công việc từ xa.', priority: 'Medium', time: '2026-06-27 08:00', status: 'Open', notes: '' },
  { id: 'comp-3', guestName: 'Đặng Quốc Huy', roomName: 'Villa 102', branchName: 'GrandStay Beachfront Resort Phu Quoc', title: 'Nước nóng bị ngắt quãng', detail: 'Vòi sen tắm nước nóng lạnh thất thường, lúc quá nóng lúc quá lạnh.', priority: 'High', time: '2026-06-26 14:15', status: 'Resolved', notes: 'Đã thay rơ-le bình nóng lạnh và kiểm tra áp lực nước ổn định.' }
];

export default function ComplaintsHandling() {
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('gs_op_complaints');
    if (saved) return JSON.parse(saved);
    return INITIAL_COMPLAINTS;
  });

  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsPerPage, setComplaintsPerPage] = useState(6);
  const [newCompForm, setNewCompForm] = useState({
    guestName: '',
    roomName: '',
    branchName: 'GrandStay Premier Thai Nguyen',
    title: '',
    detail: '',
    priority: 'Medium'
  });
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('gs_op_complaints', JSON.stringify(complaints));
  }, [complaints]);

  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompForm.guestName || !newCompForm.roomName || !newCompForm.title || !newCompForm.detail) return;

    const newComp = {
      id: 'comp-' + Math.random().toString(36).substr(2, 5),
      guestName: newCompForm.guestName,
      roomName: newCompForm.roomName,
      branchName: newCompForm.branchName,
      title: newCompForm.title,
      detail: newCompForm.detail,
      priority: newCompForm.priority,
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      status: 'Open',
      notes: ''
    };

    setComplaints(prev => [newComp, ...prev]);
    setNewCompForm({
      guestName: '',
      roomName: '',
      branchName: 'GrandStay Premier Thai Nguyen',
      title: '',
      detail: '',
      priority: 'Medium'
    });
  };

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaintId || !resolutionNotes) return;

    setComplaints(prev => prev.map(c => c.id === resolvingComplaintId ? { ...c, status: 'Resolved', notes: resolutionNotes } : c));
    setResolvingComplaintId(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* New Complaint Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-rose-500" />
          Ghi Nhận Ý Kiến / Khiếu Nại Của Khách Hàng
        </h3>
        <form onSubmit={handleAddComplaint} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên khách hàng</label>
            <input
              type="text"
              required
              value={newCompForm.guestName}
              onChange={(e) => setNewCompForm({ ...newCompForm, guestName: e.target.value })}
              placeholder="e.g. Lê Văn Hoàng"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số phòng / Địa điểm</label>
            <input
              type="text"
              required
              value={newCompForm.roomName}
              onChange={(e) => setNewCompForm({ ...newCompForm, roomName: e.target.value })}
              placeholder="e.g. Phòng 202"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tiêu đề phản ánh</label>
            <input
              type="text"
              required
              value={newCompForm.title}
              onChange={(e) => setNewCompForm({ ...newCompForm, title: e.target.value })}
              placeholder="e.g. Điều hòa không mát"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mức độ khẩn cấp</label>
            <select
              value={newCompForm.priority}
              onChange={(e) => setNewCompForm({ ...newCompForm, priority: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold text-rose-600"
            >
              <option value="Low">Thấp (Tiện nghi phụ)</option>
              <option value="Medium">Trung bình (Sinh hoạt)</option>
              <option value="High">Cao (Khẩn cấp / Kỹ thuật)</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nội dung khiếu nại chi tiết</label>
            <textarea
              required
              rows={2}
              value={newCompForm.detail}
              onChange={(e) => setNewCompForm({ ...newCompForm, detail: e.target.value })}
              placeholder="Khách phàn nàn cụ thể về sự cố gì? Yêu cầu bồi hoàn hay sửa chữa kịp thời ra sao..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div className="md:col-span-4 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tiếp Nhận Khiếu Nại
            </button>
          </div>
        </form>
      </div>

      {/* Resolve Complaint Inline Modal/Form */}
      {resolvingComplaintId && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl animate-fade-in">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Đang Giải Quyết Khiếu Nại ID: {resolvingComplaintId}</h4>
          <form onSubmit={handleResolveComplaint} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-grow">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ghi chú phương án xử lý</label>
              <input
                type="text"
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Đã đổi phòng mới cho khách, miễn phí 1 bữa ăn tối để xoa dịu..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-medium text-slate-800"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Xác nhận Giải Quyết
              </button>
              <button
                type="button"
                onClick={() => setResolvingComplaintId(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(() => {
          const startIdx = (complaintsPage - 1) * complaintsPerPage;
          return complaints.slice(startIdx, startIdx + complaintsPerPage).map(comp => (
          <div key={comp.id} className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Mã khiếu nại: {comp.id}</span>

                {/* Priority indicator */}
                {comp.priority === 'High' ? (
                  <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-extrabold uppercase animate-pulse">Khẩn cấp (High)</span>
                ) : comp.priority === 'Medium' ? (
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-extrabold uppercase">Trung bình</span>
                ) : (
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">Thấp</span>
                )}
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm">{comp.title}</h4>
              <p className="text-xs text-slate-500 font-medium">{comp.detail}</p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Khách: {comp.guestName} ({comp.roomName})</span>
                <span className="font-mono">{comp.time}</span>
              </div>

              {comp.notes && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-semibold text-xs space-y-1">
                  <div className="text-[9px] font-bold text-emerald-600 uppercase">Kết Quả Giải Quyết:</div>
                  <p>{comp.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {comp.status === 'Open' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    Mới tiếp nhận
                  </span>
                ) : comp.status === 'Investigating' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    Đang điều tra
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Đã giải quyết ổn thỏa
                  </span>
                )}
              </div>

              <div>
                {comp.status !== 'Resolved' ? (
                  <button
                    onClick={() => {
                      setResolvingComplaintId(comp.id);
                      setResolutionNotes('');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Giải quyết
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-extrabold">&#10003; Đã đóng hồ sơ</span>
                )}
              </div>
            </div>
          </div>
        ));
        })()}
      </div>

      <Pagination
        currentPage={complaintsPage}
        totalItems={complaints.length}
        itemsPerPage={complaintsPerPage}
        onPageChange={setComplaintsPage}
        onItemsPerPageChange={setComplaintsPerPage}
      />
    </div>
  );
}
