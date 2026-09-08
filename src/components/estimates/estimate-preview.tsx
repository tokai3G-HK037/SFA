import { taxTypeLabels } from "@/lib/validation/estimate";
import type { EstimateDetailDto } from "@/lib/api-client";

// 見積書の印刷イメージ表示。将来のPDF/Excel出力(react-pdf等)でもこの構造を土台にする想定。
export function EstimatePreview({ estimate }: { estimate: EstimateDetailDto }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-lg border bg-background p-8 print:border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">見積番号: {estimate.estimateNumber}</p>
          <p className="text-sm text-muted-foreground">
            発行日: {estimate.issueDate.slice(0, 10)}
          </p>
          {estimate.validUntil && (
            <p className="text-sm text-muted-foreground">
              有効期限: {estimate.validUntil.slice(0, 10)}
            </p>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{estimate.issuerName}</p>
          {estimate.issuerAddress && <p>{estimate.issuerAddress}</p>}
          {estimate.issuerContact && <p>{estimate.issuerContact}</p>}
        </div>
      </div>

      <h1 className="text-center text-2xl font-bold tracking-wide">御見積書</h1>

      <div className="flex items-end justify-between border-b pb-2">
        <p className="text-lg font-semibold">{estimate.addressee}</p>
        <p className="text-2xl font-bold">
          {Number(estimate.totalAmount).toLocaleString()}円
          <span className="ml-1 text-sm font-normal text-muted-foreground">(税込)</span>
        </p>
      </div>

      <p className="font-medium">{estimate.title}</p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4">品名</th>
            <th className="py-2 pr-2 text-right">数量</th>
            <th className="py-2 pr-4">単位</th>
            <th className="py-2 pr-4 text-right">単価</th>
            <th className="py-2 text-right">金額</th>
          </tr>
        </thead>
        <tbody>
          {estimate.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2 pr-4">{item.name}</td>
              <td className="py-2 pr-2 text-right">{Number(item.quantity)}</td>
              <td className="py-2 pr-4">{item.unit ?? ""}</td>
              <td className="py-2 pr-4 text-right">{Number(item.unitPrice).toLocaleString()}円</td>
              <td className="py-2 text-right">{Number(item.amount).toLocaleString()}円</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">小計</span>
          <span>{Number(estimate.subtotal).toLocaleString()}円</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            消費税({taxTypeLabels[estimate.taxType]} {Number(estimate.taxRate)}%)
          </span>
          <span>{Number(estimate.taxAmount).toLocaleString()}円</span>
        </div>
        <div className="flex justify-between border-t pt-1 text-base font-semibold">
          <span>合計</span>
          <span>{Number(estimate.totalAmount).toLocaleString()}円</span>
        </div>
      </div>

      {estimate.notes && (
        <div className="border-t pt-4 text-sm whitespace-pre-wrap text-muted-foreground">
          {estimate.notes}
        </div>
      )}
    </div>
  );
}
