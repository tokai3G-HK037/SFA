import type { ProjectInput, PurchaseItemInput } from "@/lib/validation/project";

export type ProjectStatus = "ESTIMATING" | "ORDERED" | "LOST" | "COMPLETED";

export type ProjectDto = {
  id: string;
  customerName: string;
  projectName: string;
  assignee: string | null;
  status: ProjectStatus;
  amount: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseItemDto = {
  id: string;
  projectId: string;
  sortOrder: number;
  supplierName: string;
  itemName: string;
  quantity: string;
  unit: string | null;
  unitPrice: string;
  amount: string;
  notes: string | null;
};

export type ProjectDetailDto = ProjectDto & {
  purchaseItems: PurchaseItemDto[];
  estimates: Array<{
    id: string;
    estimateNumber: string;
    title: string;
    issueDate: string;
    totalAmount: string;
    status: string;
  }>;
};

export type ProjectListResult = {
  items: ProjectDto[];
  total: number;
  page: number;
  pageSize: number;
};

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "エラーが発生しました" }));
    throw new Error(body.error ?? `リクエストに失敗しました (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchProjects(params: {
  query?: string;
  status?: string;
  assignee?: string;
  page?: number;
}) {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.assignee) search.set("assignee", params.assignee);
  if (params.page) search.set("page", String(params.page));
  return request<ProjectListResult>(`/api/projects?${search.toString()}`);
}

export function fetchProject(id: string) {
  return request<ProjectDetailDto>(`/api/projects/${id}`);
}

export function createProjectRequest(input: ProjectInput) {
  return request<ProjectDto>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProjectRequest(id: string, input: ProjectInput) {
  return request<ProjectDto>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteProjectRequest(id: string) {
  return request<{ ok: true }>(`/api/projects/${id}`, { method: "DELETE" });
}

export function addPurchaseItemRequest(projectId: string, input: PurchaseItemInput) {
  return request<PurchaseItemDto>(`/api/projects/${projectId}/purchase-items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePurchaseItemRequest(
  projectId: string,
  itemId: string,
  input: PurchaseItemInput,
) {
  return request<PurchaseItemDto>(`/api/projects/${projectId}/purchase-items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletePurchaseItemRequest(projectId: string, itemId: string) {
  return request<{ ok: true }>(`/api/projects/${projectId}/purchase-items/${itemId}`, {
    method: "DELETE",
  });
}
