"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  addPurchaseItemRequest,
  updatePurchaseItemRequest,
  type PurchaseItemDto,
} from "@/lib/api-client";
import {
  purchaseItemInputSchema,
  type PurchaseItemFormInput,
  type PurchaseItemInput,
} from "@/lib/validation/project";

function toDefaults(item?: PurchaseItemDto): PurchaseItemFormInput {
  return {
    supplierName: item?.supplierName ?? "",
    itemName: item?.itemName ?? "",
    quantity: item ? Number(item.quantity) : 1,
    unit: item?.unit ?? "",
    unitPrice: item ? Number(item.unitPrice) : 0,
    notes: item?.notes ?? "",
  };
}

export function PurchaseItemDialog({
  projectId,
  item,
  open,
  onOpenChange,
  onSaved,
}: {
  projectId: string;
  item?: PurchaseItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(item);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseItemFormInput, unknown, PurchaseItemInput>({
    resolver: zodResolver(purchaseItemInputSchema),
    defaultValues: toDefaults(item),
  });

  useEffect(() => {
    if (open) reset(toDefaults(item));
  }, [open, item, reset]);

  const onSubmit = async (values: PurchaseItemInput) => {
    try {
      if (isEdit && item) {
        await updatePurchaseItemRequest(projectId, item.id, values);
        toast.success("仕入明細を更新しました");
      } else {
        await addPurchaseItemRequest(projectId, values);
        toast.success("仕入明細を追加しました");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "仕入明細の編集" : "仕入明細の追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel htmlFor="supplierName">仕入先</FieldLabel>
              <Input id="supplierName" {...register("supplierName")} />
              <FieldError errors={[errors.supplierName]} />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="itemName">品目</FieldLabel>
              <Input id="itemName" {...register("itemName")} />
              <FieldError errors={[errors.itemName]} />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="quantity">数量</FieldLabel>
              <Input id="quantity" type="number" step="0.01" {...register("quantity")} />
              <FieldError errors={[errors.quantity]} />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="unit">単位</FieldLabel>
              <Input id="unit" {...register("unit")} />
              <FieldError errors={[errors.unit]} />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="unitPrice">単価(円)</FieldLabel>
              <Input id="unitPrice" type="number" step="1" {...register("unitPrice")} />
              <FieldError errors={[errors.unitPrice]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">備考</FieldLabel>
              <Input id="notes" {...register("notes")} />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
