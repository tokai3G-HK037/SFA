"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchProjects } from "@/lib/api-client";
import { projectStatusLabels, projectStatusValues } from "@/lib/validation/project";

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ESTIMATING: "secondary",
  ORDERED: "default",
  LOST: "destructive",
  COMPLETED: "outline",
};

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", { query, status }],
    queryFn: () =>
      fetchProjects({
        query: query || undefined,
        status: status === "ALL" ? undefined : status,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">案件管理</h1>
        <Button render={<Link href="/projects/new" />} nativeButton={false}>
          新規案件を登録
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="顧客名・案件名で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(value) => value && setStatus(value)}>
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string) =>
                value === "ALL"
                  ? "すべてのステータス"
                  : projectStatusLabels[value as keyof typeof projectStatusLabels]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべてのステータス</SelectItem>
            {projectStatusValues.map((value) => (
              <SelectItem key={value} value={value}>
                {projectStatusLabels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>顧客名</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>期限</TableHead>
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
            {data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  該当する案件がありません
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((project) => (
              <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="block">
                    {project.customerName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="block">
                    {project.projectName}
                  </Link>
                </TableCell>
                <TableCell>{project.assignee ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[project.status]}>
                    {projectStatusLabels[project.status as keyof typeof projectStatusLabels]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {Number(project.amount).toLocaleString()}円
                </TableCell>
                <TableCell>{project.dueDate?.slice(0, 10) ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <p className="text-sm text-muted-foreground">全 {data.total} 件</p>
      )}
    </div>
  );
}
