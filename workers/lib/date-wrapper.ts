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
