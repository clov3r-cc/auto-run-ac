import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

const DATE_FORMATTER = 'yyyy-MM-dd';

/**
 * `Date`をフォーマットした日付の文字列を返す
 * @param date フォーマットする日付
 * @returns 'yyyy-MM-dd'形式にフォーマットした文字列
 */
export const formatDate = (date: Date) => format(date, DATE_FORMATTER);

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

/**
 * 日付のリストから年と月のペアを計算する
 * @param dateList 日付のリスト
 * @returns 年と月（0始まり）のペアのリスト
 */
export const calculateYearMonthPairs = (dateList: TZDate[]) => {
  const list = dateList.map((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return { year, month };
  });

  // NOTE: 重複を排除
  // https://tech-lab.sios.jp/archives/40479
  return Array.from(
    new Map(list.map((item) => [`${item.year}/${item.month}`, item])).values(),
  );
};
