import { UserSim } from './types';

export const MOCK_USERS: UserSim[] = [
  {
    id: 'user-1',
    name: 'Trần Minh Anh',
    email: 'minhanh.tran@gmail.com',
    phone: '0912 345 678',
    role: 'member',
    roleName: 'Hội viên VIP',
    avatarInitials: 'MA',
    tier: 'Platinum Elite',
    loyaltyPoints: 1250
  },
  {
    id: 'user-2',
    name: 'Nguyễn Văn Quyết',
    email: 'quyet.nv@grandstay.com',
    phone: '0912 345 678',
    role: 'role-1',
    roleName: 'Giám Đốc Vận Hành',
    avatarInitials: 'VQ',
    tier: 'Root Admin',
    loyaltyPoints: 5000
  },
  {
    id: 'user-3',
    name: 'Lê Thị Khánh Mai',
    email: 'mai.ltk@grandstay.com',
    phone: '0987 654 321',
    role: 'role-3',
    roleName: 'Kế Toán Trưởng',
    avatarInitials: 'KM',
    tier: 'Finance Admin',
    loyaltyPoints: 3200
  },
  {
    id: 'user-4',
    name: 'Phạm Hồng Nhung',
    email: 'nhung.ph@grandstay.com',
    phone: '0934 567 890',
    role: 'role-4',
    roleName: 'Nhân Viên Lễ Tân',
    avatarInitials: 'HN',
    tier: 'Staff Admin',
    loyaltyPoints: 1500
  },
  {
    id: 'user-5',
    name: 'Nguyễn Thị Hoa',
    email: 'hoa.nt@grandstay.com',
    phone: '0966 555 444',
    role: 'role-5',
    roleName: 'Nhân Viên Buồng Phòng',
    avatarInitials: 'TH',
    tier: 'Housekeeper',
    loyaltyPoints: 800
  }
];
