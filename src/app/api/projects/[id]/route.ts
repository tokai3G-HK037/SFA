import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, jsonError } from "@/lib/api-utils";
import {
  getProjectById,
  softDeleteProject,
  updateProject,
} from "@/lib/services/projectService";
import { projectInputSchema } from "@/lib/validation/project";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await ctx.params;
    const project = await getProjectById(id);
    if (!project) return jsonError("案件が見つかりません", 404);
    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const input = projectInputSchema.parse(body);
    const project = await updateProject(id, input);
    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await ctx.params;
    await softDeleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
