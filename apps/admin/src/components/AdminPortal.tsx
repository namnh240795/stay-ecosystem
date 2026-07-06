import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  X, 
  TrendingUp, 
  Building, 
  Home, 
  FileText, 
  Users, 
  ShieldAlert, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Check, 
  User, 
  Search, 
  Lock, 
  Layers, 
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shuffle,
  CalendarDays,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Package,
  QrCode,
  CreditCard,
  Compass,
  LayoutTemplate,
  Upload,
  Image,
  Camera,
  ChevronRight,
  Quote,
  Leaf,
  Shield,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import { Branch, Apartment, UserSim } from '../types';
import { formatVND } from '../utils/formatVND';
import { exportRosterToPDF, exportMaintenanceToPDF } from '../utils/pdf';
import RoomAvailability from './RoomAvailability';
import OperationsLayout from './operations/OperationsLayout';
import AdminDashboardTab from './admin/AdminDashboardTab';
import AdminHotelsTab from './admin/AdminHotelsTab';
import AdminApartmentsTab from './admin/AdminApartmentsTab';
import Pagination from './admin/Pagination';

interface AdminPortalProps {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  apartments: Apartment[];
  setApartments: React.Dispatch<React.SetStateAction<Apartment[]>>;
  currentUser: UserSim;
  onBackToHome: () => void;
}

// Pre-defined list of system permissions
const SYSTEM_PERMISSIONS = [
  { id: 'view_dashboard', name: 'Xem báo cáo doanh thu', desc: 'Quyền xem biểu đồ doanh thu tuần/tháng/năm và thống kê tài chính.' },
  { id: 'manage_hotels', name: 'Quản lý khách sạn', desc: 'Thêm, sửa, xóa thông tin và tiện ích các chi nhánh khách sạn.' },
  { id: 'manage_apartments', name: 'Quản lý căn hộ', desc: 'Cập nhật danh mục căn hộ dài hạn, giá thuê và trạng thái.' },
  { id: 'manage_contracts', name: 'Quản lý hợp đồng', desc: 'Xét duyệt hợp đồng thuê trực tuyến, hủy hoặc gia hạn hợp đồng.' },
  { id: 'manage_roles_staff', name: 'Tạo vai trò & phân quyền', desc: 'Thiết lập vai trò nhân sự, tích chọn gán quyền và quản lý nhân viên.' }
];

// Initial Roles
const INITIAL_ROLES = [
  { id: 'role-1', name: 'Giám Đốc Vận Hành', desc: 'Toàn quyền kiểm soát hệ thống, phê duyệt báo cáo tài chính cao cấp.', permissions: ['view_dashboard', 'manage_hotels', 'manage_apartments', 'manage_contracts', 'manage_roles_staff'] },
  { id: 'role-2', name: 'Quản Lý Dự Án', desc: 'Quản lý quỹ phòng, khách sạn, căn hộ và tương tác trực tiếp với khách thuê.', permissions: ['view_dashboard', 'manage_hotels', 'manage_apartments', 'manage_contracts'] },
  { id: 'role-3', name: 'Kế Toán Trưởng', desc: 'Chuyên trách báo cáo doanh thu, lập hóa đơn và rà soát pháp lý hợp đồng.', permissions: ['view_dashboard', 'manage_contracts'] },
  { id: 'role-4', name: 'Nhân Viên Lễ Tân', desc: 'Tiếp đón khách hàng, cập nhật tình trạng phòng ngủ và tạo yêu cầu dịch vụ.', permissions: ['manage_contracts'] },
  { id: 'role-5', name: 'Nhân Viên Buồng Phòng', desc: 'Chăm sóc buồng phòng dọn dẹp sạch sẽ, quản lý trang thiết bị buồng phòng, xin nghỉ phép & xin đổi ca.', permissions: [] }
];

// Initial Staff
const INITIAL_STAFF = [
  { id: 'staff-1', name: 'Nguyễn Văn Quyết', email: 'quyet.nv@grandstay.com', phone: '0912345678', roleId: 'role-1', status: 'Active' },
  { id: 'staff-2', name: 'Lê Thị Khánh Mai', email: 'mai.ltk@grandstay.com', phone: '0987654321', roleId: 'role-3', status: 'Active' },
  { id: 'staff-3', name: 'Trần Minh Tuấn', email: 'tuan.tm@grandstay.com', phone: '0905123456', roleId: 'role-2', status: 'Active' },
  { id: 'staff-4', name: 'Phạm Hồng Nhung', email: 'nhung.ph@grandstay.com', phone: '0934567890', roleId: 'role-4', status: 'Active' },
  { id: 'staff-5', name: 'Hoàng Quốc Việt', email: 'viet.hq@grandstay.com', phone: '0977889900', roleId: 'role-4', status: 'Suspended' },
  { id: 'staff-6', name: 'Nguyễn Thị Hoa', email: 'hoa.nt@grandstay.com', phone: '0966555444', roleId: 'role-5', status: 'Active' }
];

// Initial Schedule / Leave / Swap requests
const INITIAL_SCHEDULE_REQUESTS = [
  {
    id: 'req-sch-1',
    type: 'leave', // 'leave' | 'swap'
    staffName: 'Nguyễn Thị Hoa',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    leaveStartDate: '2026-07-01',
    leaveEndDate: '2026-07-03',
    leaveType: 'annual', // 'annual' | 'sick' | 'unpaid'
    reason: 'Xin nghỉ phép thường niên về quê ăn giỗ gia đình',
    status: 'Pending',
    createdAt: '2026-06-27'
  },
  {
    id: 'req-sch-2',
    type: 'swap',
    staffName: 'Phạm Hồng Nhung',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    originalShiftDate: '2026-06-29',
    originalShiftName: 'Ca Sáng (06:00 - 14:00)',
    targetShiftDate: '2026-06-29',
    targetShiftName: 'Ca Đêm (22:00 - 06:00)',
    targetStaffName: 'Hoàng Quốc Việt',
    reason: 'Trùng lịch khám sức khoẻ định kì buổi sáng, muốn đổi ca với đồng nghiệp',
    status: 'Pending',
    createdAt: '2026-06-28'
  },
  {
    id: 'req-sch-3',
    type: 'leave',
    staffName: 'Trần Minh Tuấn',
    roleName: 'Quản Lý Dự Án',
    branchName: 'GrandStay Premier Thai Nguyen',
    leaveStartDate: '2026-06-25',
    leaveEndDate: '2026-06-25',
    leaveType: 'sick',
    reason: 'Xin nghỉ ốm đột xuất do bị sốt siêu vi',
    status: 'Approved',
    approvedBy: 'Nguyễn Văn Quyết',
    responseNotes: 'Đã duyệt nghỉ đột xuất. Đã giao Tuấn Anh bàn giao ca.',
    createdAt: '2026-06-25'
  }
];

// Initial Staff Weekly Shift Roster
const INITIAL_ROSTER = [
  {
    staffId: 'staff-1',
    staffName: 'Nguyễn Văn Quyết',
    roleName: 'Giám Đốc Vận Hành',
    branchName: 'Tất Cả Chi Nhánh',
    shifts: {
      '2026-06-25': 'Hành chính (08:00 - 17:00)',
      '2026-06-26': 'Hành chính (08:00 - 17:00)',
      '2026-06-27': 'Hành chính (08:00 - 17:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Hành chính (08:00 - 17:00)',
      '2026-06-30': 'Hành chính (08:00 - 17:00)',
      '2026-07-01': 'Hành chính (08:00 - 17:00)'
    }
  },
  {
    staffId: 'staff-3',
    staffName: 'Trần Minh Tuấn',
    roleName: 'Quản Lý Dự Án',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'OFF (Nghỉ ốm)',
      '2026-06-26': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-27': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Sáng (06:00 - 14:00)',
      '2026-07-01': 'Ca Chiều (14:00 - 22:00)'
    }
  },
  {
    staffId: 'staff-4',
    staffName: 'Phạm Hồng Nhung',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-26': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-27': 'OFF',
      '2026-06-28': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Chiều (14:00 - 22:00)',
      '2026-07-01': 'Ca Chiều (14:00 - 22:00)'
    }
  },
  {
    staffId: 'staff-5',
    staffName: 'Hoàng Quốc Việt',
    roleName: 'Nhân Viên Lễ Tân',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-26': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-27': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-28': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-29': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-30': 'OFF',
      '2026-07-01': 'Ca Đêm (22:00 - 06:00)'
    }
  },
  {
    staffId: 'staff-6',
    staffName: 'Nguyễn Thị Hoa',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-26': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-27': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-30': 'Ca Chiều (14:00 - 22:00)',
      '2026-07-01': 'OFF (Xin nghỉ phép)'
    }
  },
  {
    staffId: 'staff-7',
    staffName: 'Lê Văn Nam',
    roleName: 'Nhân Viên Buồng Phòng',
    branchName: 'GrandStay Premier Thai Nguyen',
    shifts: {
      '2026-06-25': 'Ca Sáng (06:00 - 14:00)',
      '2026-06-26': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-27': 'Ca Đêm (22:00 - 06:00)',
      '2026-06-28': 'OFF',
      '2026-06-29': 'Ca Chiều (14:00 - 22:00)',
      '2026-06-30': 'Ca Sáng (06:00 - 14:00)',
      '2026-07-01': 'Ca Sáng (06:00 - 14:00)'
    }
  }
];

