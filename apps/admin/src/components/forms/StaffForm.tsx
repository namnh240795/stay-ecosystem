import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'On Leave']),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: Partial<StaffFormData>;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  roles?: { id: string; name: string }[];
}

const STATUSES = ['Active', 'Inactive', 'On Leave'] as const;

const DEFAULT_ROLES = [
  { id: 'role-1', name: 'Operations Director' },
  { id: 'role-2', name: 'Project Manager' },
  { id: 'role-3', name: 'Receptionist' },
  { id: 'role-4', name: 'Housekeeping' },
  { id: 'role-5', name: 'Technician' },
];

export default function StaffForm({ initialData, onSubmit, onCancel, isLoading, roles }: StaffFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData,
  });

  const roleOptions = roles ?? DEFAULT_ROLES;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name</label>
          <input
            {...register('name')}
            placeholder="e.g. Nguyen Van A"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. staff@grandstay.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
          <input
            {...register('phone')}
            placeholder="e.g. 0912345678"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
          />
          {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role</label>
          <select
            {...register('roleId')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            <option value="">Select a role</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {errors.roleId && <span className="text-xs text-red-500">{errors.roleId.message}</span>}
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
          {isLoading ? 'Saving...' : 'Save Staff'}
        </button>
      </div>
    </form>
  );
}
