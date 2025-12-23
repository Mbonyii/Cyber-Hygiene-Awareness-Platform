import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import {
  insertModuleSchema,
  insertQuizQuestionSchema,
  insertUserProgressSchema,
  insertQuizAttemptSchema,
  insertPhishingAttemptSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Module routes
  app.get('/api/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get('/api/modules/:id', isAuthenticated, async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post('/api/modules', isAuthenticated, async (req: any, res) => {
    try {
      const moduleData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(moduleData);
      res.json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(400).json({ message: "Invalid module data" });
    }
  });

  // Quiz question routes
  app.get('/api/modules/:moduleId/questions', isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getModuleQuestions(req.params.moduleId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/questions', isAuthenticated, async (req, res) => {
    try {
      const questionData = insertQuizQuestionSchema.parse(req.body);
      const question = await storage.createQuizQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(400).json({ message: "Invalid question data" });
    }
  });

  // User progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = insertUserProgressSchema.parse({ ...req.body, userId });
      const progress = await storage.upsertUserProgress(progressData);
      
      // Update completed modules count if status is completed
      if (progressData.status === 'completed') {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(userId, {
            completedModules: user.completedModules + 1,
          });
        }
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Quiz attempt routes
  app.post('/api/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = insertQuizAttemptSchema.parse({ ...req.body, userId });
      const attempt = await storage.createQuizAttempt(attemptData);
      
      // Award points for successful completion (70%+ score)
      const scorePercentage = attempt.score / attempt.totalQuestions;
      if (scorePercentage >= 0.7) {
        const points = Math.floor(scorePercentage * 100);
        await storage.updateUserScore(userId, points);
      }
      
      // Check for badge eligibility
      await checkAndAwardBadges(userId);
      
      res.json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(400).json({ message: "Invalid attempt data" });
    }
  });

  app.get('/api/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserQuizAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // Badge routes
  app.get('/api/badges', isAuthenticated, async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get('/api/user-badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Phishing simulation routes
  app.post('/api/phishing-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = insertPhishingAttemptSchema.parse({ ...req.body, userId });
      const attempt = await storage.createPhishingAttempt(attemptData);
      
      // Award points based on score
      if (attempt.score >= 80) {
        await storage.updateUserScore(userId, 50);
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error creating phishing attempt:", error);
      res.status(400).json({ message: "Invalid attempt data" });
    }
  });

  app.get('/api/phishing-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserPhishingAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching phishing attempts:", error);
      res.status(500).json({ message: "Failed to fetch phishing attempts" });
    }
  });

  // Recommendation route (personalized learning)
  app.get('/api/recommended-module', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const module = await storage.getRecommendedModule(userId);
      res.json(module);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      res.status(500).json({ message: "Failed to get recommendation" });
    }
  });

  // Admin analytics routes
  app.get('/api/admin/weak-areas', isAuthenticated, async (req, res) => {
    try {
      const weakAreas = await storage.getWeakestAreas();
      res.json(weakAreas);
    } catch (error) {
      console.error("Error fetching weak areas:", error);
      res.status(500).json({ message: "Failed to fetch weak areas" });
    }
  });

  app.get('/api/admin/completion-rate', isAuthenticated, async (req, res) => {
    try {
      const rate = await storage.getCompletionRate();
      res.json({ completionRate: rate });
    } catch (error) {
      console.error("Error fetching completion rate:", error);
      res.status(500).json({ message: "Failed to fetch completion rate" });
    }
  });

  app.get('/api/admin/failed-quizzes', isAuthenticated, async (req, res) => {
    try {
      const failedQuizzes = await storage.getMostFailedQuizzes();
      res.json(failedQuizzes);
    } catch (error) {
      console.error("Error fetching failed quizzes:", error);
      res.status(500).json({ message: "Failed to fetch failed quizzes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to check and award badges based on user achievements
async function checkAndAwardBadges(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const badges = await storage.getAllBadges();
  const userBadges = await storage.getUserBadges(userId);
  const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

  // Check each badge requirement
  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) continue;

    let shouldAward = false;

    switch (badge.name) {
      case 'First Steps':
        shouldAward = user.totalQuizzesTaken >= 1;
        break;
      case 'Phishing Master':
        const phishingAttempts = await storage.getUserPhishingAttempts(userId);
        shouldAward = phishingAttempts.filter(a => a.score >= 90).length >= 3;
        break;
      case 'Password Pro':
        shouldAward = user.completedModules >= 1;
        break;
      case 'Quiz Champion':
        shouldAward = user.totalQuizzesTaken >= 10;
        break;
      case 'Perfect Score':
        const attempts = await storage.getUserQuizAttempts(userId);
        shouldAward = attempts.some(a => a.score === a.totalQuestions);
        break;
      case 'Dedicated Learner':
        shouldAward = user.completedModules >= 5;
        break;
    }

    if (shouldAward) {
      await storage.awardBadge(userId, badge.id);
    }
  }
}
