/**
 * Kontrak Data Modul Admin Checker (Tugas Petugas & Rekap Laporan Harian)
 * Selaras dengan porta-be TasksController (/task-reviews/admin/*) & DailyReportsController (/daily-reports/*)
 */

export interface CheckerOfficerSummary {
  id: number;
  fullName: string;
  email: string;
  role: string;
  portId?: number | null;
}

export interface CheckerTaskItem {
  id: number;
  taskCode: string;
  title: string;
  description?: string | null;
  taskType: string;
  executionStatus:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "COMPLETED"
    | "OVERDUE"
    | "CANCELLED";
  reviewStatus:
    | "PENDING_SUBMISSION"
    | "WAITING_ADMIN"
    | "ADMIN_REVIEW"
    | "ADMIN_RETURNED"
    | "ADMIN_APPROVED"
    | "WAITING_HEAD_VERIFICATION"
    | "HEAD_RETURNED"
    | "HEAD_VERIFIED";
  priority?: string;
  isOverdue: boolean;
  hasIssue?: boolean;
  issueNotes?: string | null;
  dueDate?: string | null;
  submittedAt?: string | null;
  assigneeId?: number | null;
  assignee?: {
    id: number;
    fullName: string;
    email?: string;
    role?: string;
  } | null;
  berth?: {
    id: number;
    code: string;
    name: string;
  } | null;
  visit?: {
    id: number;
    visitNumber: string;
    vessel?: { name: string } | null;
  } | null;
  attachments?: Array<{
    id: number;
    fileName: string;
    filePath: string;
    notes?: string | null;
  }>;
}

export interface AdminCheckerDashboardResponse {
  portId: number | string;
  summary: {
    totalOfficers: number;
    activeAssignmentsCount: number;
    totalObligatedTasks: number;
    notStartedCount: number;
    unsubmittedCount: number;
    waitingAdminReviewCount: number;
    incompleteReturnedCount: number;
    overdueCount: number;
    completedCount: number;
  };
  officers: CheckerOfficerSummary[];
  queues: {
    notStartedTasks: CheckerTaskItem[];
    unsubmittedTasks: CheckerTaskItem[];
    waitingAdminReviewTasks: CheckerTaskItem[];
    incompleteReturnedTasks: CheckerTaskItem[];
    overdueTasks: CheckerTaskItem[];
  };
}

export interface OfficerDailyObligationItem {
  officer: {
    id: number;
    fullName: string;
    email: string;
    portId?: number | null;
    port?: { id: number; code: string; name: string } | null;
  };
  overallObligationStatus:
    | "NO_OBLIGATION"
    | "OBLIGATION_NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "INCOMPLETE_RETURNED"
    | "ADMIN_CHECKED"
    | "HEAD_VERIFIED";
  metrics: {
    totalObligated: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    unsubmitted: number;
    returned: number;
    overdue: number;
    withIssues: number;
    adminChecked: number;
    headVerified: number;
    completed: number;
  };
}

export interface DailyObligationRecapResponse {
  date?: string;
  summary?: {
    totalOfficers: number;
    officersWithObligations?: number;
    fullyVerifiedCount?: number;
    adminCheckedCount?: number;
    unsubmittedOfficersCount?: number;
  };
  officers: OfficerDailyObligationItem[];
}

export interface CheckerDailyReportItem {
  id: number;
  reportNumber: string;
  portId: number;
  reportDate: string;
  shiftName: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "ADMIN_CHECKED"
    | "HEAD_VERIFIED"
    | "RETURNED"
    | "ACKNOWLEDGED";
  summaryNotes?: string | null;
  adminCheckNotes?: string | null;
  officer?: {
    id: number;
    fullName: string;
    role?: string;
  } | null;
  port?: {
    id: number;
    code: string;
    name: string;
  } | null;
  createdAt: string;
}
