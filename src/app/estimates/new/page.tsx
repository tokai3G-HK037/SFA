"use client";

import { use } from "react";
import { EstimateForm } from "@/components/estimates/estimate-form";

export default function NewEstimatePage({
  searchParams,
}: PageProps<"/estimates/new">) {
  const params = use(searchParams);
  const projectId = typeof params.projectId === "string" ? params.projectId : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">見積書の作成</h1>
      <EstimateForm defaultProjectId={projectId} />
    </div>
  );
}
