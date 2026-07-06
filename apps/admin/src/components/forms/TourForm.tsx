import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const tourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  region: z.string().min(1, 'Region is required'),
  pricePerSlot: z.coerce.number().min(0, 'Price must be a positive number'),
  maxSlots: z.coerce.number().min(1, 'Must allow at least 1 slot'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().min(1, 'Description is required'),
  tourType: z.enum(['day', 'multi']),
});

type TourFormData = z.infer<typeof tourSchema>;

interface TourFormProps {
  initialData?: Partial<TourFormData>;
  onSubmit: (data: TourFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TOUR_TYPES = [
  { value: 'day', label: 'Day Tour' },
  { value: 'multi', label: 'Multi-Day Tour' },
] as const;

export default function TourForm({ initialData, onSubmit, onCancel, isLoading }: TourFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tour Name</label>
          <input
            {...register('name')}
            placeholder="e.g. Sapa Mountain Trek"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Region</label>
          <input
            {...register('region')}
            placeholder="e.g. Northern Highlands"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.region && <span className="text-xs text-red-500">{errors.region.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Price/Slot (VND)</label>
          <input
            type="number"
            {...register('pricePerSlot')}
            placeholder="e.g. 1500000"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.pricePerSlot && <span className="text-xs text-red-500">{errors.pricePerSlot.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Max Slots</label>
          <input
            type="number"
            {...register('maxSlots')}
            placeholder="e.g. 20"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.maxSlots && <span className="text-xs text-red-500">{errors.maxSlots.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label>
          <input
            {...register('duration')}
            placeholder="e.g. 4 hours"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.duration && <span className="text-xs text-red-500">{errors.duration.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tour Type</label>
        <select
          {...register('tourType')}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
        >
          {TOUR_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        {errors.tourType && <span className="text-xs text-red-500">{errors.tourType.message}</span>}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe the tour itinerary and highlights..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
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
          {isLoading ? 'Saving...' : 'Save Tour'}
        </button>
      </div>
    </form>
  );
}
