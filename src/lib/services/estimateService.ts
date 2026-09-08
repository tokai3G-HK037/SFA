import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { calculateEstimateAmounts } from "@/lib/estimate-calc";
import { generateEstimateNumber } from "@/lib/services/estimateNumbering";
import type { EstimateInput, EstimateQuery } from "@/lib/validation/estimate";

export { calculateEstimateAmounts };

function toDecimal(value: number) {
  return new Prisma.Decimal(value);
}

function toDateOrNull(value: string | undefined) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function listEstimates(query: EstimateQuery) {
  const where: Prisma.EstimateWhereInput = {
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  return prisma.estimate.findMany({
    where,
    orderBy: { issueDate: "desc" },
    include: { project: { select: { customerName: true, projectName: true } } },
  });
}

export async function getEstimateById(id: string) {
  return prisma.estimate.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      project: { select: { id: true, customerName: true, projectName: true } },
    },
  });
}

export async function createEstimate(input: EstimateInput) {
  const { subtotal, taxAmount, totalAmount } = calculateEstimateAmounts(
    input.items,
    input.taxRate,
    input.taxType,
  );
  const issueDate = toDate(input.issueDate);
  const estimateNumber = await generateEstimateNumber(issueDate);

  return prisma.estimate.create({
    data: {
      projectId: input.projectId,
      estimateNumber,
      title: input.title,
      addressee: input.addressee,
      issuerName: input.issuerName,
      issuerAddress: input.issuerAddress || null,
      issuerContact: input.issuerContact || null,
      issueDate,
      validUntil: toDateOrNull(input.validUntil),
      taxRate: toDecimal(input.taxRate),
      taxType: input.taxType,
      subtotal: toDecimal(subtotal),
      taxAmount: toDecimal(taxAmount),
      totalAmount: toDecimal(totalAmount),
      status: input.status,
      notes: input.notes || null,
      items: {
        create: input.items.map((item, index) => ({
          sortOrder: index,
          name: item.name,
          quantity: toDecimal(item.quantity),
          unit: item.unit || null,
          unitPrice: toDecimal(item.unitPrice),
          amount: toDecimal(Math.round(item.quantity * item.unitPrice)),
          notes: item.notes || null,
        })),
      },
    },
    include: { items: true },
  });
}

export async function updateEstimate(id: string, input: EstimateInput) {
  const { subtotal, taxAmount, totalAmount } = calculateEstimateAmounts(
    input.items,
    input.taxRate,
    input.taxType,
  );

  return prisma.$transaction(async (tx) => {
    await tx.estimateItem.deleteMany({ where: { estimateId: id } });
    return tx.estimate.update({
      where: { id },
      data: {
        projectId: input.projectId,
        title: input.title,
        addressee: input.addressee,
        issuerName: input.issuerName,
        issuerAddress: input.issuerAddress || null,
        issuerContact: input.issuerContact || null,
        issueDate: toDate(input.issueDate),
        validUntil: toDateOrNull(input.validUntil),
        taxRate: toDecimal(input.taxRate),
        taxType: input.taxType,
        subtotal: toDecimal(subtotal),
        taxAmount: toDecimal(taxAmount),
        totalAmount: toDecimal(totalAmount),
        status: input.status,
        notes: input.notes || null,
        items: {
          create: input.items.map((item, index) => ({
            sortOrder: index,
            name: item.name,
            quantity: toDecimal(item.quantity),
            unit: item.unit || null,
            unitPrice: toDecimal(item.unitPrice),
            amount: toDecimal(Math.round(item.quantity * item.unitPrice)),
            notes: item.notes || null,
          })),
        },
      },
      include: { items: true },
    });
  });
}

export async function deleteEstimate(id: string) {
  return prisma.estimate.delete({ where: { id } });
}
