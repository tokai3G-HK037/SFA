"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstimatePreview } from "@/components/estimates/estimate-preview";
import { deleteEstimateRequest, fetchEstimate } from "@/lib/api-client";
import { estimateStatusLabels } from "@/lib/validation/estimate";

export default function EstimateDetailPage({
  params,
}: PageProps<"/estimates/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: estimate, isLoading, isError } = useQuery({
    queryKey: ["estimate", id],
    queryFn: () => fetchEstimate(id),
  });

  const handleDelete = async () => {
    try {
      await deleteEstimateRequest(id);
      toast.success("見積書を削除しました");
      router.push("/estimates");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">読み込み中...</p>;
  if (isError || !estimate) return <p className="text-destructive">見積書が見つかりません</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{estimate.estimateNumber}</h1>
            <Badge variant={estimate.status === "FINALIZED" ? "default" : "secondary"}>
              {estimateStatusLabels[estimate.status]}
            </Badge>
          </div>
          <Link
            href={`/projects/${estimate.project.id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {estimate.project.customerName} / {estimate.project.projectName}
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/estimates/${id}/edit`} />} nativeButton={false}>
            編集
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            削除
          </Button>
        </div>
      </div>

      <EstimatePreview estimate={estimate} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>見積書を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
