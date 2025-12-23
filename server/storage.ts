import {
  users,
  modules,
  quizQuestions,
  userProgress,
  quizAttempts,
  badges,
  userBadges,
  phishingAttempts,
  type User,
  type InsertUser,
  type Module,
  type InsertModule,
  type QuizQuestion,
  type InsertQuizQuestion,
  type UserProgress,
  type InsertUserProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type PhishingAttempt,
  type InsertPhishingAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  updateUserScore(userId: string, scoreIncrement: number): Promise<void>;
  
  // Module operations
  getAllModules(): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  // Quiz question operations
  getModuleQuestions(moduleId: string): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  getModuleQuizAttempts(moduleId: string): Promise<QuizAttempt[]>;
  
  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
  
  // Phishing simulation operations
  createPhishingAttempt(attempt: InsertPhishingAttempt): Promise<PhishingAttempt>;
  getUserPhishingAttempts(userId: string): Promise<PhishingAttempt[]>;
  
  // Analytics operations
  getWeakestAreas(): Promise<{ category: string; failureRate: number }[]>;
  getCompletionRate(): Promise<number>;
  getMostFailedQuizzes(): Promise<{ moduleId: string; moduleTitle: string; failureCount: number }[]>;
  
  // Personalization - get recommended module based on weak areas
  getRecommendedModule(userId: string): Promise<Module | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserScore(userId: string, scoreIncrement: number): Promise<void> {
    await db
      .update(users)
      .set({
        cyberHygieneScore: sql`${users.cyberHygieneScore} + ${scoreIncrement}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Module operations
  async getAllModules(): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.isActive, true))
      .orderBy(modules.orderIndex);
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(moduleData: InsertModule): Promise<Module> {
    const [module] = await db.insert(modules).values(moduleData).returning();
    return module;
  }

  // Quiz question operations
  async getModuleQuestions(moduleId: string): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.moduleId, moduleId))
      .orderBy(quizQuestions.orderIndex);
  }

  async createQuizQuestion(questionData: InsertQuizQuestion): Promise<QuizQuestion> {
    const [question] = await db.insert(quizQuestions).values(questionData).returning();
    return question;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.updatedAt));
  }

  async getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        )
      );
    return progress;
  }

  async upsertUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserModuleProgress(progressData.userId, progressData.moduleId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progressData,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values(progressData)
        .returning();
      return created;
    }
  }

  // Quiz attempt operations
  async createQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts).values(attemptData).returning();
    
    // Update user stats
    await db
      .update(users)
      .set({
        totalQuizzesTaken: sql`${users.totalQuizzesTaken} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, attemptData.userId));
    
    return attempt;
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getModuleQuizAttempts(moduleId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.moduleId, moduleId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(badgeData).returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
    
    return results.map(r => ({
      ...r.user_badges,
      badge: r.badges,
    }));
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    // Check if already earned
    const [existing] = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      );
    
    if (!existing) {
      await db.insert(userBadges).values({ userId, badgeId });
      
      // Add badge points to user score
      const [badge] = await db.select().from(badges).where(eq(badges.id, badgeId));
      if (badge) {
        await this.updateUserScore(userId, badge.points);
      }
    }
  }

  // Phishing simulation operations
  async createPhishingAttempt(attemptData: InsertPhishingAttempt): Promise<PhishingAttempt> {
    const [attempt] = await db.insert(phishingAttempts).values(attemptData).returning();
    return attempt;
  }

  async getUserPhishingAttempts(userId: string): Promise<PhishingAttempt[]> {
    return await db
      .select()
      .from(phishingAttempts)
      .where(eq(phishingAttempts.userId, userId))
      .orderBy(desc(phishingAttempts.completedAt));
  }

  // Analytics operations
  async getWeakestAreas(): Promise<{ category: string; failureRate: number }[]> {
    const results = await db
      .select({
        category: modules.category,
        totalAttempts: sql<number>`COUNT(${quizAttempts.id})::int`,
        failedAttempts: sql<number>`SUM(CASE WHEN ${quizAttempts.score} < ${quizAttempts.totalQuestions} * 0.7 THEN 1 ELSE 0 END)::int`,
      })
      .from(quizAttempts)
      .innerJoin(modules, eq(quizAttempts.moduleId, modules.id))
      .groupBy(modules.category);
    
    return results.map(r => ({
      category: r.category,
      failureRate: r.totalAttempts > 0 ? r.failedAttempts / r.totalAttempts : 0,
    })).sort((a, b) => b.failureRate - a.failureRate);
  }

  async getCompletionRate(): Promise<number> {
    const [result] = await db
      .select({
        totalUsers: sql<number>`COUNT(DISTINCT ${users.id})::int`,
        completedUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${users.completedModules} > 0 THEN ${users.id} END)::int`,
      })
      .from(users);
    
    return result.totalUsers > 0 ? result.completedUsers / result.totalUsers : 0;
  }

  async getMostFailedQuizzes(): Promise<{ moduleId: string; moduleTitle: string; failureCount: number }[]> {
    const results = await db
      .select({
        moduleId: modules.id,
        moduleTitle: modules.title,
        failureCount: sql<number>`COUNT(CASE WHEN ${quizAttempts.score} < ${quizAttempts.totalQuestions} * 0.7 THEN 1 END)::int`,
      })
      .from(quizAttempts)
      .innerJoin(modules, eq(quizAttempts.moduleId, modules.id))
      .groupBy(modules.id, modules.title)
      .orderBy(desc(sql`COUNT(CASE WHEN ${quizAttempts.score} < ${quizAttempts.totalQuestions} * 0.7 THEN 1 END)`))
      .limit(5);
    
    return results;
  }

  // Personalization - recommend next module based on weak areas
  async getRecommendedModule(userId: string): Promise<Module | undefined> {
    // Get user's quiz attempts to identify weak areas
    const attempts = await this.getUserQuizAttempts(userId);
    const completedProgress = await this.getUserProgress(userId);
    const completedModuleIds = completedProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);
    
    if (attempts.length === 0) {
      // New user - recommend first module
      const [firstModule] = await db
        .select()
        .from(modules)
        .where(eq(modules.isActive, true))
        .orderBy(modules.orderIndex)
        .limit(1);
      return firstModule;
    }
    
    // Find categories with worst performance
    const categoryScores = new Map<string, { total: number; correct: number }>();
    
    for (const attempt of attempts) {
      const module = await this.getModule(attempt.moduleId);
      if (!module) continue;
      
      const current = categoryScores.get(module.category) || { total: 0, correct: 0 };
      current.total += attempt.totalQuestions;
      current.correct += attempt.score;
      categoryScores.set(module.category, current);
    }
    
    // Find weakest category
    let weakestCategory = '';
    let lowestScore = 1;
    
    for (const [category, scores] of Array.from(categoryScores.entries())) {
      const scoreRate = scores.total > 0 ? scores.correct / scores.total : 0;
      if (scoreRate < lowestScore) {
        lowestScore = scoreRate;
        weakestCategory = category;
      }
    }
    
    // Recommend an incomplete module from the weakest category
    if (weakestCategory) {
      const query = db
        .select()
        .from(modules)
        .where(
          and(
            eq(modules.isActive, true),
            eq(modules.category, weakestCategory)
          )
        )
        .orderBy(modules.orderIndex);
      
      const categoryModules = await query;
      const uncompleted = categoryModules.find(m => !completedModuleIds.includes(m.id));
      
      if (uncompleted) {
        return uncompleted;
      }
    }
    
    // Fallback: recommend next incomplete module
    const allModules = await this.getAllModules();
    return allModules.find(m => !completedModuleIds.includes(m.id));
  }
}

export const storage = new DatabaseStorage();
