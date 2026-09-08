import { prisma } from "@/lib/db";
import type { CompanyProfileInput } from "@/lib/validation/company-profile";

const SINGLETON_ID = "default";

export async function getCompanyProfile() {
  const existing = await prisma.companyProfile.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.companyProfile.create({ data: { id: SINGLETON_ID } });
}

export async function updateCompanyProfile(input: CompanyProfileInput) {
  return prisma.companyProfile.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      companyName: input.companyName,
      postalCode: input.postalCode || null,
      address: input.address || null,
      phone: input.phone || null,
      contactName: input.contactName || null,
    },
    update: {
      companyName: input.companyName,
      postalCode: input.postalCode || null,
      address: input.address || null,
      phone: input.phone || null,
      contactName: input.contactName || null,
    },
  });
}
