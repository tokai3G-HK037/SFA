"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { EstimateForm } from "@/components/estimates/estimate-form";
import { fetchEstimate } from "@/lib/api-client";

export default function EditEstimatePage({
  params,
}: PageProps<"/estimates/[id]/edit">) {
  const { id } = use(params);

  const { data: estimate, isLoading, isError } = useQuery({
    queryKey: ["estimate", id],
    queryFn: () => fetchEstimate(id),
  });

  if (isLoading) return <p className="text-muted-foreground">読み込み中...</p>;
  if (isError || !estimate) return <p className="text-destructive">見積書が見つかりません</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">見積書の編集</h1>
      <EstimateForm estimate={estimate} />
    </div>
  );
}
