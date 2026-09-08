"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ProjectForm } from "@/components/projects/project-form";
import { fetchProject } from "@/lib/api-client";

export default function EditProjectPage({
  params,
}: PageProps<"/projects/[id]/edit">) {
  const { id } = use(params);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
  });

  if (isLoading) return <p className="text-muted-foreground">読み込み中...</p>;
  if (isError || !project) return <p className="text-destructive">案件が見つかりません</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">案件の編集</h1>
      <ProjectForm project={project} />
    </div>
  );
}
