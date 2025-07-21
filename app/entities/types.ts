import type { TZDate } from '@date-fns/tz';

export interface ScheduleData {
  date: TZDate;
  arrivedHome: {
    hour: number;
    minute: number;
  };
  isDefault: boolean;
  isDisabled: boolean;
}
