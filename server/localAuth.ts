import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import type { Express } from "express";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemStore = MemoryStore(session);
  return session({
    secret: process.env.SESSION_SECRET || "default-secret-change-in-prod",
    store: new MemStore({ checkPeriod: 86400000 }), // prune expired entries every 24h
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Login route
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};