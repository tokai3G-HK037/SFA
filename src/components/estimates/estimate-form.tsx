"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createEstimateRequest,
  fetchCompanyProfile,
  fetchProjects,
  updateEstimateRequest,
  type EstimateDetailDto,
} from "@/lib/api-client";
import { calculateEstimateAmounts } from "@/lib/estimate-calc";
import {
  estimateInputSchema,
  estimateStatusLabels,
  estimateStatusValues,
  taxTypeLabels,
  taxTypeValues,
  type EstimateFormInput,
  type EstimateInput,
} from "@/lib/validation/estimate";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toFormDefaults(estimate?: EstimateDetailDto, defaultProjectId?: string): EstimateFormInput {
  if (estimate) {
    return {
      projectId: estimate.projectId,
      title: estimate.title,
      addressee: estimate.addressee,
      issuerName: estimate.issuerName,
      issuerAddress: estimate.issuerAddress ?? "",
      issuerContact: estimate.issuerContact ?? "",
      issueDate: estimate.issueDate.slice(0, 10),
      validUntil: estimate.validUntil ? estimate.validUntil.slice(0, 10) : "",
      taxRate: Number(estimate.taxRate),
      taxType: estimate.taxType,
      status: estimate.status,
      notes: estimate.notes ?? "",
      items: estimate.items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit ?? "",
        unitPrice: Number(item.unitPrice),
        notes: item.notes ?? "",
      })),
    };
  }

  return {
    projectId: defaultProjectId ?? "",
    title: "",
    addressee: "",
    issuerName: "",
    issuerAddress: "",
    issuerContact: "",
    issueDate: todayStr(),
    validUntil: "",
    taxRate: 10,
    taxType: "EXCLUSIVE",
    status: "DRAFT",
    notes: "",
    items: [{ name: "", quantity: 1, unit: "", unitPrice: 0, notes: "" }],
  };
}

export function EstimateForm({
  estimate,
  defaultProjectId,
}: {
  estimate?: EstimateDetailDto;
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(estimate);

  const { data: projectsResult } = useQuery({
    queryKey: ["projects", "for-estimate-select"],
    queryFn: () => fetchProjects({ pageSize: 200 }),
  });
  const { data: companyProfile } = useQuery({
    queryKey: ["company-profile"],
    queryFn: fetchCompanyProfile,
    enabled: !isEdit,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EstimateFormInput, unknown, EstimateInput>({
    resolver: zodResolver(estimateInputSchema),
    defaultValues: toFormDefaults(estimate, defaultProjectId),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // 新規作成時、自社情報を発行者情報の初期値として反映する
  useEffect(() => {
    if (!isEdit && companyProfile && !getValues("issuerName")) {
      setValue("issuerName", companyProfile.companyName);
      setValue("issuerAddress", companyProfile.address ?? "");
      setValue("issuerContact", [companyProfile.contactName, companyProfile.phone].filter(Boolean).join(" / "));
    }
  }, [companyProfile, isEdit, setValue, getValues]);

  const watchedItems = useWatch({ control, name: "items" });
  const watchedTaxRate = useWatch({ control, name: "taxRate" });
  const watchedTaxType = useWatch({ control, name: "taxType" });

  const amounts = useMemo(() => {
    const items = (watchedItems ?? []).map((item) => ({
      quantity: Number(item?.quantity) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
    }));
    const taxRate = Number(watchedTaxRate) || 0;
    return calculateEstimateAmounts(items, taxRate, watchedTaxType ?? "EXCLUSIVE");
  }, [watchedItems, watchedTaxRate, watchedTaxType]);

  const onSubmit = async (values: EstimateInput) => {
    try {
      if (isEdit && estimate) {
        await updateEstimateRequest(estimate.id, values);
        toast.success("見積書を更新しました");
        router.push(`/estimates/${estimate.id}`);
      } else {
        const created = await createEstimateRequest(values);
        toast.success("見積書を作成しました");
        router.push(`/estimates/${created.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="projectId">案件</FieldLabel>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                <SelectTrigger id="projectId" className="w-full">
                  <SelectValue placeholder="案件を選択してください">
                    {(value: string) => {
                      const project = projectsResult?.items.find((p) => p.id === value);
                      return project ? `${project.customerName} / ${project.projectName}` : value;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projectsResult?.items.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.customerName} / {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.projectId]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="title">件名</FieldLabel>
          <Input id="title" {...register("title")} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="addressee">宛先</FieldLabel>
          <Input id="addressee" placeholder="株式会社〇〇 御中" {...register("addressee")} />
          <FieldError errors={[errors.addressee]} />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="issuerName">発行者名</FieldLabel>
            <Input id="issuerName" {...register("issuerName")} />
            <FieldError errors={[errors.issuerName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="issuerAddress">発行者住所</FieldLabel>
            <Input id="issuerAddress" {...register("issuerAddress")} />
            <FieldError errors={[errors.issuerAddress]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="issuerContact">発行者連絡先</FieldLabel>
            <Input id="issuerContact" {...register("issuerContact")} />
            <FieldError errors={[errors.issuerContact]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="issueDate">発行日</FieldLabel>
            <Input id="issueDate" type="date" {...register("issueDate")} />
            <FieldError errors={[errors.issueDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="validUntil">有効期限</FieldLabel>
            <Input id="validUntil" type="date" {...register("validUntil")} />
            <FieldError errors={[errors.validUntil]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="taxRate">消費税率(%)</FieldLabel>
            <Input id="taxRate" type="number" step="0.1" min="0" max="100" {...register("taxRate")} />
            <FieldError errors={[errors.taxRate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="taxType">税区分</FieldLabel>
            <Controller
              control={control}
              name="taxType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                  <SelectTrigger id="taxType" className="w-full">
                    <SelectValue>
                      {(value: (typeof taxTypeValues)[number]) => taxTypeLabels[value]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypeValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {taxTypeLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.taxType]} />
          </Field>
        </div>

        <Field orientation="responsive">
          <FieldLabel htmlFor="status">ステータス</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                <SelectTrigger id="status" className="w-48">
                  <SelectValue>
                    {(value: (typeof estimateStatusValues)[number]) => estimateStatusLabels[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {estimateStatusValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {estimateStatusLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">明細</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ name: "", quantity: 1, unit: "", unitPrice: 0, notes: "" })}
          >
            明細行を追加
          </Button>
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">品名</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>単位</TableHead>
                <TableHead>単価</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const quantity = Number(watchedItems?.[index]?.quantity) || 0;
                const unitPrice = Number(watchedItems?.[index]?.unitPrice) || 0;
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input {...register(`items.${index}.name`)} />
                      <FieldError errors={[errors.items?.[index]?.name]} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24"
                        {...register(`items.${index}.quantity`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input className="w-20" {...register(`items.${index}.unit`)} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="1"
                        className="w-28"
                        {...register(`items.${index}.unitPrice`)}
                      />
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {Math.round(quantity * unitPrice).toLocaleString()}円
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {errors.items?.message && (
          <p className="text-sm text-destructive">{errors.items.message}</p>
        )}

        <div className="ml-auto w-full max-w-xs space-y-1 rounded-lg border bg-background p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">小計</span>
            <span>{amounts.subtotal.toLocaleString()}円</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">消費税</span>
            <span>{amounts.taxAmount.toLocaleString()}円</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>合計</span>
            <span>{amounts.totalAmount.toLocaleString()}円</span>
          </div>
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="notes">備考</FieldLabel>
        <Textarea id="notes" rows={3} {...register("notes")} />
        <FieldError errors={[errors.notes]} />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isEdit ? "更新する" : "作成する"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
