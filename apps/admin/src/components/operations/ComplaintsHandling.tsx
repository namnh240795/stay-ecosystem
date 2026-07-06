import { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import Pagination from '../admin/Pagination';
import ComplaintForm from '../forms/ComplaintForm';
import { useComplaints, useCreateComplaint, useUpdateComplaintStatus } from '../../hooks/useComplaints';

export default function ComplaintsHandling() {
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsPerPage, setComplaintsPerPage] = useState(6);
  const [showNewForm, setShowNewForm] = useState(false);
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data, isLoading } = useComplaints({});
  const createComplaint = useCreateComplaint();
  const updateComplaintStatus = useUpdateComplaintStatus();

  const complaints = data?.data ?? [];

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaintId || !resolutionNotes) return;

    updateComplaintStatus.mutate(
      { id: resolvingComplaintId, status: 'Resolved', notes: resolutionNotes },
      {
        onSuccess: () => {
          setResolvingComplaintId(null);
          setResolutionNotes('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* New Complaint Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-rose-500" />
          Ghi Nhận Ý Kiến / Khiếu Nại Của Khách Hàng
        </h3>
        {!showNewForm ? (
          <div className="text-right">
            <button
              onClick={() => setShowNewForm(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tiếp Nhận Khiếu Nại
            </button>
          </div>
        ) : (
          <ComplaintForm
            onSubmit={(formData) => {
              createComplaint.mutate(formData, {
                onSuccess: () => setShowNewForm(false),
              });
            }}
            onCancel={() => setShowNewForm(false)}
            isLoading={createComplaint.isPending}
          />
        )}
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
                disabled={updateComplaintStatus.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {updateComplaintStatus.isPending ? 'Đang lưu...' : 'Xác nhận Giải Quyết'}
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(complaintsPerPage)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
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
      )}

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
