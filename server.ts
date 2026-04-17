if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("tickets.db");

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'other',
    ai_response TEXT,
    ai_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec("ALTER TABLE tickets ADD COLUMN closed_at DATETIME");
} catch (e) {
  // column likely exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/tickets", (req, res) => {
    const stmt = db.prepare("SELECT * FROM tickets ORDER BY created_at DESC");
    res.json(stmt.all());
  });

  app.get("/api/tickets/:id", (req, res) => {
    const stmt = db.prepare("SELECT * FROM tickets WHERE id = ?");
    const ticket = stmt.get(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req, res) => {
    const { title, description, priority, category, ai_response } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: "Title and description required" });

    const stmt = db.prepare(`
      INSERT INTO tickets (title, description, priority, category, ai_response, ai_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title,
      description,
      priority || "medium",
      category || "other",
      ai_response || "Спасибо за обращение. Мы рассмотрим вашу заявку.",
      "gemini-genai",
    );

    const newTicketStmt = db.prepare("SELECT * FROM tickets WHERE id = ?");
    const newTicket = newTicketStmt.get(info.lastInsertRowid);

    res.status(201).json(newTicket);
  });

  app.patch("/api/tickets/:id/status", (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });

    let stmt;
    if (status === "closed") {
      stmt = db.prepare(
        "UPDATE tickets SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?",
      );
    } else {
      stmt = db.prepare(
        "UPDATE tickets SET status = ?, closed_at = NULL WHERE id = ?",
      );
    }
    const info = stmt.run(status, req.params.id);

    if (info.changes === 0) return res.status(404).json({ error: "Not found" });

    const updatedStmt = db.prepare("SELECT * FROM tickets WHERE id = ?");
    res.json(updatedStmt.get(req.params.id));
  });

  app.delete("/api/tickets/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM tickets WHERE id = ?");
    const info = stmt.run(req.params.id);

    if (info.changes === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const __dirname = path.resolve();
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
