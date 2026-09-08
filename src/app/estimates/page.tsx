"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEstimates } from "@/lib/api-client";
import { estimateStatusLabels } from "@/lib/validation/estimate";

export default function EstimatesPage() {
  const { data: estimates, isLoading, isError } = useQuery({
    queryKey: ["estimates"],
    queryFn: () => fetchEstimates(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">見積書</h1>
        <Button render={<Link href="/estimates/new" />} nativeButton={false}>
          新規見積書を作成
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>見積番号</TableHead>
              <TableHead>顧客名 / 案件名</TableHead>
              <TableHead>件名</TableHead>
              <TableHead>発行日</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-destructive">
                  データの取得に失敗しました
                </TableCell>
              </TableRow>
            )}
            {estimates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  見積書はまだありません
                </TableCell>
              </TableRow>
            )}
            {estimates?.map((estimate) => (
              <TableRow key={estimate.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link href={`/estimates/${estimate.id}`} className="block">
                    {estimate.estimateNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {estimate.project.customerName} / {estimate.project.projectName}
                </TableCell>
                <TableCell>{estimate.title}</TableCell>
                <TableCell>{estimate.issueDate.slice(0, 10)}</TableCell>
                <TableCell>
                  <Badge variant={estimate.status === "FINALIZED" ? "default" : "secondary"}>
                    {estimateStatusLabels[estimate.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {Number(estimate.totalAmount).toLocaleString()}円
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
