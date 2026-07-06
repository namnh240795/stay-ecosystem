import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const complaintSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  roomName: z.string().min(1, 'Room name is required'),
  title: z.string().min(1, 'Title is required'),
  detail: z.string().min(1, 'Detail is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  initialData?: Partial<ComplaintFormData>;
  onSubmit: (data: ComplaintFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRIORITIES = [
  { value: 'Low', label: 'Low (Minor inconvenience)' },
  { value: 'Medium', label: 'Medium (Living standard issue)' },
  { value: 'High', label: 'High (Urgent / Technical)' },
] as const;

export default function ComplaintForm({ initialData, onSubmit, onCancel, isLoading }: ComplaintFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: 'Medium',
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Guest Name</label>
          <input
            {...register('guestName')}
            placeholder="e.g. Le Van Hoang"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.guestName && <span className="text-xs text-red-500">{errors.guestName.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Room Name</label>
          <input
            {...register('roomName')}
            placeholder="e.g. Room 202"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.roomName && <span className="text-xs text-red-500">{errors.roomName.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
          <input
            {...register('title')}
            placeholder="e.g. AC not working"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold text-rose-600"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {errors.priority && <span className="text-xs text-red-500">{errors.priority.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Detail</label>
        <textarea
          {...register('detail')}
          rows={3}
          placeholder="Describe the complaint in detail..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.detail && <span className="text-xs text-red-500">{errors.detail.message}</span>}
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
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
}
