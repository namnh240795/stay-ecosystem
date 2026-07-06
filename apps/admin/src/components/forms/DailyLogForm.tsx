import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const dailyLogSchema = z.object({
  shift: z.string().min(1, 'Shift is required'),
  content: z.string().min(1, 'Content is required'),
  issues: z.string().optional(),
});

type DailyLogFormData = z.infer<typeof dailyLogSchema>;

interface DailyLogFormProps {
  initialData?: Partial<DailyLogFormData>;
  onSubmit: (data: DailyLogFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SHIFTS = [
  'Ca Sang (06:00 - 14:00)',
  'Ca Chieu (14:00 - 22:00)',
  'Ca Dem (22:00 - 06:00)',
] as const;

export default function DailyLogForm({ initialData, onSubmit, onCancel, isLoading }: DailyLogFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: {
      shift: SHIFTS[0],
      issues: '',
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift</label>
          <select
            {...register('shift')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {SHIFTS.map((shift) => (
              <option key={shift} value={shift}>{shift}</option>
            ))}
          </select>
          {errors.shift && <span className="text-xs text-red-500">{errors.shift.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Issues / Incidents</label>
          <input
            {...register('issues')}
            placeholder="e.g. Broken hallway light on floor 3"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift Summary / Handover Notes</label>
        <textarea
          {...register('content')}
          rows={4}
          placeholder="Summarize the shift progress, check-in/out counts, notes for the next shift..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
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
          {isLoading ? 'Saving...' : 'Save Log'}
        </button>
      </div>
    </form>
  );
}
