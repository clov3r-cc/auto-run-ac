import { Result } from '@praha/byethrow';
// eslint-disable-next-line import/no-unresolved
import { env } from 'cloudflare:test';
import { formatDate } from 'lib/utils/date.ts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduledWorker } from './scheduled.ts';

const mockSwitchBotClient = vi.hoisted(() => ({
  getCurrentTemp: vi.fn(),
  turnOnAirConditioner: vi.fn(),
}));

vi.mock('./lib/switchbot.ts', () => ({
  switchBotClient: () => mockSwitchBotClient,
}));

const mockNotifyAirConditionerOnToDiscord = vi.hoisted(() => vi.fn());

vi.mock('./lib/discord.ts', () => ({
  notifyAirConditionerOnToDiscord: mockNotifyAirConditionerOnToDiscord,
}));

describe('scheduledWorker', () => {
  const mockEnv = {
    KV__SCHEDULES: env.KV__SCHEDULES,
    KV__HISTORY: env.KV__HISTORY,
    SWITCHBOT_TOKEN: 'test-token',
    SWITCHBOT_CLIENT_SECRET: 'test-secret',
    METER_DEVICE_ID: 'DC49091D8404',
    DEFAULT_ARRIVED_HOME__HOUR: 20,
    DEFAULT_ARRIVED_HOME__MINUTE: 0,
    MINIMUM_ACCEPTABLE_TEMPERATURE: 20,
    MAXIMUM_ACCEPTABLE_TEMPERATURE: 28,
    AIR_CONDITIONER_DEVICE_ID: '02-202306140644-28427602',
    NOTIFICATION_WEBHOOK_URL: 'https://example.com/webhook',
  } as const;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return early if history already exists for today', async () => {
    const today = new Date('2024-01-01T15:00:00+09:00');
    vi.setSystemTime(today);

    const historyKey = formatDate(today);
    await env.KV__HISTORY.put(historyKey, 'completed');

    const result = await scheduledWorker(mockEnv);

    expect(result).toBe('ALREADY_PROCESSED_TODAY');
    expect(mockSwitchBotClient.getCurrentTemp).not.toBeCalled();
  });

  it('should return early if schedule is disabled', async () => {
    const today = new Date('2024-01-01T15:00:00+09:00');
    vi.setSystemTime(today);

    const scheduleKey = formatDate(today);
    await env.KV__SCHEDULES.put(
      scheduleKey,
      JSON.stringify({
        arrivedHome: { hour: 18, minute: 0 },
        isDisabled: true,
      }),
    );

    const result = await scheduledWorker(mockEnv);

    expect(result).toBe('SCHEDULE_DISABLED');
    expect(mockSwitchBotClient.getCurrentTemp).not.toBeCalled();
  });

  it('should return early if temperature is within acceptable range', async () => {
    const today = new Date('2024-01-01T15:00:00+09:00');
    vi.setSystemTime(today);

    mockSwitchBotClient.getCurrentTemp.mockResolvedValue(Result.succeed(24));

    const result = await scheduledWorker(mockEnv);

    expect(result).toBe('TEMPERATURE_IN_RANGE');
    expect(mockSwitchBotClient.getCurrentTemp).toHaveBeenCalledWith(
      mockEnv.METER_DEVICE_ID,
    );
  });

  it('should return early if not yet time to turn on air conditioner', async () => {
    const today = new Date('2024-01-01T15:00:00+09:00');
    vi.setSystemTime(today);

    mockSwitchBotClient.getCurrentTemp.mockResolvedValue(Result.succeed(30));

    const result = await scheduledWorker(mockEnv);

    expect(result).toBe('NOT_YET_TIME');
    expect(mockSwitchBotClient.getCurrentTemp).toHaveBeenCalledWith(
      mockEnv.METER_DEVICE_ID,
    );
    expect(mockSwitchBotClient.turnOnAirConditioner).not.toBeCalled();
  });

  it.each([
    {
      temperature: 30,
      expectedThreshold: mockEnv.MAXIMUM_ACCEPTABLE_TEMPERATURE,
      scenario: 'too hot',
    },
    {
      temperature: 15,
      expectedThreshold: mockEnv.MINIMUM_ACCEPTABLE_TEMPERATURE,
      scenario: 'too cold',
    },
  ])(
    'should turn on air conditioner successfully when $scenario',
    async ({ temperature, expectedThreshold }) => {
      const today = new Date('2024-01-01T19:00:00+09:00');
      vi.setSystemTime(today);

      mockSwitchBotClient.getCurrentTemp.mockResolvedValue(
        Result.succeed(temperature),
      );
      mockSwitchBotClient.turnOnAirConditioner.mockResolvedValue(
        Result.succeed({}),
      );
      mockNotifyAirConditionerOnToDiscord.mockResolvedValue(Result.succeed({}));

      const result = await scheduledWorker(mockEnv);

      expect(result).toBe('AC_TURNED_ON_SUCCESS');
      expect(mockSwitchBotClient.getCurrentTemp).toHaveBeenCalledWith(
        mockEnv.METER_DEVICE_ID,
      );
      expect(mockSwitchBotClient.turnOnAirConditioner).toHaveBeenCalledWith(
        mockEnv.AIR_CONDITIONER_DEVICE_ID,
        expectedThreshold,
      );
      expect(mockNotifyAirConditionerOnToDiscord).toHaveBeenCalled();
    },
  );
});
