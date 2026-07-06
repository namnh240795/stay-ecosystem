import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'properties.read', label: 'View Properties' },
  { id: 'properties.write', label: 'Manage Properties' },
  { id: 'apartments.read', label: 'View Apartments' },
  { id: 'apartments.write', label: 'Manage Apartments' },
  { id: 'contracts.read', label: 'View Contracts' },
  { id: 'contracts.write', label: 'Manage Contracts' },
  { id: 'staff.read', label: 'View Staff' },
  { id: 'staff.write', label: 'Manage Staff' },
  { id: 'roles.read', label: 'View Roles' },
  { id: 'roles.write', label: 'Manage Roles' },
  { id: 'operations.read', label: 'View Operations' },
  { id: 'operations.write', label: 'Manage Operations' },
  { id: 'complaints.read', label: 'View Complaints' },
  { id: 'complaints.write', label: 'Manage Complaints' },
  { id: 'tours.read', label: 'View Tours' },
  { id: 'tours.write', label: 'Manage Tours' },
  { id: 'reports.read', label: 'View Reports' },
  { id: 'settings.write', label: 'Manage Settings' },
];

export default function RoleForm({ initialData, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      permissions: [],
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role Name</label>
        <input
          {...register('name')}
          placeholder="e.g. Operations Director"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="Describe the role responsibilities..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Permissions</label>
        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value.includes(perm.id)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...field.value, perm.id]
                        : field.value.filter((p) => p !== perm.id);
                      field.onChange(updated);
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-medium text-slate-600">{perm.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.permissions && <span className="text-xs text-red-500">{errors.permissions.message}</span>}
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
          {isLoading ? 'Saving...' : 'Save Role'}
        </button>
      </div>
    </form>
  );
}
