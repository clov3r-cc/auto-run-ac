import { format } from 'date-fns';

const DATE_FORMATTER = 'yyyy-MM-dd';

/**
 * `Date`をフォーマットした日付の文字列を返す
 * @param date フォーマットする日付
 * @returns 'yyyy-MM-dd'形式にフォーマットした文字列
 */
export const formatDate = (date: Date) => format(date, DATE_FORMATTER);
