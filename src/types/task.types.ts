export interface TaskSourceDocument {
  label: string;
  fileName: string;
  filePath: string;
  status?: string;
}

export interface TaskSourceContext {
  kind: string;
  referenceCode: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  details: Record<string, string | number | boolean | null>;
  documents: TaskSourceDocument[];
}

export interface TaskChecklistItem {
  id: number;
  taskId: number;
  itemOrder: number;
  code: string;
  label: string;
  isRequired: boolean;
  isApplicable: boolean;
  requiresAttachment: boolean;
  checkedByOfficer: boolean;
  officerNotes?: string | null;
  attachmentPath?: string | null;
  checkedByAdmin: boolean;
  adminNotes?: string | null;
}

export interface TaskAttachmentItem {
  id: number;
  taskId: number;
  checklistItemId?: number | null;
  fileName: string;
  filePath: string;
  mimeType: string;
  notes?: string | null;
  createdAt: string;
}

export interface TaskDetailItem {
  id: number;
  taskNumber: string;
  taskType: string;
  title: string;
  description: string;
  sourceType: string;
  sourceId?: string | null;
  portId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  obligationDate: string;
  dueDate: string;
  executionStatus:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "COMPLETED"
    | "OVERDUE"
    | "CANCELLED";
  reviewStatus:
    | "NOT_SUBMITTED"
    | "WAITING_ADMIN"
    | "ADMIN_REVIEW"
    | "ADMIN_RETURNED"
    | "ADMIN_APPROVED"
    | "WAITING_HEAD_VERIFICATION"
    | "HEAD_RETURNED"
    | "HEAD_VERIFIED"
    | "HEAD_REJECTED";
  isOverdue: boolean;
  hasIssue: boolean;
  issueNotes?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  adminReviewNotes?: string | null;
  headVerifyNotes?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  assignee?: {
    id: number;
    fullName: string;
    email?: string;
    role?: string;
  } | null;
  berth?: { id: number; code: string; name: string } | null;
  visit?: {
    id: number;
    visitNumber: string;
    vessel?: { name: string } | null;
  } | null;
  checklistItems: TaskChecklistItem[];
  attachments: TaskAttachmentItem[];
  sourceContext?: TaskSourceContext | null;
}

export interface DomainBreakdownItem {
  domainCode: string;
  domainLabel: string;
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  returned: number;
  headVerified: number;
  overdue: number;
  withIssues: number;
}

export interface HeadBottleneckItem {
  taskId: number;
  taskNumber: string;
  title: string;
  taskType: string;
  sourceType: string;
  priority: string;
  executionStatus: string;
  reviewStatus: string;
  stage:
    | "STUCK_AT_OFFICER"
    | "RETURNED_LOOP"
    | "STUCK_AT_ADMIN_CHECKER"
    | "WAITING_HEAD";
  isOverdue: boolean;
  hasIssue: boolean;
  issueNotes?: string | null;
  agingHours: number;
  dueDate: string;
  currentHolder: {
    id: number | null;
    fullName: string;
    role: string;
  };
  missingChecklistItems: Array<{
    code: string;
    label: string;
    requiresAttachment: boolean;
    missingAttachment: boolean;
    checkedByOfficer: boolean;
    checkedByAdmin: boolean;
  }>;
  lastReturnReason?: string | null;
  returnCount: number;
}

export interface HeadBottlenecksResponse {
  summary: {
    totalActive: number;
    stuckAtOfficer: number;
    returnedLoop: number;
    stuckAtAdminChecker: number;
    waitingHead: number;
    overdueCount: number;
  };
  items: HeadBottleneckItem[];
}
