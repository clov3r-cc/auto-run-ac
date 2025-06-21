import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const defaultThresholds = sqliteTable('default_thresholds', {
  id: text('id').primaryKey(),
  threshold: integer('threshold').notNull(),
  comparison: text('comparison').notNull(),
  mode: text('mode').notNull(),
  timeStart: text('time_start').notNull(),
  timeEnd: text('time_end').notNull(),
});

export const scheduledThresholds = sqliteTable('scheduled_thresholds', {
  id: text('id').primaryKey(),
  threshold: integer('threshold').notNull(),
  comparison: text('comparison').notNull(),
  mode: text('mode').notNull(),
  date: text('date').notNull(),
  timeStart: text('time_start').notNull(),
  timeEnd: text('time_end').notNull(),
});
