import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  cyberHygieneScore: integer("cyber_hygiene_score").default(0).notNull(),
  completedModules: integer("completed_modules").default(0).notNull(),
  totalQuizzesTaken: integer("total_quizzes_taken").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Learning modules
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  difficulty: varchar("difficulty").notNull(),
  content: text("content").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quiz questions for each module
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  orderIndex: integer("order_index").notNull(),
});

// User progress on modules
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull(),
  score: integer("score"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_progress_user").on(table.userId),
  index("idx_user_progress_module").on(table.moduleId),
]);

// Quiz attempts with detailed results
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").notNull(),
  weakAreas: text("weak_areas").array(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => [
  index("idx_quiz_attempts_user").on(table.userId),
  index("idx_quiz_attempts_module").on(table.moduleId),
]);

// Achievement badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  category: varchar("category").notNull(),
  requirement: text("requirement").notNull(),
  points: integer("points").notNull(),
});

// User earned badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_badges_user").on(table.userId),
]);

// Phishing simulation attempts
export const phishingAttempts = pgTable("phishing_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  emailId: varchar("email_id").notNull(),
  detectedThreats: text("detected_threats").array(),
  missedThreats: text("missed_threats").array(),
  score: integer("score").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => [
  index("idx_phishing_attempts_user").on(table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
  badges: many(userBadges),
  phishingAttempts: many(phishingAttempts),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  questions: many(quizQuestions),
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [userProgress.moduleId],
    references: [modules.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [quizAttempts.moduleId],
    references: [modules.id],
  }),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  module: one(modules, {
    fields: [quizQuestions.moduleId],
    references: [modules.id],
  }),
}));

// Insert schemas
export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

export const insertPhishingAttemptSchema = createInsertSchema(phishingAttempts).omit({
  id: true,
  completedAt: true,
});

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type PhishingAttempt = typeof phishingAttempts.$inferSelect;
export type InsertPhishingAttempt = z.infer<typeof insertPhishingAttemptSchema>;
