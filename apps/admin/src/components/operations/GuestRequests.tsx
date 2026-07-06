import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useRequests, useCreateRequest, useUpdateRequestStatus } from '../../hooks/useRequests';
import RequestForm from '../forms/RequestForm';
import Pagination from '../admin/Pagination';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GuestRequests: React.FC = () => {
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data fetching
  const { data, isLoading } = useRequests({
    page: requestsPage,
    limit: requestsPerPage,
  });

  // Mutations
  const createRequest = useCreateRequest();
  const updateRequestStatus = useUpdateRequestStatus();

  const requests = data?.data ?? [];

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleCreateRequest = (formData: {
    roomName: string;
    guestName: string;
    type: string;
    detail: string;
    assignedStaff: string;
  }) => {
    createRequest.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleUpdateRequestStatus = (reqId: string, newStatus: string) => {
    updateRequestStatus.mutate({ id: reqId, status: newStatus });
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* New Request Button + Modal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-500" />
            Tiếp Nhận Yêu Cầu Dịch Vụ Mới Của Khách
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm Yêu Cầu Mới
          </button>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-950 text-sm">Tạo Yêu Cầu Dịch Vụ Mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RequestForm
              onSubmit={handleCreateRequest}
              onCancel={() => setShowCreateModal(false)}
              isLoading={createRequest.isPending}
            />
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4">Nhật Ký Yêu Cầu Đang Hoạt Động</h3>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-bold">
              <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang tải dữ liệu...
            </div>
          ) : (
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
                {requests.map((req: any) => (
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
                          disabled={updateRequestStatus.isPending}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-[10px] rounded border border-blue-200 cursor-pointer transition-all disabled:opacity-50"
                        >
                          Nhận dọn/xử lý
                        </button>
                      )}
                      {req.status === 'Processing' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'Completed')}
                          disabled={updateRequestStatus.isPending}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-[10px] rounded border border-emerald-200 cursor-pointer transition-all disabled:opacity-50"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {(req.status === 'Pending' || req.status === 'Processing') && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'Cancelled')}
                          disabled={updateRequestStatus.isPending}
                          className="ml-1.5 px-2 py-1 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-extrabold text-[10px] rounded cursor-pointer transition-all disabled:opacity-50"
                        >
                          Hủy
                        </button>
                      )}
                      {(req.status === 'Completed' || req.status === 'Cancelled') && (
                        <span className="text-[10px] text-slate-400 font-bold">Lịch sử được lưu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
