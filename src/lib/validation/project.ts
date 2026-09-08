import { z } from "zod";

export const projectStatusValues = [
  "ESTIMATING",
  "ORDERED",
  "LOST",
  "COMPLETED",
] as const;

export const projectStatusLabels: Record<(typeof projectStatusValues)[number], string> = {
  ESTIMATING: "見積中",
  ORDERED: "受注",
  LOST: "失注",
  COMPLETED: "完了",
};

export const projectInputSchema = z.object({
  customerName: z.string().trim().min(1, "顧客名を入力してください").max(200),
  projectName: z.string().trim().min(1, "案件名を入力してください").max(200),
  assignee: z.string().trim().max(100).optional().or(z.literal("")),
  status: z.enum(projectStatusValues),
  amount: z.coerce.number().min(0, "0以上を入力してください"),
  expectedDeliveryDate: z.string().optional().or(z.literal("")), // "YYYY-MM-DD" 予定納期
  notes: z.string().max(2000).optional().or(z.literal("")),
  // エンドユーザー(納品先の最終顧客)情報
  endUserName: z.string().trim().max(200).optional().or(z.literal("")),
  endUserContactPerson: z.string().trim().max(100).optional().or(z.literal("")),
  endUserAddress: z.string().trim().max(300).optional().or(z.literal("")),
  endUserContact: z.string().trim().max(200).optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
// フォーム入力時点(coerce前)の型。amountが未入力の間は文字列/未定義になりうるためAPI送信用の
// ProjectInputとは別に持つ。react-hook-formのuseFormにはこちらを渡す。
export type ProjectFormInput = z.input<typeof projectInputSchema>;

export const purchaseItemInputSchema = z.object({
  supplierName: z.string().trim().min(1, "仕入先を入力してください").max(200),
  itemName: z.string().trim().min(1, "品目を入力してください").max(200),
  // 値引き行を入力できるよう数量はマイナスも許容する
  quantity: z.coerce.number(),
  unit: z.string().trim().max(30).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0, "0以上を入力してください"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type PurchaseItemInput = z.infer<typeof purchaseItemInputSchema>;
export type PurchaseItemFormInput = z.input<typeof purchaseItemInputSchema>;

export const projectQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(projectStatusValues).optional(),
  assignee: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;
