import React from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import { 
  DollarSign, 
  Building, 
  Home, 
  FileText, 
  Layers, 
  TrendingUp, 
  CalendarDays, 
  QrCode, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingDown,
  Activity,
  Award
} from 'lucide-react';
import { formatVND } from '../../utils/formatVND';

// Local copy of mock data
const WEEKLY_REVENUE = [
  { label: 'T2', hotel: 45000000, apt: 30000000, total: 75000000 },
  { label: 'T3', hotel: 52000000, apt: 35000000, total: 87000000 },
  { label: 'T4', hotel: 39000000, apt: 42000000, total: 81000000 },
  { label: 'T5', hotel: 68000000, apt: 38000000, total: 106000000 },
  { label: 'T6', hotel: 85000000, apt: 55000000, total: 140000000 },
  { label: 'T7', hotel: 120000000, apt: 60000000, total: 180000000 },
  { label: 'CN', hotel: 110000000, apt: 50000000, total: 160000000 }
];

const MONTHLY_REVENUE = [
  { label: 'Tuần 1', hotel: 280000000, apt: 180000000, total: 460000000 },
  { label: 'Tuần 2', hotel: 320000000, apt: 195000000, total: 515000000 },
  { label: 'Tuần 3', hotel: 410000000, apt: 220000000, total: 630000000 },
  { label: 'Tuần 4', hotel: 490000000, apt: 240000000, total: 730000000 }
];

const YEARLY_REVENUE = [
  { label: 'Thg 1', hotel: 1200000000, apt: 750000000, total: 1950000000 },
  { label: 'Thg 2', hotel: 1400000000, apt: 810000000, total: 2210000000 },
  { label: 'Thg 3', hotel: 1350000000, apt: 800000000, total: 2150000000 },
  { label: 'Thg 4', hotel: 1600000000, apt: 920000000, total: 2520000000 },
  { label: 'Thg 5', hotel: 1850000000, apt: 1100000000, total: 2950000000 },
  { label: 'Thg 6', hotel: 2200000000, apt: 1250000000, total: 3450000000 },
  { label: 'Thg 7', hotel: 2400000000, apt: 1300000000, total: 3700000000 },
  { label: 'Thg 8', hotel: 2100000000, apt: 1200000000, total: 3300000000 },
  { label: 'Thg 9', hotel: 1750000000, apt: 1050000000, total: 2800000000 },
  { label: 'Thg 10', hotel: 1900000000, apt: 1150000000, total: 3050000000 },
  { label: 'Thg 11', hotel: 2050000000, apt: 1200000000, total: 3250000000 },
  { label: 'Thg 12', hotel: 2600000000, apt: 1450000000, total: 4050000000 }
];

