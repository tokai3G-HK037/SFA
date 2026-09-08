import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { createProject, listProjects } from "@/lib/services/projectService";
import { projectInputSchema, projectQuerySchema } from "@/lib/validation/project";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = projectQuerySchema.parse({
      query: searchParams.get("query") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      assignee: searchParams.get("assignee") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });
    const result = await listProjects(query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = projectInputSchema.parse(body);
    const project = await createProject(input);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
