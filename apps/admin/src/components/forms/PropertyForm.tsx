import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  pricePerNight: z.coerce.number().min(0, 'Price must be a positive number'),
  maxGuests: z.coerce.number().min(1, 'Must allow at least 1 guest'),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative'),
  propertyType: z.enum(['Hotel', 'Resort', 'Villa', 'Homestay', 'Apartment']),
  status: z.enum(['Active', 'Inactive', 'Maintenance']),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROPERTY_TYPES = ['Hotel', 'Resort', 'Villa', 'Homestay', 'Apartment'] as const;
const STATUSES = ['Active', 'Inactive', 'Maintenance'] as const;

export default function PropertyForm({ initialData, onSubmit, onCancel, isLoading }: PropertyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
          <input
            {...register('title')}
            placeholder="e.g. GrandStay Premier Thai Nguyen"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Property Type</label>
          <select
            {...register('propertyType')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.propertyType && <span className="text-xs text-red-500">{errors.propertyType.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe the property..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</label>
          <input
            {...register('address')}
            placeholder="e.g. 123 Main Street"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">City</label>
          <input
            {...register('city')}
            placeholder="e.g. Thai Nguyen"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Country</label>
          <input
            {...register('country')}
            placeholder="e.g. Vietnam"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.country && <span className="text-xs text-red-500">{errors.country.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Price/Night (VND)</label>
          <input
            type="number"
            {...register('pricePerNight')}
            placeholder="e.g. 3000000"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.pricePerNight && <span className="text-xs text-red-500">{errors.pricePerNight.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Max Guests</label>
          <input
            type="number"
            {...register('maxGuests')}
            placeholder="e.g. 4"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.maxGuests && <span className="text-xs text-red-500">{errors.maxGuests.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register('bedrooms')}
            placeholder="e.g. 2"
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
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
        <select
          {...register('status')}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        {errors.status && <span className="text-xs text-red-500">{errors.status.message}</span>}
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
          {isLoading ? 'Saving...' : 'Save Property'}
        </button>
      </div>
    </form>
  );
}