const LAST_30_DAYS_DATA = [
  { date: '01/06', bookings: 18, hotelRevenue: 48000000, aptRevenue: 25000000, totalRevenue: 73000000, occupancy: 72 },
  { date: '02/06', bookings: 15, hotelRevenue: 42000000, aptRevenue: 25000000, totalRevenue: 67000000, occupancy: 68 },
  { date: '03/06', bookings: 22, hotelRevenue: 59000000, aptRevenue: 25000000, totalRevenue: 84000000, occupancy: 75 },
  { date: '04/06', bookings: 25, hotelRevenue: 68000000, aptRevenue: 30000000, totalRevenue: 98000000, occupancy: 80 },
  { date: '05/06', bookings: 32, hotelRevenue: 85000000, aptRevenue: 35000000, totalRevenue: 120000000, occupancy: 88 },
  { date: '06/06', bookings: 38, hotelRevenue: 110000000, aptRevenue: 40000000, totalRevenue: 150000000, occupancy: 95 },
  { date: '07/06', bookings: 35, hotelRevenue: 105000000, aptRevenue: 35000000, totalRevenue: 140000000, occupancy: 92 },
  { date: '08/06', bookings: 19, hotelRevenue: 51000000, aptRevenue: 25000000, totalRevenue: 76000000, occupancy: 71 },
  { date: '09/06', bookings: 16, hotelRevenue: 44000000, aptRevenue: 25000000, totalRevenue: 69000000, occupancy: 66 },
  { date: '10/06', bookings: 21, hotelRevenue: 58000000, aptRevenue: 25000000, totalRevenue: 83000000, occupancy: 74 },
  { date: '11/06', bookings: 24, hotelRevenue: 65000000, aptRevenue: 30000000, totalRevenue: 95000000, occupancy: 79 },
  { date: '12/06', bookings: 31, hotelRevenue: 88000000, aptRevenue: 35000000, totalRevenue: 123000000, occupancy: 89 },
  { date: '13/06', bookings: 40, hotelRevenue: 120000000, aptRevenue: 40000000, totalRevenue: 160000000, occupancy: 98 },
  { date: '14/06', bookings: 36, hotelRevenue: 108000000, aptRevenue: 35000000, totalRevenue: 143000000, occupancy: 94 },
  { date: '15/06', bookings: 20, hotelRevenue: 53000000, aptRevenue: 25000000, totalRevenue: 78000000, occupancy: 73 },
  { date: '16/06', bookings: 17, hotelRevenue: 46000000, aptRevenue: 25000000, totalRevenue: 71000000, occupancy: 69 },
  { date: '17/06', bookings: 23, hotelRevenue: 61000000, aptRevenue: 25000000, totalRevenue: 86000000, occupancy: 76 },
  { date: '18/06', bookings: 26, hotelRevenue: 70000000, aptRevenue: 30000000, totalRevenue: 100000000, occupancy: 82 },
  { date: '19/06', bookings: 34, hotelRevenue: 92000000, aptRevenue: 35000000, totalRevenue: 127000000, occupancy: 90 },
  { date: '20/06', bookings: 42, hotelRevenue: 125000000, aptRevenue: 40000000, totalRevenue: 165000000, occupancy: 99 },
  { date: '21/06', bookings: 38, hotelRevenue: 112000000, aptRevenue: 35000000, totalRevenue: 147000000, occupancy: 95 },
  { date: '22/06', bookings: 22, hotelRevenue: 56000000, aptRevenue: 25000000, totalRevenue: 81000000, occupancy: 75 },
  { date: '23/06', bookings: 19, hotelRevenue: 49000000, aptRevenue: 25000000, totalRevenue: 74000000, occupancy: 70 },
  { date: '24/06', bookings: 25, hotelRevenue: 64000000, aptRevenue: 25000000, totalRevenue: 89000000, occupancy: 78 },
  { date: '25/06', bookings: 28, hotelRevenue: 74000000, aptRevenue: 30000000, totalRevenue: 104000000, occupancy: 84 },
  { date: '26/06', bookings: 36, hotelRevenue: 98000000, aptRevenue: 35000000, totalRevenue: 133000000, occupancy: 92 },
  { date: '27/06', bookings: 45, hotelRevenue: 130000000, aptRevenue: 40000000, totalRevenue: 170000000, occupancy: 100 },
  { date: '28/06', bookings: 41, hotelRevenue: 118000000, aptRevenue: 35000000, totalRevenue: 153000000, occupancy: 96 },
  { date: '29/06', bookings: 24, hotelRevenue: 59000000, aptRevenue: 25000000, totalRevenue: 84000000, occupancy: 76 },
  { date: '30/06', bookings: 23, hotelRevenue: 57000000, aptRevenue: 25000000, totalRevenue: 82000000, occupancy: 74 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl shadow-2xl text-left text-xs text-white max-w-[260px] z-50 pointer-events-none">
        <p className="font-extrabold text-blue-400 border-b border-slate-800 pb-2 mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" /> Ngày {label}
        </p>
        <div className="space-y-1.5 font-medium text-slate-300">
          {payload.map((pld: any, index: number) => {
            const isRevenue = pld.name.toLowerCase().includes('doanh thu') || pld.name.toLowerCase().includes('revenue');
            const isPercent = pld.name.includes('%') || pld.name.toLowerCase().includes('lấp đầy') || pld.name.toLowerCase().includes('occupancy');
            const valFormatted = isRevenue 
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pld.value) 
              : isPercent 
                ? `${pld.value}%` 
                : `${pld.value} lượt`;

            return (
              <p key={index} className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pld.color || pld.stroke }} />
                  {pld.name}:
                </span>
                <strong className="text-white font-bold font-mono text-xs">{valFormatted}</strong>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

interface AdminDashboardTabProps {
  grandTotalRevenue: number;
  totalHotelRevenue: number;
  totalAptRevenue: number;
  pendingContractsCount: number;
  dashboardSubTab: 'overview' | 'trends' | 'revenue' | 'occupancy';
  setDashboardSubTab: (tab: 'overview' | 'trends' | 'revenue' | 'occupancy') => void;
  revenueFilter: 'week' | 'month' | 'year';
  setRevenueFilter: (filter: 'week' | 'month' | 'year') => void;
  sepayTotalCount: number;
  sepayTotalAmount: number;
  sepayPercent: number;
  stripeTotalCount: number;
  stripeTotalAmount: number;
  stripePercent: number;
}

export default function AdminDashboardTab({
  grandTotalRevenue,
  totalHotelRevenue,
  totalAptRevenue,
  pendingContractsCount,
  dashboardSubTab,
  setDashboardSubTab,
  revenueFilter,
  setRevenueFilter,
  sepayTotalCount,
  sepayTotalAmount,
  sepayPercent,
  stripeTotalCount,
  stripeTotalAmount,
  stripePercent,
}: AdminDashboardTabProps) {
  
  const currentChartData = revenueFilter === 'week' 
    ? WEEKLY_REVENUE 
    : revenueFilter === 'month' 
      ? MONTHLY_REVENUE 
      : YEARLY_REVENUE;

  return (
    <div className="space-y-6">
      {/* Dynamic Operational Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Hệ thống hoạt động trực tuyến
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Đồng bộ thời gian thực
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Trung Tâm Vận Hành & Tổng Quan Doanh Thu
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Hợp nhất dữ liệu kinh doanh phòng nghỉ ngắn hạn, căn hộ dịch vụ dài hạn, trạng thái hợp đồng, công suất buồng phòng và các cổng dòng tiền thanh toán trực tiếp.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-3 rounded-xl shrink-0 self-start md:self-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chào ngày mới</p>
            <p className="text-xs font-black text-slate-800">Quản trị viên hệ thống</p>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Tổng Doanh Thu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng Doanh Thu</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatVND(grandTotalRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-slate-100/80 pt-3 mt-3.5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% MoM
            </span>
            <span className="text-slate-400">so với tháng trước</span>
          </div>
        </div>

        {/* Card 2: Dịch Vụ Khách Sạn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dịch Vụ Khách Sạn</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatVND(totalHotelRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-blue-100">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-slate-100/80 pt-3 mt-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-blue-600 font-bold">Chiếm 63.2%</span>
              <span className="text-slate-400">tổng cơ cấu nguồn thu</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '63.2%' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Cho Thuê Căn Hộ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cho Thuê Căn Hộ</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatVND(totalAptRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-amber-100">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-slate-100/80 pt-3 mt-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% tăng trưởng
              </span>
              <span className="text-slate-400">hợp đồng ký mới</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '36.8%' }} />
            </div>
          </div>
        </div>

        {/* Card 4: Hợp Đồng Chờ Phê Duyệt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hợp Đồng Chờ Duyệt</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {pendingContractsCount}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 border ${
              pendingContractsCount > 0 
                ? 'bg-rose-50 text-rose-600 border-rose-100' 
                : 'bg-slate-50 text-slate-400 border-slate-150'
            }`}>
              <FileText className={`w-5 h-5 ${pendingContractsCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="border-t border-slate-100/80 pt-3 mt-3.5 flex items-center justify-between text-[11px]">
            {pendingContractsCount > 0 ? (
              <>
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 animate-bounce" /> Yêu cầu xử lý gấp
                </span>
                <span className="text-slate-400">để duy trì tiến độ</span>
              </>
            ) : (
              <>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt xong tất cả
                </span>
                <span className="text-slate-400">không có tồn đọng</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Sub-Tab Navigation inside dashboard */}
      <div className="bg-slate-100 p-1.5 rounded-xl flex flex-wrap gap-1 max-w-fit border border-slate-200/50">
        <button
          type="button"
          onClick={() => setDashboardSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            dashboardSubTab === 'overview' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Layers className={`w-4 h-4 ${dashboardSubTab === 'overview' ? 'text-blue-600' : 'text-slate-400'}`} />
          Báo Cáo Tổng Hợp
        </button>
        <button
          type="button"
          onClick={() => setDashboardSubTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            dashboardSubTab === 'trends' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${dashboardSubTab === 'trends' ? 'text-indigo-600' : 'text-slate-400'}`} />
          Xu Hướng Đặt Phòng
        </button>
        <button
          type="button"
          onClick={() => setDashboardSubTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            dashboardSubTab === 'revenue' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <DollarSign className={`w-4 h-4 ${dashboardSubTab === 'revenue' ? 'text-emerald-600' : 'text-slate-400'}`} />
          Doanh Thu 30 Ngày
        </button>
        <button
          type="button"
          onClick={() => setDashboardSubTab('occupancy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            dashboardSubTab === 'occupancy' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <CalendarDays className={`w-4 h-4 ${dashboardSubTab === 'occupancy' ? 'text-teal-600' : 'text-slate-400'}`} />
          Đỉnh Điểm Occupancy
        </button>
      </div>

      {/* Sub-Tab Content Render */}
      <AnimatePresence mode="wait">
        {dashboardSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Main Upgraded Recharts Chart for General Revenue (Week/Month/Year) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600 animate-pulse" /> Biểu Đồ Xu Hướng Doanh Thu Hệ Thống
                  </h2>
                  <p className="text-slate-400 text-xs">Phân tích dòng tiền thực tế thu từ khách đặt khách sạn ngắn hạn & hợp đồng thuê căn hộ dài hạn</p>
                </div>
                {/* Period Filter Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRevenueFilter('week')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      revenueFilter === 'week' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20 font-black' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    Tuần Này
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueFilter('month')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      revenueFilter === 'month' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20 font-black' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    Tháng Này
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueFilter('year')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      revenueFilter === 'year' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20 font-black' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    Năm Nay
                  </button>
                </div>
              </div>

              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hotelGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.95}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.95}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar name="Doanh thu Khách sạn" dataKey="hotel" fill="url(#hotelGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar name="Doanh thu Căn hộ" dataKey="apt" fill="url(#aptGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Insights Grid to add functional visual excellence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Điểm Sáng Tuần Qua</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mức tăng trưởng doanh thu khách sạn đạt 14.2% nhờ chiến dịch ưu đãi kỳ nghỉ hè cho khách du lịch ngắn ngày và khách lẻ.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Vận Hành Đạt Chuẩn</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Toàn bộ các phòng khách sạn và căn hộ dài hạn đã được thẩm định tiêu chuẩn vệ sinh, an toàn phòng cháy chất lượng 5 sao.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Luồng Đối Soát Live</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hệ thống chuyển khoản QR SePay và thanh toán Stripe hoàn thành đối soát tự động đạt tỉ lệ 99.8% thành công trong vòng 1.2s.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {dashboardSubTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600 animate-pulse" /> Xu Hướng Đặt Phòng 30 Ngày Gần Nhất
                  </h2>
                  <p className="text-slate-400 text-xs">Biểu diễn số lượng lượt đặt phòng hoàn thành thành công theo ngày trong tháng này</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-150 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-500/30 animate-pulse" /> 
                    Thực tế đặt phòng
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                <div className="lg:col-span-3 w-full h-80 min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={LAST_30_DAYS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        name="Số lượt đặt" 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }} 
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2">Chỉ số đặt phòng</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Tổng đặt phòng:</span>
                        <strong className="text-slate-900 font-black font-mono">821 đơn</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Trung bình ngày:</span>
                        <strong className="text-slate-900 font-black font-mono">27.4 đơn/ngày</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Cao nhất tháng:</span>
                        <strong className="text-emerald-600 font-extrabold font-mono">45 đơn (27/06)</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Thấp nhất tháng:</span>
                        <strong className="text-slate-600 font-bold font-mono">15 đơn (02/06)</strong>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[10.5px] leading-relaxed text-indigo-850 font-medium space-y-1">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                      💡 Phân tích lưu lượng:
                    </span>
                    <p className="text-slate-600">
                      Lượng đặt phòng đạt đỉnh điểm vào các ngày Thứ 6 và Thứ 7, tăng khoảng 48% so với đầu tuần. Khách hàng đặc biệt ưu chuộng các gói lưu trú ngắn ngày dịp cuối tuần.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {dashboardSubTab === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 animate-pulse" /> Biểu Đồ Theo Dõi Doanh Thu 30 Ngày
                  </h2>
                  <p className="text-slate-400 text-xs">Dòng doanh thu hàng ngày được tách biệt chi tiết giữa khách sạn ngắn hạn và căn hộ dài hạn</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20" /> Doanh thu khách sạn
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" /> Doanh thu căn hộ
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                <div className="lg:col-span-3 w-full h-80 min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={LAST_30_DAYS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="hotelDetailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="aptDetailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area name="Doanh thu Khách sạn" type="monotone" dataKey="hotelRevenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#hotelDetailed)" />
                      <Area name="Doanh thu Căn hộ" type="monotone" dataKey="aptRevenue" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#aptDetailed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2">Tổng kết dòng tiền</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Khách sạn ngắn hạn:</span>
                        <strong className="text-slate-900 font-black font-mono">2.36B VND</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Căn hộ dài hạn:</span>
                        <strong className="text-slate-900 font-black font-mono">0.90B VND</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2.5 font-bold text-blue-600">
                        <span>Tổng cộng 30 ngày:</span>
                        <strong className="text-blue-700 font-black font-mono">3.26B VND</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Doanh thu trung bình:</span>
                        <strong className="text-slate-900 font-black font-mono text-[11px]">108.7M/ngày</strong>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[10.5px] leading-relaxed text-emerald-850 font-medium space-y-1">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                      📈 Nhận định kinh doanh:
                    </span>
                    <p className="text-slate-600">
                      Doanh thu tăng trưởng mạnh mẽ 14.5% so với cùng kỳ tháng trước nhờ tối ưu hóa phân khúc khách lẻ ngắn hạn đặt qua app.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Breakdown Cards */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  📊 Phân Tích Kênh Dòng Tiền & Cổng Thanh Toán Live
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Cổng Chuyển Khoản SePay</h4>
                          <p className="text-[10px] text-slate-400">Tự động nhận diện QR VietQR</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                        {sepayTotalCount} giao dịch
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Doanh thu qua SePay</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{formatVND(sepayTotalAmount)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Tỷ trọng kênh thanh toán</span>
                        <span>{sepayPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${sepayPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Cổng Thẻ Quốc Tế Stripe</h4>
                          <p className="text-[10px] text-slate-400">Thanh toán bảo mật chuẩn quốc tế</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100 shrink-0">
                        {stripeTotalCount} giao dịch
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Doanh thu qua Stripe</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{formatVND(stripeTotalAmount)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Tỷ trọng kênh thanh toán</span>
                        <span>{stripePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${stripePercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {dashboardSubTab === 'occupancy' && (
          <motion.div
            key="occupancy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-emerald-600 animate-pulse" /> Biểu Đồ Theo Dõi Tỷ Lệ Lấp Đầy & Đỉnh Điểm Occupancy
                  </h2>
                  <p className="text-slate-400 text-xs">Xác định các giai đoạn đỉnh điểm công suất buồng phòng để điều phối giá phòng linh hoạt</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-150 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 animate-pulse" /> 
                    Tỉ lệ lấp đầy (%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                <div className="lg:col-span-3 w-full h-80 min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={LAST_30_DAYS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area name="Tỉ lệ lấp đầy" type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#occupancyGrad)" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2">Chỉ số vận hành cơ sở</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Công suất trung bình:</span>
                        <strong className="text-slate-900 font-black font-mono">82.3%</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Đạt đỉnh tuyệt đối (100%):</span>
                        <strong className="text-indigo-600 font-black font-mono">1 lần (27/06)</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Trên ngưỡng tối ưu (&gt;90%):</span>
                        <strong className="text-slate-900 font-black font-mono">12 ngày</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Thấp nhất tháng (66%):</span>
                        <strong className="text-rose-600 font-black font-mono">09/06</strong>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-[10.5px] leading-relaxed text-amber-850 font-medium space-y-1">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1">
                      💡 Gợi ý Yield Management:
                    </span>
                    <p className="text-slate-600">
                      Hệ thống ghi nhận công suất đạt trên 95% vào tối thứ Bảy hàng tuần. Khuyến nghị cấu hình tăng giá buồng phòng tự động từ 15% đến 20% vào tối thứ Bảy để tối ưu hóa biên doanh thu thuần.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
