import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const apartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Studio', '1-Bedroom', '2-Bedroom', 'Penthouse', 'Service Apartment']),
  area: z.coerce.number().min(1, 'Area must be greater than 0'),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative'),
  monthlyPrice: z.coerce.number().min(0, 'Price must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  petFriendly: z.boolean(),
  hasVirtualTour: z.boolean(),
  availableFrom: z.string().min(1, 'Available from date is required'),
});

type ApartmentFormData = z.infer<typeof apartmentSchema>;

interface ApartmentFormProps {
  initialData?: Partial<ApartmentFormData>;
  onSubmit: (data: ApartmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const APARTMENT_TYPES = ['Studio', '1-Bedroom', '2-Bedroom', 'Penthouse', 'Service Apartment'] as const;

export default function ApartmentForm({ initialData, onSubmit, onCancel, isLoading }: ApartmentFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      petFriendly: false,
      hasVirtualTour: false,
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name</label>
          <input
            {...register('name')}
            placeholder="e.g. Metropolitan Luxury Studio"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
          <input
            {...register('location')}
            placeholder="e.g. Saigon"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {APARTMENT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Available From</label>
          <input
            type="date"
            {...register('availableFrom')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          />
          {errors.availableFrom && <span className="text-xs text-red-500">{errors.availableFrom.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Area (m2)</label>
          <input
            type="number"
            {...register('area')}
            placeholder="e.g. 50"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.area && <span className="text-xs text-red-500">{errors.area.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register('bedrooms')}
            placeholder="e.g. 1"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.bedrooms && <span className="text-xs text-red-500">{errors.bedrooms.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bathrooms</label>
          <input
            type="number"
            {...register('bathrooms')}
            placeholder="e.g. 1"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.bathrooms && <span className="text-xs text-red-500">{errors.bathrooms.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly Price (VND)</label>
          <input
            type="number"
            {...register('monthlyPrice')}
            placeholder="e.g. 25000000"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.monthlyPrice && <span className="text-xs text-red-500">{errors.monthlyPrice.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe the apartment..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
      </div>

      <div className="flex items-center gap-6">
        <Controller
          name="petFriendly"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-600">Pet Friendly</span>
            </label>
          )}
        />

        <Controller
          name="hasVirtualTour"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-600">Has Virtual Tour</span>
            </label>
          )}
        />
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
          {isLoading ? 'Saving...' : 'Save Apartment'}
        </button>
      </div>
    </form>
  );
}
