"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fetchCompanyProfile, updateCompanyProfileRequest, type CompanyProfileDto } from "@/lib/api-client";
import { companyProfileInputSchema, type CompanyProfileInput } from "@/lib/validation/company-profile";

function toDefaults(profile?: CompanyProfileDto): CompanyProfileInput {
  return {
    companyName: profile?.companyName ?? "",
    postalCode: profile?.postalCode ?? "",
    address: profile?.address ?? "",
    phone: profile?.phone ?? "",
    contactName: profile?.contactName ?? "",
  };
}

export default function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: fetchCompanyProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileInputSchema),
    defaultValues: toDefaults(),
  });

  useEffect(() => {
    if (profile) reset(toDefaults(profile));
  }, [profile, reset]);

  const onSubmit = async (values: CompanyProfileInput) => {
    try {
      await updateCompanyProfileRequest(values);
      toast.success("自社情報を更新しました");
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">読み込み中...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">自社情報設定</h1>
        <p className="text-muted-foreground">
          見積書の発行者情報の初期値として使用されます。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="companyName">会社名</FieldLabel>
            <Input id="companyName" {...register("companyName")} />
            <FieldError errors={[errors.companyName]} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="postalCode">郵便番号</FieldLabel>
            <Input id="postalCode" {...register("postalCode")} />
            <FieldError errors={[errors.postalCode]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="address">住所</FieldLabel>
            <Input id="address" {...register("address")} />
            <FieldError errors={[errors.address]} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="phone">電話番号</FieldLabel>
            <Input id="phone" {...register("phone")} />
            <FieldError errors={[errors.phone]} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="contactName">担当者名</FieldLabel>
            <Input id="contactName" {...register("contactName")} />
            <FieldError errors={[errors.contactName]} />
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting}>
          保存する
        </Button>
      </form>
    </div>
  );
}
