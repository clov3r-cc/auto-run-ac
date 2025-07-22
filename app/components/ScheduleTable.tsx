import { useState } from 'react';
import { href, Link } from 'react-router';
import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { calculateYearMonthPairs } from 'lib/utils/date.ts';
import { Check, Pencil, X } from 'lucide-react';
import { match } from 'ts-pattern';

import { Button } from '~/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select.tsx';
import type { ScheduleData } from '~/entities/types';
import { cn } from '~/lib/utils.ts';

// スケジュール表示コンポーネント
interface ScheduleDisplayProps {
  schedule: ScheduleData;
  onEdit: (date: Date) => void;
}

function ScheduleDisplay({ schedule, onEdit }: ScheduleDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="text-muted-foreground flex-1 text-sm font-medium">
        {String(schedule.arrivedHome.hour).padStart(2, '0')}:
        {String(schedule.arrivedHome.minute).padStart(2, '0')}
      </div>
      <div className="flex items-center gap-1">
        <Button
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded border transition-colors',
            !schedule.isDisabled
              ? 'border-green-300 bg-green-50 text-green-600 hover:bg-green-50'
              : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-50',
          )}
          title={schedule.isDisabled ? '現在無効' : '現在有効'}
          aria-label={schedule.isDisabled ? '現在無効' : '現在有効'}
        >
          {!schedule.isDisabled ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
        <Link
          to={{
            pathname: href('/edit'),
            search: `?year=${schedule.date.getFullYear()}&month=${schedule.date.getMonth() + 1}&day=${schedule.date.getDate()}`,
          }}
        >
          <Button
            onClick={() => onEdit(schedule.date)}
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
            title="スケジュールを編集"
            aria-label="スケジュールを編集する"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// 日付セルのプロパティ
interface DateCellProps {
  date: Date;
  schedule: ScheduleData;
  variant?: 'today' | 'saturday' | 'sunday' | 'regular';
  onScheduleEdit: (date: Date) => void;
}

// 日付セル
function DateCell({
  date,
  schedule,
  variant = 'regular',
  onScheduleEdit,
}: DateCellProps) {
  const containerStyles = match(variant)
    .with('today', () => 'border-orange-500 bg-orange-50')
    .with('saturday', () => 'border-blue-200 bg-blue-50/50')
    .with('sunday', () => 'bg-red-50/50')
    .with('regular', () => 'border-border bg-background hover:bg-muted/50')
    .exhaustive();

  const textStyles = match(variant)
    .with('today', () => 'font-bold text-orange-700')
    .with('saturday', () => 'font-medium text-blue-600')
    .with('sunday', () => 'font-medium text-red-600')
    .with('regular', () => 'font-medium text-foreground')
    .exhaustive();

  return (
    <div
      className={cn(
        'relative h-20 rounded-md border p-2 transition-colors',
        containerStyles,
      )}
    >
      <div className={cn('mb-1', textStyles)}>{format(date, 'd')}</div>
      <ScheduleDisplay schedule={schedule} onEdit={onScheduleEdit} />
    </div>
  );
}

// 曜日ヘッダーのプロパティ
interface WeekdayHeaderProps {
  day: string;
  variant?: 'saturday' | 'sunday' | 'regular';
}

// 曜日ヘッダー
function WeekdayHeader({ day, variant = 'regular' }: WeekdayHeaderProps) {
  const variantStyles = match(variant)
    .with('saturday', () => 'bg-blue-50 text-blue-600')
    .with('sunday', () => 'bg-red-50 text-red-600')
    .with('regular', () => 'bg-muted text-muted-foreground')
    .exhaustive();

  return (
    <div
      className={cn(
        'rounded-md p-3 text-center text-sm font-medium',
        variantStyles,
      )}
    >
      {day}
    </div>
  );
}

interface ScheduleTableProps {
  today: Date;
  schedules: ScheduleData[];
  onScheduleEdit?: (date: Date) => void;
}

export default function ScheduleTable({
  today,
  schedules,
  onScheduleEdit = () => undefined,
}: ScheduleTableProps) {
  const [currentDate, setCurrentDate] = useState<Date>(today);

  // 今日の日付
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  // 選択中の日付
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 今月の"日付"を計算
  const currentMonthStartAt = startOfMonth(currentDate);
  const currentMonthEndAt = endOfMonth(currentDate);
  const currentMonthDays = eachDayOfInterval({
    start: currentMonthStartAt,
    end: currentMonthEndAt,
  });

  // 曜日ヘッダーを生成（月曜始まり）
  const getWeekdayHeaders = () => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: monday,
      end: addDays(monday, 6),
    }).map((day) => format(day, 'EEEEEE', { locale: ja }));
  };

  // 選択可能な年月の組み合わせを計算
  const calculateYearMonthOptions = () => {
    const dates = schedules.map((schedule) => schedule.date);
    const yearMonthPairs = calculateYearMonthPairs(dates);

    return yearMonthPairs.map(({ year, month }) => ({
      value: `${year}-${month}`,
      label: `${year}/${month + 1}`,
    }));
  };

  // 指定日のスケジュールを検索
  const getScheduleByDate = (date: Date) =>
    schedules.find((schedule) => isSameDay(schedule.date, date))!;

  // カレンダーグリッドを生成
  const generateCalenderGrids = (isThisMonth: boolean): (Date | null)[] => {
    const weekdayOffset =
      (getDay(isThisMonth ? today : currentMonthStartAt) + 6) % 7;
    const paddingDays: null[] = Array<null>(weekdayOffset).fill(null);

    return [...paddingDays, ...currentMonthDays];
  };

  // 年月変更ハンドラー
  const handleYearMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    const newDate = new TZDate(year, month, 1, 'Asia/Tokyo');
    setCurrentDate(newDate);
  };

  // 先月・来月ナビゲーション
  const canGoPreviousMonth = () =>
    schedules.some(
      // 前月1日のスケジュールが含まれていないことがあるので、前月の最終日のスケジュールで比較
      (schedules) =>
        isSameDay(schedules.date, endOfMonth(subMonths(currentDate, 1))),
    );

  const canGoNextMonth = () =>
    schedules.some((schedule) =>
      isSameDay(schedule.date, addMonths(currentDate, 1)),
    );

  const goToPreviousMonth = () => {
    if (canGoPreviousMonth()) {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const goToNextMonth = () => {
    if (canGoNextMonth()) {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new TZDate(todayYear, todayMonth, 1, 'Asia/Tokyo'));
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          エアコン制御ダッシュボード
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-1 text-xl">
            <Select
              value={`${currentYear}-${currentMonth}`}
              onValueChange={handleYearMonthChange}
            >
              <SelectTrigger className="hover:bg-accent h-auto w-auto border-none bg-transparent px-1 py-0 pl-4 text-xl font-bold shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calculateYearMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              disabled={!canGoPreviousMonth()}
            >
              先月
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
              今月
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              disabled={!canGoNextMonth()}
            >
              来月
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-7 gap-2">
            {getWeekdayHeaders().map((day, index) => (
              <WeekdayHeader
                key={day}
                day={day}
                variant={
                  index === 5 ? 'saturday' : index === 6 ? 'sunday' : 'regular'
                }
              />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {generateCalenderGrids(
              currentMonthDays.some((date) => isSameDay(date, today)),
            ).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-20"></div>;
              }

              const isToday = isSameDay(date, today);
              const isPastDate = date < today && !isToday;
              const isSaturday = getDay(date) === 6;
              const isSunday = getDay(date) === 0;

              if (isPastDate) {
                return undefined;
              }

              const variant = isToday
                ? 'today'
                : isSaturday
                  ? 'saturday'
                  : isSunday
                    ? 'sunday'
                    : 'regular';

              const schedule = getScheduleByDate(date);

              return (
                <DateCell
                  key={date.toISOString()}
                  date={date}
                  schedule={schedule}
                  variant={variant}
                  onScheduleEdit={onScheduleEdit}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
