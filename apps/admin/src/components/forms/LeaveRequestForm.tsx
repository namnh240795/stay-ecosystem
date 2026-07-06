import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leaveRequestSchema = z.object({
  type: z.enum(['leave', 'swap']),
  staffName: z.string().min(1, 'Staff name is required'),
  reason: z.string().min(1, 'Reason is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  initialData?: Partial<LeaveRequestFormData>;
  onSubmit: (data: LeaveRequestFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const REQUEST_TYPES = [
  { value: 'leave', label: 'Leave Request' },
  { value: 'swap', label: 'Shift Swap' },
] as const;

export default function LeaveRequestForm({ initialData, onSubmit, onCancel, isLoading }: LeaveRequestFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Request Type</label>
          <select
            {...register('type')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Staff Name</label>
          <input
            {...register('staffName')}
            placeholder="e.g. Nguyen Thi Hoa"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.staffName && <span className="text-xs text-red-500">{errors.staffName.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          />
          {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          />
          {errors.endDate && <span className="text-xs text-red-500">{errors.endDate.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason</label>
        <textarea
          {...register('reason')}
          rows={3}
          placeholder="Describe the reason for the request..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.reason && <span className="text-xs text-red-500">{errors.reason.message}</span>}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
