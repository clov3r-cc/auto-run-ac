import { Form } from 'react-router';
import { type SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { z } from 'zod/v3';

import { Checkbox, FieldError, Select } from '~/components/form.tsx';
import { Button } from '~/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card.tsx';
import { Label } from '~/components/ui/label.tsx';
import type { ScheduleData } from '~/entities/types.ts';

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

interface EditScheduleFormProps {
  schedule: ScheduleData;
  onCancel: () => void;
  onReset?: () => void;
  lastResult: SubmissionResult<string[]> | null | undefined;
}

export function EditScheduleForm({
  schedule,
  onCancel,
  onReset,
  lastResult,
}: EditScheduleFormProps) {
  const [editForm, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: editScheduleSchema }),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 12);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {format(schedule.date, 'yyyy/M/d（EEEE）', { locale: ja })}
          のスケジュールを変更する
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          id={editForm.id}
          onSubmit={editForm.onSubmit}
          method="post"
          noValidate
        >
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Label htmlFor={fields.arrivedHomeAtHour.id}>帰宅時刻</Label>
                <Select
                  id={fields.arrivedHomeAtHour.id}
                  name={fields.arrivedHomeAtHour.name}
                  placeholder="時"
                  defaultValue={schedule.arrivedHome.hour.toString()}
                  items={hours.map((h) => ({
                    name: h.toString().padStart(2, '0'),
                    value: h.toString(),
                  }))}
                />
                <span>:</span>
                <Select
                  id={fields.arrivedHomeAtMinute.id}
                  name={fields.arrivedHomeAtMinute.name}
                  placeholder="分"
                  defaultValue={schedule.arrivedHome.minute.toString()}
                  items={minutes.map((m) => ({
                    name: m.toString().padStart(2, '0'),
                    value: m.toString(),
                  }))}
                />
              </div>
              {fields.arrivedHomeAtHour.errors && (
                <FieldError>{fields.arrivedHomeAtHour.errors}</FieldError>
              )}
              {fields.arrivedHomeAtMinute.errors && (
                <FieldError>{fields.arrivedHomeAtMinute.errors}</FieldError>
              )}
            </div>
            <div className="flex items-center justify-center">
              <Label htmlFor={fields.isDisabled.id}>
                <Checkbox
                  id={fields.isDisabled.id}
                  name={fields.isDisabled.name}
                  defaultChecked={schedule.isDisabled}
                />
                この日は自動起動を無効にする
              </Label>
            </div>
          </div>
          <div className="flex">
            <Button
              variant="default"
              className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </Form>
        <Form
          method="post"
          action={`/reset?year=${schedule.date.getFullYear()}&month=${schedule.date.getMonth() + 1}&day=${schedule.date.getDate()}`}
        >
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={onReset}
              variant="outline"
              className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              初期設定に戻す
            </Button>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          キャンセル
        </Button>
      </CardFooter>
    </Card>
  );
}
