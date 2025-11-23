import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Require SESSION_SECRET in all environments
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set");
  }
  
  // Use secure cookies in production (behind Replit's HTTPS proxy), non-secure in dev
  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    proxy: true, // Trust proxy for secure cookie handling
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // true in production (HTTPS), false in dev (HTTP)
      sameSite: 'lax',
      maxAge: sessionTtl,
      path: '/',
    },
  });
}

export async function setupAuth(app: Express) {
  // Trust proxy for deployment (Replit uses a reverse proxy)
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Authenticating user:", username);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "Incorrect username" });
        }

        console.log("User found:", username);
        
        if (!user.password) {
          console.log("❌ User has no password set");
          return done(null, false, { message: "Incorrect password" });
        }

        // Check if password is bcrypt-hashed (starts with $2a$, $2b$, or $2y$)
        const isBcryptHash = /^\$2[aby]\$/.test(user.password);
        
        let passwordsMatch = false;
        
        if (isBcryptHash) {
          // Use bcrypt comparison for hashed passwords
          const bcrypt = await import('bcryptjs');
          passwordsMatch = await bcrypt.compare(password, user.password);
          console.log("🔐 Using bcrypt comparison");
        } else {
          // Use plain text comparison for non-hashed passwords
          const expectedPassword = String(user.password).trim();
          const providedPassword = String(password).trim();
          passwordsMatch = expectedPassword === providedPassword;
          console.log("🔐 Using plain text comparison");
        }
        
        if (!passwordsMatch) {
          console.log("❌ Authentication failed - password mismatch");
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("✅ User authenticated successfully:", username);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, cb) => {
    console.log("📦 Serializing user:", user.id, user.username);
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, cb) => {
    console.log("📦 Deserializing user ID:", id);
    try {
      const user = await storage.getUser(id);
      console.log("📦 User deserialized:", user ? user.username : "NOT FOUND");
      cb(null, user);
    } catch (error) {
      console.error("❌ Deserialize error:", error);
      cb(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("=== LOGIN ATTEMPT START ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Username from request:", req.body?.username);
    console.log("Password from request:", req.body?.password);
    console.log("Session ID before auth:", req.sessionID);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      console.log("=== PASSPORT AUTHENTICATE CALLBACK ===");
      
      if (err) {
        console.error("❌ Authentication error:", err);
        return res.status(500).json({ message: "Authentifizierungsfehler", error: err.message });
      }
      
      if (!user) {
        console.log("❌ No user returned. Info:", info?.message);
        console.log("This means either user not found or password mismatch");
        return res.status(401).json({ message: "Benutzername oder Passwort falsch" });
      }
      
      console.log("✅ User found:", user.username, "User ID:", user.id);
      
      req.login(user, (loginErr) => {
        console.log("=== REQ.LOGIN CALLBACK ===");
        
        if (loginErr) {
          console.error("❌ req.login error:", loginErr);
          return res.status(500).json({ message: "Login-Fehler", error: loginErr.message });
        }
        
        console.log("✅ req.login successful");
        console.log("Session ID after login:", req.sessionID);
        console.log("Session data after login:", JSON.stringify(req.session));
        console.log("User authenticated:", req.isAuthenticated());
        console.log("Session user:", req.user);
        
        // Force session save
        req.session.save(async (saveErr) => {
          if (saveErr) {
            console.error("❌ Session save error:", saveErr);
            return res.status(500).json({ message: "Session-Speicherfehler", error: saveErr.message });
          }
          
          console.log("✅ Session saved successfully");
          
          // Track user session
          try {
            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
            const userAgent = req.headers['user-agent'];
            const session = await storage.createUserSession(user.id, ipAddress, userAgent);
            console.log("📊 Session tracked:", session.id);
            // Store session ID in Express session for later tracking
            (req.session as any).trackingSessionId = session.id;
          } catch (trackError) {
            console.error("⚠️ Failed to track session:", trackError);
            // Don't fail login if tracking fails
          }
          
          console.log("=== LOGIN ATTEMPT END - SUCCESS ===");
          return res.json(user);
        });
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", (req, res) => {
    console.log("=== GET /api/auth/user ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", JSON.stringify(req.session));
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("User:", req.user);
    
    if (req.isAuthenticated()) {
      console.log("✅ User is authenticated, returning user data");
      return res.json(req.user);
    }
    
    console.log("❌ User not authenticated");
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/logout", async (req, res) => {
    // Track session end before logout
    try {
      const trackingSessionId = (req.session as any).trackingSessionId;
      if (trackingSessionId) {
        await storage.endUserSession(trackingSessionId);
        console.log("📊 Session ended:", trackingSessionId);
      }
    } catch (trackError) {
      console.error("⚠️ Failed to end session tracking:", trackError);
      // Don't fail logout if tracking fails
    }

    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/mode", (req, res) => {
    res.json({ mode: "local", environment: process.env.NODE_ENV || "development" });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
