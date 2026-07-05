import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Pagination from '../admin/Pagination';

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const INITIAL_REQUESTS = [
  { id: 'req-1', roomName: 'Phòng 102', guestName: 'Nguyễn Lâm Anh', branchName: 'GrandStay Premier Thai Nguyen', type: 'Thêm khăn tắm', detail: 'Yêu cầu mang thêm 2 khăn tắm lớn và 2 bộ bàn chải đánh răng.', time: '2026-06-27 08:30', status: 'Pending', assignedStaff: 'Nguyễn Thị Hoa' },
  { id: 'req-2', roomName: 'Villa 101', guestName: 'Phạm Quốc Bảo', branchName: 'GrandStay Beachfront Resort Phu Quoc', type: 'Đồ ăn tại phòng', detail: 'Gọi 1 suất Phở bò và 1 ly nước cam ép đá giao lúc 9:00.', time: '2026-06-27 08:15', status: 'Processing', assignedStaff: 'Trần Văn Kiên' },
  { id: 'req-3', roomName: 'Phòng 501', guestName: 'Trần Hoàng Long', branchName: 'GrandStay Lux Waterfront Da Nang', type: 'Dọn dẹp khẩn cấp', detail: 'Trẻ em làm đổ sữa ra sàn gỗ phòng khách, cần dọn gấp.', time: '2026-06-27 07:45', status: 'Completed', assignedStaff: 'Lê Thuỳ Trang' }
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GuestRequests: React.FC = () => {
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('gs_op_requests');
    if (saved) return JSON.parse(saved);
    return INITIAL_REQUESTS;
  });

  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(5);

  const [newReqForm, setNewReqForm] = useState({
    roomName: '',
    guestName: '',
    branchName: 'GrandStay Premier Thai Nguyen',
    type: 'Thêm khăn tắm',
    detail: '',
    assignedStaff: 'Nguyễn Thị Hoa'
  });

  // Persist requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gs_op_requests', JSON.stringify(requests));
  }, [requests]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.roomName || !newReqForm.guestName || !newReqForm.detail) return;

    const newReq = {
      id: 'req-' + Math.random().toString(36).substr(2, 5),
      roomName: newReqForm.roomName,
      guestName: newReqForm.guestName,
      branchName: newReqForm.branchName,
      type: newReqForm.type,
      detail: newReqForm.detail,
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      status: 'Pending',
      assignedStaff: newReqForm.assignedStaff
    };

    setRequests(prev => [newReq, ...prev]);
    setNewReqForm({
      roomName: '',
      guestName: '',
      branchName: 'GrandStay Premier Thai Nguyen',
      type: 'Thêm khăn tắm',
      detail: '',
      assignedStaff: 'Nguyễn Thị Hoa'
    });
  };

  const handleUpdateRequestStatus = (reqId: string, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* New Request Log Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-500" />
          Tiếp Nhận Yêu Cầu Dịch Vụ Mới Của Khách
        </h3>
        <form onSubmit={handleAddRequest} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số phòng</label>
            <input
              type="text"
              required
              value={newReqForm.roomName}
              onChange={(e) => setNewReqForm({ ...newReqForm, roomName: e.target.value })}
              placeholder="e.g. Phòng 102"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên khách hàng</label>
            <input
              type="text"
              required
              value={newReqForm.guestName}
              onChange={(e) => setNewReqForm({ ...newReqForm, guestName: e.target.value })}
              placeholder="e.g. Trần Minh Long"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Loại yêu cầu</label>
            <select
              value={newReqForm.type}
              onChange={(e) => setNewReqForm({ ...newReqForm, type: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
            >
              <option value="Thêm khăn tắm">Thêm khăn tắm / Bộ vệ sinh</option>
              <option value="Dọn dẹp khân cấp">Yêu cầu dọn buồng phòng gấp</option>
              <option value="Đồ ăn tại phòng">Gọi đồ ăn / Thức uống phòng</option>
              <option value="Nước suối thêm">Bổ sung nước khoáng</option>
              <option value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật (Tivi, Khóa cửa)</option>
              <option value="Khác">Yêu cầu đặc biệt khác</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nhân viên điều phối</label>
            <input
              type="text"
              required
              value={newReqForm.assignedStaff}
              onChange={(e) => setNewReqForm({ ...newReqForm, assignedStaff: e.target.value })}
              placeholder="e.g. Nguyễn Thị Hoa"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Chi tiết yêu cầu</label>
            <textarea
              required
              rows={2}
              value={newReqForm.detail}
              onChange={(e) => setNewReqForm({ ...newReqForm, detail: e.target.value })}
              placeholder="Mô tả cụ thể khách cần thêm những gì hoặc thời gian giao nhận..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div className="md:col-span-4 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tiếp Nhận Yêu Cầu
            </button>
          </div>
        </form>
      </div>

      {/* Requests Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4">Nhật Ký Yêu Cầu Đang Hoạt Động</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Buồng Phòng / Khách Yêu Cầu</th>
                <th className="px-4 py-3">Loại Yêu Cầu</th>
                <th className="px-4 py-3">Nội Dung Chi Tiết</th>
                <th className="px-4 py-3">Thời Gian Tiếp Nhận</th>
                <th className="px-4 py-3">Nhân Viên Phụ Trách</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác Điều Phối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(() => {
                const startIdx = (requestsPage - 1) * requestsPerPage;
                return requests.slice(startIdx, startIdx + requestsPerPage).map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{req.roomName}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{req.guestName}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 font-bold">
                    {req.type}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium max-w-xs truncate" title={req.detail}>
                    {req.detail}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                    {req.time}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {req.assignedStaff}
                  </td>
                  <td className="px-4 py-3.5">
                    {req.status === 'Pending' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                        Chờ xử lý
                      </span>
                    ) : req.status === 'Processing' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Đang xử lý
                      </span>
                    ) : req.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Đã hủy bỏ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, 'Processing')}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-[10px] rounded border border-blue-200 cursor-pointer transition-all"
                      >
                        Nhận dọn/xử lý
                      </button>
                    )}
                    {req.status === 'Processing' && (
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, 'Completed')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-[10px] rounded border border-emerald-200 cursor-pointer transition-all"
                      >
                        Hoàn thành
                      </button>
                    )}
                    {(req.status === 'Pending' || req.status === 'Processing') && (
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, 'Cancelled')}
                        className="ml-1.5 px-2 py-1 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-extrabold text-[10px] rounded cursor-pointer transition-all"
                      >
                        Hủy
                      </button>
                    )}
                    {(req.status === 'Completed' || req.status === 'Cancelled') && (
                      <span className="text-[10px] text-slate-400 font-bold">Lịch sử được lưu</span>
                    )}
                  </td>
                </tr>
              ));
            })()}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={requestsPage}
          totalItems={requests.length}
          itemsPerPage={requestsPerPage}
          onPageChange={setRequestsPage}
          onItemsPerPageChange={setRequestsPerPage}
          variant="table"
        />
      </div>
    </div>
  );
};

export default GuestRequests;
