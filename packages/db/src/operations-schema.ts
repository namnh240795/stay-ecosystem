import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Complaints ─────────────────────────────────────────────────────────────

export const complaints = sqliteTable('complaints', {
  complaintsId: text('complaints_id').primaryKey(), // UUID
  complaintsGuestName: text('complaints_guest_name').notNull(),
  complaintsRoomName: text('complaints_room_name').notNull(),
  complaintsBranchName: text('complaints_branch_name').notNull(),
  complaintsTitle: text('complaints_title').notNull(),
  complaintsDetail: text('complaints_detail'),
  complaintsPriority: text('complaints_priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  complaintsStatus: text('complaints_status').notNull().default('pending'), // 'pending' | 'in_progress' | 'resolved' | 'closed'
  complaintsNotes: text('complaints_notes'),
  complaintsTime: text('complaints_time'),
  complaintsCreatedAt: text('complaints_created_at').notNull().default(''),
  complaintsUpdatedAt: text('complaints_updated_at').notNull().default(''),
});

export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;

// ─── Daily Logs ─────────────────────────────────────────────────────────────

export const dailyLogs = sqliteTable('daily_logs', {
  dailyLogsId: text('daily_logs_id').primaryKey(), // UUID
  dailyLogsAuthor: text('daily_logs_author').notNull(),
  dailyLogsShift: text('daily_logs_shift'),
  dailyLogsContent: text('daily_logs_content').notNull(),
  dailyLogsIssues: text('daily_logs_issues'),
  dailyLogsDate: text('daily_logs_date').notNull(), // ISO date string (YYYY-MM-DD)
  dailyLogsTime: text('daily_logs_time'),
  dailyLogsCreatedAt: text('daily_logs_created_at').notNull().default(''),
  dailyLogsUpdatedAt: text('daily_logs_updated_at').notNull().default(''),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;

// ─── Service Requests ───────────────────────────────────────────────────────

export const serviceRequests = sqliteTable('service_requests', {
  serviceRequestsId: text('service_requests_id').primaryKey(), // UUID
  serviceRequestsRoomName: text('service_requests_room_name').notNull(),
  serviceRequestsGuestName: text('service_requests_guest_name').notNull(),
  serviceRequestsBranchName: text('service_requests_branch_name').notNull(),
  serviceRequestsType: text('service_requests_type').notNull(),
  serviceRequestsDetail: text('service_requests_detail'),
  serviceRequestsTime: text('service_requests_time'),
  serviceRequestsStatus: text('service_requests_status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  serviceRequestsAssignedStaff: text('service_requests_assigned_staff'),
  serviceRequestsCreatedAt: text('service_requests_created_at').notNull().default(''),
  serviceRequestsUpdatedAt: text('service_requests_updated_at').notNull().default(''),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

// ─── Staff ──────────────────────────────────────────────────────────────────

export const staff = sqliteTable('staff', {
  staffId: text('staff_id').primaryKey(), // UUID
  staffUserId: text('staff_user_id'),
  staffRoleId: text('staff_role_id'),
  staffStatus: text('staff_status').notNull().default('active'), // 'active' | 'inactive' | 'on_leave'
  staffJoinedAt: text('staff_joined_at'),
  staffCreatedAt: text('staff_created_at').notNull().default(''),
  staffUpdatedAt: text('staff_updated_at').notNull().default(''),
});

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;

// ─── Roles ──────────────────────────────────────────────────────────────────

export const roles = sqliteTable('roles', {
  rolesId: text('roles_id').primaryKey(), // UUID
  rolesName: text('roles_name').notNull().unique(),
  rolesDescription: text('roles_description'),
  rolesPermissions: text('roles_permissions'), // JSON text
  rolesCreatedAt: text('roles_created_at').notNull().default(''),
  rolesUpdatedAt: text('roles_updated_at').notNull().default(''),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

// ─── Leave Requests ─────────────────────────────────────────────────────────

export const leaveRequests = sqliteTable('leave_requests', {
  leaveRequestsId: text('leave_requests_id').primaryKey(), // UUID
  leaveRequestsType: text('leave_requests_type').notNull(),
  leaveRequestsStaffName: text('leave_requests_staff_name').notNull(),
  leaveRequestsBranchName: text('leave_requests_branch_name'),
  leaveRequestsReason: text('leave_requests_reason'),
  leaveRequestsLeaveStartDate: text('leave_requests_leave_start_date'),
  leaveRequestsLeaveEndDate: text('leave_requests_leave_end_date'),
  leaveRequestsLeaveType: text('leave_requests_leave_type'),
  leaveRequestsOriginalShiftDate: text('leave_requests_original_shift_date'),
  leaveRequestsOriginalShiftName: text('leave_requests_original_shift_name'),
  leaveRequestsTargetShiftDate: text('leave_requests_target_shift_date'),
  leaveRequestsTargetShiftName: text('leave_requests_target_shift_name'),
  leaveRequestsTargetStaffName: text('leave_requests_target_staff_name'),
  leaveRequestsStatus: text('leave_requests_status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'cancelled'
  leaveRequestsResponseNotes: text('leave_requests_response_notes'),
  leaveRequestsApprovedBy: text('leave_requests_approved_by'),
  leaveRequestsCreatedAt: text('leave_requests_created_at').notNull().default(''),
  leaveRequestsUpdatedAt: text('leave_requests_updated_at').notNull().default(''),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
