import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Complaints ─────────────────────────────────────────────────────────────

export const complaints = sqliteTable('complaints', {
  id: text('id').primaryKey(), // UUID
  guestName: text('guest_name').notNull(),
  roomName: text('room_name').notNull(),
  branchName: text('branch_name').notNull(),
  title: text('title').notNull(),
  detail: text('detail'),
  priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'resolved' | 'closed'
  notes: text('notes'),
  time: text('time'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;

// ─── Daily Logs ─────────────────────────────────────────────────────────────

export const dailyLogs = sqliteTable('daily_logs', {
  id: text('id').primaryKey(), // UUID
  author: text('author').notNull(),
  roleName: text('role_name').notNull(),
  shift: text('shift'),
  content: text('content').notNull(),
  issues: text('issues'),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  time: text('time'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;

// ─── Service Requests ───────────────────────────────────────────────────────

export const serviceRequests = sqliteTable('service_requests', {
  id: text('id').primaryKey(), // UUID
  roomName: text('room_name').notNull(),
  guestName: text('guest_name').notNull(),
  branchName: text('branch_name').notNull(),
  type: text('type').notNull(),
  detail: text('detail'),
  time: text('time'),
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedStaff: text('assigned_staff'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

// ─── Staff ──────────────────────────────────────────────────────────────────

export const staff = sqliteTable('staff', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  roleId: text('role_id'),
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'on_leave'
  joinedAt: text('joined_at'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;

// ─── Roles ──────────────────────────────────────────────────────────────────

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: text('permissions'), // JSON text
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

// ─── Leave Requests ─────────────────────────────────────────────────────────

export const leaveRequests = sqliteTable('leave_requests', {
  id: text('id').primaryKey(), // UUID
  type: text('type').notNull(),
  staffName: text('staff_name').notNull(),
  roleName: text('role_name'),
  branchName: text('branch_name'),
  reason: text('reason'),
  leaveStartDate: text('leave_start_date'),
  leaveEndDate: text('leave_end_date'),
  leaveType: text('leave_type'),
  originalShiftDate: text('original_shift_date'),
  originalShiftName: text('original_shift_name'),
  targetShiftDate: text('target_shift_date'),
  targetShiftName: text('target_shift_name'),
  targetStaffName: text('target_staff_name'),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'cancelled'
  responseNotes: text('response_notes'),
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