// Initial Hotel Room Supplies Checklist & Damage logs
const INITIAL_ROOM_AUDITS = [
  {
    id: 'audit-1',
    roomName: 'Phòng 102 (Deluxe Twin)',
    branchName: 'GrandStay Premier Thai Nguyen',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: 'Nguyễn Thị Hoa',
    auditDate: '2026-06-28',
    status: 'Deficit', // 'Full' | 'Deficit' | 'Damaged'
    items: [
      { name: 'Khăn tắm lớn', standard: 2, actual: 1, status: 'Missing', notes: 'Khách mang đi/làm mất', cost: 150000 },
      { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Ly thủy tinh', standard: 2, actual: 1, status: 'Broken', notes: 'Khách làm vỡ ly nước', cost: 50000 },
      { name: 'Nước suối miễn phí', standard: 2, actual: 0, status: 'Used', notes: 'Khách đã uống (bổ sung mới)', cost: 0 },
      { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
    ],
    totalDamageCost: 200000,
    notes: 'Khách làm vỡ 1 ly nước và mang đi 1 khăn tắm lớn. Đã lập biên bản bồi thường lúc check-out.'
  },
  {
    id: 'audit-2',
    roomName: 'Phòng 202 (Presidential Suite)',
    branchName: 'GrandStay Premier Thai Nguyen',
    shift: 'Ca Chiều (14:00 - 22:00)',
    auditor: 'Trần Minh Quân',
    auditDate: '2026-06-27',
    status: 'Damaged',
    items: [
      { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Broken', notes: 'Cháy cuộn dây động cơ máy sấy', cost: 350000 },
      { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Dép đi trong phòng', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 }
    ],
    totalDamageCost: 350000,
    notes: 'Máy sấy tóc bị hỏng cuộn nhiệt bên trong, cần đem đi sửa chữa hoặc thay thế mới.'
  },
  {
    id: 'audit-3',
    roomName: 'Villa 102 (Two-Bedroom Villa)',
    branchName: 'GrandStay Beachfront Resort Phu Quoc',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: 'Phạm Hồng Ánh',
    auditDate: '2026-06-28',
    status: 'Full',
    items: [
      { name: 'Chăn ga gối', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 4, actual: 4, status: 'Good', notes: '', cost: 0 },
      { name: 'Nước suối miễn phí', standard: 4, actual: 2, status: 'Used', notes: 'Bổ sung đầy đủ', cost: 0 }
    ],
    totalDamageCost: 0,
    notes: 'Vật tư buồng phòng đầy đủ, không hư hại hỏng hóc.'
  }
];

// Initial Mock Contracts
const INITIAL_CONTRACTS = [
  { id: 'HD-A8972', aptName: 'Metropolitan Luxury Studio - Saigon Central', location: 'Saigon', monthlyPrice: 23750000, leaseTerm: 12, tenantName: 'Trần Hoàng Long', tenantPhone: '0911223344', tenantEmail: 'long.th@gmail.com', signedDate: '2026-06-15', status: 'Approved' },
  { id: 'HD-C2341', aptName: 'Indochine Heritage 1BR Suite - Hoan Kiem', location: 'Hanoi', monthlyPrice: 27500000, leaseTerm: 6, tenantName: 'Lê Thuỳ Trang', tenantPhone: '0988776655', tenantEmail: 'trang.lt@yahoo.com', signedDate: '2026-06-20', status: 'Pending' },
  { id: 'HD-D4509', aptName: 'My Khe Beachfront Panoramic 2BR Apartment', location: 'Da Nang', monthlyPrice: 36250000, leaseTerm: 3, tenantName: 'Nguyễn Minh Anh', tenantPhone: '0909090909', tenantEmail: 'minhanh.ng@hotmail.com', signedDate: '2026-06-26', status: 'Approved' }
];

// Initial states for hotel operations
const INITIAL_ROOMS = [
  { id: 'rm-tn-101', name: 'Phòng 101 (Deluxe Double)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Clean', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Hoa' },
  { id: 'rm-tn-102', name: 'Phòng 102 (Deluxe Twin)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Dirty', occupancy: 'Occupied', housekeeper: 'Lê Văn Nam' },
  { id: 'rm-tn-201', name: 'Phòng 201 (Executive Suite)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Cleaning', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Hoa' },
  { id: 'rm-tn-202', name: 'Phòng 202 (Presidential Suite)', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', status: 'Repairing', occupancy: 'Vacant', housekeeper: 'Trần Minh Quân' },

  { id: 'rm-pq-101', name: 'Villa 101 (Ocean Pool Beachfront)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Phạm Hồng Ánh' },
  { id: 'rm-pq-102', name: 'Villa 102 (Two-Bedroom Villa)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Dirty', occupancy: 'Vacant', housekeeper: 'Phạm Hồng Ánh' },
  { id: 'rm-pq-201', name: 'Villa 201 (Royal Family Residence)', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', status: 'Clean', occupancy: 'Reserved', housekeeper: 'Chưa phân công' },

  { id: 'rm-dn-501', name: 'Phòng 501 (Grand Lux Skyline)', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Lê Thuỳ Trang' },
  { id: 'rm-dn-502', name: 'Phòng 502 (Premium River View)', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', status: 'Dirty', occupancy: 'Vacant', housekeeper: 'Chưa phân công' },

  { id: 'rm-sg-1502', name: 'Căn hộ 1502 (Studio)', branchId: 'apt-saigon-skyline', branchName: 'Metropolitan Luxury Studio - Saigon Central', status: 'Clean', occupancy: 'Occupied', housekeeper: 'Trần Văn Kiên' },
  { id: 'rm-hn-301', name: 'Căn hộ 301 (Indochine Heritage)', branchId: 'apt-hanoi-indochine', branchName: 'Indochine Heritage 1BR Suite - Hoan Kiem', status: 'Cleaning', occupancy: 'Vacant', housekeeper: 'Nguyễn Thị Bình' }
];

const INITIAL_REQUESTS = [
  { id: 'req-1', roomName: 'Phòng 102', guestName: 'Nguyễn Lâm Anh', branchName: 'GrandStay Premier Thai Nguyen', type: 'Thêm khăn tắm', detail: 'Yêu cầu mang thêm 2 khăn tắm lớn và 2 bộ bàn chải đánh răng.', time: '2026-06-27 08:30', status: 'Pending', assignedStaff: 'Nguyễn Thị Hoa' },
  { id: 'req-2', roomName: 'Villa 101', guestName: 'Phạm Quốc Bảo', branchName: 'GrandStay Beachfront Resort Phu Quoc', type: 'Đồ ăn tại phòng', detail: 'Gọi 1 suất Phở bò và 1 ly nước cam ép đá giao lúc 9:00.', time: '2026-06-27 08:15', status: 'Processing', assignedStaff: 'Trần Văn Kiên' },
  { id: 'req-3', roomName: 'Phòng 501', guestName: 'Trần Hoàng Long', branchName: 'GrandStay Lux Waterfront Da Nang', type: 'Dọn dẹp khẩn cấp', detail: 'Trẻ em làm đổ sữa ra sàn gỗ phòng khách, cần dọn gấp.', time: '2026-06-27 07:45', status: 'Completed', assignedStaff: 'Lê Thuỳ Trang' }
];

const INITIAL_COMPLAINTS = [
  { id: 'comp-1', guestName: 'Lê Văn Hoàng', roomName: 'Phòng 202', branchName: 'GrandStay Premier Thai Nguyen', title: 'Điều hòa không mát', detail: 'Máy điều hòa bật 16 độ nhưng chỉ có gió, phòng rất nóng và bí.', priority: 'High', time: '2026-06-26 19:40', status: 'Investigating', notes: 'Kỹ thuật viên đang kiểm tra gas và block máy ngoài ban công.' },
  { id: 'comp-2', guestName: 'Nguyễn Thị Lan', roomName: 'Căn hộ 1502', branchName: 'Metropolitan Luxury Studio - Saigon Central', title: 'Wifi không kết nối được', detail: 'Mạng Wifi báo sóng căng nhưng không vào mạng được, ảnh hưởng công việc từ xa.', priority: 'Medium', time: '2026-06-27 08:00', status: 'Open', notes: '' },
  { id: 'comp-3', guestName: 'Đặng Quốc Huy', roomName: 'Villa 102', branchName: 'GrandStay Beachfront Resort Phu Quoc', title: 'Nước nóng bị ngắt quãng', detail: 'Vòi sen tắm nước nóng lạnh thất thường, lúc quá nóng lúc quá lạnh.', priority: 'High', time: '2026-06-26 14:15', status: 'Resolved', notes: 'Đã thay rơ-le bình nóng lạnh và kiểm tra áp lực nước ổn định.' }
];

const INITIAL_DAILY_LOGS = [
  { id: 'log-1', author: 'Nguyễn Văn Quyết', roleName: 'Giám Đốc Vận Hành', shift: 'Ca Sáng (06:00 - 14:00)', date: '2026-06-27', content: 'Vận hành đầu ngày ổn định. Đã tổ chức họp ngắn bàn giao với nhân viên buồng phòng. Nhắc nhở tập trung dọn dẹp sớm các phòng check-out trước 12:00 để kịp đón đoàn khách VIP chiều nay.', issues: 'Không có sự cố lớn.', time: '2026-06-27 08:45' },
  { id: 'log-2', author: 'Phạm Hồng Nhung', roleName: 'Nhân Viên Lễ Tân', shift: 'Ca Chiều (14:00 - 22:00)', date: '2026-06-26', content: 'Ca chiều đón 15 lượt check-in và tiễn 8 lượt check-out. Có khiếu nại từ phòng 202 về điều hòa đã được chuyển kỹ thuật dọn dẹp và xử lý kịp thời.', issues: 'Phòng 202 hỏng điều hòa, đã điều chuyển kỹ thuật kiểm tra và tặng voucher bồi hoàn cho khách.', time: '2026-06-26 21:55' }
];

const INITIAL_RESERVATIONS = [
  { id: 'BK-001', guestName: 'Nguyễn Lâm Anh', phone: '0981 123 456', email: 'lamanh.ng@gmail.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 102 (Deluxe Twin)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 9000000, rooms: 1, specialRequest: 'Yêu cầu phòng tầng cao, yên tĩnh.' },
  { id: 'BK-002', guestName: 'Phạm Quốc Bảo', phone: '0912 334 455', email: 'baopq@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 101 (Ocean Pool Beachfront)', checkIn: '2026-06-25', checkOut: '2026-06-28', status: 'CheckedIn', totalPrice: 13500000, rooms: 1, specialRequest: 'Chuẩn bị nến lãng mạn kỷ niệm ngày cưới.' },
  { id: 'BK-003', guestName: 'Trần Hoàng Long', phone: '0911 223 344', email: 'long.th@gmail.com', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', roomName: 'Phòng 501 (Grand Lux Skyline)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 11250000, rooms: 1, specialRequest: '' },
  { id: 'BK-004', guestName: 'Đỗ Thị Minh', phone: '0933 445 566', email: 'minhdt@outlook.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 101 (Deluxe Double)', checkIn: '2026-06-27', checkOut: '2026-06-30', status: 'Reserved', totalPrice: 6000000, rooms: 1, specialRequest: 'Check-in sớm lúc 11:00 nếu có thể.' },
  { id: 'BK-005', guestName: 'Lương Thế Vinh', phone: '0945 667 788', email: 'vinhlt@gmail.com', branchId: 'sapa', branchName: 'GrandStay Cloud Retreat Sapa', roomName: 'Biệt thự trên mây 302', checkIn: '2026-06-28', checkOut: '2026-07-02', status: 'Reserved', totalPrice: 16500000, rooms: 1, specialRequest: 'Đưa đón ga Sapa bằng xe Limousine.' },
  { id: 'BK-006', guestName: 'Lê Thuỳ Trang', phone: '0988 776 655', email: 'trang.lt@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 102 (Two-Bedroom Villa)', checkIn: '2026-06-24', checkOut: '2026-06-27', status: 'CheckedOut', totalPrice: 13500000, rooms: 1, specialRequest: 'Thanh toán bằng thẻ Visa doanh nghiệp.' }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl text-left text-[11px] text-white max-w-[240px] z-50 pointer-events-none">
        <p className="font-extrabold text-blue-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center gap-1">
          📅 Ngày {label}
        </p>
        <div className="space-y-1 font-medium text-slate-300">
          {payload.map((pld: any, index: number) => {
            const isRevenue = pld.name.toLowerCase().includes('doanh thu') || pld.name.toLowerCase().includes('revenue');
            const isPercent = pld.name.includes('%') || pld.name.toLowerCase().includes('lấp đầy') || pld.name.toLowerCase().includes('occupancy');
            const valFormatted = isRevenue 
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pld.value) 
              : isPercent 
                ? `${pld.value}%` 
                : `${pld.value} lượt`;

            return (
              <p key={index} className="flex justify-between gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pld.color || pld.stroke }} />
                  {pld.name}:
                </span>
                <strong className="text-white font-bold font-mono text-[11px]">{valFormatted}</strong>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminPortal({ 
  branches, 
  setBranches, 
  apartments, 
  setApartments,
  currentUser,
  onBackToHome
}: AdminPortalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = (() => {
    // With HashRouter, use hash instead of pathname
    // Hash format: "#/admin/dashboard", "#/admin/hotels", etc.
    const hash = location.hash || '';
    const hashPath = hash.replace('#', '');
    const parts = hashPath.split('/');
    const tab = parts[2];
    const validTabs = ['dashboard', 'hotels', 'apartments', 'contracts', 'roles', 'staff', 'operations', 'leaves', 'tours', 'footer', 'banners', 'policies'];
    if (validTabs.includes(tab)) {
      return tab as 'dashboard' | 'hotels' | 'apartments' | 'contracts' | 'roles' | 'staff' | 'operations' | 'leaves' | 'tours' | 'footer' | 'banners' | 'policies';
    }
    return 'dashboard';
  })();

  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`);
  };

  // dashboardSubTab and revenueFilter are now managed internally by AdminDashboardTab
  const [housekeepingViewMode, setHousekeepingViewMode] = useState<'hotels' | 'apartments'>('hotels');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'sepay' | 'stripe'>('all');

  // Operations Hub States
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('gs_op_rooms');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROOMS;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('gs_op_requests');
    if (saved) return JSON.parse(saved);
    return INITIAL_REQUESTS;
  });

  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('gs_op_complaints');
    if (saved) return JSON.parse(saved);
    return INITIAL_COMPLAINTS;
  });

  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('gs_op_daily_logs');
    if (saved) return JSON.parse(saved);
    return INITIAL_DAILY_LOGS;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('gs_op_reservations');
    if (saved) return JSON.parse(saved);
    return INITIAL_RESERVATIONS;
  });

  const [scheduleRequests, setScheduleRequests] = useState(() => {
    const saved = localStorage.getItem('gs_op_schedule_requests');
    if (saved) return JSON.parse(saved);
    return INITIAL_SCHEDULE_REQUESTS;
  });

  const [roster, setRoster] = useState(() => {
    const saved = localStorage.getItem('gs_op_roster');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROSTER;
  });

  const [roomAudits, setRoomAudits] = useState(() => {
    const saved = localStorage.getItem('gs_op_room_audits');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROOM_AUDITS;
  });

  // State for adding a new room audit checklist
  const [newAuditForm, setNewAuditForm] = useState({
    roomId: '',
    shift: 'Ca Sáng (06:00 - 14:00)',
    auditor: currentUser.name,
    notes: '',
    items: [
      { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn tắm lớn', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Khăn mặt', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Dép đi trong phòng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Lược chải đầu', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Nước suối miễn phí', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Trà & Cà phê gói', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
      { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
      { name: 'Ly thủy tinh', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
    ]
  });

  // Filter state for audits
  const [auditFilterRoom, setAuditFilterRoom] = useState<string>('All');

  // New Operational Form States
  const [newReqForm, setNewReqForm] = useState({
    roomName: '',
    guestName: '',
    branchName: 'GrandStay Premier Thai Nguyen',
    type: 'Thêm khăn tắm',
    detail: '',
    assignedStaff: 'Nguyễn Thị Hoa'
  });

  const [newCompForm, setNewCompForm] = useState({
    guestName: '',
    roomName: '',
    branchName: 'GrandStay Premier Thai Nguyen',
    title: '',
    detail: '',
    priority: 'Medium'
  });

  const [newLogForm, setNewLogForm] = useState({
    shift: 'Ca Sáng (06:00 - 14:00)',
    content: '',
    issues: ''
  });

  const [newLeaveForm, setNewLeaveForm] = useState({
    startDate: '',
    endDate: '',
    type: 'annual' as 'annual' | 'sick' | 'unpaid',
    reason: ''
  });

  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    date: string;
    currentShift: string;
  } | null>(null);

  const [rosterRoleFilter, setRosterRoleFilter] = useState<string>('All');

  const [newSwapForm, setNewSwapForm] = useState({
    originalDate: '',
    originalShift: 'Ca Sáng (06:00 - 14:00)',
    targetDate: '',
    targetShift: 'Ca Sáng (06:00 - 14:00)',
    targetStaff: '',
    reason: ''
  });

  const [responseNotesState, setResponseNotesState] = useState<{ [key: string]: string }>({});

  const [newResForm, setNewResForm] = useState({
    guestName: '',
    phone: '',
    email: '',
    branchId: 'thai-nguyen',
    roomName: 'Phòng 101 (Deluxe Double)',
    checkIn: '2026-06-27',
    checkOut: '2026-06-30',
    totalPrice: 6000000,
    specialRequest: ''
  });

  // Complaint Resolution Modal/Input state
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Room Swap & Upgrade system states
  const [swappingReservation, setSwappingReservation] = useState<any | null>(null);
  const [selectedSwapRoomId, setSelectedSwapRoomId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<'no_vacant_clean' | 'room_issue' | 'guest_request_upgrade' | 'other'>('room_issue');
  const [swapSurcharge, setSwapSurcharge] = useState<number>(0);
  const [swapIsFoc, setSwapIsFoc] = useState<boolean>(true);
  const [swapNotes, setSwapNotes] = useState<string>('');
  
  // Local states that survive inside this Portal component or use localStorage for persistence
  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('gs_mock_contracts');
    if (saved) return JSON.parse(saved);
    return INITIAL_CONTRACTS;
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('gs_roles');
    if (saved) return JSON.parse(saved);
    return INITIAL_ROLES;
  });

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('gs_staff');
    if (saved) return JSON.parse(saved);
    return INITIAL_STAFF;
  });

  // Extract user's permissions based on their role
  const activeRoleObj = roles.find((r: any) => r.id === currentUser.role);
  const userPermissions = activeRoleObj ? activeRoleObj.permissions : [];

  // Automatically switch activeTab to the first authorized option if current activeTab is not permitted
  useEffect(() => {
    const allowedTabs: ('dashboard' | 'hotels' | 'apartments' | 'contracts' | 'roles' | 'staff' | 'operations' | 'leaves' | 'tours' | 'footer' | 'banners' | 'policies')[] = [];
    if (userPermissions.includes('view_dashboard')) allowedTabs.push('dashboard');
    if (userPermissions.includes('manage_hotels')) allowedTabs.push('hotels');
    if (userPermissions.includes('manage_apartments')) allowedTabs.push('apartments');
    if (userPermissions.includes('manage_contracts')) allowedTabs.push('contracts');
    if (userPermissions.includes('manage_roles_staff')) {
      allowedTabs.push('roles');
      allowedTabs.push('staff');
    }
    // Operations is accessible to all administrative users
    allowedTabs.push('operations');
    allowedTabs.push('leaves');
    allowedTabs.push('tours');
    allowedTabs.push('footer');
    allowedTabs.push('banners');
    allowedTabs.push('policies');

    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [currentUser, userPermissions, activeTab]);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Leave Management States
  const [leavesForm, setLeavesForm] = useState({
    startDate: '',
    endDate: '',
    type: 'annual' as 'annual' | 'sick' | 'unpaid',
    reason: '',
    staffId: '' // optional if manager wants to submit on behalf of someone
  });
  const [leavesStatusFilter, setLeavesStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [leavesTypeFilter, setLeavesTypeFilter] = useState<'All' | 'annual' | 'sick' | 'unpaid'>('All');
  const [leavesScopeFilter, setLeavesScopeFilter] = useState<'All' | 'Mine'>('All');
  const [leavesResponseNotes, setLeavesResponseNotes] = useState<Record<string, string>>({});

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gs_mock_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('gs_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('gs_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('gs_op_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('gs_op_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('gs_op_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('gs_op_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('gs_op_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('gs_op_schedule_requests', JSON.stringify(scheduleRequests));
  }, [scheduleRequests]);

  useEffect(() => {
    localStorage.setItem('gs_op_roster', JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem('gs_op_room_audits', JSON.stringify(roomAudits));
  }, [roomAudits]);

  // Load newly signed customer contracts in real-time from user flow
  useEffect(() => {
    const handleStorageChange = () => {
      const liveContractsStr = localStorage.getItem('gs_signed_contracts');
      if (liveContractsStr) {
        const liveContracts = JSON.parse(liveContractsStr);
        // Merge with existing contracts, checking duplicates
        setContracts(prev => {
          const prevFiltered = prev.filter(p => !liveContracts.some((l: any) => l.id === p.id));
          const formattedLive = liveContracts.map((c: any) => ({
            id: c.id,
            aptName: c.aptName,
            location: c.location,
            monthlyPrice: c.monthlyPrice,
            leaseTerm: c.leaseTerm,
            tenantName: c.tenantName,
            tenantPhone: c.tenantPhone,
            tenantEmail: c.tenantEmail,
            signedDate: c.signedDate,
            status: 'Approved' // auto approved from portal sign
          }));
          return [...formattedLive, ...prevFiltered];
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // initial call

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // CRUD States
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination States
  const [contractsPage, setContractsPage] = useState(1);
  const [contractsPerPage, setContractsPerPage] = useState(5);

  const [staffPage, setStaffPage] = useState(1);
  const [staffPerPage, setStaffPerPage] = useState(5);

  const [leavesPage, setLeavesPage] = useState(1);
  const [leavesPerPage, setLeavesPerPage] = useState(5);

  // Operations Hub Paginations
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(6); // Default to 6 for 3-column hotel rooms grid

  const [apartmentsPage, setApartmentsPage] = useState(1);
  const [apartmentsPerPage, setApartmentsPerPage] = useState(6); // Default to 6 for 3-column apartments grid

  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(5);

  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsPerPage, setComplaintsPerPage] = useState(6); // Default to 6 for 2-column complaints grid

  const [dailyLogsPage, setDailyLogsPage] = useState(1);
  const [dailyLogsPerPage, setDailyLogsPerPage] = useState(5);

  const [roomAuditsPage, setRoomAuditsPage] = useState(1);
  const [roomAuditsPerPage, setRoomAuditsPerPage] = useState(5);

  const [scheduleRequestsPage, setScheduleRequestsPage] = useState(1);
  const [scheduleRequestsPerPage, setScheduleRequestsPerPage] = useState(5);

  // Reset page numbers when search term or filters change
  useEffect(() => {
    setContractsPage(1);
    setStaffPage(1);
    setLeavesPage(1);
    setRoomsPage(1);
    setApartmentsPage(1);
    setRequestsPage(1);
    setComplaintsPage(1);
    setDailyLogsPage(1);
    setRoomAuditsPage(1);
    setScheduleRequestsPage(1);
  }, [searchTerm, leavesStatusFilter, leavesTypeFilter, leavesScopeFilter, housekeepingViewMode]);
  const [aptStatusFilter, setAptStatusFilter] = useState<'all' | 'Clean' | 'Needs Repair' | 'Under Maintenance'>('all');
  
  // Hotel form state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Branch | null>(null);
  const [hotelForm, setHotelForm] = useState({
    id: '',
    name: '',
    region: 'Northern Highlands',
    brand: 'GrandStay Premier',
    description: '',
    image: '',
    pricePerNight: 2000000,
    amenities: ['Free Wi-Fi', 'Pool', 'Gym'],
    virtualTourUrl: ''
  });

  // Apartment form state
  const [showAptModal, setShowAptModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);
  const [aptForm, setAptForm] = useState({
    id: '',
    name: '',
    location: 'Saigon',
    type: 'Studio' as any,
    area: 40,
    bedrooms: 1,
    bathrooms: 1,
    monthlyPrice: 20000000,
    image: '',
    description: '',
    amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock'],
    petFriendly: true,
    hasVirtualTour: true,
    virtualTourUrl: ''
  });

  // Role form state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    desc: '',
    permissions: [] as string[]
  });

  const [showHotelTourPreview, setShowHotelTourPreview] = useState(false);
  const [showAptTourPreview, setShowAptTourPreview] = useState(false);
  const [activeTourUrl, setActiveTourUrl] = useState<string | null>(null);

  // Staff form state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: 'role-4',
    status: 'Active'
  });

  // Selected Contract detail modal
  const [selectedContractDetail, setSelectedContractDetail] = useState<any>(null);

  // Contract edit modal states
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [contractForm, setContractForm] = useState({
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    aptName: '',
    location: 'Saigon',
    monthlyPrice: 0,
    leaseTerm: 12,
    signedDate: '',
    status: 'Pending',
    vatAndFeesText: 'Chưa bao gồm thuế GTGT và phí quản lý dịch vụ tiện ích phát sinh thực tế',
    additionalTerms: 'Cư dân cam kết tuân thủ quy định nội quy tòa nhà, không tự ý cải tạo kết cấu khi chưa được sự đồng ý bằng văn bản của Bên A. Hợp đồng có giá trị pháp lý tương đương bản cứng sau khi được phê duyệt trên cổng GrandStay Admin.'
  });

  // Stats calculation
  // Dynamic payment gateway totals based on current reservations (including user-created ones)
  const stripeBookings = reservations.filter((r: any) => r.paymentMethod === 'stripe');
  const stripeTotalCount = stripeBookings.length;
  const stripeTotalAmount = stripeBookings.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);

  const sepayBookings = reservations.filter((r: any) => r.paymentMethod === 'sepay' || !r.paymentMethod);
  const sepayTotalCount = sepayBookings.length;
  const sepayTotalAmount = sepayBookings.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);

  const totalGatewayAmount = (stripeTotalAmount + sepayTotalAmount) || 1; // avoid divide by zero
  const stripePercent = Math.round((stripeTotalAmount / totalGatewayAmount) * 100);
  const sepayPercent = Math.round((sepayTotalAmount / totalGatewayAmount) * 100);

  const liveReservationRevenue = reservations
    .filter((r: any) => r.status === 'CheckedIn' || r.status === 'CheckedOut' || r.status === 'Reserved')
    .reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);

  const totalHotelRevenue = 2650000000 + liveReservationRevenue;
  const totalAptRevenue = 1540000000;
  const grandTotalRevenue = totalHotelRevenue + totalAptRevenue;
  
  const activeContractsCount = contracts.filter((c: any) => c.status === 'Approved').length;
  const pendingContractsCount = contracts.filter((c: any) => c.status === 'Pending').length;

  // Handle image upload and base64 conversion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isApt: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isApt) {
          setAptForm(prev => ({ ...prev, image: base64String }));
        } else {
          setHotelForm(prev => ({ ...prev, image: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to set tour URL and auto toggle status
  const setFormAndVerifyTour = (url: string, isApt: boolean) => {
    if (isApt) {
      setAptForm(prev => ({ ...prev, virtualTourUrl: url, hasVirtualTour: !!url }));
    } else {
      setHotelForm(prev => ({ ...prev, virtualTourUrl: url }));
    }
  };

  // Handle hotel save
  const handleSaveHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHotel) {
      setBranches(prev => prev.map(b => b.id === editingHotel.id ? { ...b, ...hotelForm } : b));
    } else {
      const newId = 'hotel-' + Math.random().toString(36).substr(2, 5);
      const newHotel: Branch = {
        ...hotelForm,
        id: newId,
        rating: 4.8,
        reviews: 1,
        popularFor: 'Premium Stay'
      };
      setBranches(prev => [newHotel, ...prev]);
    }
    setShowHotelModal(false);
    setEditingHotel(null);
  };

  // Handle apartment save
  const handleSaveApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApt) {
      setApartments(prev => prev.map(a => a.id === editingApt.id ? { ...a, ...aptForm } : a));
    } else {
      const newId = 'apt-' + Math.random().toString(36).substr(2, 5);
      const newApt: Apartment = {
        ...aptForm,
        id: newId,
        rating: 4.8,
        reviews: 1,
        images: [aptForm.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        availableFrom: new Date().toISOString().split('T')[0]
      };
      setApartments(prev => [newApt, ...prev]);
    }
    setShowAptModal(false);
    setEditingApt(null);
  };

  // Handle role save
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: roleForm.name, desc: roleForm.desc, permissions: roleForm.permissions } : r));
    } else {
      const newRole = {
        id: 'role-' + Math.random().toString(36).substr(2, 5),
        name: roleForm.name,
        desc: roleForm.desc,
        permissions: roleForm.permissions
      };
      setRoles(prev => [...prev, newRole]);
    }
    setShowRoleModal(false);
    setEditingRole(null);
  };

  // Handle staff save
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...staffForm } : s));
    } else {
      const newStaff = {
        id: 'staff-' + Math.random().toString(36).substr(2, 5),
        ...staffForm
      };
      setStaff(prev => [...prev, newStaff]);
    }
    setShowStaffModal(false);
    setEditingStaff(null);
  };

  // Handle contract save
  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
      setContracts((prev: any[]) => prev.map(c => c.id === editingContract.id ? { ...c, ...contractForm } : c));
    } else {
      const newId = 'HD-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      const newContract = {
        id: newId,
        ...contractForm
      };
      setContracts((prev: any[]) => [newContract, ...prev]);
    }
    setShowContractModal(false);
    setEditingContract(null);
  };

  // --- OPERATIONS HELPERS ---
  const handleCheckIn = (resId: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;
    
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CheckedIn' } : r));

    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(res.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === res.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Occupied' };
      }
      return room;
    }));
  };

  const handleCheckOut = (resId: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CheckedOut' } : r));

    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(res.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === res.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Vacant', status: 'Dirty' };
      }
      return room;
    }));
  };

  const handleUpdateRoomStatus = (roomId: string, newStatus: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
  };

  const handleAssignHousekeeper = (roomId: string, housekeeperName: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeeper: housekeeperName } : r));
  };

  const handleUpdateApartmentMaintenance = (
    aptId: string,
    status: 'Clean' | 'Needs Repair' | 'Under Maintenance',
    cost?: number,
    notes?: string
  ) => {
    setApartments(prev => prev.map(a => {
      if (a.id === aptId) {
        return {
          ...a,
          maintenanceStatus: status,
          estimatedRepairCost: cost !== undefined ? cost : a.estimatedRepairCost,
          maintenanceNotes: notes !== undefined ? notes : a.maintenanceNotes
        };
      }
      return a;
    }));
  };

  const handlePerformRoomSwap = () => {
    if (!swappingReservation || !selectedSwapRoomId) return;

    const targetRoom = rooms.find((r: any) => r.id === selectedSwapRoomId);
    if (!targetRoom) return;

    const oldRoomName = swappingReservation.roomName;
    const newRoomName = targetRoom.name;

    // 1. Update reservation
    setReservations((prev: any[]) => prev.map(res => {
      if (res.id === swappingReservation.id) {
        return {
          ...res,
          roomName: newRoomName,
          totalPrice: res.totalPrice + (swapIsFoc ? 0 : swapSurcharge),
          specialRequest: res.specialRequest 
            ? `${res.specialRequest} (Chuyển phòng: ${oldRoomName} ➔ ${newRoomName}. Lý do: ${
                swapReason === 'room_issue' ? 'Sự cố phòng cũ' :
                swapReason === 'no_vacant_clean' ? 'Hết phòng trống thực tế' :
                swapReason === 'guest_request_upgrade' ? 'Nâng cấp theo yêu cầu khách' : 'Lý do khác'
              }. Ghi chú: ${swapNotes})`
            : `Chuyển phòng: ${oldRoomName} ➔ ${newRoomName}. Lý do: ${
                swapReason === 'room_issue' ? 'Sự cố phòng cũ' :
                swapReason === 'no_vacant_clean' ? 'Hết phòng trống thực tế' :
                swapReason === 'guest_request_upgrade' ? 'Nâng cấp theo yêu cầu khách' : 'Lý do khác'
              }. Ghi chú: ${swapNotes}`
        };
      }
      return res;
    }));

    // 2. Update occupancy & status of both old and new rooms
    setRooms((prev: any[]) => prev.map(room => {
      const branchMatch = room.branchId === swappingReservation.branchId;
      
      // Old room matching
      const oldRoomMatch = room.name.toLowerCase().includes(oldRoomName.split(' ')[0].toLowerCase());
      
      // Target room matching
      const targetRoomMatch = room.id === targetRoom.id;

      if (branchMatch) {
        if (targetRoomMatch) {
          const newOccupancy = swappingReservation.status === 'CheckedIn' ? 'Occupied' : 'Reserved';
          return { 
            ...room, 
            occupancy: newOccupancy,
            status: 'Clean'
          };
        }
        if (oldRoomMatch) {
          const nextStatus = swapReason === 'room_issue' ? 'Repairing' : 'Dirty';
          return {
            ...room,
            occupancy: 'Vacant',
            status: nextStatus
          };
        }
      }
      return room;
    }));

    // 3. Add to daily logs
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 5),
      author: currentUser?.name || 'Hệ Thống Lễ Tân',
      roleName: currentUser?.role || 'Lễ Tân',
      shift: 'Ca Trực Hiện Tại',
      date: new Date().toISOString().split('T')[0],
      content: `[ĐIỀU CHUYỂN PHÒNG] Đổi phòng cho khách ${swappingReservation.guestName} (Mã booking: ${swappingReservation.id}). Từ [${oldRoomName}] sang [${newRoomName}]. Lý do: ${
        swapReason === 'room_issue' ? 'Phòng cũ gặp sự cố kỹ thuật' :
        swapReason === 'no_vacant_clean' ? 'Hết phòng trống thực tế cùng hạng' :
        swapReason === 'guest_request_upgrade' ? 'Yêu cầu nâng cấp từ khách hàng' : 'Lý do khác'
      }. Phụ phí phát sinh: ${swapIsFoc ? '0 VND (FOC - Miễn phí)' : `${swapSurcharge.toLocaleString()} VND`}. Chi tiết: ${swapNotes}`,
      issues: swapReason === 'room_issue' ? `Phòng cũ [${oldRoomName}] gặp sự cố kỹ thuật và đã chuyển tự động sang trạng thái bảo trì.` : 'Không có sự cố phát sinh thêm.',
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' ')
    };
    setDailyLogs((prev: any[]) => [newLog, ...prev]);

    // 4. If the swap was due to room_issue, automatically create a high priority Complaint ticket for maintenance
    if (swapReason === 'room_issue') {
      const newComplaint = {
        id: 'comp-' + Math.random().toString(36).substr(2, 5),
        guestName: swappingReservation.guestName,
        roomName: oldRoomName,
        branchName: swappingReservation.branchName,
        title: `[Tự động] Bảo trì gấp phòng ${oldRoomName.split(' ')[0]} do gặp sự cố`,
        detail: `Khách được điều chuyển phòng khẩn cấp sang phòng mới. Chi tiết sự cố phòng cũ: ${swapNotes || 'Cần kiểm tra thiết bị hạ tầng kỹ thuật.'}`,
        priority: 'High' as const,
        time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
        status: 'Open' as const,
        notes: `Tự động tạo từ quầy lễ tân khi đổi phòng khẩn cấp cho khách sang ${newRoomName}.`
      };
      setComplaints((prev: any[]) => [newComplaint, ...prev]);
    }

    // Reset states
    setSwappingReservation(null);
    setSelectedSwapRoomId('');
    setSwapReason('room_issue');
    setSwapSurcharge(0);
    setSwapIsFoc(true);
    setSwapNotes('');
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.roomName || !newReqForm.guestName || !newReqForm.detail) return;

    const newReq = {
      id: 'req-' + Math.random().toString(36).substr(2, 5),
      roomName: newReqForm.roomName,
      guestName: newReqForm.guestName,
      branchName: newReqForm.branchName,
      type: newReqForm.type,
      detail: newReqForm.detail,
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      status: 'Pending',
      assignedStaff: newReqForm.assignedStaff
    };

    setRequests(prev => [newReq, ...prev]);
    setNewReqForm({
      roomName: '',
      guestName: '',
      branchName: 'GrandStay Premier Thai Nguyen',
      type: 'Thêm khăn tắm',
      detail: '',
      assignedStaff: 'Nguyễn Thị Hoa'
    });
  };

  const handleUpdateRequestStatus = (reqId: string, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
  };

  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompForm.guestName || !newCompForm.roomName || !newCompForm.title || !newCompForm.detail) return;

    const newComp = {
      id: 'comp-' + Math.random().toString(36).substr(2, 5),
      guestName: newCompForm.guestName,
      roomName: newCompForm.roomName,
      branchName: newCompForm.branchName,
      title: newCompForm.title,
      detail: newCompForm.detail,
      priority: newCompForm.priority,
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      status: 'Open',
      notes: ''
    };

    setComplaints(prev => [newComp, ...prev]);
    setNewCompForm({
      guestName: '',
      roomName: '',
      branchName: 'GrandStay Premier Thai Nguyen',
      title: '',
      detail: '',
      priority: 'Medium'
    });
  };

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaintId || !resolutionNotes) return;

    setComplaints(prev => prev.map(c => c.id === resolvingComplaintId ? { ...c, status: 'Resolved', notes: resolutionNotes } : c));
    setResolvingComplaintId(null);
    setResolutionNotes('');
  };

  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogForm.content) return;

    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 5),
      author: currentUser.name,
      roleName: currentUser.roleName,
      shift: newLogForm.shift,
      date: new Date().toISOString().slice(0, 10),
      content: newLogForm.content,
      issues: newLogForm.issues || 'Không có sự cố lớn.',
      time: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' ')
    };

    setDailyLogs(prev => [newLog, ...prev]);
    setNewLogForm({
      shift: 'Ca Sáng (06:00 - 14:00)',
      content: '',
      issues: ''
    });
  };

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveForm.startDate || !newLeaveForm.endDate || !newLeaveForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin ngày nghỉ và lý do!');
      return;
    }

    const newReq = {
      id: 'req-sch-' + Math.random().toString(36).substr(2, 5),
      type: 'leave' as 'leave' | 'swap',
      staffName: currentUser.name,
      roleName: currentUser.roleName,
      branchName: 'GrandStay Premier Thai Nguyen', // default branch
      leaveStartDate: newLeaveForm.startDate,
      leaveEndDate: newLeaveForm.endDate,
      leaveType: newLeaveForm.type,
      reason: newLeaveForm.reason,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setScheduleRequests(prev => [newReq, ...prev]);
    setNewLeaveForm({
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: ''
    });
    alert('Đã gửi yêu cầu xin nghỉ phép thành công!');
  };

  const handleCreateSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwapForm.originalDate || !newSwapForm.targetDate || !newSwapForm.reason || !newSwapForm.targetStaff) {
      alert('Vui lòng điền đầy đủ thông tin ngày, đồng nghiệp đổi ca và lý do!');
      return;
    }

    const newReq = {
      id: 'req-sch-' + Math.random().toString(36).substr(2, 5),
      type: 'swap' as 'leave' | 'swap',
      staffName: currentUser.name,
      roleName: currentUser.roleName,
      branchName: 'GrandStay Premier Thai Nguyen',
      originalShiftDate: newSwapForm.originalDate,
      originalShiftName: newSwapForm.originalShift,
      targetShiftDate: newSwapForm.targetDate,
      targetShiftName: newSwapForm.targetShift,
      targetStaffName: newSwapForm.targetStaff,
      reason: newSwapForm.reason,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setScheduleRequests(prev => [newReq, ...prev]);
    setNewSwapForm({
      originalDate: '',
      originalShift: 'Ca Sáng (06:00 - 14:00)',
      targetDate: '',
      targetShift: 'Ca Sáng (06:00 - 14:00)',
      targetStaff: '',
      reason: ''
    });
    alert('Đã gửi yêu cầu xin đổi ca làm việc thành công!');
  };

  const handleCreateLeaveRequestEx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leavesForm.startDate || !leavesForm.endDate || !leavesForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin ngày nghỉ và lý do!');
      return;
    }

    if (new Date(leavesForm.endDate) < new Date(leavesForm.startDate)) {
      alert('Ngày kết thúc không thể trước ngày bắt đầu!');
      return;
    }

    // Determine target staff details (default to current user or selected staff if manager is submitting on behalf)
    let finalStaffName = currentUser.name;
    let finalRoleName = currentUser.roleName;
    
    const isManager = currentUser.role === 'role-1' || currentUser.role === 'role-2' || currentUser.role === 'role-3';
    if (isManager && leavesForm.staffId) {
      const selectedStaff = staff.find((s: any) => s.id === leavesForm.staffId);
      if (selectedStaff) {
        finalStaffName = selectedStaff.name;
        const matchingRole = roles.find((r: any) => r.id === selectedStaff.roleId);
        finalRoleName = matchingRole ? matchingRole.name : 'Nhân viên';
      }
    }

    const newReq = {
      id: 'req-sch-' + Math.random().toString(36).substr(2, 5),
      type: 'leave' as 'leave' | 'swap',
      staffName: finalStaffName,
      roleName: finalRoleName,
      branchName: 'GrandStay Premier Thai Nguyen', // default branch
      leaveStartDate: leavesForm.startDate,
      leaveEndDate: leavesForm.endDate,
      leaveType: leavesForm.type,
      reason: leavesForm.reason,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setScheduleRequests(prev => [newReq, ...prev]);
    
    // reset form
    setLeavesForm(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
      reason: '',
      staffId: ''
    }));

    alert('Đã gửi yêu cầu xin nghỉ phép thành công!');
  };

  const handleActionLeaveRequest = (id: string, action: 'Approved' | 'Rejected') => {
    const comment = leavesResponseNotes[id] || '';
    setScheduleRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: action,
          approvedBy: currentUser.name,
          responseNotes: comment || (action === 'Approved' ? 'Đã chấp thuận đơn xin nghỉ phép.' : 'Không phê duyệt đơn nghỉ phép.')
        };
      }
      return req;
    }));
    alert(action === 'Approved' ? 'Đã duyệt nghỉ phép thành công!' : 'Đã từ chối đơn nghỉ phép.');
  };

  const handleActionScheduleRequest = (id: string, action: 'Approved' | 'Rejected') => {
    const notes = responseNotesState[id] || '';
    setScheduleRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: action,
          approvedBy: currentUser.name,
          responseNotes: notes || (action === 'Approved' ? 'Đã phê duyệt.' : 'Không phê duyệt yêu cầu.')
        };
      }
      return req;
    }));
    alert(action === 'Approved' ? 'Đã phê duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu.');
  };

  const handleUpdateShift = (staffId: string, date: string, newShift: string) => {
    setRoster(prev => prev.map(item => {
      if (item.staffId === staffId) {
        return {
          ...item,
          shifts: {
            ...item.shifts,
            [date]: newShift
          }
        };
      }
      return item;
    }));
    setEditingCell(null);
  };

  const handleCreateRoomAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditForm.roomId) {
      alert("Vui lòng chọn phòng cần kiểm kê vật tư!");
      return;
    }

    const selectedRoom = rooms.find((r: any) => r.id === newAuditForm.roomId);
    if (!selectedRoom) return;

    // Calculate total damage/replacement cost
    const totalCost = newAuditForm.items.reduce((sum, item) => sum + (item.cost || 0), 0);

    // Determine overall status
    let auditStatus = 'Full';
    const hasMissing = newAuditForm.items.some(item => item.actual < item.standard || item.status === 'Missing');
    const hasBroken = newAuditForm.items.some(item => item.status === 'Broken' || item.status === 'Damaged');
    if (hasBroken) {
      auditStatus = 'Damaged';
    } else if (hasMissing) {
      auditStatus = 'Deficit';
    }

    const newAudit = {
      id: 'audit-' + Math.floor(1000 + Math.random() * 9000),
      roomName: selectedRoom.name,
      branchName: selectedRoom.branchName,
      shift: newAuditForm.shift,
      auditor: newAuditForm.auditor,
      auditDate: new Date().toISOString().split('T')[0],
      status: auditStatus,
      items: [...newAuditForm.items],
      totalDamageCost: totalCost,
      notes: newAuditForm.notes || (totalCost > 0 ? `Kiểm tra ca phát hiện hỏng hóc/thiếu hụt vật tư. Tổng phí sửa chữa/đền bù: ${formatVND(totalCost)}` : 'Vật tư phòng đầy đủ, không hư hại.')
    };

    setRoomAudits(prev => [newAudit, ...prev]);

    // Also update room status to Dirty if needed or Repairing if damaged
    if (auditStatus === 'Damaged') {
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'Repairing' } : r));
    } else if (auditStatus === 'Deficit') {
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'Dirty' } : r));
    }

    // Reset items to standard quantities
    setNewAuditForm({
      roomId: '',
      shift: 'Ca Sáng (06:00 - 14:00)',
      auditor: currentUser.name,
      notes: '',
      items: [
        { name: 'Chăn ga gối', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Khăn tắm lớn', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Khăn mặt', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Dép đi trong phòng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Bàn chải & Kem đánh răng', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Lược chải đầu', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Nước suối miễn phí', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Trà & Cà phê gói', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 },
        { name: 'Ấm siêu tốc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
        { name: 'Máy sấy tóc', standard: 1, actual: 1, status: 'Good', notes: '', cost: 0 },
        { name: 'Ly thủy tinh', standard: 2, actual: 2, status: 'Good', notes: '', cost: 0 }
      ]
    });

    alert(`Đã tạo thành công biên bản kiểm kê vật tư phòng ${selectedRoom.name} sau ca trực!`);
  };

  const handleDeleteAudit = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biên bản kiểm kê này?")) {
      setRoomAudits(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleUpdateItemActual = (index: number, val: number) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { 
        ...updated[index], 
        actual: Math.max(0, val),
        status: Math.max(0, val) < updated[index].standard ? 'Missing' : 'Good' 
      };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemStatus = (index: number, status: string) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { 
        ...updated[index], 
        status,
        // Default costs if broken or missing to save typing time
        cost: status === 'Broken' && updated[index].cost === 0 ? (
          updated[index].name.includes('Ly') ? 50000 : 
          updated[index].name.includes('sấy') ? 350000 : 
          updated[index].name.includes('tốc') ? 250000 : 
          updated[index].name.includes('Khăn') ? 150000 : 0
        ) : status === 'Good' ? 0 : updated[index].cost
      };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemCost = (index: number, cost: number) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], cost: Math.max(0, cost) };
      return { ...prev, items: updated };
    });
  };

  const handleUpdateItemNotes = (index: number, notes: string) => {
    setNewAuditForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], notes };
      return { ...prev, items: updated };
    });
  };

  const handleAddDirectReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.guestName || !newResForm.phone || !newResForm.email) return;

    const bName = branches.find(b => b.id === newResForm.branchId)?.name || 'GrandStay Apartment';

    const newRes = {
      id: 'BK-' + Math.floor(100 + Math.random() * 900),
      guestName: newResForm.guestName,
      phone: newResForm.phone,
      email: newResForm.email,
      branchId: newResForm.branchId,
      branchName: bName,
      roomName: newResForm.roomName,
      checkIn: newResForm.checkIn,
      checkOut: newResForm.checkOut,
      status: 'Reserved',
      totalPrice: Number(newResForm.totalPrice),
      rooms: 1,
      specialRequest: newResForm.specialRequest
    };

    setReservations(prev => [newRes, ...prev]);
    
    setRooms(prev => prev.map(room => {
      const roomMatch = room.name.toLowerCase().includes(newResForm.roomName.split(' ')[0].toLowerCase());
      const branchMatch = room.branchId === newResForm.branchId;
      if (roomMatch && branchMatch) {
        return { ...room, occupancy: 'Reserved' };
      }
      return room;
    }));

    setNewResForm({
      guestName: '',
      phone: '',
      email: '',
      branchId: 'thai-nguyen',
      roomName: 'Phòng 101 (Deluxe Double)',
      checkIn: '2026-06-27',
      checkOut: '2026-06-30',
      totalPrice: 6000000,
      specialRequest: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Admin Panel Content - full page view */}
      <div className="w-full min-h-[80vh] bg-slate-50 rounded-3xl shadow-xl flex flex-col overflow-hidden border border-slate-200">
        
            {/* Admin Banner & Portal Title */}
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                    GrandStay Admin Control Center
                    <span className="text-[10px] uppercase tracking-widest bg-blue-500/30 text-blue-400 font-extrabold px-1.5 py-0.5 rounded-full border border-blue-500/20">System Root</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Quản trị chuỗi khách sạn nghỉ dưỡng và căn hộ cao cấp • <span className="font-bold text-blue-400">{currentUser.name} ({currentUser.roleName})</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={onBackToHome}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-white/10"
              >
                <Home className="w-3.5 h-3.5 text-slate-300" />
                <span>Quay lại Trang Chủ</span>
              </button>
            </header>

            {/* Portal Workspace (Sidebar + Content) */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar Navigation - Filtered dynamically based on permissions */}
              <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-none">
                
                {userPermissions.includes('view_dashboard') && (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mb-2">Hệ Thống & Doanh Thu</p>
                    <button
                      onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Doanh Thu & Dashboard
                    </button>
                  </>
                )}

                {(userPermissions.includes('manage_hotels') || userPermissions.includes('manage_apartments') || userPermissions.includes('manage_contracts')) && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mt-4 mb-2">Danh Mục Dịch Vụ</p>
                )}

                {userPermissions.includes('manage_hotels') && (
                  <button
                    onClick={() => { setActiveTab('hotels'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'hotels' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Building className="w-4 h-4" />
                    Quản lý Khách Sạn ({branches.length})
                  </button>
                )}

                {userPermissions.includes('manage_apartments') && (
                  <button
                    onClick={() => { setActiveTab('apartments'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'apartments' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Home className="w-4 h-4" />
                    Quản lý Căn Hộ ({apartments.length})
                  </button>
                )}

                {userPermissions.includes('manage_contracts') && (
                  <button
                    onClick={() => { setActiveTab('contracts'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'contracts' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <FileText className="w-4 h-4" />
                    Quản lý Hợp Đồng ({contracts.length})
                    {pendingContractsCount > 0 && (
                      <span className="ml-auto w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    )}
                  </button>
                )}

                {/* Operations Desk */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mt-4 mb-2">Vận Hành & Dịch Vụ</p>
                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveTab('operations'); setSearchTerm(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'operations' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Briefcase className={`w-4 h-4 ${activeTab === 'operations' ? 'text-white' : 'text-blue-500'}`} />
                    Bàn Vận Hành Khách Sạn
                    <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">Live</span>
                  </button>

                  {/* Sub-menu items for Operations */}
                  {activeTab === 'operations' && (
                    <div className="pl-4 pr-1 py-1 space-y-1 bg-slate-50/50 rounded-lg border-l-2 border-slate-200/80 ml-4.5 animate-fade-in">
                      <button
                        onClick={() => { navigate('/admin/operations/calendar'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/calendar') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Lịch Đặt & Quầy Lễ Tân
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/housekeeping'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/housekeeping') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Buồng Phòng
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/requests'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/requests') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Yêu Cầu Khách
                        {requests.filter((r: any) => r.status === 'Pending' || r.status === 'Processing').length > 0 && (
                          <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {requests.filter((r: any) => r.status === 'Pending' || r.status === 'Processing').length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/complaints'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/complaints') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Khiếu Nại
                        {complaints.filter((c: any) => c.status === 'Open' || c.status === 'Investigating').length > 0 && (
                          <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {complaints.filter((c: any) => c.status === 'Open' || c.status === 'Investigating').length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/dailylogs'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/dailylogs') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Nhật Ký Ca Trực
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/schedule'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/schedule') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Nghỉ Phép & Đổi Ca
                        {scheduleRequests.filter((r: any) => r.status === 'Pending').length > 0 && (
                          <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {scheduleRequests.filter((r: any) => r.status === 'Pending').length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => { navigate('/admin/operations/availability'); setSearchTerm(''); }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${location.pathname.includes('/operations/availability') ? 'bg-white text-blue-700 font-extrabold shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Lịch Trống & Khóa Phòng
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setActiveTab('tours'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'tours' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Compass className="w-4 h-4 text-emerald-500" />
                  Quản lý Tour & Tour Ghép
                  <span className="ml-auto bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Tour</span>
                </button>

                {userPermissions.includes('manage_roles_staff') && (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mt-4 mb-2">Phân Quyền & Nhân Sự</p>
                    <button
                      onClick={() => { setActiveTab('roles'); setSearchTerm(''); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Layers className="w-4 h-4" />
                      Tạo & Gán Quyền Vai Trò
                    </button>
                    <button
                      onClick={() => { setActiveTab('staff'); setSearchTerm(''); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Users className="w-4 h-4" />
                      Gán Vai Trò Nhân Viên
                    </button>
                  </>
                )}

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mt-4 mb-2">Đơn Từ & Nghỉ Phép</p>
                <button
                  onClick={() => { setActiveTab('leaves'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'leaves' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Quản lý Nghỉ Phép
                  {scheduleRequests.filter((r: any) => r.type === 'leave' && r.status === 'Pending').length > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {scheduleRequests.filter((r: any) => r.type === 'leave' && r.status === 'Pending').length}
                    </span>
                  )}
                </button>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mt-4 mb-2">Giao Diện & Cấu Hình</p>
                <button
                  onClick={() => { setActiveTab('footer'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'footer' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <LayoutTemplate className="w-4 h-4 text-pink-500" />
                  Cấu Hình Footer Website
                  <span className="ml-auto bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Footer</span>
                </button>

                <button
                  onClick={() => { setActiveTab('banners'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'banners' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Image className="w-4 h-4 text-amber-500" />
                  Quản Lý Banners & Slides
                  <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Hero</span>
                </button>

                <button
                  onClick={() => { setActiveTab('policies'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'policies' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Chính Sách Hoàn Tiền
                  <span className="ml-auto bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Policy</span>
                </button>

              </aside>

              {/* Central Workspace Canvas */}
              <main className="flex-grow p-6 overflow-y-auto bg-slate-50">
                {/* Search Bar filter dynamically applied except for Dashboard & Roles */}
                {activeTab !== 'dashboard' && activeTab !== 'roles' && activeTab !== 'operations' && activeTab !== 'footer' && activeTab !== 'banners' && (
                  <div className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={
                          activeTab === 'hotels' ? 'Tìm khách sạn theo tên hoặc khu vực...' :
                          activeTab === 'apartments' ? 'Tìm căn hộ theo tên hoặc thành phố...' :
                          activeTab === 'contracts' ? 'Tìm hợp đồng theo tên khách, căn hộ, mã hợp đồng...' :
                          activeTab === 'leaves' ? 'Tìm đơn nghỉ phép theo tên nhân viên, lý do...' :
                          'Tìm kiếm nhân viên...'
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-lg text-xs transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 focus:outline-none"
                      />
                    </div>
                    
                    {/* Primary CRUD buttons */}
                    {activeTab === 'hotels' && (
                      <button 
                        onClick={() => {
                          setEditingHotel(null);
                          setHotelForm({ id: '', name: '', region: 'Northern Highlands', brand: 'GrandStay Premier', description: '', image: '', pricePerNight: 2000000, amenities: ['Free Wi-Fi', 'Pool', 'Gym'], virtualTourUrl: '' });
                          setShowHotelModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 h-9.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm shadow-slate-950/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Khách Sạn
                      </button>
                    )}

                    {activeTab === 'apartments' && (
                      <button 
                        onClick={() => {
                          setEditingApt(null);
                          setAptForm({ id: '', name: '', location: 'Saigon', type: 'Studio', area: 40, bedrooms: 1, bathrooms: 1, monthlyPrice: 20000000, image: '', description: '', amenities: ['Kitchen', 'Washing Machine', 'Desk', 'High-speed Wi-Fi', 'Smart Lock'], petFriendly: true, hasVirtualTour: true, virtualTourUrl: '' });
                          setShowAptModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 h-9.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm shadow-slate-950/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Căn Hộ
                      </button>
                    )}

                    {activeTab === 'staff' && (
                      <button 
                        onClick={() => {
                          setEditingStaff(null);
                          setStaffForm({ name: '', email: '', phone: '', roleId: roles[0]?.id || 'role-4', status: 'Active' });
                          setShowStaffModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 h-9.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm shadow-slate-950/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Nhân Viên
                      </button>
                    )}
                  </div>
                )}

                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" replace />} />
                  {/* ==================== TAB 1: REVENUE DASHBOARD ==================== */}
                  <Route path="dashboard" element={
                    <AdminDashboardTab />
                  } />

                  {/* ==================== TAB 2: HOTEL MANAGEMENT ==================== */}
                  <Route path="hotels" element={
                    <AdminHotelsTab />
                  } />

                  {/* ==================== TAB 3: APARTMENT MANAGEMENT ==================== */}
                  <Route path="apartments" element={
                    <AdminApartmentsTab
                      apartments={apartments}
                      searchTerm={searchTerm}
                      aptStatusFilter={aptStatusFilter}
                      setAptStatusFilter={setAptStatusFilter}
                      activeTourUrl={activeTourUrl}
                      setActiveTourUrl={setActiveTourUrl}
                      setEditingApt={setEditingApt}
                      setAptForm={setAptForm}
                      setShowAptModal={setShowAptModal}
                      setApartments={setApartments}
                    />
                  } />


                  {/* ==================== TAB 4: CONTRACTS MANAGEMENT ==================== */}
                  <Route path="contracts" element={
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm">Quản Lý Thỏa Thuận & Hợp Đồng Cho Thuê</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Đã Ký: {activeContractsCount}</span>
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">Chờ duyệt: {pendingContractsCount}</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingContract(null);
                            setContractForm({
                              tenantName: '',
                              tenantPhone: '',
                              tenantEmail: '',
                              aptName: '',
                              location: 'Saigon',
                              monthlyPrice: 0,
                              leaseTerm: 12,
                              signedDate: new Date().toISOString().split('T')[0],
                              status: 'Pending',
                              vatAndFeesText: 'Chưa bao gồm thuế GTGT và phí quản lý dịch vụ tiện ích phát sinh thực tế',
                              additionalTerms: 'Cư dân cam kết tuân thủ quy định nội quy tòa nhà, không tự ý cải tạo kết cấu khi chưa được sự đồng ý bằng văn bản của Bên A. Hợp đồng có giá trị pháp lý tương đương bản cứng sau khi được phê duyệt trên cổng GrandStay Admin.'
                            });
                            setShowContractModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm Hợp Đồng
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-5 py-3 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Mã Hợp Đồng</th>
                            <th className="px-5 py-3">Cư Dân Ký Kết (Khách hàng)</th>
                            <th className="px-5 py-3">Căn Hộ Liên Kết</th>
                            <th className="px-5 py-3">Giá Thuê / Kỳ Hạn</th>
                            <th className="px-5 py-3">Ngày Ký Bản Gốc</th>
                            <th className="px-5 py-3">Trạng Thái</th>
                            <th className="px-5 py-3 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(() => {
                            const filtered = contracts.filter(c => c.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || c.aptName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()));
                            const startIdx = (contractsPage - 1) * contractsPerPage;
                            return filtered.slice(startIdx, startIdx + contractsPerPage).map((contract) => (
                              <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-5 py-4 font-mono font-bold text-blue-700 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">{contract.id}</td>
                                <td className="px-5 py-4">
                                  <div className="space-y-0.5">
                                    <h4 className="font-bold text-slate-900">{contract.tenantName}</h4>
                                    <p className="text-[10px] text-slate-400 font-mono">{contract.tenantPhone} • {contract.tenantEmail}</p>
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-bold text-slate-800">
                                  {contract.aptName}
                                  <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">Khu vực: TP. {contract.location}</span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-bold text-slate-900 block">{formatVND(contract.monthlyPrice)} /tháng</span>
                                  <span className="text-[10px] text-slate-500 font-bold">Kỳ hạn: {contract.leaseTerm} tháng</span>
                                </td>
                                <td className="px-5 py-4 text-slate-500">{contract.signedDate}</td>
                                <td className="px-5 py-4">
                                  {contract.status === 'Approved' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Đang hiệu lực
                                    </span>
                                  ) : contract.status === 'Pending' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 animate-pulse">
                                      <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                                      Chờ phê duyệt
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      Đã thanh lý
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setSelectedContractDetail(contract)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                                      title="Xem hợp đồng chi tiết"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {contract.status !== 'Approved' && (
                                      <button
                                        onClick={() => {
                                          setEditingContract(contract);
                                          setContractForm({
                                            tenantName: contract.tenantName,
                                            tenantPhone: contract.tenantPhone,
                                            tenantEmail: contract.tenantEmail,
                                            aptName: contract.aptName,
                                            location: contract.location || 'Saigon',
                                            monthlyPrice: contract.monthlyPrice,
                                            leaseTerm: contract.leaseTerm,
                                            signedDate: contract.signedDate,
                                            status: contract.status,
                                            vatAndFeesText: contract.vatAndFeesText || 'Chưa bao gồm thuế GTGT và phí quản lý dịch vụ tiện ích phát sinh thực tế',
                                            additionalTerms: contract.additionalTerms || 'Cư dân cam kết tuân thủ quy định nội quy tòa nhà, không tự ý cải tạo kết cấu khi chưa được sự đồng ý bằng văn bản của Bên A. Hợp đồng có giá trị pháp lý tương đương bản cứng sau khi được phê duyệt trên cổng GrandStay Admin.'
                                          });
                                          setShowContractModal(true);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 cursor-pointer"
                                        title="Chỉnh sửa nội dung"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    
                                    {contract.status === 'Pending' && (
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Bạn có đồng ý phê duyệt trực tuyến hợp đồng này không?')) {
                                            setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, status: 'Approved' } : c));
                                          }
                                        }}
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer border border-emerald-200"
                                        title="Duyệt hợp đồng"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn huỷ hoặc thanh lý hợp đồng này không?')) {
                                          setContracts(prev => prev.filter(c => c.id !== contract.id));
                                        }
                                      }}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600 cursor-pointer"
                                      title="Huỷ hợp đồng"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={contractsPage}
                      totalItems={contracts.filter(c => c.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || c.aptName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).length}
                      itemsPerPage={contractsPerPage}
                      onPageChange={setContractsPage}
                      onItemsPerPageChange={setContractsPerPage}
                      variant="table"
                    />
                  </div>
                } />


                  {/* ==================== TAB 5: CREATING & ASSIGNING ROLES ==================== */}
                  <Route path="roles" element={
                  <div className="space-y-6">
                    {/* Intro */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="font-extrabold text-slate-900 text-sm">Tạo & Thiết Lập Vai Trò Hệ Thống</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Xây dựng các chức vụ công việc, cấu hình nhóm quyền hạn của từng chức vụ. Nhóm quyền này sẽ tự động áp dụng khi gán vai trò tương ứng cho nhân sự.
                      </p>
                      
                      <div className="mt-4 flex justify-start">
                        <button
                          onClick={() => {
                            setEditingRole(null);
                            setRoleForm({ name: '', desc: '', permissions: [] });
                            setShowRoleModal(true);
                          }}
                          className="flex items-center gap-1.5 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm Vai Trò Mới
                        </button>
                      </div>
                    </div>

                    {/* Roles Matrix / Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roles.map((role) => (
                        <div key={role.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                <ShieldAlert className="w-4.5 h-4.5 text-blue-600" />
                                {role.name}
                              </h4>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingRole(role);
                                    setRoleForm({ name: role.name, desc: role.desc, permissions: role.permissions });
                                    setShowRoleModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="Chỉnh sửa quyền"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (roles.length <= 1) {
                                      alert('Không thể xoá vai trò duy nhất còn lại của hệ thống!');
                                      return;
                                    }
                                    if (window.confirm(`Bạn có chắc muốn xoá vai trò: ${role.name}? Tất cả nhân viên trực thuộc vai trò này sẽ tạm thời mất quyền.`)) {
                                      setRoles(prev => prev.filter(r => r.id !== role.id));
                                    }
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Xoá vai trò"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{role.desc}</p>
                          </div>

                          {/* Permission List of this role */}
                          <div className="p-5 flex-grow space-y-2.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh Sách Quyền Hạn Được Gán</p>
                            <div className="space-y-2">
                              {SYSTEM_PERMISSIONS.map((perm) => {
                                const hasPerm = role.permissions.includes(perm.id);
                                return (
                                  <div 
                                    key={perm.id} 
                                    onClick={() => {
                                      // Toggle permission instantly on click for faster operations!
                                      const updatedPerms = hasPerm 
                                        ? role.permissions.filter(p => p !== perm.id)
                                        : [...role.permissions, perm.id];
                                      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: updatedPerms } : r));
                                    }}
                                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${hasPerm ? 'bg-blue-50/45 border-blue-100 text-slate-800' : 'bg-slate-50/50 border-slate-100 text-slate-400/80'}`}
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${hasPerm ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <div>
                                      <h5 className={`font-bold text-xs ${hasPerm ? 'text-slate-900' : 'text-slate-500'}`}>{perm.name}</h5>
                                      <p className="text-[9px] text-slate-400 mt-0.5">{perm.desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                } />


                    {/* ==================== TAB 6: STAFF ROLE ASSIGNMENT ==================== */}
                    <Route path="staff" element={
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm">Danh Sách Nhân Sự & Gán Chức Vụ</h3>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{staff.length} Thành viên</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-5 py-3 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Nhân Viên</th>
                            <th className="px-5 py-3">Liên Hệ</th>
                            <th className="px-5 py-3">Vai Trò Đảm Nhiệm</th>
                            <th className="px-5 py-3">Quyền Hạn Thực Tế</th>
                            <th className="px-5 py-3">Trạng Thái</th>
                            <th className="px-5 py-3 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(() => {
                            const filtered = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));
                            const startIdx = (staffPage - 1) * staffPerPage;
                            return filtered.slice(startIdx, startIdx + staffPerPage).map((member) => {
                              const matchingRole = roles.find(r => r.id === member.roleId);
                              return (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-5 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-blue-100 text-blue-700 font-bold flex items-center justify-center rounded-full text-xs">
                                        {member.name.split(' ').pop()?.charAt(0)}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-slate-900 leading-snug">{member.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-mono">Staff ID: {member.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="space-y-0.5">
                                      <span className="block text-slate-700">{member.email}</span>
                                      <span className="text-[10px] text-slate-400">{member.phone}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    {/* Interactive Select inline for instant assignment! */}
                                    <select
                                      value={member.roleId}
                                      onChange={(e) => {
                                        const newRoleId = e.target.value;
                                        setStaff(prev => prev.map(s => s.id === member.id ? { ...s, roleId: newRoleId } : s));
                                      }}
                                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                      {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                      {matchingRole?.permissions.map((permId) => {
                                        const permName = SYSTEM_PERMISSIONS.find(p => p.id === permId)?.name.split(' ').slice(-2).join(' ');
                                        return (
                                          <span key={permId} className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-extrabold border border-blue-100/30">
                                            {permName || permId}
                                          </span>
                                        );
                                      })}
                                      {(!matchingRole || matchingRole.permissions.length === 0) && (
                                        <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Không có quyền</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    {member.status === 'Active' ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        Đang hoạt động
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        Đang tạm khóa
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                      <button 
                                        onClick={() => {
                                          setEditingStaff(member);
                                          setStaffForm({
                                            name: member.name,
                                            email: member.email,
                                            phone: member.phone,
                                            roleId: member.roleId,
                                            status: member.status
                                          });
                                          setShowStaffModal(true);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 cursor-pointer"
                                        title="Chỉnh sửa thông tin"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (window.confirm(`Bạn có chắc muốn xoá nhân viên ${member.name} khỏi hệ thống?`)) {
                                            setStaff(prev => prev.filter(s => s.id !== member.id));
                                          }
                                        }}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600 cursor-pointer"
                                        title="Xoá nhân viên"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={staffPage}
                      totalItems={staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase())).length}
                      itemsPerPage={staffPerPage}
                      onPageChange={setStaffPage}
                      onItemsPerPageChange={setStaffPerPage}
                      variant="table"
                    />
                  </div>
                } />

                    {/* ==================== OPERATIONS LAYOUT ==================== */}
                    <Route path="operations/*" element={
                      <OperationsLayout
                        branches={branches}
                        apartments={apartments}
                        setApartments={setApartments}
                        rooms={rooms}
                        reservations={reservations}
                        currentUser={currentUser}
                      />
                    } />
                    {/* ==================== TAB 8: LEAVE MANAGEMENT PANEL ==================== */}
                    <Route path="leaves" element={
                  <div className="space-y-6 animate-fade-in" id="leave-management-panel">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest block mb-1">
                          Hệ Thống Phân Hệ Nội Bộ
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-blue-200" />
                          Quản Lý Nghỉ Phép (Leave Management)
                        </h2>
                        <p className="text-xs text-blue-100 mt-1">
                          Đăng ký nghỉ phép trực tuyến dành cho nhân viên và phê duyệt tự động/thủ công bởi ban quản lý.
                        </p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-xs text-right">
                        <span className="block text-blue-200 font-bold uppercase text-[9px]">Tài khoản hiện tại</span>
                        <span className="font-extrabold text-white text-sm">{currentUser.name}</span>
                        <span className="block text-[10px] text-blue-200">{currentUser.roleName}</span>
                      </div>
                    </div>

                    {/* Left & Right Grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Column: Stats & Submission Form */}
                      <div className="lg:col-span-5 space-y-6">
                        
                        {/* 1. Leave Quota & Stats Card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                            Quỹ Phép Của Bạn (My Leave Balance)
                          </h3>
                          
                          {(() => {
                            const myApprovedLeaves = scheduleRequests.filter((r: any) => 
                              r.type === 'leave' && 
                              r.status === 'Approved' && 
                              r.staffName === currentUser.name
                            );
                            
                            const getDays = (start: string, end: string) => {
                              try {
                                const s = new Date(start);
                                const e = new Date(end);
                                if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
                                return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
                              } catch {
                                return 1;
                              }
                            };

                            const takenAnnual = myApprovedLeaves
                              .filter((r: any) => r.leaveType === 'annual')
                              .reduce((sum: number, r: any) => sum + getDays(r.leaveStartDate, r.leaveEndDate), 0);

                            const takenSick = myApprovedLeaves
                              .filter((r: any) => r.leaveType === 'sick')
                              .reduce((sum: number, r: any) => sum + getDays(r.leaveStartDate, r.leaveEndDate), 0);

                            const takenUnpaid = myApprovedLeaves
                              .filter((r: any) => r.leaveType === 'unpaid')
                              .reduce((sum: number, r: any) => sum + getDays(r.leaveStartDate, r.leaveEndDate), 0);

                            const annualQuota = 12;
                            const sickQuota = 5;
                            
                            const annualRemaining = Math.max(0, annualQuota - takenAnnual);
                            const sickRemaining = Math.max(0, sickQuota - takenSick);

                            return (
                              <div className="space-y-4">
                                {/* Annual Leave Progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-700">✈️ Phép Thường Niên (Có lương)</span>
                                    <span className="text-slate-900">{annualRemaining} / {annualQuota} ngày</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${(annualRemaining / annualQuota) * 100}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                    <span>Đã dùng: {takenAnnual} ngày</span>
                                    <span>Còn lại: {annualRemaining} ngày</span>
                                  </div>
                                </div>

                                {/* Sick Leave Progress */}
                                <div className="space-y-1 pt-2 border-t border-slate-50">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-700">🏥 Nghỉ Ốm Đau (Hưởng BHXH)</span>
                                    <span className="text-slate-900">{sickRemaining} / {sickQuota} ngày</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${(sickRemaining / sickQuota) * 100}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                    <span>Đã dùng: {takenSick} ngày</span>
                                    <span>Hạn mức năm: {sickQuota} ngày</span>
                                  </div>
                                </div>

                                {/* Unpaid Leave Summary */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                                  <span>💼 Nghỉ Việc Riêng Không Lương:</span>
                                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 font-extrabold">{takenUnpaid} ngày</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 2. Submit Leave Form */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h3 className="font-extrabold text-slate-950 text-sm">
                              Tạo Đơn Đăng Ký Nghỉ Phép
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Điền đầy đủ thông tin để gửi phê duyệt trực tuyến.
                            </p>
                          </div>

                          <form onSubmit={handleCreateLeaveRequestEx} className="space-y-4">
                            {/* Manager Mode - Submit on behalf of other staff */}
                            {(currentUser.role === 'role-1' || currentUser.role === 'role-2' || currentUser.role === 'role-3') && (
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Nộp hộ nhân viên (Manager Only)
                                </label>
                                <select
                                  value={leavesForm.staffId}
                                  onChange={(e) => setLeavesForm({ ...leavesForm, staffId: e.target.value })}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
                                >
                                  <option value="">-- Tự gửi đơn (Bản thân) --</option>
                                  {staff.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.roleId === 'role-4' ? 'Lễ Tân' : s.roleId === 'role-5' ? 'Buồng Phòng' : 'Nhân viên'})</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Leave Type */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Loại hình nghỉ phép
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { value: 'annual', label: 'P. Năm', desc: 'Có lương', icon: '✈️' },
                                  { value: 'sick', label: 'Ốm đau', desc: 'BHXH duyệt', icon: '🏥' },
                                  { value: 'unpaid', label: 'V. Riêng', desc: 'Ko lương', icon: '💼' }
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setLeavesForm({ ...leavesForm, type: opt.value as any })}
                                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                      leavesForm.type === opt.value
                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-base mb-0.5">{opt.icon}</span>
                                    <span className="text-[10px] font-extrabold text-slate-800 block">{opt.label}</span>
                                    <span className="text-[8px] text-slate-400 font-medium block mt-0.5">{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Date inputs */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Từ ngày</label>
                                <input
                                  type="date"
                                  required
                                  value={leavesForm.startDate}
                                  onChange={(e) => setLeavesForm({ ...leavesForm, startDate: e.target.value })}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Đến hết ngày</label>
                                <input
                                  type="date"
                                  required
                                  value={leavesForm.endDate}
                                  onChange={(e) => setLeavesForm({ ...leavesForm, endDate: e.target.value })}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {/* Predefined Quick Reasons */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Gợi ý lý do nhanh
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'Giải quyết việc riêng gia đình đột xuất',
                                  'Khám sức khoẻ định kỳ bệnh viện',
                                  'Nghỉ mát hàng năm cùng gia đình',
                                  'Sức khoẻ không tốt, cần nghỉ ngơi'
                                ].map(reasonPreset => (
                                  <button
                                    key={reasonPreset}
                                    type="button"
                                    onClick={() => setLeavesForm({ ...leavesForm, reason: reasonPreset })}
                                    className="text-[9px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded px-2 py-1 max-w-[200px] truncate cursor-pointer animate-none"
                                    title={reasonPreset}
                                  >
                                    {reasonPreset.slice(0, 20)}...
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Detail Reason */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Chi tiết lý do nghỉ phép
                              </label>
                              <textarea
                                required
                                rows={3}
                                value={leavesForm.reason}
                                onChange={(e) => setLeavesForm({ ...leavesForm, reason: e.target.value })}
                                placeholder="Ghi cụ thể lý do bàn giao công việc..."
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
                              />
                            </div>

                            {/* Real-time Calculation Summary */}
                            {leavesForm.startDate && leavesForm.endDate && (
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[11px] font-bold text-blue-800 flex items-center justify-between">
                                <span>Tổng thời gian nghỉ đăng ký:</span>
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                                  {(() => {
                                    const s = new Date(leavesForm.startDate);
                                    const e = new Date(leavesForm.endDate);
                                    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '1 ngày';
                                    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
                                    return `${diff} ngày`;
                                  })()}
                                </span>
                              </div>
                            )}

                            {/* Submit Button */}
                            <button
                              type="submit"
                              className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CalendarDays className="w-4 h-4" /> Đăng Ký Đơn Nghỉ Phép
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right Column: List of Leaves with Manager Controls */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Filters Panel */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                              Danh Sách Yêu Cầu Nghỉ Phép
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold">
                              Tổng cộng: {scheduleRequests.filter((r: any) => r.type === 'leave').length} đơn
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Filter Status */}
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Bộ lọc Trạng Thái</span>
                              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
                                {[
                                  { key: 'All', label: 'Tất cả' },
                                  { key: 'Pending', label: 'Chờ duyệt' },
                                  { key: 'Approved', label: 'Duyệt' }
                                ].map(statusItem => (
                                  <button
                                    key={statusItem.key}
                                    type="button"
                                    onClick={() => setLeavesStatusFilter(statusItem.key as any)}
                                    className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                      leavesStatusFilter === statusItem.key
                                        ? 'bg-white text-slate-950 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {statusItem.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Filter Type */}
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Loại Nghỉ Phép</span>
                              <select
                                value={leavesTypeFilter}
                                onChange={(e) => setLeavesTypeFilter(e.target.value as any)}
                                className="w-full bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none border border-slate-200/40 cursor-pointer"
                              >
                                <option value="All">Tất cả các loại nghỉ</option>
                                <option value="annual">Nghỉ phép thường niên</option>
                                <option value="sick">Nghỉ ốm / Khám bệnh</option>
                                <option value="unpaid">Nghỉ việc riêng không lương</option>
                              </select>
                            </div>

                            {/* Filter Scope / My Requests vs All Staff */}
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1 font-sans">Đối Tượng Xem</span>
                              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
                                {[
                                  { key: 'All', label: 'Toàn nhân sự' },
                                  { key: 'Mine', label: 'Chỉ của tôi' }
                                ].map(scopeItem => (
                                  <button
                                    key={scopeItem.key}
                                    type="button"
                                    onClick={() => setLeavesScopeFilter(scopeItem.key as any)}
                                    className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                      leavesScopeFilter === scopeItem.key
                                        ? 'bg-white text-slate-950 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {scopeItem.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* List of Leave requests */}
                        <div className="space-y-4">
                          {(() => {
                            const filteredLeaves = scheduleRequests
                              .filter((r: any) => r.type === 'leave')
                              .filter((r: any) => {
                                if (!searchTerm) return true;
                                const search = searchTerm.toLowerCase();
                                return (
                                  r.staffName.toLowerCase().includes(search) ||
                                  (r.reason && r.reason.toLowerCase().includes(search)) ||
                                  r.roleName.toLowerCase().includes(search)
                                );
                              })
                              .filter((r: any) => {
                                if (leavesStatusFilter === 'All') return true;
                                return r.status === leavesStatusFilter;
                              })
                              .filter((r: any) => {
                                if (leavesTypeFilter === 'All') return true;
                                return r.leaveType === leavesTypeFilter;
                              })
                              .filter((r: any) => {
                                if (leavesScopeFilter === 'Mine') {
                                  return r.staffName === currentUser.name;
                                }
                                return true;
                              });

                            if (filteredLeaves.length === 0) {
                              return (
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
                                  Không tìm thấy đơn nghỉ phép nào trùng khớp với bộ lọc.
                                </div>
                              );
                            }

                            const startIdx = (leavesPage - 1) * leavesPerPage;
                            return filteredLeaves.slice(startIdx, startIdx + leavesPerPage).map((req: any) => {
                              const isPending = req.status === 'Pending';
                              const isApproved = req.status === 'Approved';
                              
                              const isManager = currentUser.role === 'role-1' || currentUser.role === 'role-2' || currentUser.role === 'role-3';

                              const sDate = new Date(req.leaveStartDate);
                              const eDate = new Date(req.leaveEndDate);
                              const durationDays = isNaN(sDate.getTime()) || isNaN(eDate.getTime()) 
                                ? 1 
                                : Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)) + 1);

                              return (
                                <div 
                                  key={req.id}
                                  className={`p-5 rounded-2xl bg-white border shadow-sm transition-all hover:border-slate-300 ${
                                    isPending ? 'border-amber-200/80 bg-gradient-to-r from-white to-amber-50/10' :
                                    isApproved ? 'border-emerald-200/60 bg-gradient-to-r from-white to-emerald-50/5' : 'border-slate-200'
                                  }`}
                                >
                                  {/* Top header of request item */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center rounded-xl text-xs border border-indigo-100">
                                        {req.staffName.split(' ').pop()?.charAt(0) || 'S'}
                                      </div>
                                      <div>
                                        <h4 className="font-extrabold text-slate-900 text-xs leading-snug flex items-center gap-1.5">
                                          {req.staffName}
                                          {req.staffName === currentUser.name && (
                                            <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-1.5 py-0.5 rounded">Tôi</span>
                                          )}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-bold">{req.roleName} • {req.branchName || 'GrandStay Premier'}</p>
                                      </div>
                                    </div>

                                    {/* Simple Status Indicator */}
                                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                      {isPending ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                                          ⏳ Đang chờ duyệt
                                        </span>
                                      ) : isApproved ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                          ✅ Đã chấp thuận
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                                          ❌ Từ chối
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Leave Specific details */}
                                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                                      <span className="text-[9px] text-slate-400 block uppercase mb-0.5">Thời Gian Đăng Ký</span>
                                      <span className="text-slate-900 flex items-center gap-1">
                                        <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        {req.leaveStartDate} ➔ {req.leaveEndDate}
                                      </span>
                                    </div>

                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                                      <span className="text-[9px] text-slate-400 block uppercase mb-0.5">Hình Thức & Độ Dài</span>
                                      <div className="flex items-center justify-between">
                                        <span className="text-indigo-700">
                                          {req.leaveType === 'annual' ? '✈️ Phép thường niên' : req.leaveType === 'sick' ? '🏥 Nghỉ phép ốm' : '💼 Không lương'}
                                        </span>
                                        <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded-md font-extrabold">
                                          {durationDays} ngày
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Leave Reason quotes */}
                                  <div className="mt-3.5">
                                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Lý do nghỉ:</span>
                                    <p className="text-xs text-slate-600 font-medium italic bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-1">
                                      "{req.reason}"
                                    </p>
                                  </div>

                                  {/* Approval / Rejection Action Area */}
                                  <div className="mt-4 pt-4 border-t border-slate-100">
                                    {isPending ? (
                                      isManager ? (
                                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                                          <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                                              Ghi chú của quản lý (Ý kiến phê duyệt)
                                            </label>
                                            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                              Manager Control
                                            </span>
                                          </div>
                                          
                                          <input 
                                            type="text"
                                            placeholder="Ghi chú phản hồi (ví dụ: Đồng ý duyệt, Đã có người làm thay...)"
                                            value={leavesResponseNotes[req.id] || ''}
                                            onChange={(e) => setLeavesResponseNotes({ ...leavesResponseNotes, [req.id]: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />

                                          <div className="flex items-center gap-2 pt-1">
                                            <button
                                              type="button"
                                              onClick={() => handleActionLeaveRequest(req.id, 'Approved')}
                                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
                                            >
                                              <Check className="w-3.5 h-3.5" /> Đồng ý phê duyệt
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleActionLeaveRequest(req.id, 'Rejected')}
                                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
                                            >
                                              <X className="w-3.5 h-3.5" /> Từ chối đơn xin
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Đơn đang chờ ban giám đốc hoặc quản lý phê duyệt trực tuyến.
                                        </div>
                                      )
                                    ) : (
                                      /* Display result notes */
                                      <div className="bg-slate-50 rounded-2xl p-3 text-xs border border-slate-100 space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Ý kiến ban quản lý:
                                          </span>
                                        </div>
                                        <p className="font-extrabold text-slate-800 italic pl-3">
                                          "{req.responseNotes || 'Đơn đã được xử lý.'}"
                                        </p>
                                        <div className="text-[9px] text-slate-400 font-bold flex justify-between pt-1">
                                          <span>Phê duyệt bởi: {req.approvedBy || 'Quản lý hệ thống'}</span>
                                          <span>Mã đơn: {req.id}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}

                          <Pagination
                            currentPage={leavesPage}
                            totalItems={scheduleRequests
                              .filter((r: any) => r.type === 'leave')
                              .filter((r: any) => {
                                if (!searchTerm) return true;
                                const search = searchTerm.toLowerCase();
                                return (
                                  r.staffName.toLowerCase().includes(search) ||
                                  (r.reason && r.reason.toLowerCase().includes(search)) ||
                                  r.roleName.toLowerCase().includes(search)
                                );
                              })
                              .filter((r: any) => {
                                if (leavesStatusFilter === 'All') return true;
                                return r.status === leavesStatusFilter;
                              })
                              .filter((r: any) => {
                                if (leavesTypeFilter === 'All') return true;
                                return r.leaveType === leavesTypeFilter;
                              })
                              .filter((r: any) => {
                                if (leavesScopeFilter === 'Mine') {
                                  return r.staffName === currentUser.name;
                                }
                                return true;
                              }).length}
                            itemsPerPage={leavesPerPage}
                            onPageChange={setLeavesPage}
                            onItemsPerPageChange={setLeavesPerPage}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                } />

                  {/* ==================== TAB 9: TOUR & GROUP TOUR MANAGEMENT ==================== */}
                  <Route path="tours" element={<TourAdminPanel currentUser={currentUser} />} />

                  {/* ==================== TAB 10: FOOTER CONFIGURATION ==================== */}
                  <Route path="footer" element={<FooterAdminPanel />} />

                  {/* ==================== TAB 11: HERO BANNERS CONFIGURATION ==================== */}
                  <Route path="banners" element={<BannersAdminPanel />} />

                  {/* ==================== TAB 12: REFUND POLICIES CONFIGURATION ==================== */}
                  <Route path="policies" element={<PoliciesAdminPanel />} />
                </Routes>
              </main>
            </div>

            {/* Footer metadata */}
            <footer className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-bold flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>Hệ thống Bảo mật & Giám sát vận hành tự động • GrandStay Enterprise © 2026</span>
              <span className="text-blue-600">UTC: 2026-06-27 • Server status: Online</span>
            </footer>
          </div>


          {/* ========================================================================= */}
          {/* ============================== MODALS BLOCK ============================== */}
          {/* ========================================================================= */}

          {/* 1. HOTEL MODAL (Add / Edit) */}
          {showHotelModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200/50"
              >
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Building className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-black text-sm">{editingHotel ? 'Chỉnh Sửa Chi Nhánh Khách Sạn' : 'Thêm Chi Nhánh Mới'}</h4>
                      <p className="text-[10px] text-slate-400">Thiết lập hình ảnh, tiện ích, và tính năng VR 3D Tour</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowHotelModal(false); setShowHotelTourPreview(false); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSaveHotel} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {/* Basic information */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên khách sạn / Chi nhánh</label>
                    <input 
                      type="text" 
                      required 
                      value={hotelForm.name} 
                      onChange={e => setHotelForm({...hotelForm, name: e.target.value})}
                      placeholder="VD: GrandStay Premier Saigon River"
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Thương hiệu</label>
                      <select 
                        value={hotelForm.brand} 
                        onChange={e => setHotelForm({...hotelForm, brand: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="GrandStay Premier">GrandStay Premier</option>
                        <option value="GrandStay Resort">GrandStay Resort</option>
                        <option value="GrandStay Lux">GrandStay Lux</option>
                        <option value="GrandStay Heritage">GrandStay Heritage</option>
                        <option value="GrandStay Suites">GrandStay Suites</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Vùng miền</label>
                      <input 
                        type="text" 
                        required 
                        value={hotelForm.region} 
                        onChange={e => setHotelForm({...hotelForm, region: e.target.value})}
                        placeholder="VD: Nam Bộ"
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Giá mỗi đêm (VND)</label>
                      <input 
                        type="number" 
                        required 
                        value={hotelForm.pricePerNight} 
                        onChange={e => setHotelForm({...hotelForm, pricePerNight: parseInt(e.target.value) || 0})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold text-amber-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dịch vụ chính</label>
                      <div className="text-slate-500 text-[10px] pt-2 font-medium">Bao gồm Ăn sáng, Hồ bơi, Wi-Fi 6, Gym 24/7</div>
                    </div>
                  </div>

                  {/* THAY ẢNH INTERACTIVE MANAGER */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        Quản lý hình ảnh (Thay ảnh tức thì)
                      </span>
                      <span className="text-[9px] text-slate-400">Chọn mẫu có sẵn hoặc tải file lên</span>
                    </div>

                    <div className="flex gap-4 items-start">
                      {/* Live Image Preview Thumbnail */}
                      <div className="w-24 h-20 rounded-xl border border-slate-200 overflow-hidden relative group/thumb bg-slate-100 shrink-0">
                        {hotelForm.image ? (
                          <img 
                            src={hotelForm.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Image className="w-5 h-5 stroke-[1.5]" />
                            <span className="text-[8px] mt-1">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        {/* URL Manual Input with upload trigger inside */}
                        <div>
                          <input 
                            type="url" 
                            required 
                            placeholder="Nhập đường dẫn ảnh (URL) hoặc tải file..."
                            value={hotelForm.image} 
                            onChange={e => setHotelForm({...hotelForm, image: e.target.value})}
                            className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                          />
                        </div>

                        {/* File Upload Trigger */}
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            Tải ảnh lên từ máy
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, false)} 
                              className="hidden" 
                            />
                          </label>
                          {hotelForm.image && (
                            <button 
                              type="button" 
                              onClick={() => setHotelForm({...hotelForm, image: ''})} 
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Predefined Beautiful Luxury Presets for instant change */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[9px] font-bold text-slate-400">Sử dụng ảnh thiết kế chất lượng cao:</span>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { name: 'Phòng khách', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Phòng ngủ', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Luxury Suite', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Resort Pool', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Modern Lobby', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80' }
                        ].map((p, idx) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setHotelForm({...hotelForm, image: p.url})}
                            className={`h-10 rounded-lg border overflow-hidden relative transition-all active:scale-95 cursor-pointer hover:border-blue-400 ${
                              hotelForm.image === p.url ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200'
                            }`}
                            title={p.name}
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[7px] text-white py-0.5 text-center truncate">
                              {p.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE 3D TOUR MANAGER */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                        Quản lý 3D Virtual Tour VR
                      </span>
                      <span className="text-[9px] text-slate-400">Trải nghiệm không gian thực tế ảo</span>
                    </div>

                    <div>
                      <input 
                        type="url" 
                        value={hotelForm.virtualTourUrl} 
                        onChange={e => setFormAndVerifyTour(e.target.value, false)}
                        placeholder="VD: https://my.matterport.com/show/?m=JGPmBB676P4 hoặc link panorama"
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>

                    {/* Predefined 3D matterport / panorama models */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] font-bold text-slate-400 mr-1 mt-1.5">Mẫu Tour VR:</span>
                      {[
                        { name: 'VR Biệt thự Luxury', url: 'https://my.matterport.com/show/?m=JGPmBB676P4' },
                        { name: 'VR Căn hộ hiện đại', url: 'https://my.matterport.com/show/?m=gLaZByVbXee' },
                        { name: 'VR Phòng ấm cúng', url: 'https://my.matterport.com/show/?m=9hP1bKSt7uC' }
                      ].map(tour => (
                        <button
                          key={tour.url}
                          type="button"
                          onClick={() => setFormAndVerifyTour(tour.url, false)}
                          className={`px-2.5 py-1 text-[9px] rounded-lg font-bold border transition-all cursor-pointer ${
                            hotelForm.virtualTourUrl === tour.url 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {tour.name}
                        </button>
                      ))}
                    </div>

                    {/* Test 3D VR Preview block */}
                    {hotelForm.virtualTourUrl && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowHotelTourPreview(!showHotelTourPreview)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                            showHotelTourPreview 
                              ? 'bg-slate-900 border-slate-800 text-emerald-400' 
                              : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {showHotelTourPreview ? 'Ẩn màn hình xem thử 3D VR' : 'Kích hoạt xem thử trực quan 3D VR'}
                        </button>

                        {showHotelTourPreview && (
                          <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative">
                            {hotelForm.virtualTourUrl.includes('matterport.com') ? (
                              <iframe 
                                src={hotelForm.virtualTourUrl}
                                className="w-full h-full border-0"
                                allowFullScreen
                                allow="xr-spatial-tracking"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                <Compass className="w-10 h-10 text-emerald-400 animate-spin mb-2" style={{ animationDuration: '10s' }} />
                                <span className="text-white font-extrabold text-xs">Mô phỏng Panorama 360°</span>
                                <span className="text-[10px] text-slate-400 mt-1 block max-w-xs truncate">{hotelForm.virtualTourUrl}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mô tả tóm tắt */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mô tả tóm tắt khách sạn</label>
                    <textarea 
                      rows={2.5}
                      required
                      value={hotelForm.description} 
                      onChange={e => setHotelForm({...hotelForm, description: e.target.value})}
                      placeholder="Mô tả tóm tắt các điểm nổi bật của chi nhánh..."
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowHotelModal(false); setShowHotelTourPreview(false); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Lưu thông tin</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 2. APARTMENT MODAL (Add / Edit) */}
          {showAptModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200/50"
              >
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Home className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-black text-sm">{editingApt ? 'Chỉnh Sửa Thông Tin Căn Hộ' : 'Thêm Căn Hộ Mới'}</h4>
                      <p className="text-[10px] text-slate-400">Thiết lập hình ảnh căn hộ dài hạn và gắn liên kết tour VR 3D</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowAptModal(false); setShowAptTourPreview(false); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSaveApt} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {/* Basic information */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên căn hộ / Mã phòng</label>
                    <input 
                      type="text" 
                      required 
                      value={aptForm.name} 
                      onChange={e => setAptForm({...aptForm, name: e.target.value})}
                      placeholder="VD: Premium Studio S1.02 - Vinhomes Central Park"
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Địa điểm / Thành phố</label>
                      <select 
                        value={aptForm.location} 
                        onChange={e => setAptForm({...aptForm, location: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Saigon">Saigon</option>
                        <option value="Hanoi">Hanoi</option>
                        <option value="Da Nang">Da Nang</option>
                        <option value="Phu Quoc">Phu Quoc</option>
                        <option value="Sapa">Sapa</option>
                        <option value="Thai Nguyen">Thai Nguyen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Loại phòng</label>
                      <select 
                        value={aptForm.type} 
                        onChange={e => setAptForm({...aptForm, type: e.target.value as any})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Studio">Studio</option>
                        <option value="1-Bedroom">1-Bedroom</option>
                        <option value="2-Bedroom">2-Bedroom</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Service Apartment">Service Apartment</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diện tích (m²)</label>
                      <input 
                        type="number" 
                        required 
                        value={aptForm.area} 
                        onChange={e => setAptForm({...aptForm, area: parseInt(e.target.value) || 0})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phòng ngủ</label>
                      <input 
                        type="number" 
                        required 
                        value={aptForm.bedrooms} 
                        onChange={e => setAptForm({...aptForm, bedrooms: parseInt(e.target.value) || 1})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phòng tắm</label>
                      <input 
                        type="number" 
                        required 
                        value={aptForm.bathrooms} 
                        onChange={e => setAptForm({...aptForm, bathrooms: parseInt(e.target.value) || 1})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Giá thuê / Tháng (VND)</label>
                      <input 
                        type="number" 
                        required 
                        value={aptForm.monthlyPrice} 
                        onChange={e => setAptForm({...aptForm, monthlyPrice: parseInt(e.target.value) || 0})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold text-emerald-600" 
                      />
                    </div>
                    <div className="flex flex-col justify-end space-y-2">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                          <input 
                            type="checkbox" 
                            checked={aptForm.petFriendly} 
                            onChange={e => setAptForm({...aptForm, petFriendly: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 focus:ring-emerald-500 text-emerald-600 cursor-pointer"
                          />
                          Nuôi thú cưng OK
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                          <input 
                            type="checkbox" 
                            checked={aptForm.hasVirtualTour} 
                            onChange={e => setAptForm({...aptForm, hasVirtualTour: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 focus:ring-emerald-500 text-emerald-600 cursor-pointer"
                          />
                          Có 3D Tour VR
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* THAY ẢNH CAN HO INTERACTIVE MANAGER */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        Quản lý hình ảnh căn hộ (Thay ảnh tức thì)
                      </span>
                      <span className="text-[9px] text-slate-400">Chọn mẫu có sẵn hoặc tải file lên</span>
                    </div>

                    <div className="flex gap-4 items-start">
                      {/* Live Image Preview Thumbnail */}
                      <div className="w-24 h-20 rounded-xl border border-slate-200 overflow-hidden relative group/thumb bg-slate-100 shrink-0">
                        {aptForm.image ? (
                          <img 
                            src={aptForm.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Image className="w-5 h-5 stroke-[1.5]" />
                            <span className="text-[8px] mt-1">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        {/* URL Manual Input with upload trigger inside */}
                        <div>
                          <input 
                            type="url" 
                            required 
                            placeholder="Nhập đường dẫn ảnh (URL) hoặc tải file..."
                            value={aptForm.image} 
                            onChange={e => setAptForm({...aptForm, image: e.target.value})}
                            className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                          />
                        </div>

                        {/* File Upload Trigger */}
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            Tải ảnh lên từ máy
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, true)} 
                              className="hidden" 
                            />
                          </label>
                          {aptForm.image && (
                            <button 
                              type="button" 
                              onClick={() => setAptForm({...aptForm, image: ''})} 
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Predefined Beautiful Luxury Presets for instant change */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[9px] font-bold text-slate-400">Sử dụng ảnh thiết kế chất lượng cao:</span>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { name: 'Studio', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Phòng đơn', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Penthouse', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Modern', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Nordic', url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80' }
                        ].map((p, idx) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setAptForm({...aptForm, image: p.url})}
                            className={`h-10 rounded-lg border overflow-hidden relative transition-all active:scale-95 cursor-pointer hover:border-blue-400 ${
                              aptForm.image === p.url ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200'
                            }`}
                            title={p.name}
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[7px] text-white py-0.5 text-center truncate">
                              {p.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE 3D TOUR MANAGER FOR APARTMENT */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                        Quản lý 3D Virtual Tour VR Căn Hộ
                      </span>
                      <span className="text-[9px] text-slate-400">Trải nghiệm không gian thực tế ảo dài hạn</span>
                    </div>

                    <div>
                      <input 
                        type="url" 
                        value={aptForm.virtualTourUrl} 
                        onChange={e => setFormAndVerifyTour(e.target.value, true)}
                        placeholder="VD: https://my.matterport.com/show/?m=JGPmBB676P4 hoặc link panorama"
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                      />
                    </div>

                    {/* Predefined 3D matterport / panorama models */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] font-bold text-slate-400 mr-1 mt-1.5">Mẫu Tour VR:</span>
                      {[
                        { name: 'VR Biệt thự Luxury', url: 'https://my.matterport.com/show/?m=JGPmBB676P4' },
                        { name: 'VR Căn hộ hiện đại', url: 'https://my.matterport.com/show/?m=gLaZByVbXee' },
                        { name: 'VR Phòng ấm cúng', url: 'https://my.matterport.com/show/?m=9hP1bKSt7uC' }
                      ].map(tour => (
                        <button
                          key={tour.url}
                          type="button"
                          onClick={() => setFormAndVerifyTour(tour.url, true)}
                          className={`px-2.5 py-1 text-[9px] rounded-lg font-bold border transition-all cursor-pointer ${
                            aptForm.virtualTourUrl === tour.url 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {tour.name}
                        </button>
                      ))}
                    </div>

                    {/* Test 3D VR Preview block */}
                    {aptForm.virtualTourUrl && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAptTourPreview(!showAptTourPreview)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                            showAptTourPreview 
                              ? 'bg-slate-900 border-slate-800 text-emerald-400' 
                              : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {showAptTourPreview ? 'Ẩn màn hình xem thử 3D VR' : 'Kích hoạt xem thử trực quan 3D VR'}
                        </button>

                        {showAptTourPreview && (
                          <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative">
                            {aptForm.virtualTourUrl.includes('matterport.com') ? (
                              <iframe 
                                src={aptForm.virtualTourUrl}
                                className="w-full h-full border-0"
                                allowFullScreen
                                allow="xr-spatial-tracking"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                <Compass className="w-10 h-10 text-emerald-400 animate-spin mb-2" style={{ animationDuration: '10s' }} />
                                <span className="text-white font-extrabold text-xs">Mô phỏng Panorama 360°</span>
                                <span className="text-[10px] text-slate-400 mt-1 block max-w-xs truncate">{aptForm.virtualTourUrl}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mô tả căn hộ */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mô tả chi tiết căn hộ</label>
                    <textarea 
                      rows={2.5}
                      required
                      value={aptForm.description} 
                      onChange={e => setAptForm({...aptForm, description: e.target.value})}
                      placeholder="Mô tả các ưu điểm vượt trội của căn hộ (tiện ích, giao thông, an ninh, nội thất...)"
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowAptModal(false); setShowAptTourPreview(false); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Lưu thông tin</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 3. ROLE MODAL (Create / Edit) */}
          {showRoleModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
              >
                <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                  <h4 className="font-extrabold text-sm">{editingRole ? 'Chỉnh Sửa Quyền Vai Trò' : 'Thêm Vai Trò Hệ Thống'}</h4>
                  <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveRole} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên vai trò / Chức vụ</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: Kiểm Soát Viên Chất Lượng"
                      value={roleForm.name} 
                      onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả công việc</label>
                    <textarea 
                      rows={2}
                      required
                      placeholder="Mô tả tóm tắt nhiệm vụ chính..."
                      value={roleForm.desc} 
                      onChange={e => setRoleForm({...roleForm, desc: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 mb-2">Tích chọn gán các quyền hệ thống</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {SYSTEM_PERMISSIONS.map(perm => {
                        const isChecked = roleForm.permissions.includes(perm.id);
                        return (
                          <label key={perm.id} className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {
                                const nextPerms = isChecked
                                  ? roleForm.permissions.filter(p => p !== perm.id)
                                  : [...roleForm.permissions, perm.id];
                                setRoleForm({ ...roleForm, permissions: nextPerms });
                              }}
                              className="w-4 h-4 rounded mt-0.5 border-slate-300 text-blue-600"
                            />
                            <div>
                              <h5 className="font-bold text-xs text-slate-800">{perm.name}</h5>
                              <p className="text-[9px] text-slate-400 mt-0.5">{perm.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Lưu cấu hình</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 4. STAFF MODAL (Add / Edit) */}
          {showStaffModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100"
              >
                <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                  <h4 className="font-extrabold text-sm">{editingStaff ? 'Cập Nhật Nhân Sự' : 'Thêm Nhân Viên Mới'}</h4>
                  <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveStaff} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Họ và tên</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: Nguyễn Văn A"
                      value={staffForm.name} 
                      onChange={e => setStaffForm({...staffForm, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email nội bộ</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="name@grandstay.com"
                      value={staffForm.email} 
                      onChange={e => setStaffForm({...staffForm, email: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: 09xxxxxxxx"
                      value={staffForm.phone} 
                      onChange={e => setStaffForm({...staffForm, phone: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vai trò</label>
                      <select 
                        value={staffForm.roleId} 
                        onChange={e => setStaffForm({...staffForm, roleId: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Trạng thái</label>
                      <select 
                        value={staffForm.status} 
                        onChange={e => setStaffForm({...staffForm, status: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="Suspended">Tạm khoá</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowStaffModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Lưu thông tin</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* CONTRACT EDIT MODAL (Add / Edit) */}
          {showContractModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 font-sans"
              >
                <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-blue-500" />
                    {editingContract ? 'Chỉnh Sửa Hợp Đồng' : 'Thêm Hợp Đồng Mới'}
                  </h4>
                  <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveContract} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên cư dân (Bên B)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="VD: Nguyễn Văn A"
                        value={contractForm.tenantName} 
                        onChange={e => setContractForm({...contractForm, tenantName: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số điện thoại</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="VD: 09xxxxxxxx"
                        value={contractForm.tenantPhone} 
                        onChange={e => setContractForm({...contractForm, tenantPhone: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email cư dân</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="name@example.com"
                        value={contractForm.tenantEmail} 
                        onChange={e => setContractForm({...contractForm, tenantEmail: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Thành phố (Khu vực)</label>
                      <select 
                        value={contractForm.location} 
                        onChange={e => setContractForm({...contractForm, location: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="Saigon">TP. Hồ Chí Minh (Saigon)</option>
                        <option value="Hanoi">TP. Hà Nội (Hanoi)</option>
                        <option value="Da Nang">TP. Đà Nẵng (Da Nang)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên căn hộ liên kết</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: Premium Corner 2BR Apartment"
                      value={contractForm.aptName} 
                      onChange={e => setContractForm({...contractForm, aptName: e.target.value})}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Giá thuê (VND/tháng)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        placeholder="VD: 15000000"
                        value={contractForm.monthlyPrice || ''} 
                        onChange={e => setContractForm({...contractForm, monthlyPrice: Number(e.target.value)})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kỳ hạn (tháng)</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        placeholder="VD: 12"
                        value={contractForm.leaseTerm || ''} 
                        onChange={e => setContractForm({...contractForm, leaseTerm: Number(e.target.value)})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày ký hợp đồng</label>
                      <input 
                        type="date" 
                        required 
                        value={contractForm.signedDate} 
                        onChange={e => setContractForm({...contractForm, signedDate: e.target.value})}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tùy Chỉnh Thỏa Thuận Riêng Cho Loại Căn Hộ:</h5>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">1. Phụ chú / Thuế và phí đi kèm (Giá thuê)</label>
                      <input 
                        type="text" 
                        required 
                        value={contractForm.vatAndFeesText} 
                        onChange={e => setContractForm({...contractForm, vatAndFeesText: e.target.value})}
                        placeholder="VD: Chưa bao gồm thuế GTGT và phí quản lý dịch vụ tiện ích phát sinh thực tế"
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                      <span className="text-[9px] text-slate-400">Hiển thị cạnh phần thông tin giá thuê (khoản 2 của thỏa thuận).</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">2. Điều khoản bổ sung dịch vụ & Quy định</label>
                      <textarea 
                        rows={3}
                        required 
                        value={contractForm.additionalTerms} 
                        onChange={e => setContractForm({...contractForm, additionalTerms: e.target.value})}
                        placeholder="Nhập nội dung các quy định, cam kết tuân thủ nội quy tòa nhà, cải tạo kết cấu..."
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors" 
                      />
                      <span className="text-[9px] text-slate-400">Hiển thị ở khung màu vàng nổi bật cuối hợp đồng thuê điện tử.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Trạng thái hợp đồng</label>
                    <select 
                      value={contractForm.status} 
                      onChange={e => setContractForm({...contractForm, status: e.target.value})}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Approved">Đang hiệu lực (Approved)</option>
                      <option value="Pending">Chờ phê duyệt (Pending)</option>
                      <option value="Terminated">Đã thanh lý (Terminated)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowContractModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Lưu hợp đồng</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 5. CONTRACT DETAIL MODAL */}
          {selectedContractDetail && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 font-sans"
              >
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">Hợp Đồng Thuê Căn Hộ Điện Tử</h4>
                      <p className="text-[10px] text-slate-400">Bản lưu trữ hệ thống đối chứng số: {selectedContractDetail.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedContractDetail(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                {/* Contract Core Content Paper */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed bg-slate-50/50">
                  <div className="text-center space-y-1 mb-4 border-b border-slate-100 pb-4">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                    <p className="font-bold text-[10px] text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-slate-400 text-[10px] font-medium italic mt-2">Hà Nội, ngày {selectedContractDetail.signedDate}</p>
                  </div>

                  <h2 className="font-extrabold text-center text-slate-900 text-xs mb-3">HỢP ĐỒNG THUÊ CĂN HỘ CAO CẤP LONG-TERM RESIDENCE</h2>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 border-l-2 border-amber-500 pl-2">BÊN CHO THUÊ (BÊN A):</h4>
                    <p><strong>CÔNG TY CỔ PHẦN ĐẦU TƯ & QUẢN LÝ DỊCH VỤ GRANDSTAY PREMIER</strong></p>
                    <p>Mã số doanh nghiệp: 0102030405 do Sở KH&ĐT cấp.</p>
                    <p>Đại diện ủy quyền pháp lý trực tuyến của hệ thống.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 border-l-2 border-amber-500 pl-2">BÊN THUÊ (BÊN B - QUÝ CƯ DÂN):</h4>
                    <p>Họ tên cư dân: <strong>{selectedContractDetail.tenantName}</strong></p>
                    <p>Số điện thoại liên hệ: <span className="font-mono">{selectedContractDetail.tenantPhone}</span> • Email số hóa: <span className="font-mono">{selectedContractDetail.tenantEmail}</span></p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 border-l-2 border-amber-500 pl-2">NỘI DUNG THỎA THUẬN THUÊ:</h4>
                    <p>1. Căn hộ cho thuê: <strong>{selectedContractDetail.aptName}</strong> (Tổ hợp GrandStay {selectedContractDetail.location})</p>
                    <p>2. Giá thuê cố định: <strong className="text-amber-600">{formatVND(selectedContractDetail.monthlyPrice)} / tháng</strong> ({selectedContractDetail.vatAndFeesText || 'Chưa bao gồm thuế GTGT và phí quản lý dịch vụ tiện ích phát sinh thực tế'})</p>
                    <p>3. Kỳ hạn cam kết thuê tối thiểu: <strong>{selectedContractDetail.leaseTerm} tháng</strong> kể từ ngày ký hợp đồng trực tuyến.</p>
                  </div>

                  <div className="space-y-1 bg-amber-50/50 p-3 rounded-lg border border-amber-200/30 text-[10px]">
                    <h5 className="font-bold text-amber-800 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Điều khoản bổ sung dịch vụ:</h5>
                    <p className="whitespace-pre-wrap">{selectedContractDetail.additionalTerms || 'Cư dân cam kết tuân thủ quy định nội quy tòa nhà, không tự ý cải tạo kết cấu khi chưa được sự đồng ý bằng văn bản của Bên A. Hợp đồng có giá trị pháp lý tương đương bản cứng sau khi được phê duyệt trên cổng GrandStay Admin.'}</p>
                  </div>

                  {/* Digital Signature Panel */}
                  <div className="flex justify-between items-start pt-6 border-t border-slate-100">
                    <div className="text-center space-y-1">
                      <p className="font-bold text-slate-500 text-[10px]">ĐẠI DIỆN BÊN A</p>
                      <p className="text-[9px] text-slate-400">Đã xác thực điện tử</p>
                      <div className="h-10 flex items-center justify-center">
                        <span className="text-xs font-mono font-extrabold text-blue-600 border border-blue-500/20 bg-blue-50/50 px-2.5 py-1 rounded-md rotate-[-2deg]">GRANDSTAY APPROVED</span>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <p className="font-bold text-slate-500 text-[10px]">CƯ DÂN (BÊN B)</p>
                      <p className="text-[9px] text-slate-400">Chữ ký điện tử của khách hàng</p>
                      <div className="h-10 flex items-center justify-center">
                        <span className="font-serif italic font-extrabold text-amber-600 underline text-sm tracking-widest">{selectedContractDetail.tenantName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-100 flex justify-end gap-3 border-t border-slate-200">
                  <button 
                    onClick={() => setSelectedContractDetail(null)} 
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng bản xem
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 6. ROOM SWAP & UPGRADE MODAL */}
          {swappingReservation && (() => {
            const getRoomLevel = (roomName: string) => {
              const nameLower = roomName.toLowerCase();
              if (nameLower.includes('presidential') || nameLower.includes('royal') || nameLower.includes('family')) {
                return { label: 'Presidential Suite (Siêu VIP)', level: 3, color: 'text-amber-600 bg-amber-50 border border-amber-200' };
              }
              if (nameLower.includes('executive') || nameLower.includes('skyline') || nameLower.includes('river view')) {
                return { label: 'Executive Suite (Thượng hạng)', level: 2, color: 'text-purple-600 bg-purple-50 border border-purple-200' };
              }
              if (nameLower.includes('deluxe') || nameLower.includes('villa')) {
                return { label: 'Deluxe Suite (Tiêu chuẩn)', level: 1, color: 'text-blue-600 bg-blue-50 border border-blue-200' };
              }
              return { label: 'Standard Room (Cơ bản)', level: 0, color: 'text-slate-600 bg-slate-50 border border-slate-200' };
            };

            const oldLevelInfo = getRoomLevel(swappingReservation.roomName);
            const targetRoom = rooms.find((r: any) => r.id === selectedSwapRoomId);
            const newLevelInfo = targetRoom ? getRoomLevel(targetRoom.name) : { label: 'Chưa chọn', level: 0, color: 'text-slate-400 bg-slate-50' };

            const isUpgrade = targetRoom ? newLevelInfo.level > oldLevelInfo.level : false;
            const isDowngrade = targetRoom ? newLevelInfo.level < oldLevelInfo.level : false;
            const isSameClass = targetRoom ? newLevelInfo.level === oldLevelInfo.level : false;

            const branchRooms = rooms.filter((r: any) => r.branchId === swappingReservation.branchId && r.name !== swappingReservation.roomName);

            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 font-sans my-8"
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-slate-950 to-slate-800 text-white px-6 py-4.5 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" />
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Điều Phối & Nâng Cấp Buồng Phòng</h4>
                        <p className="text-[10px] text-slate-300">Thay đổi, nâng cấp phòng khi có sự cố hoặc theo nhu cầu của khách hàng • {swappingReservation.branchName}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSwappingReservation(null)} 
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Grid Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* Left Settings Panel: 7 cols */}
                    <div className="lg:col-span-7 p-6 border-r border-slate-100 space-y-5 max-h-[70vh] overflow-y-auto">
                      
                      {/* Guest Info Header */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Khách hàng yêu cầu</span>
                          <strong className="text-sm text-slate-900 font-extrabold">{swappingReservation.guestName}</strong>
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5">Mã Booking: {swappingReservation.id} • SĐT: {swappingReservation.phone}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Trạng thái cư trú</span>
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                            swappingReservation.status === 'CheckedIn' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {swappingReservation.status === 'CheckedIn' ? '● Đang Lưu Trú' : '📅 Đã Đặt (Chưa Check-in)'}
                          </span>
                        </div>
                      </div>

                      {/* Step 1: Reason Selection */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Bước 1: Chọn lý do điều chuyển phòng</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            swapReason === 'room_issue' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200/80 hover:bg-slate-50/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="swap_reason" 
                                checked={swapReason === 'room_issue'} 
                                onChange={() => { setSwapReason('room_issue'); setSwapIsFoc(true); }}
                                className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer" 
                              />
                              <span className="text-xs font-bold text-slate-900">Sự cố buồng phòng</span>
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 pl-5">Thiết bị hỏng, bẩn đột xuất. Phòng cũ sẽ tự động chuyển trạng thái bảo trì.</span>
                          </label>

                          <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            swapReason === 'no_vacant_clean' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200/80 hover:bg-slate-50/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="swap_reason" 
                                checked={swapReason === 'no_vacant_clean'} 
                                onChange={() => { setSwapReason('no_vacant_clean'); setSwapIsFoc(true); }}
                                className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer" 
                              />
                              <span className="text-xs font-bold text-slate-900">Hết phòng dọn sạch</span>
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 pl-5">Hết phòng trống thực tế dọn sạch cùng hạng. Nâng cấp bồi thường cho khách.</span>
                          </label>

                          <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            swapReason === 'guest_request_upgrade' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200/80 hover:bg-slate-50/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="swap_reason" 
                                checked={swapReason === 'guest_request_upgrade'} 
                                onChange={() => { setSwapReason('guest_request_upgrade'); setSwapIsFoc(false); }}
                                className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer" 
                              />
                              <span className="text-xs font-bold text-slate-900">Yêu cầu nâng cấp dịch vụ</span>
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 pl-5">Khách tự nguyện nâng lên hạng phòng cao hơn và đồng ý đóng phụ thu chênh lệch.</span>
                          </label>

                          <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            swapReason === 'other' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200/80 hover:bg-slate-50/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="swap_reason" 
                                checked={swapReason === 'other'} 
                                onChange={() => setSwapReason('other')}
                                className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer" 
                              />
                              <span className="text-xs font-bold text-slate-900">Lý do điều phối khác</span>
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 pl-5">Đổi phòng theo sắp xếp đặc biệt của giám đốc vận hành hoặc đổi sang phòng cạnh đoàn khách khác.</span>
                          </label>
                        </div>
                      </div>

                      {/* Step 2: Target Room Selection */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Bước 2: Chọn phòng đích muốn chuyển đến</label>
                        <select 
                          value={selectedSwapRoomId}
                          onChange={(e) => setSelectedSwapRoomId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                        >
                          <option value="">-- Vui lòng chọn buồng phòng trống --</option>
                          {branchRooms.map((room: any) => {
                            const info = getRoomLevel(room.name);
                            const roomStatusLabel = 
                              room.status === 'Clean' ? '✨ Sạch dọn sẵn' :
                              room.status === 'Dirty' ? '🧹 Bẩn chưa dọn' :
                              room.status === 'Cleaning' ? '🧼 Đang dọn dẹp' : '⚙️ Bảo trì sửa chữa';

                            const roomOccLabel = 
                              room.occupancy === 'Vacant' ? '🟢 Trống cư trú' :
                              room.occupancy === 'Occupied' ? '🔴 Đang có khách' : '🔵 Có booking chờ';

                            return (
                              <option key={room.id} value={room.id}>
                                {room.name} • [{roomStatusLabel}] • [{roomOccLabel}] ({info.label})
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-[10px] text-slate-400 italic font-medium">Lưu ý: Bạn chỉ có thể chọn điều chuyển giữa các buồng phòng thuộc cùng chi nhánh chi phối ({swappingReservation.branchName}).</p>
                      </div>

                      {/* Step 3: Pricing and FOC Toggle */}
                      <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/50">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Bước 3: Chi phí nâng cấp & Phụ thu chênh lệch</label>
                        
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={swapIsFoc}
                              onChange={(e) => {
                                setSwapIsFoc(e.target.checked);
                                if (e.target.checked) setSwapSurcharge(0);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                            />
                            <div className="text-xs font-bold text-slate-800">
                              Nâng cấp miễn phí (FOC - Free of Charge)
                            </div>
                          </label>
                          <span className="text-[9px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">Khuyên dùng cho sự cố</span>
                        </div>

                        {!swapIsFoc && (
                          <div className="space-y-2 pt-2 border-t border-slate-100 animate-fade-in">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phụ phí chênh lệch phòng phát sinh (VND)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">VND</span>
                              <input 
                                type="number"
                                min="0"
                                step="50000"
                                value={swapSurcharge}
                                onChange={(e) => setSwapSurcharge(Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-lg pl-12 pr-4 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 block font-medium">Nhập số tiền khách đồng ý đóng thêm cho suốt thời gian lưu trú còn lại.</span>
                          </div>
                        )}
                      </div>

                      {/* Step 4: Notes */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Bước 4: Ghi chú chuyển dịch ca trực</label>
                        <textarea 
                          rows={2.5}
                          value={swapNotes}
                          onChange={(e) => setSwapNotes(e.target.value)}
                          placeholder="Mô tả chi tiết sự cố phòng cũ hoặc thoả thuận nâng cấp với khách để lưu lịch sử bàn giao ca..."
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                    </div>

                    {/* Right Live Preview Panel: 5 cols */}
                    <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bản xem trước luồng xử lý</span>
                        <h5 className="font-extrabold text-xs text-slate-900">SƠ ĐỒ ĐIỀU CHUYỂN BUỒNG PHÒNG TRỰC TIẾP</h5>

                        {/* Visual Flow chart */}
                        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
                          {/* Top indicator of Upgrade Class */}
                          {targetRoom && (
                            <div className="text-center">
                              {isUpgrade && (
                                <span className="inline-block text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 animate-bounce">
                                  ⭐ ĐÂY LÀ PHÂN PHÂN KHÚC NÂNG CẤP (UPGRADE)
                                </span>
                              )}
                              {isDowngrade && (
                                <span className="inline-block text-[10px] font-extrabold text-rose-800 bg-rose-50 border border-rose-200 rounded-full px-3 py-1">
                                  ⚠️ PHÂN KHÚC HẠ HẠNG PHÒNG (DOWNGRADE)
                                </span>
                              )}
                              {isSameClass && (
                                <span className="inline-block text-[10px] font-extrabold text-slate-800 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                                  🔄 PHÒNG CÙNG PHÂN KHÚC (SAME CLASS)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Original Room Box */}
                          <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">BUỒNG PHÒNG HIỆN TẠI</span>
                            <strong className="text-xs text-slate-800 block truncate font-extrabold">{swappingReservation.roomName}</strong>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${oldLevelInfo.color}`}>
                              {oldLevelInfo.label}
                            </span>
                          </div>

                          {/* Connecting Arrow */}
                          <div className="flex justify-center my-1 relative">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/10 z-10 border-2 border-white">
                              ➔
                            </div>
                            <div className="absolute inset-y-1/2 inset-x-0 border-t-2 border-dashed border-slate-200" />
                          </div>

                          {/* Target Room Box */}
                          <div className="border border-slate-200 bg-white p-3 rounded-xl shadow-sm">
                            <span className="text-[8px] text-blue-500 font-extrabold block uppercase tracking-wider">BUỒNG PHÒNG TIẾP NHẬN MỚI</span>
                            <strong className="text-xs text-slate-900 block truncate font-extrabold">
                              {targetRoom ? targetRoom.name : 'Chưa chọn buồng phòng mới'}
                            </strong>
                            {targetRoom ? (
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${newLevelInfo.color}`}>
                                {newLevelInfo.label}
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full mt-1.5">
                                Đang đợi cấu hình ở Bước 2
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pricing summary */}
                        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2.5 font-mono">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Giá trị booking gốc:</span>
                            <span>{swappingReservation.totalPrice.toLocaleString()} VND</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-white/5 pb-2">
                            <span>Phụ thu đổi phòng ({swapIsFoc ? 'FOC' : 'Chênh lệch'}):</span>
                            <span className={swapIsFoc ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                              {swapIsFoc ? '0 VND (FOC)' : `+${swapSurcharge.toLocaleString()} VND`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold pt-1">
                            <span className="text-slate-200">Tổng thanh toán mới:</span>
                            <span className="text-emerald-400 text-sm font-extrabold">
                              {(swappingReservation.totalPrice + (swapIsFoc ? 0 : swapSurcharge)).toLocaleString()} VND
                            </span>
                          </div>
                        </div>

                        {/* Automatic impacts description */}
                        <div className="space-y-1.5 bg-slate-100 p-3 rounded-xl border border-slate-200/50 text-[10px] text-slate-500 font-medium">
                          <strong className="text-slate-700 block text-[10px] font-extrabold mb-1">CÁC HÀNH ĐỘNG TỰ ĐỘNG KÈM THEO:</strong>
                          <p>✓ Cập nhật booking của khách sang buồng phòng {targetRoom ? targetRoom.name.split(' ')[0] : 'mới'}.</p>
                          {swapReason === 'room_issue' && (
                            <p className="text-amber-700 font-bold">✓ Phòng cũ {swappingReservation.roomName.split(' ')[0]} tự động chuyển sang trạng thái "BẢO TRÌ" (Repairing) & Tạo khiếu nại kĩ thuật gấp.</p>
                          )}
                          <p>✓ Ghi nhận một biên bản chi tiết tại tab "Nhật Ký Ca Trực" để đối chiếu doanh thu & quản lý chất lượng.</p>
                        </div>

                      </div>

                      {/* Cancel / Submit Buttons */}
                      <div className="flex gap-3 pt-6 border-t border-slate-200/60 mt-4">
                        <button 
                          type="button" 
                          onClick={() => setSwappingReservation(null)} 
                          className="flex-grow px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
                        >
                          Hủy thao tác
                        </button>
                        <button 
                          type="button" 
                          disabled={!selectedSwapRoomId}
                          onClick={handlePerformRoomSwap}
                          className={`flex-grow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            selectedSwapRoomId 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/10' 
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Xác nhận chuyển đổi
                        </button>
                      </div>

                    </div>

                  </div>
                </motion.div>
              </div>
            );
          })()}

    </div>
  );
}

// =========================================================================
// ========================== TOUR ADMIN PANEL =============================
// =========================================================================

interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  location: string;
  maxSlots: number;
  bookedSlots: number;
}

interface GroupTour {
  id: string;
  tourId: string;
  tourTitle: string;
  startDate: string;
  joinedMembers: number;
  maxMembers: number;
  joinedUserNames: string[];
  status: 'matching' | 'matched' | 'cancelled';
  createdAt: string;
}

function TourAdminPanel({ currentUser }: { currentUser: UserSim }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [groups, setGroups] = useState<GroupTour[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Add new tour form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: 1200000,
    duration: '1 Ngày (8h00 - 17h00)',
    location: '',
    maxSlots: 20,
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80'
  });

  // Load and sync data with localStorage
  useEffect(() => {
    const savedTours = localStorage.getItem('gs_tours');
    const savedGroups = localStorage.getItem('gs_groups');
    const savedBookings = localStorage.getItem('gs_tour_bookings');

    if (savedTours) {
      setTours(JSON.parse(savedTours));
    } else {
      // Initialize if empty
      const defaultTours: Tour[] = [
        {
          id: 'tour-halong',
          title: 'Tour Hạ Long - Vịnh Di Sản (Du thuyền 5 Sao)',
          description: 'Khám phá Vịnh Hạ Long kỳ vĩ trên du thuyền hạng sang 5 sao, bao gồm buffet trưa hải sản, chèo thuyền kayak và leo núi ngắm toàn cảnh Vịnh.',
          price: 1850000,
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
          duration: '1 Ngày (8h00 - 18h00)',
          location: 'Vịnh Hạ Long, Quảng Ninh',
          maxSlots: 30,
          bookedSlots: 18
        },
        {
          id: 'tour-sapa',
          title: 'Tour Sapa - Cát Cát - Fansipan (Khám phá Sương Mù)',
          description: 'Hành trình chinh phục Nóc nhà Đông Dương Fansipan bằng cáp treo thế kỷ, dạo bước qua bản Cát Cát mộng mơ và thưởng thức ẩm thực Tây Bắc.',
          price: 1450000,
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          duration: '2 Ngày 1 Đêm',
          location: 'Sa Pa, Lào Cai',
          maxSlots: 15,
          bookedSlots: 9
        },
        {
          id: 'tour-phongnha',
          title: 'Tour Phong Nha - Kẻ Bàng (Thám hiểm Hang Động)',
          description: 'Khám phá Động Phong Nha và Động Thiên Đường kỳ bí với hệ thống thạch nhũ triệu năm tuổi lung linh, kết hợp đu dây zipline dã ngoại sông Chày.',
          price: 2200000,
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          duration: '1 Ngày (7h30 - 17h30)',
          location: 'Phong Nha, Quảng Bình',
          maxSlots: 12,
          bookedSlots: 5
        },
        {
          id: 'tour-phuquoc',
          title: 'Tour Phú Quốc - Đảo Thiên Đường (Lặn ngắm San Hô)',
          description: 'Trải nghiệm cano 4 đảo, lặn ngắm san hô tự nhiên tại hòn Móng Tay, thưởng thức tiệc BBQ hải sản bãi biển và check-in Sunset Sanato.',
          price: 1950000,
          image: 'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&w=600&q=80',
          duration: '1 Ngày (8h30 - 17h00)',
          location: 'Phú Quốc, Kiên Giang',
          maxSlots: 25,
          bookedSlots: 14
        },
        {
          id: 'tour-hue',
          title: 'Tour Huế - Lăng Tẩm Cổ Kính (Thuyền Rồng Sông Hương)',
          description: 'Hành trình di sản cố đô Huế: tham quan Đại Nội, các lăng tẩm hoàng gia uy nghiêm, nghe ca Huế trên thuyền rồng sông Hương thơ mộng.',
          price: 950000,
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
          duration: '1 Ngày (8h00 - 17h00)',
          location: 'Thừa Thiên Huế',
          maxSlots: 20,
          bookedSlots: 11
        }
      ];
      setTours(defaultTours);
      localStorage.setItem('gs_tours', JSON.stringify(defaultTours));
    }

    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      const defaultGroups: GroupTour[] = [
        {
          id: 'GP-HL-101',
          tourId: 'tour-halong',
          tourTitle: 'Tour Hạ Long - Vịnh Di Sản (Du thuyền 5 Sao)',
          startDate: '2026-07-02',
          joinedMembers: 5,
          maxMembers: 8,
          joinedUserNames: ['Nguyễn Văn Tuấn', 'Trần Thị Hà', 'Lê Minh', 'Phạm Minh Trí', 'Nguyễn Thị Hoa'],
          status: 'matching',
          createdAt: '2026-06-25'
        },
        {
          id: 'GP-SP-202',
          tourId: 'tour-sapa',
          tourTitle: 'Tour Sapa - Cát Cát - Fansipan (Khám phá Sương Mù)',
          startDate: '2026-07-05',
          joinedMembers: 3,
          maxMembers: 6,
          joinedUserNames: ['Nguyễn Văn Quyết', 'Lê Thị Khánh Mai', 'Trần Minh Tuấn'],
          status: 'matching',
          createdAt: '2026-06-26'
        }
      ];
      setGroups(defaultGroups);
      localStorage.setItem('gs_groups', JSON.stringify(defaultGroups));
    }

    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  // Sync state changes to LocalStorage
  const updateLocalStorageTours = (newList: Tour[]) => {
    setTours(newList);
    localStorage.setItem('gs_tours', JSON.stringify(newList));
  };

  const updateLocalStorageGroups = (newList: GroupTour[]) => {
    setGroups(newList);
    localStorage.setItem('gs_groups', JSON.stringify(newList));
  };

  // Handlers for Tours
  const handleEditTourSlots = (id: string, newMax: number) => {
    const updated = tours.map(t => {
      if (t.id === id) {
        return { ...t, maxSlots: Math.max(t.bookedSlots, newMax) };
      }
      return t;
    });
    updateLocalStorageTours(updated);
  };

  const handleEditTourBooked = (id: string, newBooked: number) => {
    const updated = tours.map(t => {
      if (t.id === id) {
        return { ...t, bookedSlots: Math.min(t.maxSlots, Math.max(0, newBooked)) };
      }
      return t;
    });
    updateLocalStorageTours(updated);
  };

  const handleEditTourPrice = (id: string, newPrice: number) => {
    const updated = tours.map(t => {
      if (t.id === id) {
        return { ...t, price: Math.max(10000, newPrice) };
      }
      return t;
    });
    updateLocalStorageTours(updated);
  };

  const handleDeleteTour = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá Tour trải nghiệm này khỏi danh mục hệ thống không?')) {
      const updated = tours.filter(t => t.id !== id);
      updateLocalStorageTours(updated);
    }
  };

  const handleCreateTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'tour-' + Date.now();
    const newRecord: Tour = {
      id,
      title: newTour.title,
      description: newTour.description,
      price: newTour.price,
      duration: newTour.duration,
      location: newTour.location,
      maxSlots: newTour.maxSlots,
      image: newTour.image,
      bookedSlots: 0
    };

    const updated = [...tours, newRecord];
    updateLocalStorageTours(updated);
    setShowAddForm(false);
    setNewTour({
      title: '',
      description: '',
      price: 1200000,
      duration: '1 Ngày (8h00 - 17h00)',
      location: '',
      maxSlots: 20,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80'
    });
  };

  // Handlers for Group Tours
  const handleSimulateMemberJoin = (groupId: string) => {
    const mockNames = [
      'Lê Minh Anh',
      'Phan Hoàng Hải',
      'Đỗ Mỹ Linh',
      'Vũ Quốc Khánh',
      'Nguyễn Bảo Ngọc',
      'Tạ Quang Huy',
      'Trịnh Hồng Nhung'
    ];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];

    const updated = groups.map(g => {
      if (g.id === groupId) {
        if (g.joinedMembers >= g.maxMembers) {
          alert('Nhóm ghép này đã đủ sĩ số tối đa, vui lòng Phê duyệt khởi hành!');
          return g;
        }
        const updatedNames = [...g.joinedUserNames, randomName + ' (Simulated)'];
        const isNowMatched = updatedNames.length >= g.maxMembers;
        return {
          ...g,
          joinedMembers: updatedNames.length,
          joinedUserNames: updatedNames,
          status: isNowMatched ? 'matched' as const : g.status
        };
      }
      return g;
    });

    updateLocalStorageGroups(updated);
  };

  const handleSetGroupStatus = (groupId: string, status: 'matched' | 'cancelled' | 'matching') => {
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, status };
      }
      return g;
    });
    updateLocalStorageGroups(updated);
  };

  const handleClearToursData = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu Tour, booking và nhóm ghép về mặc định ban đầu không?')) {
      localStorage.removeItem('gs_tours');
      localStorage.removeItem('gs_groups');
      localStorage.removeItem('gs_tour_bookings');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tour-management-panel">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest block mb-1">
            GrandStay Enterprise Hub
          </span>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-300 animate-spin-slow" />
            Hệ Thống Thiết Lập Tour & Nhóm Ghép
          </h2>
          <p className="text-xs text-emerald-100/80 font-light mt-1">
            Quản trị viên có toàn quyền thêm tour mới, điều chỉnh số lượng chỗ còn trống, duyệt nhóm ghép và mô phỏng khách hàng tham gia.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tour Mới</span>
          </button>
          <button
            onClick={handleClearToursData}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 text-xs font-bold rounded-xl transition-all border border-red-500/20 cursor-pointer"
            title="Khôi phục mặc định"
          >
            Reset Dữ Liệu
          </button>
        </div>
      </div>

      {/* Add New Tour Form (collapsible) */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              ✨ Thiết Lập Tour Trải Nghiệm Mới
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Hủy bỏ
            </button>
          </div>

          <form onSubmit={handleCreateTourSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên Tour Trải Nghiệm</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tour Ngắm Hoàng Hôn Trên Sông Hương..."
                value={newTour.title}
                onChange={e => setNewTour({ ...newTour, title: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Địa Danh / Địa Điểm</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Sa Pa, Lào Cai"
                value={newTour.location}
                onChange={e => setNewTour({ ...newTour, location: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả tóm tắt hành trình</label>
              <textarea
                required
                rows={2}
                placeholder="Ghi rõ lịch trình tham quan, thực đơn ăn trưa, phương tiện di chuyển..."
                value={newTour.description}
                onChange={e => setNewTour({ ...newTour, description: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Giá vé (VND / người)</label>
                <input
                  type="number"
                  required
                  value={newTour.price}
                  onChange={e => setNewTour({ ...newTour, price: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-black font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Thời lượng tour</label>
                <input
                  type="text"
                  required
                  value={newTour.duration}
                  onChange={e => setNewTour({ ...newTour, duration: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sức chứa tối đa (Chỗ)</label>
                <input
                  type="number"
                  required
                  value={newTour.maxSlots}
                  onChange={e => setNewTour({ ...newTour, maxSlots: Number(e.target.value) || 10 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ảnh đại diện Tour (URL)</label>
              <input
                type="url"
                required
                value={newTour.image}
                onChange={e => setNewTour({ ...newTour, image: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Lưu và Công bố Tour
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main Two Column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: TOUR LIST MANAGEMENT */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Danh Mục Tour Trải Nghiệm Hiện Hành
              </h3>
              <p className="text-slate-400 text-[10px]">
                Xem chi tiết, cập nhật giá vé và chỉnh sửa số lượng chỗ ngồi còn trống (Chỗ trong Tour) trực tiếp.
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 font-extrabold text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {tours.length} TOURS
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {tours.map(tour => {
              const remaining = tour.maxSlots - tour.bookedSlots;
              const isLow = remaining <= 3;

              return (
                <div key={tour.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-grow">
                    <img
                      src={tour.image}
                      alt={tour.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                    <div className="space-y-1 max-w-md">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        📍 {tour.location}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">
                        {tour.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        ⏱️ Thời lượng: {tour.duration}
                      </p>

                      {/* Display remaining spots indicator */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] text-slate-500">Chỗ trống còn lại:</span>
                        <strong className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${isLow ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                          {remaining} / {tour.maxSlots} chỗ trống
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Inline quick settings form for slots and pricing */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/80 flex flex-wrap items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
                    {/* Price editor */}
                    <div className="w-28">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Giá vé (VND)</label>
                      <input
                        type="number"
                        step="50000"
                        value={tour.price}
                        onChange={e => handleEditTourPrice(tour.id, Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-black font-mono text-slate-800"
                      />
                    </div>

                    {/* Booked editor */}
                    <div className="w-16">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Đã bán</label>
                      <input
                        type="number"
                        value={tour.bookedSlots}
                        onChange={e => handleEditTourBooked(tour.id, Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-bold font-mono text-slate-700"
                      />
                    </div>

                    {/* Max slots editor */}
                    <div className="w-16">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Sức chứa</label>
                      <input
                        type="number"
                        value={tour.maxSlots}
                        onChange={e => handleEditTourSlots(tour.id, Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-bold font-mono text-slate-700"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg hover:text-red-700 cursor-pointer transition-colors mt-3.5"
                      title="Xoá Tour"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE GROUP MATCHES MONITOR */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              👥 Giám Sát Nhóm Ghép Tour
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Cư dân coliving tự tổ chức ghép đoàn dã ngoại để hưởng ưu đãi. Quản lý có thể thêm khách hoặc duyệt khởi hành cưỡng bức.
            </p>
          </div>

          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có nhóm ghép tour nào được khởi tạo hôm nay.
              </div>
            ) : (
              groups.map(group => {
                const percent = Math.min(100, Math.round((group.joinedMembers / group.maxMembers) * 100));
                const isMatched = group.status === 'matched';
                const isCancelled = group.status === 'cancelled';

                return (
                  <div
                    key={group.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isMatched
                        ? 'bg-emerald-50/50 border-emerald-200/60'
                        : isCancelled
                        ? 'bg-slate-50 border-slate-150 text-slate-400'
                        : 'bg-amber-50/20 border-amber-200/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[9px] font-mono font-black text-slate-400 block tracking-widest uppercase">
                          MÃ: {group.id}
                        </span>
                        <h5 className="font-extrabold text-xs text-slate-900 truncate max-w-[180px]">
                          {group.tourTitle}
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          📅 Ngày đi: <strong>{group.startDate}</strong>
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {isMatched ? (
                          <span className="text-[8px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            ĐÃ CHỐT ĐOÀN
                          </span>
                        ) : isCancelled ? (
                          <span className="text-[8px] font-extrabold bg-slate-300 text-slate-600 px-2 py-0.5 rounded-full">
                            ĐÃ HỦY
                          </span>
                        ) : (
                          <span className="text-[8px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                            ĐANG GHÉP ({percent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Số lượng thành viên:</span>
                        <span className="text-slate-900 font-mono">
                          {group.joinedMembers} / {group.maxMembers} người
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full transition-all ${
                            isMatched ? 'bg-emerald-500' : isCancelled ? 'bg-slate-300' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* List of members */}
                    <div className="mt-3 bg-white/70 rounded-lg p-2 border border-slate-100 space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Thành viên tham gia ({group.joinedMembers}):</span>
                      <p className="text-[9px] text-slate-600 font-medium truncate">
                        {group.joinedUserNames.join(', ') || 'Chưa có cư dân'}
                      </p>
                    </div>

                    {/* Control buttons for simulator */}
                    {!isCancelled && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Simulation trigger */}
                        {!isMatched && (
                          <button
                            onClick={() => handleSimulateMemberJoin(group.id)}
                            className="text-[9px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2 py-1 rounded-md transition-all cursor-pointer"
                          >
                            + Giả lập khách ghép
                          </button>
                        )}

                        <div className="flex gap-1.5 ml-auto">
                          {!isMatched ? (
                            <button
                              onClick={() => handleSetGroupStatus(group.id, 'matched')}
                              className="text-[9px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold px-2.5 py-1 rounded-md cursor-pointer"
                            >
                              Duyệt Khởi Hành
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetGroupStatus(group.id, 'matching')}
                              className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-md cursor-pointer"
                            >
                              Mở lại ghép nhóm
                            </button>
                          )}
                          <button
                            onClick={() => handleSetGroupStatus(group.id, 'cancelled')}
                            className="text-[9px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-1.5 py-1 rounded-md cursor-pointer"
                          >
                            Hủy nhóm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// ========================== FOOTER ADMIN PANEL ===========================
// =========================================================================

interface FooterSettings {
  newsletterTitle: string;
  newsletterDesc: string;
  brandDesc: string;
  affiliateText: string;
  branchesTitle: string;
  branchesLinks: { label: string; href: string }[];
  servicesTitle: string;
  servicesLinks: { label: string; href: string }[];
  contactTitle: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  copyrightText: string;
}

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  newsletterTitle: "Đăng ký đặc quyền X Member",
  newsletterDesc: "Nhận ngay ưu đãi giảm giá 15% cho phòng đầu tiên và thông báo các đợt mở bán độc quyền.",
  brandDesc: "GrandStay định nghĩa lại chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam. Mỗi chi nhánh là một tác phẩm kiến trúc hòa quyện cùng thiên nhiên bản địa.",
  affiliateText: "Thành viên trực thuộc GrandStay Hospitality Group",
  branchesTitle: "Hệ thống Chi nhánh",
  branchesLinks: [
    { label: "GrandStay Premier Thái Nguyên", href: "#search-panel" },
    { label: "GrandStay Beachfront Phú Quốc", href: "#search-panel" },
    { label: "GrandStay Lux Đà Nẵng", href: "#search-panel" },
    { label: "GrandStay Cloud Retreat Sapa", href: "#search-panel" },
    { label: "GrandStay Heritage Hà Nội", href: "#search-panel" }
  ],
  servicesTitle: "Dịch vụ & Đặc quyền",
  servicesLinks: [
    { label: "Thẻ X Member Đặc quyền", href: "#benefits" },
    { label: "Căn hộ dịch vụ Dài hạn", href: "#long-term" },
    { label: "Dịch vụ Spa & Chăm sóc trị liệu", href: "#spa" },
    { label: "Ẩm thực hữu cơ chuẩn 5 sao", href: "#dining" },
    { label: "Hội nghị & Tiệc cưới Thượng lưu", href: "#events" }
  ],
  contactTitle: "Liên hệ GrandStay",
  contactAddress: "Đại lộ Hùng Vương, Thành phố Thái Nguyên, Việt Nam",
  contactPhone: "+84 (0) 24 1234 5678",
  contactEmail: "contact@grandstay.com.vn",
  copyrightText: "GrandStay. All rights reserved. Designed for ultra-premium hospitality experience."
};

function FooterAdminPanel() {
  const [settings, setSettings] = useState<FooterSettings>(() => {
    const saved = localStorage.getItem('gs_footer_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return DEFAULT_FOOTER_SETTINGS;
  });

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'links' | 'contact' | 'preview'>('general');

  // Links state
  const [newBranchLink, setNewBranchLink] = useState({ label: '', href: '#' });
  const [newServiceLink, setNewServiceLink] = useState({ label: '', href: '#' });

  const saveSettings = (newSettings: FooterSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gs_footer_settings', JSON.stringify(newSettings));
    // Dispatch custom event to notify Footer component of immediate updates
    window.dispatchEvent(new Event('footer_settings_updated'));
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại thông tin Footer về mặc định ban đầu không?')) {
      saveSettings(DEFAULT_FOOTER_SETTINGS);
    }
  };

  const handleUpdateField = (key: keyof FooterSettings, value: any) => {
    saveSettings({ ...settings, [key]: value });
  };

  const handleAddLink = (type: 'branches' | 'services') => {
    if (type === 'branches') {
      if (!newBranchLink.label) return;
      const updated = [...settings.branchesLinks, newBranchLink];
      saveSettings({ ...settings, branchesLinks: updated });
      setNewBranchLink({ label: '', href: '#' });
    } else {
      if (!newServiceLink.label) return;
      const updated = [...settings.servicesLinks, newServiceLink];
      saveSettings({ ...settings, servicesLinks: updated });
      setNewServiceLink({ label: '', href: '#' });
    }
  };

  const handleDeleteLink = (type: 'branches' | 'services', index: number) => {
    if (type === 'branches') {
      const updated = settings.branchesLinks.filter((_, i) => i !== index);
      saveSettings({ ...settings, branchesLinks: updated });
    } else {
      const updated = settings.servicesLinks.filter((_, i) => i !== index);
      saveSettings({ ...settings, servicesLinks: updated });
    }
  };

  const handleMoveLink = (type: 'branches' | 'services', index: number, direction: 'up' | 'down') => {
    const links = type === 'branches' ? [...settings.branchesLinks] : [...settings.servicesLinks];
    if (direction === 'up' && index > 0) {
      const temp = links[index];
      links[index] = links[index - 1];
      links[index - 1] = temp;
    } else if (direction === 'down' && index < links.length - 1) {
      const temp = links[index];
      links[index] = links[index + 1];
      links[index + 1] = temp;
    }
    if (type === 'branches') {
      saveSettings({ ...settings, branchesLinks: links });
    } else {
      saveSettings({ ...settings, servicesLinks: links });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="footer-management-panel">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-pink-200 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Giao diện Website & Trải nghiệm khách hàng
          </span>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-pink-300" />
            Quản Trị Thông Tin Footer Website
          </h2>
          <p className="text-xs text-pink-100/80 font-light mt-1">
            Cập nhật tức thời thông tin liên hệ, bản tin khuyến mãi, hệ thống liên kết chi nhánh và bản quyền ở chân trang của toàn bộ website.
          </p>
        </div>
        <div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Khôi phục Mặc định
          </button>
        </div>
      </div>

      {/* Navigation Sub Tabs */}
      <div className="flex border-b border-slate-200 pb-0 gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'general' ? 'border-pink-600 text-pink-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📝 Bản Tin & Thương Hiệu
        </button>
        <button
          onClick={() => setActiveSubTab('links')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'links' ? 'border-pink-600 text-pink-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🔗 Menu & Liên Kết
        </button>
        <button
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'contact' ? 'border-pink-600 text-pink-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📞 Liên Hệ & Bản Quyền
        </button>
        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'preview' ? 'border-pink-600 text-pink-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👁️ Xem Trước Thực Tế
        </button>
      </div>

      {/* Main Work Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        
        {/* SUB-TAB 1: GENERAL */}
        {activeSubTab === 'general' && (
          <div className="space-y-6 text-left">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Bản tin khuyến mãi & Slogan Thương hiệu
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">📬 Khu vực Đăng ký bản tin (Newsletter)</h4>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề Bản tin</label>
                  <input
                    type="text"
                    value={settings.newsletterTitle}
                    onChange={(e) => handleUpdateField('newsletterTitle', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả Bản tin</label>
                  <textarea
                    rows={3}
                    value={settings.newsletterDesc}
                    onChange={(e) => handleUpdateField('newsletterDesc', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">🏢 Thông tin thương hiệu & Công ty thành viên</h4>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả/Giới thiệu tóm tắt</label>
                  <textarea
                    rows={3}
                    value={settings.brandDesc}
                    onChange={(e) => handleUpdateField('brandDesc', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dòng ghi nhận bản quyền phụ (Affiliate/Group)</label>
                  <input
                    type="text"
                    value={settings.affiliateText}
                    onChange={(e) => handleUpdateField('affiliateText', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: LINKS */}
        {activeSubTab === 'links' && (
          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Menu 1: Branches */}
              <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    🏢 Menu 1: Chi nhánh
                  </h4>
                  <input
                    type="text"
                    value={settings.branchesTitle}
                    onChange={(e) => handleUpdateField('branchesTitle', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-700 w-44 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Tiêu đề Menu"
                  />
                </div>

                {/* List of branch links */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {settings.branchesLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <div className="flex-grow space-y-1">
                        <div className="text-xs font-bold text-slate-800">{link.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{link.href}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveLink('branches', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Lên trên"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveLink('branches', idx, 'down')}
                          disabled={idx === settings.branchesLinks.length - 1}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Xuống dưới"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleDeleteLink('branches', idx)}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                          title="Xóa liên kết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to add branch link */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Thêm liên kết mới</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên chi nhánh/Nội dung"
                      value={newBranchLink.label}
                      onChange={(e) => setNewBranchLink({ ...newBranchLink, label: e.target.value })}
                      className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ liên kết (e.g. #search-panel)"
                      value={newBranchLink.href}
                      onChange={(e) => setNewBranchLink({ ...newBranchLink, href: e.target.value })}
                      className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleAddLink('branches')}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    + Thêm Liên Kết Vào Menu 1
                  </button>
                </div>
              </div>

              {/* Menu 2: Services */}
              <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    🔗 Menu 2: Đặc quyền & Dịch vụ
                  </h4>
                  <input
                    type="text"
                    value={settings.servicesTitle}
                    onChange={(e) => handleUpdateField('servicesTitle', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-700 w-44 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Tiêu đề Menu"
                  />
                </div>

                {/* List of service links */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {settings.servicesLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <div className="flex-grow space-y-1">
                        <div className="text-xs font-bold text-slate-800">{link.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{link.href}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveLink('services', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Lên trên"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveLink('services', idx, 'down')}
                          disabled={idx === settings.servicesLinks.length - 1}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Xuống dưới"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleDeleteLink('services', idx)}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                          title="Xóa liên kết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to add service link */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Thêm liên kết mới</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên dịch vụ/Đặc quyền"
                      value={newServiceLink.label}
                      onChange={(e) => setNewServiceLink({ ...newServiceLink, label: e.target.value })}
                      className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ liên kết (e.g. #benefits)"
                      value={newServiceLink.href}
                      onChange={(e) => setNewServiceLink({ ...newServiceLink, href: e.target.value })}
                      className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleAddLink('services')}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    + Thêm Liên Kết Vào Menu 2
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-TAB 3: CONTACT & COPYRIGHT */}
        {activeSubTab === 'contact' && (
          <div className="space-y-6 text-left">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Thông Tin Liên Hệ Doanh Nghiệp & Bản Quyền
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">📞 Khối Thông tin Liên hệ Chân trang</h4>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề Liên hệ</label>
                  <input
                    type="text"
                    value={settings.contactTitle}
                    onChange={(e) => handleUpdateField('contactTitle', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">📍 Địa chỉ Trụ sở chính</label>
                  <input
                    type="text"
                    value={settings.contactAddress}
                    onChange={(e) => handleUpdateField('contactAddress', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">📞 Số điện thoại hotline</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => handleUpdateField('contactPhone', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-mono text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">✉️ Email hỗ trợ/Kinh doanh</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleUpdateField('contactEmail', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">⚖️ Bản Quyền Dưới Cùng (Bottom Banner)</h4>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dòng chữ bản quyền (Năm được tính tự động)</label>
                  <textarea
                    rows={4}
                    value={settings.copyrightText}
                    onChange={(e) => handleUpdateField('copyrightText', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none font-medium text-slate-700"
                  />
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-medium">
                  💡 <strong>Gợi ý:</strong> Bạn có thể sử dụng các kí tự đặc biệt để ngăn cách thông tin. Giao diện người dùng sẽ tự động cập nhật ngay lập tức mà không cần phải tải lại trang.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: REAL-TIME PREVIEW */}
        {activeSubTab === 'preview' && (
          <div className="space-y-4 text-left">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Xem trước giao diện Footer (Mockup thu nhỏ)
            </h3>
            
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 space-y-6 text-xs shadow-inner">
              {/* Upper Section */}
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-white text-sm flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {settings.newsletterTitle}
                  </h5>
                  <p className="text-slate-400 text-[10px]">{settings.newsletterDesc}</p>
                </div>
                <div className="flex bg-slate-800 rounded px-2 py-1 border border-slate-700 text-[10px]">
                  <span className="text-slate-500">Email...</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[10px]">
                {/* Brand */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center text-[10px]">G</div>
                    <span className="font-bold text-white">GrandStay</span>
                  </div>
                  <p className="text-slate-400 font-light leading-relaxed">{settings.brandDesc}</p>
                  <p className="text-amber-500/80 font-bold text-[9px]">✔ {settings.affiliateText}</p>
                </div>

                {/* Menu 1 */}
                <div className="space-y-2">
                  <h6 className="font-bold text-white uppercase">{settings.branchesTitle}</h6>
                  <ul className="space-y-1 text-slate-400">
                    {settings.branchesLinks.map((l, i) => (
                      <li key={i}>• {l.label}</li>
                    ))}
                  </ul>
                </div>

                {/* Menu 2 */}
                <div className="space-y-2">
                  <h6 className="font-bold text-white uppercase">{settings.servicesTitle}</h6>
                  <ul className="space-y-1 text-slate-400">
                    {settings.servicesLinks.map((l, i) => (
                      <li key={i}>• {l.label}</li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <h6 className="font-bold text-white uppercase">{settings.contactTitle}</h6>
                  <ul className="space-y-1.5 text-slate-400">
                    <li className="flex gap-1">📍 <span className="truncate">{settings.contactAddress}</span></li>
                    <li>📞 {settings.contactPhone}</li>
                    <li>✉ {settings.contactEmail}</li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-slate-800 pt-3 text-center text-[9px] text-slate-500 flex justify-between items-center">
                <span>© {new Date().getFullYear()} {settings.copyrightText}</span>
                <span>Made in Vietnam ❤️</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ==================== HERO BANNERS & SLIDES CONFIGURATION PANEL ==================== */
interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  actionText: string;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Relax & Unwind',
    subtitle: 'Discover our stunning pool and spa facilities',
    description: 'Take a dip in our infinity pool or rejuvenate with a relaxing spa treatment designed to soothe your soul and mind.',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1920&q=80',
    actionText: 'Explore Pools & Spa'
  },
  {
    id: 2,
    title: 'Premium Coastal Living',
    subtitle: 'Waking up to the calming sound of ocean waves',
    description: 'Experience beachfront villas with custom panoramic floor-to-ceiling windows, private decks, and seamless beach access.',
    image: 'https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1920&q=80',
    actionText: 'View Beachfront Villas'
  },
  {
    id: 3,
    title: 'Serene Highland Retreats',
    subtitle: 'Elevate your senses high above the green valleys',
    description: 'Cozy up in luxury eco-villas with wood-burning fireplaces, mountain mist balconies, and private therapeutic herbal hot springs.',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80',
    actionText: 'Discover Cloud Retreats'
  }
];

function BannersAdminPanel() {
  const [recommendedSize, setRecommendedSize] = useState<string>(() => {
    return localStorage.getItem('gs_banner_recommended_size') || '1920x800 px (Landscape)';
  });

  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('gs_home_slides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_HERO_SLIDES;
  });

  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'longterm' | 'about' | 'config' | 'preview'>('slides');

  // About GrandStay content states
  const [aboutTagline, setAboutTagline] = useState<string>(() => {
    return localStorage.getItem('gs_about_tagline') || 'HÀNH TRÌNH KIẾN TẠO KIỆT TÁC';
  });
  const [aboutTitle, setAboutTitle] = useState<string>(() => {
    return localStorage.getItem('gs_about_title') || 'Về GrandStay Hospitality Group';
  });
  const [aboutDesc, setAboutDesc] = useState<string>(() => {
    return localStorage.getItem('gs_about_desc') || 'Được thành lập từ năm 2018 với khát vọng tái định nghĩa chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam, GrandStay không ngừng kiến tạo những không gian sống đầy nghệ thuật, kết hợp hoàn hảo giữa tiện nghi thượng hạng và văn hóa bản địa đặc sắc.';
  });
  const [aboutVisionTitle, setAboutVisionTitle] = useState<string>(() => {
    return localStorage.getItem('gs_about_vision_title') || 'Sứ mệnh bảo tồn & phát triển trải nghiệm bản địa thượng lưu';
  });
  const [aboutVisionDesc, setAboutVisionDesc] = useState<string>(() => {
    return localStorage.getItem('gs_about_vision_desc') || 'Mỗi điểm đến của GrandStay không chỉ là một nơi lưu trú, mà là một tác phẩm kiến trúc tôn vinh tinh hoa vùng miền. Từ những thửa ruộng bậc thang mờ sương tại Sapa, bờ cát trắng hoang sơ Phú Quốc, đến nhịp sống tinh tế tại Tràng An Hà Nội, chúng tôi gìn giữ linh hồn của đất mẹ và mang đến trải nghiệm nghỉ dưỡng xa xỉ đích thực cho quý khách.';
  });
  const [aboutStats, setAboutStats] = useState<{ value: string; label: string }[]>(() => {
    const saved = localStorage.getItem('gs_about_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { value: '06', label: 'Tỉnh thành trọng điểm' },
      { value: '150k+', label: 'Lượt khách lưu trú' },
      { value: '15+', label: 'Giải thưởng quốc tế' }
    ];
  });
  const [aboutPillars, setAboutPillars] = useState<{ title: string; desc: string }[]>(() => {
    const saved = localStorage.getItem('gs_about_pillars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { title: 'Kiến Trúc Độc Bản', desc: 'Thiết kế hòa quyện giữa nét hiện đại phương Tây và họa tiết nghệ thuật truyền thống Việt Nam.' },
      { title: 'An Ninh & Bảo Mật Tuyệt Đối', desc: 'Đảm bảo sự riêng tư tuyệt đối cho kỳ nghỉ của giới thượng lưu với công nghệ quản lý an ninh đa lớp.' },
      { title: 'Lối Sống Xanh & Chữa Lành', desc: 'Ưu tiên nông sản hữu cơ địa phương, không rác thải nhựa, kết hợp liệu trình spa thảo dược truyền thống.' }
    ];
  });
  const [aboutQuote, setAboutQuote] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote') || 'Tại GrandStay, chúng tôi tin rằng xa xỉ không chỉ nằm ở những phiến đá marble đắt tiền hay ánh đèn pha lê lấp lánh, mà xa xỉ đích thực là sự thấu hiểu sâu sắc tâm hồn của người lữ hành, mang đến cho họ những phút giây tĩnh lặng vô giá bên gia đình.';
  });
  const [aboutQuoteAuthor, setAboutQuoteAuthor] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote_author') || 'Trần Hoàng Sơn';
  });
  const [aboutQuoteRole, setAboutQuoteRole] = useState<string>(() => {
    return localStorage.getItem('gs_about_quote_role') || 'Người Sáng Lập & Chủ Tịch GrandStay Group';
  });

  const handleSaveAboutField = (field: string, value: any) => {
    if (field === 'tagline') {
      setAboutTagline(value);
      localStorage.setItem('gs_about_tagline', value);
    } else if (field === 'title') {
      setAboutTitle(value);
      localStorage.setItem('gs_about_title', value);
    } else if (field === 'desc') {
      setAboutDesc(value);
      localStorage.setItem('gs_about_desc', value);
    } else if (field === 'vision_title') {
      setAboutVisionTitle(value);
      localStorage.setItem('gs_about_vision_title', value);
    } else if (field === 'vision_desc') {
      setAboutVisionDesc(value);
      localStorage.setItem('gs_about_vision_desc', value);
    } else if (field === 'stats') {
      setAboutStats(value);
      localStorage.setItem('gs_about_stats', JSON.stringify(value));
    } else if (field === 'pillars') {
      setAboutPillars(value);
      localStorage.setItem('gs_about_pillars', JSON.stringify(value));
    } else if (field === 'quote') {
      setAboutQuote(value);
      localStorage.setItem('gs_about_quote', value);
    } else if (field === 'quote_author') {
      setAboutQuoteAuthor(value);
      localStorage.setItem('gs_about_quote_author', value);
    } else if (field === 'quote_role') {
      setAboutQuoteRole(value);
      localStorage.setItem('gs_about_quote_role', value);
    }
    window.dispatchEvent(new Event('about_content_updated'));
  };

  // Long-term stays content states
  const [ltBanner, setLtBanner] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_banner_image') || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80';
  });
  const [ltTitle, setLtTitle] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_title') || 'Long-term Rooms';
  });
  const [ltSubtitle, setLtSubtitle] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_subtitle') || 'Looking for extended stay options? Our long-term room packages offer comfortable accommodation at competitive rates for stays of 30 days or more.';
  });
  const [ltAdvantages, setLtAdvantages] = useState<string[]>(() => {
    const saved = localStorage.getItem('gs_longterm_advantages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      "Significant discounts compared to nightly rates",
      "Flexible lease terms from 1 to 12 months",
      "Fully furnished rooms with utilities included",
      "Dedicated housekeeping and maintenance"
    ];
  });

  const handleSaveLongTermField = (field: 'banner' | 'title' | 'subtitle' | 'advantages', value: any) => {
    if (field === 'banner') {
      setLtBanner(value);
      localStorage.setItem('gs_longterm_banner_image', value);
    } else if (field === 'title') {
      setLtTitle(value);
      localStorage.setItem('gs_longterm_title', value);
    } else if (field === 'subtitle') {
      setLtSubtitle(value);
      localStorage.setItem('gs_longterm_subtitle', value);
    } else if (field === 'advantages') {
      setLtAdvantages(value);
      localStorage.setItem('gs_longterm_advantages', JSON.stringify(value));
    }
    window.dispatchEvent(new Event('longterm_content_updated'));
  };

  const [newSlide, setNewSlide] = useState<Omit<HeroSlide, 'id'>>({
    title: 'New Slogan',
    subtitle: 'Luxury Holiday Escape',
    description: 'Create memorable moments in our boutique premium suites designed with modern elegance and panoramic scenic views.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    actionText: 'Book Now'
  });

  const saveSlides = (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    localStorage.setItem('gs_home_slides', JSON.stringify(newSlides));
    window.dispatchEvent(new Event('home_slides_updated'));
  };

  const handleUpdateSlideField = (id: number, field: keyof HeroSlide, value: any) => {
    const updated = slides.map(s => s.id === id ? { ...s, [field]: value } : s);
    saveSlides(updated);
  };

  const handleDeleteSlide = (id: number) => {
    if (slides.length <= 1) {
      alert('Hệ thống yêu cầu tối thiểu phải có ít nhất 1 Slide hoạt động để tránh lỗi hiển thị trang chủ.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa Slide này không?')) {
      const updated = slides.filter(s => s.id !== id);
      saveSlides(updated);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const updated = [...slides];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    saveSlides(updated);
  };

  const handleAddSlide = () => {
    if (!newSlide.image) {
      alert('Vui lòng cung cấp link hình ảnh hợp lệ cho Slide.');
      return;
    }
    const maxId = slides.reduce((max, s) => s.id > max ? s.id : max, 0);
    const added: HeroSlide = {
      id: maxId + 1,
      ...newSlide
    };
    saveSlides([...slides, added]);
    // Reset new slide form
    setNewSlide({
      title: 'New Slogan',
      subtitle: 'Luxury Holiday Escape',
      description: 'Create memorable moments in our boutique premium suites designed with modern elegance.',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
      actionText: 'Book Now'
    });
    alert('Thêm Slide thành công!');
  };

  const handleResetBanners = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ banner, slide, nội dung Long-term & About GrandStay về mặc định không?')) {
      saveSlides(DEFAULT_HERO_SLIDES);
      setRecommendedSize('1920x800 px (Landscape)');
      localStorage.setItem('gs_banner_recommended_size', '1920x800 px (Landscape)');
      
      localStorage.removeItem('gs_longterm_banner_image');
      localStorage.removeItem('gs_longterm_title');
      localStorage.removeItem('gs_longterm_subtitle');
      localStorage.removeItem('gs_longterm_advantages');
      setLtBanner('https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80');
      setLtTitle('Long-term Rooms');
      setLtSubtitle('Looking for extended stay options? Our long-term room packages offer comfortable accommodation at competitive rates for stays of 30 days or more.');
      setLtAdvantages([
        "Significant discounts compared to nightly rates",
        "Flexible lease terms from 1 to 12 months",
        "Fully furnished rooms with utilities included",
        "Dedicated housekeeping and maintenance"
      ]);

      localStorage.removeItem('gs_about_tagline');
      localStorage.removeItem('gs_about_title');
      localStorage.removeItem('gs_about_desc');
      localStorage.removeItem('gs_about_vision_title');
      localStorage.removeItem('gs_about_vision_desc');
      localStorage.removeItem('gs_about_stats');
      localStorage.removeItem('gs_about_pillars');
      localStorage.removeItem('gs_about_quote');
      localStorage.removeItem('gs_about_quote_author');
      localStorage.removeItem('gs_about_quote_role');

      setAboutTagline('HÀNH TRÌNH KIẾN TẠO KIỆT TÁC');
      setAboutTitle('Về GrandStay Hospitality Group');
      setAboutDesc('Được thành lập từ năm 2018 với khát vọng tái định nghĩa chuẩn mực nghỉ dưỡng cao cấp tại Việt Nam, GrandStay không ngừng kiến tạo những không gian sống đầy nghệ thuật, kết hợp hoàn hảo giữa tiện nghi thượng hạng và văn hóa bản địa đặc sắc.');
      setAboutVisionTitle('Sứ mệnh bảo tồn & phát triển trải nghiệm bản địa thượng lưu');
      setAboutVisionDesc('Mỗi điểm đến của GrandStay không chỉ là một nơi lưu trú, mà là một tác phẩm kiến trúc tôn vinh tinh hoa vùng miền. Từ những thửa ruộng bậc thang mờ sương tại Sapa, bờ cát trắng hoang sơ Phú Quốc, đến nhịp sống tinh tế tại Tràng An Hà Nội, chúng tôi gìn giữ linh hồn của đất mẹ và mang đến trải nghiệm nghỉ dưỡng xa xỉ đích thực cho quý khách.');
      setAboutStats([
        { value: '06', label: 'Tỉnh thành trọng điểm' },
        { value: '150k+', label: 'Lượt khách lưu trú' },
        { value: '15+', label: 'Giải thưởng quốc tế' }
      ]);
      setAboutPillars([
        { title: 'Kiến Trúc Độc Bản', desc: 'Thiết kế hòa quyện giữa nét hiện đại phương Tây và họa tiết nghệ thuật truyền thống Việt Nam.' },
        { title: 'An Ninh & Bảo Mật Tuyệt Đối', desc: 'Đảm bảo sự riêng tư tuyệt đối cho kỳ nghỉ của giới thượng lưu với công nghệ quản lý an ninh đa lớp.' },
        { title: 'Lối Sống Xanh & Chữa Lành', desc: 'Ưu tiên nông sản hữu cơ địa phương, không rác thải nhựa, kết hợp liệu trình spa thảo dược truyền thống.' }
      ]);
      setAboutQuote('Tại GrandStay, chúng tôi tin rằng xa xỉ không chỉ nằm ở những phiến đá marble đắt tiền hay ánh đèn pha lê lấp lánh, mà xa xỉ đích thực là sự thấu hiểu sâu sắc tâm hồn của người lữ hành, mang đến cho họ những phút giây tĩnh lặng vô giá bên gia đình.');
      setAboutQuoteAuthor('Trần Hoàng Sơn');
      setAboutQuoteRole('Người Sáng Lập & Chủ Tịch GrandStay Group');

      window.dispatchEvent(new Event('home_slides_updated'));
      window.dispatchEvent(new Event('longterm_content_updated'));
      window.dispatchEvent(new Event('about_content_updated'));
      alert('Đã khôi phục toàn bộ cài đặt về mặc định thành công!');
    }
  };

  const handleSaveSize = (value: string) => {
    setRecommendedSize(value);
    localStorage.setItem('gs_banner_recommended_size', value);
    window.dispatchEvent(new Event('home_slides_updated'));
  };

  return (
    <div className="space-y-6 animate-fade-in" id="banners-management-panel">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-200 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Giao diện Website & Trình Chiếu Trang Chủ
          </span>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-300" />
            Cấu Hình Banner, Slides & Nội Dung
          </h2>
          <p className="text-xs text-amber-100/80 font-light mt-1">
            Thay đổi hình ảnh biểu ngữ (Banner), thông điệp chào mừng, nút kêu gọi hành động, và quản lý nội dung các trang phòng nghỉ/căn hộ dài hạn.
          </p>
        </div>
        <div>
          <button
            onClick={handleResetBanners}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Khôi phục Mặc định
          </button>
        </div>
      </div>

      {/* Navigation Sub Tabs */}
      <div className="flex border-b border-slate-200 pb-0 gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('slides')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'slides' ? 'border-amber-600 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🖼️ Slides Trang Chủ ({slides.length})
        </button>
        <button
          onClick={() => setActiveSubTab('longterm')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'longterm' ? 'border-amber-600 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🏢 Content Long-Term Rooms
        </button>
        <button
          onClick={() => setActiveSubTab('about')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'about' ? 'border-amber-600 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🏰 Content About GrandStay
        </button>
        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'config' ? 'border-amber-600 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚙️ Cấu Hình Chung & Kích Thước
        </button>
        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'preview' ? 'border-amber-600 text-amber-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👁️ Xem Trước Trình Chiếu
        </button>
      </div>

      {/* Main Work Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        
        {/* SUB-TAB 1: SLIDES */}
        {activeSubTab === 'slides' && (
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Danh sách Slides hiện tại
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Kích thước khuyến nghị hiện tại: <strong className="text-amber-600">{recommendedSize}</strong>
                </span>
              </div>

              {/* Grid of existing slides */}
              <div className="grid grid-cols-1 gap-6">
                {slides.map((slide, idx) => (
                  <div key={slide.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 shadow-xs flex flex-col lg:flex-row gap-5">
                    {/* Thumbnail & Ordering */}
                    <div className="lg:w-1/4 space-y-3 shrink-0">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-slate-950/70 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
                          Slide #{idx + 1}
                        </div>
                      </div>

                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => handleMoveSlide(idx, 'up')}
                          disabled={idx === 0}
                          className="flex-1 py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all cursor-pointer"
                          title="Di chuyển lên trên"
                        >
                          ▲ Lên
                        </button>
                        <button
                          onClick={() => handleMoveSlide(idx, 'down')}
                          disabled={idx === slides.length - 1}
                          className="flex-1 py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all cursor-pointer"
                          title="Di chuyển xuống dưới"
                        >
                          ▼ Xuống
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="py-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          title="Xóa Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Inputs form for this specific slide */}
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề (Slogan ngắn - Ví dụ: Relax & Unwind)</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'title', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề phụ chính (Subtitle - Ví dụ: Discover our pool...)</label>
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'subtitle', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả tóm tắt chi tiết (Description)</label>
                          <textarea
                            rows={2}
                            value={slide.description}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'description', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đường link ảnh Banner (Unsplash / CDN URL)</label>
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'image', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-600 font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên nút hành động (Button Text)</label>
                          <input
                            type="text"
                            value={slide.actionText}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'actionText', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800"
                          />
                        </div>

                        <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100 text-[10px] text-amber-800 leading-relaxed font-medium">
                          💡 <strong>Gợi ý:</strong> Nội dung chỉnh sửa sẽ lập tức được lưu giữ trong LocalStorage và tự động đồng bộ trên toàn bộ trang chủ của khách hàng!
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FORM: ADD NEW SLIDE */}
            <div className="border border-dashed border-amber-300 rounded-xl p-5 bg-amber-50/20 text-xs font-semibold space-y-4">
              <h4 className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5 border-b border-amber-200 pb-2">
                <Plus className="w-4 h-4 text-amber-600" />
                Thêm Slide Trình Chiếu Mới
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề Slogan</label>
                    <input
                      type="text"
                      placeholder="e.g. Wellness Oasis"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề phụ chính (Subtitle)</label>
                    <input
                      type="text"
                      placeholder="e.g. Experience mindfulness meditation like never before"
                      value={newSlide.subtitle}
                      onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả tóm tắt</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả về lợi ích, đặc điểm nổi bật..."
                      value={newSlide.description}
                      onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Ảnh Banner (Kích thước khuyên dùng: {recommendedSize})</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={newSlide.image}
                      onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-600 font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên nút hành động</label>
                    <input
                      type="text"
                      value={newSlide.actionText}
                      onChange={(e) => setNewSlide({ ...newSlide, actionText: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleAddSlide}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Thêm Slide Mới Vào Trình Chiếu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 1.5: LONGTERM CONTENT */}
        {activeSubTab === 'longterm' && (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Quản lý Nội Dung & Banner - Phòng Dài Hạn (Long-term Rooms)
              </h3>
              <span className="text-[11px] text-amber-600 font-bold">Lưu thay đổi tự động</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form Info */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiêu đề chính của Trang (Main Title)
                  </label>
                  <input
                    type="text"
                    value={ltTitle}
                    onChange={(e) => handleSaveLongTermField('title', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold bg-white"
                    placeholder="Ví dụ: Long-term Rooms"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mô tả / Slogan phụ (Subtitle)
                  </label>
                  <textarea
                    rows={3}
                    value={ltSubtitle}
                    onChange={(e) => handleSaveLongTermField('subtitle', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium bg-white"
                    placeholder="Mô tả về đặc quyền hoặc lợi ích lưu trú dài hạn..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    URL Hình ảnh Banner Đầu Trang (Banner Image URL)
                  </label>
                  <input
                    type="text"
                    value={ltBanner}
                    onChange={(e) => handleSaveLongTermField('banner', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-600 font-mono"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              {/* Right Column: Banner Preview Thumbnail */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
                  Xem Trước Banner Thực Tế (Banner Preview)
                </label>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex flex-col justify-end p-4">
                  <img
                    src={ltBanner}
                    alt="Long-term stay preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 text-white">
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest block mb-1">
                      Home / Long-term Rooms
                    </span>
                    <h4 className="text-base font-extrabold tracking-tight mb-1">{ltTitle}</h4>
                    <p className="text-[10px] text-slate-300 font-light line-clamp-2">{ltSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Advantages Content */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Đặc Điểm Nổi Bật / Ưu Điểm Lưu Trú Dài Hạn (4 Advantages)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Cập nhật 4 ưu điểm chính của các căn hộ/phòng nghỉ dài hạn sẽ hiển thị cho khách hàng xem trên trang web.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ltAdvantages.map((adv, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={adv}
                        onChange={(e) => {
                          const updated = [...ltAdvantages];
                          updated[idx] = e.target.value;
                          handleSaveLongTermField('advantages', updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-slate-700"
                        placeholder={`Ưu điểm thứ ${idx + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 1.7: ABOUT GRANDSTAY CONTENT */}
        {activeSubTab === 'about' && (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Quản lý Nội dung - Giới thiệu Tập đoàn (About GrandStay)
              </h3>
              <span className="text-[11px] text-amber-600 font-bold">Lưu thay đổi tự động</span>
            </div>

            {/* Section 1: Heading & Tagline */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                1. Tiêu Đề & Mô Tả Chung (Header Section)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dòng Tagline phụ (Kicker Tagline)</label>
                  <input
                    type="text"
                    value={aboutTagline}
                    onChange={(e) => handleSaveAboutField('tagline', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề chính (Main Section Title)</label>
                  <input
                    type="text"
                    value={aboutTitle}
                    onChange={(e) => handleSaveAboutField('title', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-extrabold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả tổng quát (General Description)</label>
                <textarea
                  rows={3}
                  value={aboutDesc}
                  onChange={(e) => handleSaveAboutField('desc', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 leading-relaxed font-medium"
                />
              </div>
            </div>

            {/* Section 2: Mission & Vision Card (Left Big Card) */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                2. Khối Sứ Mệnh & Tầm Nhìn (Big Vision Card)
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề Sứ mệnh (Vision Card Title)</label>
                  <input
                    type="text"
                    value={aboutVisionTitle}
                    onChange={(e) => handleSaveAboutField('vision_title', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nội dung chi tiết (Vision Card Content)</label>
                  <textarea
                    rows={4}
                    value={aboutVisionDesc}
                    onChange={(e) => handleSaveAboutField('vision_desc', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 leading-relaxed font-medium"
                  />
                </div>
              </div>

              {/* Stats Management */}
              <div className="border-t border-slate-200/60 pt-4 space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">3 Số liệu thống kê tiêu biểu (3 Key Stats Metrics)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aboutStats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-bold text-amber-600">Số liệu {idx + 1}</div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const updated = [...aboutStats];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            handleSaveAboutField('stats', updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-black text-slate-800"
                          placeholder="Giá trị (Ví dụ: 150k+)"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const updated = [...aboutStats];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            handleSaveAboutField('stats', updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-500 font-medium"
                          placeholder="Mô tả số liệu"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Pillars of Excellence */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                3. Các Trụ Cột Giá Trị Cốt Lõi (3 Core Pillars)
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {aboutPillars.map((pillar, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Trụ cột {idx + 1}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const updated = [...aboutPillars];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          handleSaveAboutField('pillars', updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-slate-800"
                        placeholder="Tiêu đề trụ cột"
                      />
                      <textarea
                        rows={3}
                        value={pillar.desc}
                        onChange={(e) => {
                          const updated = [...aboutPillars];
                          updated[idx] = { ...updated[idx], desc: e.target.value };
                          handleSaveAboutField('pillars', updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-500 leading-relaxed font-medium"
                        placeholder="Mô tả trụ cột"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: CEO Quote Section */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                4. Thông Điệp Từ Ban Sáng Lập (CEO Quote)
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trích dẫn / Thông điệp (Quote Statement)</label>
                  <textarea
                    rows={3}
                    value={aboutQuote}
                    onChange={(e) => handleSaveAboutField('quote', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 italic font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên người phát biểu (Author Name)</label>
                    <input
                      type="text"
                      value={aboutQuoteAuthor}
                      onChange={(e) => handleSaveAboutField('quote_author', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chức vụ / Danh xưng (Author Title/Role)</label>
                    <input
                      type="text"
                      value={aboutQuoteRole}
                      onChange={(e) => handleSaveAboutField('quote_role', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: CONFIG */}
        {activeSubTab === 'config' && (
          <div className="space-y-6 text-left max-w-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Cấu hình chung Banners & Chỉ dẫn kỹ thuật
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kích thước ảnh khuyến nghị của Banner (Recommended Image Size)</label>
                <input
                  type="text"
                  value={recommendedSize}
                  onChange={(e) => handleSaveSize(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-slate-800"
                  placeholder="e.g. 1920x800 px (Landscape) hoặc 16:9"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  * Dòng chữ này sẽ hiển thị làm hướng dẫn cho nhân viên khi họ tải lên hoặc nhập URL hình ảnh mới cho banner.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-slate-600 font-medium leading-relaxed">
                <h4 className="font-bold text-slate-800 text-xs">📌 Quy chuẩn kích thước hình ảnh tốt nhất:</h4>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>Sử dụng các hình ảnh có tỷ lệ rộng <strong>(Landscape)</strong> để tránh bị kéo dãn hoặc cắt góc quá sâu trên thiết bị PC/Tablet.</li>
                  <li>Kích thước tối ưu: <strong>1920px (chiều rộng) x 800px (chiều cao)</strong> hoặc tỷ lệ tương đương <strong>2.4:1</strong>.</li>
                  <li>Dung lượng ảnh tối ưu: dưới <strong>500KB</strong> (dạng .jpg hoặc .webp) để đảm bảo tốc độ tải trang chủ mượt mà nhất cho người dùng.</li>
                  <li>Độ tương phản: Đừng lo lắng về độ tương phản, giao diện trang chủ tự động phủ một lớp <strong>Gradient che mờ tối (Gradient Overlay Overlay)</strong> để đảm bảo chữ màu trắng luôn dễ đọc.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: PREVIEW */}
        {activeSubTab === 'preview' && (
          <div className="space-y-4 text-left">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Xem Trước Carousel Trình Chiếu Trang Chủ
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Hệ thống chuyển slide tự động sau mỗi 8s</span>
            </div>

            {/* Simulated Hero Carousel */}
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-950 shadow-inner flex flex-col justify-end p-6 border border-slate-800">
              {slides.map((slide, idx) => (
                <div key={slide.id} className="absolute inset-0 w-full h-full animate-fade-in">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>
              ))}

              <div className="relative z-10 max-w-lg text-white space-y-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                  {slides[0]?.title || 'Relax & Unwind'}
                </span>
                <h4 className="text-lg font-extrabold leading-tight">
                  {slides[0]?.subtitle || 'Discover our stunning pool and spa'}
                </h4>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  {slides[0]?.description || 'Description goes here...'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 bg-white text-slate-950 text-[10px] font-bold rounded-md shadow-sm">
                    {slides[0]?.actionText || 'Explore More'}
                  </span>
                </div>
              </div>

              {/* Slide Dots indicator */}
              <div className="absolute bottom-4 right-6 flex gap-1 z-10">
                {slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full ${idx === 0 ? 'w-4 bg-white' : 'w-1 bg-white/40'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PoliciesAdminPanel() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gs_refund_policies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      title: "Chính Sách Đổi Trả & Hoàn Tiền",
      subtitle: "Cam kết minh bạch, bảo vệ tối đa quyền lợi của quý khách hàng và chuẩn hóa thủ tục hoàn tiền tự động trong 1-3 ngày làm việc.",
      policies: [
        {
          percentage: 100,
          timeframe: "TRƯỚC 3 NGÀY (72H)",
          title: "Miễn Phí Huỷ Phòng",
          description: "Hoàn tiền 100% giá trị đặt phòng, không thu bất kỳ khoản phí phụ thu nào. Áp dụng cho mọi hình thức thanh toán."
        },
        {
          percentage: 50,
          timeframe: "1 - 3 NGÀY (24H - 72H)",
          title: "Huỷ Muộn Trả Phí",
          description: "Hoàn tiền 50% giá trị đặt phòng. 50% còn lại được khấu trừ cho chi phí giữ phòng & cơ hội phục vụ khách hàng khác."
        },
        {
          percentage: 0,
          timeframe: "DƯỚI 24 TIẾNG / NO-SHOW",
          title: "Không Hoàn Lại",
          description: "Thu phí 100% giá trị đặt phòng. Không áp dụng chính sách hoàn trả trừ trường hợp bất khả kháng được xác nhận từ địa phương."
        }
      ],
      modificationTerms: [
        "Hỗ trợ thay đổi ngày check-in, check-out hoàn toàn miễn phí trước 24 giờ.",
        "Phòng mới sau khi thay đổi sẽ áp dụng biểu giá hiện hành tại thời điểm đổi lịch.",
        "Trong trường hợp phòng mới có giá trị thấp hơn phòng cũ, số dư chênh lệch sẽ được tích lũy vào tài khoản ví điểm thưởng của hội viên.",
        "Không giới hạn số lần thay đổi đối với hội viên hạng Gold và Diamond."
      ],
      forceMajeureTerms: [
        "Khách hàng được giải quyết hủy phòng miễn phí 100% bất kể mốc thời gian trong trường hợp có thiên tai, dịch bệnh, hoặc lệnh hạn chế di chuyển từ chính quyền địa phương.",
        "Trường hợp gặp sự cố y tế đột xuất của cá nhân, vui lòng cung cấp giấy xác nhận sức khỏe từ cơ sở y tế có thẩm quyền để bộ phận lễ tân xét duyệt đặc cách hoàn phí 100%."
      ]
    };
  });

  const [toast, setToast] = useState<string | null>(null);

  const handleSave = (updated: typeof settings) => {
    localStorage.setItem('gs_refund_policies', JSON.stringify(updated));
    setSettings(updated);
    window.dispatchEvent(new Event('refund_policies_updated'));
    setToast("Đã lưu chính sách đổi trả & hoàn tiền thành công!");
    setTimeout(() => setToast(null), 3000);
  };

  const handlePolicyChange = (index: number, field: string, value: any) => {
    const updatedPolicies = [...settings.policies];
    updatedPolicies[index] = { ...updatedPolicies[index], [field]: value };
    handleSave({ ...settings, policies: updatedPolicies });
  };

  const handleAddTerm = (listKey: 'modificationTerms' | 'forceMajeureTerms') => {
    const updatedList = [...settings[listKey], "Điều khoản mới, nhấp để chỉnh sửa..."];
    handleSave({ ...settings, [listKey]: updatedList });
  };

  const handleRemoveTerm = (listKey: 'modificationTerms' | 'forceMajeureTerms', index: number) => {
    const updatedList = settings[listKey].filter((_: any, i: number) => i !== index);
    handleSave({ ...settings, [listKey]: updatedList });
  };

  const handleTermChange = (listKey: 'modificationTerms' | 'forceMajeureTerms', index: number, value: string) => {
    const updatedList = [...settings[listKey]];
    updatedList[index] = value;
    handleSave({ ...settings, [listKey]: updatedList });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-white" />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white text-left shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/15 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-base md:text-lg">Quản Lý Chính Sách Đổi Trả & Hoàn Tiền</h2>
            <p className="text-xs text-white/80 font-medium">Chỉnh sửa nội dung, mốc thời gian hoàn tiền và điều khoản áp dụng toàn hệ thống</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Main policy configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              📝 1. Tiêu Đề Chính Sách
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề chính (Title)</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleSave({ ...settings, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả phụ (Subtitle)</label>
                <textarea
                  rows={2}
                  value={settings.subtitle}
                  onChange={(e) => handleSave({ ...settings, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Individual Refund Percentage levels */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              📊 2. Biểu đồ Tỷ Lệ & Khoảng Thời Gian Hoàn Tiền
            </h3>

            <div className="space-y-6">
              {settings.policies.map((p: any, idx: number) => {
                const borderColors = ['border-l-emerald-500', 'border-l-amber-500', 'border-l-rose-500'];
                const textColors = ['text-emerald-600', 'text-amber-600', 'text-rose-600'];
                return (
                  <div key={idx} className={`p-4 border border-slate-200 border-l-4 ${borderColors[idx] || 'border-l-slate-400'} rounded-xl bg-slate-50/50 space-y-3`}>
                    <div className="flex justify-between items-center">
                      <h4 className={`font-black text-xs uppercase tracking-wide ${textColors[idx] || 'text-slate-700'}`}>
                        Mốc {idx + 1}: Hoàn trả {p.percentage}%
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">TỶ LỆ %</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.percentage}
                          onChange={(e) => handlePolicyChange(idx, 'percentage', Number(e.target.value))}
                          className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Khung thời gian (Timeframe)</label>
                        <input
                          type="text"
                          value={p.timeframe}
                          onChange={(e) => handlePolicyChange(idx, 'timeframe', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Tiêu đề phụ mốc (Label Title)</label>
                        <input
                          type="text"
                          value={p.title}
                          onChange={(e) => handlePolicyChange(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Chi tiết mô tả quyền lợi hoàn huỷ (Details)</label>
                      <textarea
                        rows={2}
                        value={p.description}
                        onChange={(e) => handlePolicyChange(idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 leading-relaxed font-medium"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic lists for terms */}
        <div className="space-y-6">
          {/* Modification Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                🔄 3. Quy định Thay Đổi (Modification)
              </h3>
              <button
                onClick={() => handleAddTerm('modificationTerms')}
                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                title="Thêm điều khoản mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {settings.modificationTerms.map((term: string, idx: number) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">Dòng {idx + 1}</span>
                    <button
                      onClick={() => handleRemoveTerm('modificationTerms', idx)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer transition-colors"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={term}
                    onChange={(e) => handleTermChange('modificationTerms', idx, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700 leading-relaxed"
                  />
                </div>
              ))}
              {settings.modificationTerms.length === 0 && (
                <p className="text-slate-400 text-xs italic text-center py-4">Chưa có điều khoản nào được thiết lập.</p>
              )}
            </div>
          </div>

          {/* Force Majeure Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                ⚠️ 4. Miễn Trừ Đặc Biệt (Force Majeure)
              </h3>
              <button
                onClick={() => handleAddTerm('forceMajeureTerms')}
                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                title="Thêm điều khoản mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {settings.forceMajeureTerms.map((term: string, idx: number) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">Dòng {idx + 1}</span>
                    <button
                      onClick={() => handleRemoveTerm('forceMajeureTerms', idx)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer transition-colors"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={term}
                    onChange={(e) => handleTermChange('forceMajeureTerms', idx, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700 leading-relaxed"
                  />
                </div>
              ))}
              {settings.forceMajeureTerms.length === 0 && (
                <p className="text-slate-400 text-xs italic text-center py-4">Chưa có điều khoản nào được thiết lập.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


