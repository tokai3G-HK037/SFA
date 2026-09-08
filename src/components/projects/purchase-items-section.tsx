"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePurchaseItemRequest, type PurchaseItemDto } from "@/lib/api-client";
import { PurchaseItemDialog } from "@/components/projects/purchase-item-dialog";
import { PurchaseItemImportDialog } from "@/components/projects/purchase-item-import-dialog";

export function PurchaseItemsSection({
  projectId,
  items,
  onChanged,
}: {
  projectId: string;
  items: PurchaseItemDto[];
  onChanged: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseItemDto | undefined>();
  const [deletingItem, setDeletingItem] = useState<PurchaseItemDto | undefined>();

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deletePurchaseItemRequest(projectId, deletingItem.id);
      toast.success("仕入明細を削除しました");
      setDeletingItem(undefined);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">仕入明細</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            CSVから取り込む
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(undefined);
              setDialogOpen(true);
            }}
          >
            仕入明細を追加
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>仕入先</TableHead>
              <TableHead>品目</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead>単位</TableHead>
              <TableHead className="text-right">単価</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  仕入明細はまだありません
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.supplierName}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                <TableCell>{item.unit ?? "-"}</TableCell>
                <TableCell className="text-right">
                  {Number(item.unitPrice).toLocaleString()}円
                </TableCell>
                <TableCell className="text-right">
                  {Number(item.amount).toLocaleString()}円
                </TableCell>
                <TableCell className="flex gap-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setDialogOpen(true);
                    }}
                  >
                    編集
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeletingItem(item)}>
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {items.length > 0 && (
        <p className="text-right text-sm text-muted-foreground">
          仕入合計: {total.toLocaleString()}円
        </p>
      )}

      <PurchaseItemDialog
        projectId={projectId}
        item={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={onChanged}
      />

      <PurchaseItemImportDialog
        projectId={projectId}
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={onChanged}
      />

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>仕入明細を削除しますか?</AlertDialogTitle>
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
