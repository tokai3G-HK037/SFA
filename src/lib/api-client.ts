import type { ProjectInput, PurchaseItemInput } from "@/lib/validation/project";
import type { EstimateInput } from "@/lib/validation/estimate";
import type { CompanyProfileInput } from "@/lib/validation/company-profile";

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

export type TaxType = "EXCLUSIVE" | "INCLUSIVE";
export type EstimateStatus = "DRAFT" | "FINALIZED";

export type EstimateItemDto = {
  id: string;
  estimateId: string;
  sortOrder: number;
  name: string;
  quantity: string;
  unit: string | null;
  unitPrice: string;
  amount: string;
  notes: string | null;
};

export type EstimateDto = {
  id: string;
  projectId: string;
  estimateNumber: string;
  title: string;
  addressee: string;
  issuerName: string;
  issuerAddress: string | null;
  issuerContact: string | null;
  issueDate: string;
  validUntil: string | null;
  taxRate: string;
  taxType: TaxType;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  status: EstimateStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EstimateListItemDto = EstimateDto & {
  project: { customerName: string; projectName: string };
};

export type EstimateDetailDto = EstimateDto & {
  items: EstimateItemDto[];
  project: { id: string; customerName: string; projectName: string };
};

export type CompanyProfileDto = {
  id: string;
  companyName: string;
  postalCode: string | null;
  address: string | null;
  phone: string | null;
  contactName: string | null;
  updatedAt: string;
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
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.assignee) search.set("assignee", params.assignee);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
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

// ── 見積書 ─────────────────────────────

export function fetchEstimates(params: { projectId?: string; status?: string } = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.status) search.set("status", params.status);
  return request<EstimateListItemDto[]>(`/api/estimates?${search.toString()}`);
}

export function fetchEstimate(id: string) {
  return request<EstimateDetailDto>(`/api/estimates/${id}`);
}

export function createEstimateRequest(input: EstimateInput) {
  return request<EstimateDetailDto>("/api/estimates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEstimateRequest(id: string, input: EstimateInput) {
  return request<EstimateDetailDto>(`/api/estimates/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteEstimateRequest(id: string) {
  return request<{ ok: true }>(`/api/estimates/${id}`, { method: "DELETE" });
}

// ── 自社情報 ─────────────────────────────

export function fetchCompanyProfile() {
  return request<CompanyProfileDto>("/api/company-profile");
}

export function updateCompanyProfileRequest(input: CompanyProfileInput) {
  return request<CompanyProfileDto>("/api/company-profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
