import type { TZDate } from '@date-fns/tz';
import { formatDate } from 'lib/utils/date.ts';
import { z } from 'zod/v4';

const scheduleSchema = z.object({
  arrivedHome: z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
  }),
  isDisabled: z.boolean(),
});

type Schedule = z.infer<typeof scheduleSchema>;

/**
 * エアコン制御のスケジュールを管理するためのKVストレージ操作を提供する
 * @param kv Cloudflare KVNamespace
 * @returns スケジュール操作用のオブジェクト
 */
export function schedule(kv: KVNamespace) {
  return {
    /**
     * 指定した日付のスケジュールを取得する
     * @param date 取得対象の日付
     * @returns スケジュールが存在する場合はSchedule、存在しない場合はundefined
     */
    get: (date: TZDate) =>
      kv.get(formatDate(date)).then((v) => {
        if (!v) {
          return undefined;
        }

        return scheduleSchema.parse(JSON.parse(v));
      }),
    /**
     * 指定した日付のスケジュールを設定する（24時間後に自動削除）
     * @param date 設定対象の日付
     * @param schedule 設定するスケジュール
     * @returns Promise<void>
     */
    set: (date: TZDate, schedule: Schedule) =>
      // 24時間でKVに書き込んだものを削除
      kv.put(formatDate(date), JSON.stringify(schedule), {
        expirationTtl: 60 * 60 * 24,
      }),
    /**
     * 指定した日付のスケジュールを削除する
     * @param date 削除対象の日付
     * @returns Promise<void>
     */
    reset: (date: TZDate) => kv.delete(formatDate(date)),
  };
}
