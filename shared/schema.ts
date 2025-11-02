// Database schema for PostgreSQL using Drizzle ORM
// Reference: blueprint:javascript_database integration

import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const accessCodes = pgTable('access_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usedCodes = pgTable('used_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  usedAt: timestamp('used_at').notNull().defaultNow(),
});

export type AccessCode = typeof accessCodes.$inferSelect;
export type InsertAccessCode = typeof accessCodes.$inferInsert;
export type UsedCode = typeof usedCodes.$inferSelect;
export type InsertUsedCode = typeof usedCodes.$inferInsert;
