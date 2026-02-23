import { Buffer } from 'node:buffer';
import { Result } from '@praha/byethrow';
import { encode } from 'base64-arraybuffer';
import type { Mode } from 'lib/domain/model.ts';
import { z } from 'zod/v4';
import { HttpError } from './error.ts';

const SWITCHBOT_BASE_URL = 'https://api.switch-bot.com/v1.1/devices';
const FAN_SPEED_AUTO = 1;
const POWER_ON = 'on';

const meterStatus = {
  deviceId: z.string(),
  deviceType: z.string(),
  temperature: z.number(),
};

const meterStatusResponse = z.object({
  body: z.object(meterStatus),
});

const _airConditionerCommand = z.object({
  commandType: z.enum(['command']),
  command: z.enum(['setAll']),
  parameter: z.string(),
});

type AirConditionerCommand = z.infer<typeof _airConditionerCommand>;

interface AuthHeaders extends Record<string, string> {
  Authorization: string;
  sign: string;
  nonce: string;
  t: string;
}

interface SwitchBotCredentials {
  token: string;
  secret: string;
}

/**
 * SwitchBot APIの認証用署名を生成する
 * @param token SwitchBot APIトークン
 * @param secret SwitchBot APIシークレット
 * @param t タイムスタンプ
 * @param nonce ランダムなUUID
 * @returns Base64エンコードされた署名
 */
const generateSign = async (
  token: string,
  secret: string,
  t: number,
  nonce: string,
) => {
  const data = `${token}${t}${nonce}`;
  const secretKeyData = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signTerm = await crypto.subtle.sign(
    'HMAC',
    key,
    Buffer.from(data, 'utf-8'),
  );

  return encode(signTerm);
};

/**
 * SwitchBot APIの認証ヘッダーを生成する
 * @param credentials SwitchBot認証情報
 * @returns 認証ヘッダー
 * @throws {Error} 署名生成に失敗した場合に例外を投げる
 */
const generateAuthorizationHeader = async (
  credentials: SwitchBotCredentials,
): Promise<AuthHeaders> => {
  const t = Date.now();
  const nonce = crypto.randomUUID();
  const sign = await generateSign(
    credentials.token,
    credentials.secret,
    t,
    nonce,
  );

  return {
    Authorization: credentials.token,
    sign,
    nonce,
    t: t.toString(),
  };
};

/**
 * SwitchBot APIへのリクエストを実行する
 * @param path APIエンドポイントのパス
 * @param method HTTPメソッド
 * @param credentials SwitchBot認証情報
 * @param data リクエストボディ（POSTの場合）
 * @returns レスポンス
 */
const makeRequest = (
  path: string,
  method: 'GET' | 'POST',
  credentials: SwitchBotCredentials,
  data?: unknown,
) =>
  Result.pipe(
    Result.try({
      try: async () => generateAuthorizationHeader(credentials),
      catch: (err) =>
        new Error('Failed to generate authorization header', { cause: err }),
    }),
    Result.map((headers) =>
      method === 'POST'
        ? { ...headers, 'Content-Type': 'application/json' }
        : headers,
    ),
    Result.andThen((headers) =>
      Result.try({
        try: async () =>
          fetch(`${SWITCHBOT_BASE_URL}/${path}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
          }),
        catch: () => new HttpError(500, 'Internal Server Error'),
      }),
    ),
    Result.andThen((res) =>
      res.ok
        ? Result.succeed(res)
        : Result.fail(
            new HttpError(res.status, res.statusText, `${method} request`),
          ),
    ),
  );

/**
 * エアコンのモードを数値に変換する
 * @param mode エアコンのモード
 * @returns モードに対応する数値
 */
const fromMode = (mode: Mode) => {
  switch (mode) {
    case 'auto':
      return 1;
    case 'cool':
      return 2;
    case 'heat':
      return 5;
    default: {
      const _unreachable: never = mode;

      throw new Error('Unreachable code');
    }
  }
};

/**
 * SwitchBot APIクライアント
 * @param token SwitchBot APIトークン
 * @param secret SwitchBot APIシークレット
 * @returns SwitchBot APIクライアント
 */
export function switchBotClient(token: string, secret: string) {
  const credentials: SwitchBotCredentials = { token, secret };

  return {
    /**
     * 現在の室温を取得する
     * @param deviceId デバイスID
     * @returns 現在の室温
     */
    getCurrentTemp: (deviceId: string) => {
      const path = `${deviceId}/status`;

      return Result.pipe(
        makeRequest(path, 'GET', credentials),
        Result.andThen((res) =>
          Result.try({
            try: async () => res.json(),
            catch: () => new Error('Failed to parse JSON from response'),
          }),
        ),
        Result.andThen((json) => {
          const parsed = meterStatusResponse.safeParse(json);

          return parsed.success
            ? Result.succeed(parsed.data.body.temperature)
            : Result.fail(parsed.error);
        }),
      );
    },
    /**
     * エアコンをオンにする
     * @param deviceId デバイスID
     * @param settingTemp 設定温度
     */
    turnOnAirConditioner: async (deviceId: string, settingTemp: number) => {
      const path = `${deviceId}/commands`;
      const driveMode = fromMode('auto');
      const commandData: AirConditionerCommand = {
        commandType: 'command',
        command: 'setAll',
        parameter: `${settingTemp},${driveMode},${FAN_SPEED_AUTO},${POWER_ON}`,
      };

      return Result.pipe(
        makeRequest(path, 'POST', credentials, commandData),
        Result.map(() => ({})),
      );
    },
  };
}
