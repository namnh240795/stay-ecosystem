import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const requestSchema = z.object({
  roomName: z.string().min(1, 'Room name is required'),
  guestName: z.string().min(1, 'Guest name is required'),
  type: z.string().min(1, 'Request type is required'),
  detail: z.string().min(1, 'Detail is required'),
  assignedStaff: z.string().min(1, 'Assigned staff is required'),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  initialData?: Partial<RequestFormData>;
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const REQUEST_TYPES = [
  'Extra Towels',
  'Urgent Cleaning',
  'Room Service',
  'Extra Water',
  'Technical Support',
  'Other',
] as const;

export default function RequestForm({ initialData, onSubmit, onCancel, isLoading }: RequestFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Room Name</label>
          <input
            {...register('roomName')}
            placeholder="e.g. Room 102"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.roomName && <span className="text-xs text-red-500">{errors.roomName.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Guest Name</label>
          <input
            {...register('guestName')}
            placeholder="e.g. Nguyen Lam Anh"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.guestName && <span className="text-xs text-red-500">{errors.guestName.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Request Type</label>
          <select
            {...register('type')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            <option value="">Select a type</option>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned Staff</label>
          <input
            {...register('assignedStaff')}
            placeholder="e.g. Nguyen Thi Hoa"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.assignedStaff && <span className="text-xs text-red-500">{errors.assignedStaff.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Detail</label>
        <textarea
          {...register('detail')}
          rows={3}
          placeholder="Describe the guest request in detail..."
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
