"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Separator } from "@/components/ui/separator";
import { PurchaseItemsSection } from "@/components/projects/purchase-items-section";
import { deleteProjectRequest, fetchProject } from "@/lib/api-client";
import { projectStatusLabels } from "@/lib/validation/project";

export default function ProjectDetailPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
  });

  const handleDelete = async () => {
    try {
      await deleteProjectRequest(id);
      toast.success("案件を削除しました");
      router.push("/projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">読み込み中...</p>;
  if (isError || !project) return <p className="text-destructive">案件が見つかりません</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{project.projectName}</h1>
            <Badge>{projectStatusLabels[project.status as keyof typeof projectStatusLabels]}</Badge>
          </div>
          <p className="text-muted-foreground">{project.customerName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/projects/${id}/edit`} />}
            nativeButton={false}
          >
            編集
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            削除
          </Button>
          <Button render={<Link href="/estimates" />} nativeButton={false}>
            見積書を作成
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border bg-background p-4 md:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">担当者</p>
          <p>{project.assignee ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">想定金額</p>
          <p>{Number(project.amount).toLocaleString()}円</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">期限</p>
          <p>{project.dueDate?.slice(0, 10) ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">備考</p>
          <p className="whitespace-pre-wrap">{project.notes ?? "-"}</p>
        </div>
      </div>

      <Separator />

      <PurchaseItemsSection
        projectId={id}
        items={project.purchaseItems}
        onChanged={() => queryClient.invalidateQueries({ queryKey: ["project", id] })}
      />

      <Separator />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">見積書</h2>
        {project.estimates.length === 0 ? (
          <p className="text-muted-foreground">この案件に紐づく見積書はまだありません</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-background">
            {project.estimates.map((estimate) => (
              <li key={estimate.id} className="flex items-center justify-between p-3">
                <Link href={`/estimates/${estimate.id}`} className="hover:underline">
                  {estimate.estimateNumber} - {estimate.title}
                </Link>
                <span>{Number(estimate.totalAmount).toLocaleString()}円</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>案件を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              削除した案件は一覧に表示されなくなります。この操作は取り消せません。
            </AlertDialogDescription>
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
