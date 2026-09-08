import { z } from "zod";

export const companyProfileInputSchema = z.object({
  companyName: z.string().trim().min(1, "会社名を入力してください").max(200),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  contactName: z.string().trim().max(100).optional().or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileInputSchema>;
