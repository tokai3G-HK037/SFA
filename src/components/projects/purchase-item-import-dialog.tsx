"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  importPurchaseItemsRequest,
  type PurchaseItemImportError,
} from "@/lib/api-client";

const encodingLabels = { utf8: "UTF-8", shift_jis: "Shift_JIS(Excel等)" } as const;

export function PurchaseItemImportDialog({
  projectId,
  open,
  onOpenChange,
  onImported,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [encoding, setEncoding] = useState<"utf8" | "shift_jis">("utf8");
  const [rowErrors, setRowErrors] = useState<{ row: number; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImport = async () => {
    if (!file) {
      toast.error("CSVファイルを選択してください");
      return;
    }
    setSubmitting(true);
    setRowErrors([]);
    try {
      const result = await importPurchaseItemsRequest(projectId, file, encoding);
      toast.success(`${result.imported}件の仕入明細を取り込みました`);
      setFile(null);
      onOpenChange(false);
      onImported();
    } catch (error) {
      const importError = error as PurchaseItemImportError;
      if (importError.rowErrors?.length) {
        setRowErrors(importError.rowErrors);
      }
      toast.error(importError.message || "取り込みに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>仕入明細をCSVから取り込む</DialogTitle>
          <DialogDescription>
            列見出し「仕入先,品目,数量,単位,単価,備考」のCSVファイルを取り込めます。数量は値引き行のためマイナスも入力できます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <a
            href={`/api/projects/${projectId}/purchase-items/import`}
            className="text-sm text-primary underline underline-offset-4"
          >
            テンプレートCSVをダウンロード
          </a>

          <Field>
            <FieldLabel htmlFor="import-file">CSVファイル</FieldLabel>
            <input
              id="import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="import-encoding">文字コード</FieldLabel>
            <Select value={encoding} onValueChange={(value) => value && setEncoding(value as "utf8" | "shift_jis")}>
              <SelectTrigger id="import-encoding" className="w-full">
                <SelectValue>{(value: "utf8" | "shift_jis") => encodingLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utf8">{encodingLabels.utf8}</SelectItem>
                <SelectItem value="shift_jis">{encodingLabels.shift_jis}</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {rowErrors.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <p className="font-medium">取り込めなかった行があります:</p>
              <ul className="mt-1 list-disc pl-4">
                {rowErrors.map((rowError) => (
                  <li key={rowError.row}>
                    {rowError.row}行目: {rowError.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={submitting}>
            取り込む
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
