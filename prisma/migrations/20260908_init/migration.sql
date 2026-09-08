-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ESTIMATING', 'ORDERED', 'LOST', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('EXCLUSIVE', 'INCLUSIVE');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('SALES', 'PURCHASE');

-- CreateEnum
CREATE TYPE "FileFormat" AS ENUM ('CSV', 'XLSX');

-- CreateEnum
CREATE TYPE "Encoding" AS ENUM ('UTF8', 'SHIFT_JIS');

-- CreateEnum
CREATE TYPE "ColumnFormatType" AS ENUM ('TEXT', 'DATE', 'NUMBER');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "assignee" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ESTIMATING',
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "expectedDeliveryDate" DATE,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endUserName" TEXT,
    "endUserContactPerson" TEXT,
    "endUserAddress" TEXT,
    "endUserContact" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "supplierName" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "unit" TEXT,
    "unitPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "contactName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "estimateNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "addressee" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL,
    "issuerAddress" TEXT,
    "issuerContact" TEXT,
    "issueDate" DATE NOT NULL,
    "validUntil" DATE,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "taxType" "TaxType" NOT NULL DEFAULT 'EXCLUSIVE',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateItem" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "unit" TEXT,
    "unitPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exportType" "ExportType" NOT NULL,
    "fileFormat" "FileFormat" NOT NULL DEFAULT 'CSV',
    "encoding" "Encoding" NOT NULL DEFAULT 'UTF8',
    "delimiter" TEXT NOT NULL DEFAULT ',',
    "hasHeaderRow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportTemplateColumn" (
    "id" TEXT NOT NULL,
    "exportTemplateId" TEXT NOT NULL,
    "columnOrder" INTEGER NOT NULL DEFAULT 0,
    "headerLabel" TEXT NOT NULL,
    "sourceField" TEXT,
    "fixedValue" TEXT,
    "formatType" "ColumnFormatType",

    CONSTRAINT "ExportTemplateColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportHistory" (
    "id" TEXT NOT NULL,
    "exportTemplateId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodFrom" DATE,
    "periodTo" DATE,
    "recordCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_customerName_idx" ON "Project"("customerName");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_assignee_idx" ON "Project"("assignee");

-- CreateIndex
CREATE INDEX "Project_expectedDeliveryDate_idx" ON "Project"("expectedDeliveryDate");

-- CreateIndex
CREATE INDEX "Project_isDeleted_idx" ON "Project"("isDeleted");

-- CreateIndex
CREATE INDEX "PurchaseItem_projectId_idx" ON "PurchaseItem"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimateNumber_key" ON "Estimate"("estimateNumber");

-- CreateIndex
CREATE INDEX "Estimate_projectId_idx" ON "Estimate"("projectId");

-- CreateIndex
CREATE INDEX "Estimate_issueDate_idx" ON "Estimate"("issueDate");

-- CreateIndex
CREATE INDEX "Estimate_status_idx" ON "Estimate"("status");

-- CreateIndex
CREATE INDEX "EstimateItem_estimateId_idx" ON "EstimateItem"("estimateId");

-- CreateIndex
CREATE INDEX "ExportTemplate_exportType_idx" ON "ExportTemplate"("exportType");

-- CreateIndex
CREATE INDEX "ExportTemplateColumn_exportTemplateId_idx" ON "ExportTemplateColumn"("exportTemplateId");

-- CreateIndex
CREATE INDEX "ExportHistory_exportTemplateId_idx" ON "ExportHistory"("exportTemplateId");

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportTemplateColumn" ADD CONSTRAINT "ExportTemplateColumn_exportTemplateId_fkey" FOREIGN KEY ("exportTemplateId") REFERENCES "ExportTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportHistory" ADD CONSTRAINT "ExportHistory_exportTemplateId_fkey" FOREIGN KEY ("exportTemplateId") REFERENCES "ExportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

