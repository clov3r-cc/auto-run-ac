import { href, redirect, useNavigate } from 'react-router';
import { parseWithZod } from '@conform-to/zod';
import { addMonths, endOfMonth, startOfDay } from 'date-fns';
import { schedule } from 'lib/kv/schedule.ts';
import { jstDate } from 'lib/utils/date.ts';
import { z } from 'zod/v3';
import type { Route } from './+types/edit-schedule';
import { MAX_MONTHS_AHEAD } from './dashboard.tsx';

import { EditScheduleForm } from '~/components/EditScheduleForm.tsx';
import type { ScheduleData } from '~/entities/types.ts';
import { getDateParamsFromUrl } from '~/lib/req.ts';

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
  request,
}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const dateParams = getDateParamsFromUrl(url);

  if (!dateParams) {
    return redirect(href('/'));
  }

  const scheduleKV = schedule(KV__SCHEDULES);
  const date = jstDate(
    new Date(dateParams.year, dateParams.month - 1, dateParams.day),
  );

  // 今日より前と`MAX_MONTHS_AHEAD`ヶ月先の月末より後の登録をできないようにする
  const today = jstDate(new Date());
  const minDate = startOfDay(today);
  const maxDate = endOfMonth(addMonths(today, MAX_MONTHS_AHEAD));

  if (date < minDate || date > maxDate) {
    return redirect(href('/'));
  }
  const result = await scheduleKV.get(date).then((schedule) => {
    if (!schedule) {
      return {
        date,
        arrivedHome: {
          hour: DEFAULT_ARRIVED_HOME__HOUR,
          minute: DEFAULT_ARRIVED_HOME__MINUTE,
        },
        isDisabled: false,
        isDefault: true,
      } satisfies ScheduleData;
    }

    return {
      ...schedule,
      date,
      isDefault: false,
    } satisfies ScheduleData;
  });

  return { schedule: result };
}

const editScheduleSchema = z.object({
  arrivedHomeAtHour: z
    .string({ required_error: '帰宅時刻は必須です' })
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(12, { message: '帰宅時刻は12時以降である必要があります' })
        .max(23, { message: '帰宅時刻は23時までである必要があります' }),
    ),
  arrivedHomeAtMinute: z
    .string({ required_error: '帰宅時刻は必須です' })
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .refine((value) => value % 15 === 0, {
          message: '帰宅時刻は15分刻みで指定する必要があります',
        }),
    ),
  isDisabled: z.boolean().default(false),
});

export async function action({
  context: {
    cloudflare: {
      env: { KV__SCHEDULES },
    },
  },
  request,
}: Route.ActionArgs) {
  const url = new URL(request.url);
  const dateParams = getDateParamsFromUrl(url);

  if (!dateParams) {
    return redirect(href('/'));
  }

  const date = jstDate(
    new Date(dateParams.year, dateParams.month - 1, dateParams.day),
  );

  // 今日より前と`MAX_MONTHS_AHEAD`ヶ月先の月末より後の登録をできないようにする
  const today = jstDate(new Date());
  const minDate = startOfDay(today);
  const maxDate = endOfMonth(addMonths(today, MAX_MONTHS_AHEAD));

  if (date < minDate || date > maxDate) {
    return redirect(href('/'));
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: editScheduleSchema,
  });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  await schedule(KV__SCHEDULES).set(date, {
    arrivedHome: {
      hour: submission.value.arrivedHomeAtHour,
      minute: submission.value.arrivedHomeAtMinute,
    },
    isDisabled: submission.value.isDisabled,
  });

  return redirect(href('/'));
}

export default function EditSchedule({
  loaderData: { schedule },
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const handleCancel = () => {
    void navigate(href('/'));
  };

  return (
    <div className="container mx-auto py-8">
      <EditScheduleForm
        schedule={schedule}
        lastResult={actionData?.lastResult}
        onCancel={handleCancel}
      />
    </div>
  );
}
