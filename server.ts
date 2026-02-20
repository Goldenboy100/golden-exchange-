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

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    } catch {
      // File doesn't exist or is invalid
    }

    // Always ensure developer account exists
    if (!users.some((u: any) => u.email === 'faraj')) {
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
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: "Failed to read users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const newUser = req.body;
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const users = JSON.parse(data);
      
      // Check if user exists
      if (users.some((u: any) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
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
        users = JSON.parse(data);
      } catch (err) {
        // If file doesn't exist, we just have an empty users list
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

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
