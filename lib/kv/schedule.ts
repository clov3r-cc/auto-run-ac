import type { TZDate } from '@date-fns/tz';
import { eachDayOfInterval } from 'date-fns';
import {
  calculateYearMonthPairs,
  formatDateWithKeyFormat,
  KEY_SEPARATOR,
} from 'lib/utils/date.ts';
import { z } from 'zod/v4';

const scheduleSchema = z.object({
  arrivedHome: z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
  }),
  isDisabled: z.boolean(),
});

type Schedule = z.infer<typeof scheduleSchema>;

async function getAllKvEntriesRecursive(
  kv: KVNamespace,
  keyPrefix: string,
  cursor?: string,
  accumulator: KVNamespaceListResult<unknown, string>['keys'] = [],
): Promise<KVNamespaceListResult<unknown, string>['keys']> {
  const result = await kv.list({ prefix: keyPrefix, cursor });
  accumulator.push(...result.keys);

  if (result.list_complete) {
    return accumulator;
  }

  return getAllKvEntriesRecursive(kv, keyPrefix, result.cursor, accumulator);
}

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
    get: async (date: TZDate) =>
      kv.getWithMetadata(formatDateWithKeyFormat(date)).then((v) => {
        if (!v.metadata) {
          return undefined;
        }

        return scheduleSchema.parse(v.metadata);
      }),
    /**
     * 指定した期間内のスケジュールのリストを取得する
     * @param startAt 開始日
     * @param endAt 終了日
     * @returns 指定期間内のスケジュールのリスト
     */
    listBy: async (startAt: TZDate, endAt: TZDate) => {
      const fetcher = calculateYearMonthPairs(
        eachDayOfInterval({ start: startAt, end: endAt }),
      ).map(({ year, month }) => {
        const keyPrefix = `${year}${KEY_SEPARATOR}${month + 1}${KEY_SEPARATOR}`;

        return getAllKvEntriesRecursive(kv, keyPrefix);
      });

      return Promise.all(fetcher).then((results) =>
        results.flat().map((key) => {
          const [year, month, day] = key.name.split(KEY_SEPARATOR).map(Number);
          const date = new Date(year, month - 1, day);

          console.log(
            `date: ${date.toString()}`,
            `schedule: ${!!key.metadata}`,
          );

          return {
            date,
            schedule: scheduleSchema.parse(key.metadata),
          };
        }),
      );
    },
    /**
     * 指定した日付のスケジュールを設定する
     * @param date 設定対象の日付
     * @param schedule 設定するスケジュール
     */
    set: async (date: TZDate, schedule: Schedule) =>
      // TODO: 24時間でKVに書き込んだものを削除
      // NOTE: Consider storing your values in metadata if your values fit in the metadata-size limit.
      // https://developers.cloudflare.com/kv/api/list-keys/
      kv.put(formatDateWithKeyFormat(date), '', { metadata: { ...schedule } }),
    /**
     * 指定した日付のスケジュールを削除する
     * @param date 削除対象の日付
     * @returns Promise<void>
     */
    reset: async (date: TZDate) => kv.delete(formatDateWithKeyFormat(date)),
  };
}
