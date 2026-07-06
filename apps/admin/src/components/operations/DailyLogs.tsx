import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useDailyLogs, useCreateDailyLog } from '../../hooks/useDailyLogs';
import DailyLogForm from '../forms/DailyLogForm';
import Pagination from '../admin/Pagination';

interface DailyLogsProps {
  currentUser: { name: string; roleName: string };
}

export default function DailyLogs({ currentUser }: DailyLogsProps) {
  const [dailyLogsPage, setDailyLogsPage] = useState(1);
  const [dailyLogsPerPage, setDailyLogsPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useDailyLogs({
    page: dailyLogsPage,
    limit: dailyLogsPerPage,
  });

  const createLog = useCreateDailyLog();

  const dailyLogs = data?.data ?? [];
  const totalItems = data?.total ?? dailyLogs.length;

  const handleSubmit = (formData: { shift: string; content: string; issues?: string }) => {
    createLog.mutate(
      {
        author: currentUser.name,
        roleName: currentUser.roleName,
        shift: formData.shift,
        date: new Date().toISOString().slice(0, 10),
        content: formData.content,
        issues: formData.issues || 'Khong co su co lon.',
        time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDailyLogsPage(1);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Write new log form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-500" />
            Ghi Nhat Ky Nhat Trinh & Ban Giao Ca Van Hanh
          </h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Them Nhat Ky
            </button>
          )}
        </div>

        {showForm && (
          <>
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nguoi truc ghi nhat ky
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.roleName})`}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none"
              />
            </div>
            <DailyLogForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={createLog.isPending}
            />
          </>
        )}
      </div>

      {/* Logs Timeline Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4">
          Nhat Ky Lich Su Truc Van Hanh
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm font-medium">Dang tai nhat ky...</span>
          </div>
        ) : dailyLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Chua co nhat ky nao.
          </div>
        ) : (
          <div className="relative border-l border-slate-100 pl-6 space-y-6">
            {dailyLogs.map((log) => (
              <div key={log.id} className="relative">
                {/* Dot indicator */}
                <span className="absolute -left-[30px] top-1.5 w-4.5 h-4.5 bg-blue-100 border border-blue-500 rounded-full flex items-center justify-center text-[10px]">
                  📝
                </span>

                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-bold gap-1">
                    <span className="text-slate-900 font-extrabold">
                      {log.author}{' '}
                      <span className="text-slate-400 font-medium">({log.roleName})</span>
                    </span>
                    <span className="font-mono">{log.time}</span>
                  </div>
                  <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <span>{log.shift}</span>
                    <span>•</span>
                    <span>Ngay: {log.date}</span>
                  </div>
                  <p className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-2">
                    {log.content}
                  </p>

                  <div className="mt-2 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <span>🚨 Ghi nhan su co:</span>
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {log.issues}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={dailyLogsPage}
          totalItems={totalItems}
          itemsPerPage={dailyLogsPerPage}
          onPageChange={setDailyLogsPage}
          onItemsPerPageChange={setDailyLogsPerPage}
          variant="table"
        />
      </div>
    </div>
  );
}
