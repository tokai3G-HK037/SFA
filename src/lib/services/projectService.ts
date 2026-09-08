import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { ProjectInput, ProjectQuery, PurchaseItemInput } from "@/lib/validation/project";

function toDecimalInput(value: number) {
  return new Prisma.Decimal(value);
}

function toDateOrNull(value: string | undefined) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

export async function listProjects(query: ProjectQuery) {
  const where: Prisma.ProjectWhereInput = {
    isDeleted: false,
    ...(query.status ? { status: query.status } : {}),
    ...(query.assignee ? { assignee: { contains: query.assignee } } : {}),
    ...(query.query
      ? {
          OR: [
            { customerName: { contains: query.query } },
            { projectName: { contains: query.query } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getProjectById(id: string) {
  return prisma.project.findFirst({
    where: { id, isDeleted: false },
    include: {
      estimates: { orderBy: { issueDate: "desc" } },
      purchaseItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createProject(input: ProjectInput) {
  return prisma.project.create({
    data: {
      customerName: input.customerName,
      projectName: input.projectName,
      assignee: input.assignee || null,
      status: input.status,
      amount: toDecimalInput(input.amount),
      dueDate: toDateOrNull(input.dueDate),
      notes: input.notes || null,
    },
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  return prisma.project.update({
    where: { id },
    data: {
      customerName: input.customerName,
      projectName: input.projectName,
      assignee: input.assignee || null,
      status: input.status,
      amount: toDecimalInput(input.amount),
      dueDate: toDateOrNull(input.dueDate),
      notes: input.notes || null,
    },
  });
}

export async function softDeleteProject(id: string) {
  return prisma.project.update({
    where: { id },
    data: { isDeleted: true },
  });
}

// ── 仕入明細 ─────────────────────────────

export async function listPurchaseItems(projectId: string) {
  return prisma.purchaseItem.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function addPurchaseItem(projectId: string, input: PurchaseItemInput) {
  const amount = input.quantity * input.unitPrice;
  const maxSortOrder = await prisma.purchaseItem.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  return prisma.purchaseItem.create({
    data: {
      projectId,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      supplierName: input.supplierName,
      itemName: input.itemName,
      quantity: toDecimalInput(input.quantity),
      unit: input.unit || null,
      unitPrice: toDecimalInput(input.unitPrice),
      amount: toDecimalInput(amount),
      notes: input.notes || null,
    },
  });
}

export async function updatePurchaseItem(
  projectId: string,
  itemId: string,
  input: PurchaseItemInput,
) {
  const amount = input.quantity * input.unitPrice;
  return prisma.purchaseItem.update({
    where: { id: itemId, projectId },
    data: {
      supplierName: input.supplierName,
      itemName: input.itemName,
      quantity: toDecimalInput(input.quantity),
      unit: input.unit || null,
      unitPrice: toDecimalInput(input.unitPrice),
      amount: toDecimalInput(amount),
      notes: input.notes || null,
    },
  });
}

export async function deletePurchaseItem(projectId: string, itemId: string) {
  return prisma.purchaseItem.delete({
    where: { id: itemId, projectId },
  });
}
