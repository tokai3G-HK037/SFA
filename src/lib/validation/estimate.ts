import { z } from "zod";

export const taxTypeValues = ["EXCLUSIVE", "INCLUSIVE"] as const;
export const taxTypeLabels: Record<(typeof taxTypeValues)[number], string> = {
  EXCLUSIVE: "外税",
  INCLUSIVE: "内税",
};

export const estimateStatusValues = ["DRAFT", "FINALIZED"] as const;
export const estimateStatusLabels: Record<(typeof estimateStatusValues)[number], string> = {
  DRAFT: "下書き",
  FINALIZED: "確定",
};

export const estimateItemInputSchema = z.object({
  name: z.string().trim().min(1, "品名を入力してください").max(200),
  quantity: z.coerce.number().min(0, "0以上を入力してください"),
  unit: z.string().trim().max(30).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0, "0以上を入力してください"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type EstimateItemInput = z.infer<typeof estimateItemInputSchema>;
export type EstimateItemFormInput = z.input<typeof estimateItemInputSchema>;

export const estimateInputSchema = z.object({
  projectId: z.string().min(1, "案件を選択してください"),
  title: z.string().trim().min(1, "件名を入力してください").max(200),
  addressee: z.string().trim().min(1, "宛先を入力してください").max(200),
  issuerName: z.string().trim().min(1, "発行者名を入力してください").max(200),
  issuerAddress: z.string().trim().max(300).optional().or(z.literal("")),
  issuerContact: z.string().trim().max(200).optional().or(z.literal("")),
  issueDate: z.string().min(1, "発行日を入力してください"), // "YYYY-MM-DD"
  validUntil: z.string().optional().or(z.literal("")),
  taxRate: z.coerce.number().min(0).max(100),
  taxType: z.enum(taxTypeValues),
  status: z.enum(estimateStatusValues),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(estimateItemInputSchema).min(1, "明細を1件以上入力してください"),
});

export type EstimateInput = z.infer<typeof estimateInputSchema>;
export type EstimateFormInput = z.input<typeof estimateInputSchema>;

export const estimateQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(estimateStatusValues).optional(),
});

export type EstimateQuery = z.infer<typeof estimateQuerySchema>;
