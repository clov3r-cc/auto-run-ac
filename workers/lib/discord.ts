import type { TZDate } from '@date-fns/tz';
import { Result } from '@praha/byethrow';
import { formatRFC3339 } from 'date-fns';
import { HttpError } from './error.ts';

/**
 * エアコンがONになったことをDiscordに通知する
 * @param webhookUrl Discord Webhook URL
 * @param utcNow 現在のUTC時刻
 * @param currentTemp 現在の室温
 * @param settingTemp 設定温度
 */
export async function notifyAirConditionerOnToDiscord(
  webhookUrl: string,
  utcNow: TZDate,
  currentTemp: number,
  settingTemp: number,
) {
  const body = {
    embeds: [
      {
        title: 'エアコンをONにしました',
        description:
          '室温が指定された範囲外の温度になったため、エアコンをONにしました。',
        timestamp: formatRFC3339(utcNow),
        color: 5620992,
        fields: [
          {
            name: '現在の室温',
            value: `${currentTemp}℃`,
            inline: true,
          },
          {
            name: '設定温度',
            value: `${settingTemp}℃`,
            inline: true,
          },
        ],
      },
    ],
  };

  return Result.pipe(
    Result.try({
      try: async () =>
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      catch: (err) => new Error('Failed to post Webhook', { cause: err }),
    })(),
    Result.andThen((res) =>
      res.ok
        ? Result.succeed({})
        : Result.fail(
            new HttpError(
              res.status,
              res.statusText,
              'Failed to post webhook',
              body,
            ),
          ),
    ),
  );
}
