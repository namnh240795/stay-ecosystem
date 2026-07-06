import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contractSchema = z.object({
  aptName: z.string().min(1, 'Apartment name is required'),
  location: z.string().min(1, 'Location is required'),
  monthlyPrice: z.coerce.number().min(0, 'Price must be a positive number'),
  leaseTerm: z.enum(['1', '3', '6', '12']),
  tenantName: z.string().min(1, 'Tenant name is required'),
  tenantPhone: z.string().min(1, 'Phone number is required'),
  tenantEmail: z.string().email('Invalid email address'),
  signedDate: z.string().min(1, 'Signed date is required'),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LEASE_TERMS = [
  { value: '1', label: '1 Month' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '12 Months' },
] as const;

export default function ContractForm({ initialData, onSubmit, onCancel, isLoading }: ContractFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Apartment Name</label>
          <input
            {...register('aptName')}
            placeholder="e.g. Metropolitan Luxury Studio"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.aptName && <span className="text-xs text-red-500">{errors.aptName.message}</span>}
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly Price (VND)</label>
          <input
            type="number"
            {...register('monthlyPrice')}
            placeholder="e.g. 25000000"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.monthlyPrice && <span className="text-xs text-red-500">{errors.monthlyPrice.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lease Term</label>
          <select
            {...register('leaseTerm')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {LEASE_TERMS.map((term) => (
              <option key={term.value} value={term.value}>{term.label}</option>
            ))}
          </select>
          {errors.leaseTerm && <span className="text-xs text-red-500">{errors.leaseTerm.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Name</label>
          <input
            {...register('tenantName')}
            placeholder="e.g. Tran Minh Long"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.tenantName && <span className="text-xs text-red-500">{errors.tenantName.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Phone</label>
          <input
            {...register('tenantPhone')}
            placeholder="e.g. 0912345678"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.tenantPhone && <span className="text-xs text-red-500">{errors.tenantPhone.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Email</label>
          <input
            type="email"
            {...register('tenantEmail')}
            placeholder="e.g. tenant@email.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.tenantEmail && <span className="text-xs text-red-500">{errors.tenantEmail.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Signed Date</label>
        <input
          type="date"
          {...register('signedDate')}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
        />
        {errors.signedDate && <span className="text-xs text-red-500">{errors.signedDate.message}</span>}
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
          {isLoading ? 'Saving...' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
}
