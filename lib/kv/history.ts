import { formatDate } from 'lib/utils/date.ts';

const todayState = ['completed'] as const;

export type TodayState = (typeof todayState)[number];

/**
 * 文字列をTodayState型に変換する
 * @param value 変換対象の文字列
 * @returns TodayState型の値
 * @throws {Error} 無効な値が渡された場合
 */
export function asTodayState(value: string) {
  if (!todayState.includes(value as TodayState)) {
    throw new Error(`Invalid todayState: ${value}`);
  }

  return value as TodayState;
}

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
     * @returns 履歴が存在する場合はTodayState、存在しない場合はundefined
     */
    exists: (date: Date) =>
      kv.get(formatDate(date)).then((v) => (v ? asTodayState(v) : undefined)),
    /**
     * 指定した日付の履歴を設定する（24時間後に自動削除）
     * @param date 設定対象の日付
     * @param newState 設定する状態
     * @returns Promise<void>
     */
    set: (date: Date, newState: TodayState) =>
      // 24時間でKVに書き込んだものを削除
      kv.put(formatDate(date), newState, { expirationTtl: 60 * 60 * 24 }),
  };
}
