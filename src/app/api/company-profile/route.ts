import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { getCompanyProfile, updateCompanyProfile } from "@/lib/services/companyProfileService";
import { companyProfileInputSchema } from "@/lib/validation/company-profile";

export async function GET() {
  try {
    const profile = await getCompanyProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const input = companyProfileInputSchema.parse(body);
    const profile = await updateCompanyProfile(input);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
