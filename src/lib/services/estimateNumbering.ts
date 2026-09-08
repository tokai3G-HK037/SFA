import { prisma } from "@/lib/db";

/**
 * 見積番号を発行する。フォーマット: Q-{発行年}-{4桁連番}(例: Q-2026-0001)
 * 連番は発行年ごとにリセットされる。低頻度・少人数利用のため楽観的に採番し、
 * 万一の重複(同時登録によるレース)はリトライで回避する。
 */
export async function generateEstimateNumber(issueDate: Date): Promise<string> {
  const year = issueDate.getUTCFullYear();
  const prefix = `Q-${year}-`;

  const count = await prisma.estimate.count({
    where: { estimateNumber: { startsWith: prefix } },
  });

  for (let offset = 0; offset < 10; offset++) {
    const candidate = `${prefix}${String(count + 1 + offset).padStart(4, "0")}`;
    const exists = await prisma.estimate.findUnique({
      where: { estimateNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  throw new Error("見積番号の採番に失敗しました。時間をおいて再度お試しください。");
}
