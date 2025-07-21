import { TZDate } from '@date-fns/tz';
import { addMonths, eachDayOfInterval, endOfMonth, isSameDay } from 'date-fns';
import { schedule } from 'lib/kv/schedule.ts';
import { jstDate } from 'lib/utils/date.ts';
import ScheduleTable from '../components/ScheduleTable.tsx';
import type { Route } from './+types/dashboard';

import type { ScheduleData } from '~/entities/types.ts';

/**
 * 設定可能な最大月数
 * 例: 今月から6ヶ月先までのスケジュールを表示・設定
 */
export const MAX_MONTHS_AHEAD = 6;

export async function loader({
  context: {
    cloudflare: {
      env: {
        KV__SCHEDULES,
        DEFAULT_ARRIVED_HOME__HOUR,
        DEFAULT_ARRIVED_HOME__MINUTE,
      },
    },
  },
}: Route.LoaderArgs) {
  const scheduleKV = schedule(KV__SCHEDULES);

  const today = jstDate(new Date());
  const endDate = endOfMonth(
    new TZDate(addMonths(today, MAX_MONTHS_AHEAD - 1)),
  );

  const daysInMonth = eachDayOfInterval({ start: today, end: endDate });
  const list = await scheduleKV.listBy(today, endDate);
  const schedules = list.map((schedule) => ({
    ...schedule,
    date: new TZDate(schedule.date),
  }));
  const allSchedules = daysInMonth.map((date) => {
    const existingSchedule = schedules.find((schedule) =>
      isSameDay(new TZDate(schedule.date), date),
    );

    if (existingSchedule) {
      return {
        ...existingSchedule.schedule,
        date: new TZDate(existingSchedule.date),
        isDefault: false,
      } satisfies ScheduleData;
    }

    // スケジュールが存在しない場合はデフォルト値を設定
    return {
      date,
      arrivedHome: {
        hour: DEFAULT_ARRIVED_HOME__HOUR,
        minute: DEFAULT_ARRIVED_HOME__MINUTE,
      },
      isDisabled: false,
      isDefault: true,
    } satisfies ScheduleData;
  });

  return {
    today,
    schedules: allSchedules,
  };
}

export default function Dashboard({
  loaderData: { today, schedules },
}: Route.ComponentProps) {
  return <ScheduleTable today={today} schedules={schedules} />;
}
