import { type Brand } from './shared-type.ts';

// #region DurationId

/**
 * 期間を識別するためのユニークID
 * ブランド型を使用して型安全性を確保
 */
export type DurationId = string & Brand<'DurationId'>;

/**
 * 文字列をDurationIdに変換する
 * @param id 変換したい文字列
 * @returns DurationId型の値
 */
export function asDurationId(id: string): DurationId {
  return id as DurationId;
}

// #endregion

// #region Duration

/**
 * 時間の期間を表すインターフェース
 * エアコンの動作期間を定義するために使用
 */
export interface Duration {
  /** 期間のユニークID */
  id: DurationId;
  /** 開始時刻 */
  startAt: Date;
  /** 終了時刻 */
  endAt: Date;
}

/**
 * Durationオブジェクトを作成する
 * @param id 期間のユニークID
 * @param startAt 開始時刻
 * @param endAt 終了時刻
 * @returns Duration型のオブジェクト
 * @throws startAtがendAtより後の場合エラー
 */
export function asDuration(
  id: DurationId,
  startAt: Date,
  endAt: Date,
): Duration {
  if (startAt > endAt) {
    throw new Error('startAt must be before or equal to endAt');
  }

  return { id, startAt, endAt };
}

// #endregion

// #region Mode

/**
 * エアコンの動作モード定義
 * cool: 冷房, heat: 暖房, auto: 自動
 */
const _modes = ['cool', 'heat', 'auto'] as const;

/**
 * エアコンの動作モード型
 * 'cool' | 'heat' | 'auto' のいずれか
 */
export type Mode = (typeof _modes)[number];

// #endregion
