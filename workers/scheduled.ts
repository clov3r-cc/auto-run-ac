import { TZDate } from '@date-fns/tz';
import { Result } from '@praha/byethrow';
import { isBefore, subHours } from 'date-fns';
import { history } from 'lib/kv/history.ts';
import { schedule } from 'lib/kv/schedule.ts';
import { jstDate, utcDate } from './lib/date-wrapper.ts';
import { notifyAirConditionerOnToDiscord } from './lib/discord.ts';
import { switchBotClient } from './lib/switchbot.ts';

const TEMP_CHANGE_SPEED_PER_ONE_HOUR = 3;

const calculateTempDiff = (actualTemp: number, threshold: number) =>
  Math.abs(actualTemp - threshold);

interface ScheduleConfig {
  arrivedHome: {
    hour: number;
    minute: number;
  };
  isDisabled: boolean;
}

interface TemperatureConfig {
  minimum: number;
  maximum: number;
}

const calculateTempThreshold = (
  actualTemp: number,
  config: TemperatureConfig,
) => {
  const shouldWarm = actualTemp < config.minimum;
  const shouldCool = config.maximum < actualTemp;

  if (!shouldWarm && !shouldCool) {
    return null;
  }

  return shouldWarm ? config.minimum : config.maximum;
};

const calculateArrivalTime = (jstNow: TZDate, schedule: ScheduleConfig) =>
  new TZDate(
    jstNow.getFullYear(),
    jstNow.getMonth(),
    jstNow.getDate(),
    schedule.arrivedHome.hour,
    schedule.arrivedHome.minute,
  );

const calculateOptimalStartTime = (arrivalTime: TZDate, tempDiff: number) => {
  const requiredHours = Math.ceil(tempDiff / TEMP_CHANGE_SPEED_PER_ONE_HOUR);

  return subHours(arrivalTime, requiredHours);
};

const _scheduledWorkerResults = [
  'ALREADY_PROCESSED_TODAY',
  'SCHEDULE_DISABLED',
  'TEMPERATURE_IN_RANGE',
  'NOT_YET_TIME',
  'AC_TURNED_ON_SUCCESS',
  'METER_STATUS_ERROR',
  'AC_CONTROL_ERROR',
] as const;

export type ScheduledWorkerResult = (typeof _scheduledWorkerResults)[number];

export async function scheduledWorker({
  KV__SCHEDULES,
  KV__HISTORY,
  SWITCHBOT_TOKEN,
  SWITCHBOT_CLIENT_SECRET,
  METER_DEVICE_ID,
  DEFAULT_ARRIVED_HOME__HOUR,
  DEFAULT_ARRIVED_HOME__MINUTE,
  MINIMUM_ACCEPTABLE_TEMPERATURE,
  MAXIMUM_ACCEPTABLE_TEMPERATURE,
  AIR_CONDITIONER_DEVICE_ID,
  NOTIFICATION_WEBHOOK_URL,
}: Env): Promise<ScheduledWorkerResult> {
  const jstNow = jstDate(new Date());

  const todayState = await history(KV__HISTORY).exists(jstNow);

  if (todayState) {
    return 'ALREADY_PROCESSED_TODAY';
  }

  const foundSchedule = (await schedule(KV__SCHEDULES).get(jstNow)) ?? {
    arrivedHome: {
      hour: DEFAULT_ARRIVED_HOME__HOUR as number,
      minute: DEFAULT_ARRIVED_HOME__MINUTE as number,
    },
    isDisabled: false,
  };

  if (foundSchedule.isDisabled) {
    return 'SCHEDULE_DISABLED';
  }

  const client = switchBotClient(SWITCHBOT_TOKEN, SWITCHBOT_CLIENT_SECRET);
  const meterResult = await client.getCurrentTemp(METER_DEVICE_ID);

  if (Result.isFailure(meterResult)) {
    console.error('Failed to get meter status:', meterResult.error);

    return 'METER_STATUS_ERROR';
  }

  const actualTemp = meterResult.value;

  const tempThreshold = calculateTempThreshold(actualTemp, {
    minimum: MINIMUM_ACCEPTABLE_TEMPERATURE,
    maximum: MAXIMUM_ACCEPTABLE_TEMPERATURE,
  });

  if (!tempThreshold) {
    return 'TEMPERATURE_IN_RANGE';
  }

  const tempDiff = calculateTempDiff(actualTemp, tempThreshold);
  const willArriveHomeAt = calculateArrivalTime(jstNow, foundSchedule);
  const shouldBeTurnedOnAt = calculateOptimalStartTime(
    willArriveHomeAt,
    tempDiff,
  );

  if (isBefore(jstNow, shouldBeTurnedOnAt)) {
    return 'NOT_YET_TIME';
  }

  const acResult = await client.turnOnAirConditioner(
    AIR_CONDITIONER_DEVICE_ID,
    tempThreshold,
  );

  if (Result.isFailure(acResult)) {
    console.error('Failed to turn on air conditioner:', acResult.error);

    return 'AC_CONTROL_ERROR';
  }

  await history(KV__HISTORY).set(jstNow, 'completed');

  const notificationResult = await notifyAirConditionerOnToDiscord(
    NOTIFICATION_WEBHOOK_URL,
    utcDate(jstNow),
    actualTemp,
    tempThreshold,
  );

  if (Result.isFailure(notificationResult)) {
    console.error('Failed to send notification:', notificationResult.error);
  }

  return 'AC_TURNED_ON_SUCCESS';
}
