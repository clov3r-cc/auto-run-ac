import { TZDate } from '@date-fns/tz';

/**
 * 週末かどうかを判定する
 * @param dayOfWeek 週のうちの何曜日か。0から6までの値をとる。0が日曜日で、1が月曜日。
 * @returns 土曜日または日曜日であればtrue、それ以外はfalse
 */
export const isWeekend = (dayOfWeek: number) => {
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;

  return isSaturday || isSunday;
};

const JST_TIME_ZONE = 'Asia/Tokyo';

/**
 * 日本標準時（JST）のTZDateオブジェクトを作成する
 * @param date 変換対象のDateオブジェクト
 * @returns JST時刻のTZDateオブジェクト
 */
export const jstDate = (date: Date) => new TZDate(date, JST_TIME_ZONE);

const UTC_TIME_ZONE = 'UTC';

/**
 * 協定世界時（UTC）のTZDateオブジェクトを作成する
 * @param date 変換対象のDateオブジェクト
 * @returns UTC時刻のTZDateオブジェクト
 */
export const utcDate = (date: Date) => new TZDate(date, UTC_TIME_ZONE);
