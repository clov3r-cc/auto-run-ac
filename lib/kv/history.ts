import { formatDate } from 'lib/utils/date.ts';

/**
 * エアコン制御の履歴を管理するためのKVストレージ操作を提供する
 * @param kv Cloudflare KVNamespace
 * @returns 履歴操作用のオブジェクト
 */
export function history(kv: KVNamespace) {
  return {
    /**
     * 指定した日付の履歴が存在するかチェックする
     * @param date チェック対象の日付
     * @returns 履歴が存在するかどうか
     */
    exists: async (date: Date) =>
      kv.get(formatDate(date)).then((v) => {
        return !!v;
      }),
    /**
     * 指定した日付の履歴を設定する（24時間後に自動削除）
     * @param date 設定対象の日付
     */
    set: async (date: Date) =>
      // 24時間でKVに書き込んだものを削除
      kv.put(formatDate(date), 'done', { expirationTtl: 60 * 60 * 24 }),
  };
}
