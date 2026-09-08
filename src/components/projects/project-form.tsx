"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createProjectRequest,
  updateProjectRequest,
  type ProjectDto,
} from "@/lib/api-client";
import {
  projectInputSchema,
  projectStatusLabels,
  projectStatusValues,
  type ProjectFormInput,
  type ProjectInput,
} from "@/lib/validation/project";

function toFormDefaults(project?: ProjectDto): ProjectFormInput {
  return {
    customerName: project?.customerName ?? "",
    projectName: project?.projectName ?? "",
    assignee: project?.assignee ?? "",
    status: project?.status ?? "ESTIMATING",
    amount: project ? Number(project.amount) : 0,
    dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : "",
    notes: project?.notes ?? "",
  };
}

export function ProjectForm({ project }: { project?: ProjectDto }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: toFormDefaults(project),
  });

  const onSubmit = async (values: ProjectInput) => {
    try {
      if (isEdit && project) {
        await updateProjectRequest(project.id, values);
        toast.success("案件を更新しました");
        router.push(`/projects/${project.id}`);
      } else {
        const created = await createProjectRequest(values);
        toast.success("案件を登録しました");
        router.push(`/projects/${created.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="customerName">顧客名</FieldLabel>
          <Input id="customerName" {...register("customerName")} />
          <FieldError errors={[errors.customerName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="projectName">案件名</FieldLabel>
          <Input id="projectName" {...register("projectName")} />
          <FieldError errors={[errors.projectName]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="assignee">担当者</FieldLabel>
          <Input id="assignee" {...register("assignee")} />
          <FieldError errors={[errors.assignee]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="status">ステータス</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => value && field.onChange(value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {projectStatusLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="amount">想定金額(円)</FieldLabel>
          <Input id="amount" type="number" step="1" min="0" {...register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="dueDate">期限</FieldLabel>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">備考</FieldLabel>
          <Textarea id="notes" rows={4} {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isEdit ? "更新する" : "登録する"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
