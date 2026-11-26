import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import { TaskAttachmentItem, TaskDetailItem } from "@/types/task.types";

export interface OfficerChecklistPatchItem {
  code: string;
  checkedByOfficer: boolean;
  officerNotes?: string;
  isApplicable?: boolean;
}

export const TaskService = {
  async listTasks(params?: {
    executionStatus?: string;
    reviewStatus?: string;
  }): Promise<TaskDetailItem[]> {
    const res = await apiClient.get<TaskDetailItem[]>(
      API_CONFIG.ENDPOINTS.TASKS.BASE,
      params ? { params } : undefined
    );
    return Array.isArray(res) ? res : [];
  },

  getTaskById(taskId: number): Promise<TaskDetailItem> {
    return apiClient.get<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}`
    );
  },

  createTask(payload: {
    taskType: string;
    title: string;
    description: string;
    portId: number;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    sourceType?: string;
  }): Promise<TaskDetailItem> {
    return apiClient.post<TaskDetailItem>(
      API_CONFIG.ENDPOINTS.TASKS.BASE,
      payload
    );
  },

  startTask(taskId: number): Promise<TaskDetailItem> {
    return apiClient.patch<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}/start`
    );
  },

  updateOfficerChecklist(
    taskId: number,
    payload: {
      items: OfficerChecklistPatchItem[];
      hasIssue?: boolean;
      issueNotes?: string;
      notes?: string;
    }
  ): Promise<TaskDetailItem> {
    return apiClient.patch<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}/checklist`,
      payload
    );
  },

  uploadAttachment(
    taskId: number,
    file: File,
    options?: {
      checklistItemId?: number;
      checklistItemCode?: string;
      notes?: string;
    }
  ): Promise<TaskAttachmentItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.checklistItemId) {
      formData.append("checklistItemId", String(options.checklistItemId));
    }
    if (options?.checklistItemCode) {
      formData.append("checklistItemCode", options.checklistItemCode);
    }
    if (options?.notes) {
      formData.append("notes", options.notes);
    }
    return apiClient.post<TaskAttachmentItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}/attachments`,
      formData
    );
  },

  submitTask(
    taskId: number,
    payload?: {
      notes?: string;
      checklistItems?: OfficerChecklistPatchItem[];
    }
  ): Promise<TaskDetailItem> {
    return apiClient.post<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}/submit`,
      payload ?? {}
    );
  },
};
