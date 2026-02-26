import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      if (data && data.trim()) {
        users = JSON.parse(data);
      } else {
        users = [];
      }
      if (!Array.isArray(users)) users = [];
    } catch (e) {
      console.log("Users file not found or invalid, starting fresh");
      users = [];
    }

    // Always ensure developer account exists
    if (!Array.isArray(users) || !users.some((u: any) => u.email === 'faraj')) {
      if (!Array.isArray(users)) users = [];
      users.push({
        id: 'admin',
        name: 'Developer',
        email: 'faraj',
        password: 'faraj',
        role: 'developer',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }

    // Ensure config file exists
    try {
      await fs.access(CONFIG_FILE);
    } catch {
      await fs.writeFile(CONFIG_FILE, JSON.stringify({}, null, 2));
    }
  } catch (err) {
    console.error("Error initializing data directory:", err);
  }
}

async function startServer() {
  await ensureDataDir();

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Routes
  app.get("/api/users", async (req, res) => {
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      let users = [];
      if (data && data.trim()) {
        users = JSON.parse(data);
      }
      res.json(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Error reading users:", err);
      res.json([]);
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const newUser = req.body;
      let users = [];
      try {
        const data = await fs.readFile(USERS_FILE, "utf-8");
        if (data && data.trim()) {
          users = JSON.parse(data);
        }
        if (!Array.isArray(users)) users = [];
      } catch (e) {
        users = [];
      }
      
      // Check if user exists
      if (users.some((u: any) => u.email && u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return res.status(400).json({ error: "User already exists" });
      }

      users.push(newUser);
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ error: "Failed to save user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const trimmedEmail = email.toLowerCase().trim();

      // Hardcoded fallback for developer account - check this FIRST
      if (trimmedEmail === 'faraj' && password === 'faraj') {
        return res.json({
          id: 'admin',
          name: 'Developer',
          email: 'faraj',
          password: 'faraj',
          role: 'developer',
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      }

      let users = [];
      try {
        const data = await fs.readFile(USERS_FILE, "utf-8");
        if (data && data.trim()) {
          users = JSON.parse(data);
        } else {
          users = [];
        }
      } catch (err) {
        users = [];
      }
      
      const user = users.find((u: any) => 
        u.email.toLowerCase() === trimmedEmail && 
        u.password === password
      );

      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ error: "زانیارییەکان هەڵەیە!" });
      }
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.put("/api/users", async (req, res) => {
    try {
      const updatedUsers = req.body;
      await fs.writeFile(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update users" });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const data = await fs.readFile(CONFIG_FILE, "utf-8");
      const config = data && data.trim() ? JSON.parse(data) : {};
      res.json(config);
    } catch (err) {
      res.json({});
    }
  });

  app.put("/api/config", async (req, res) => {
    try {
      const config = req.body;
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
}

startServer();
