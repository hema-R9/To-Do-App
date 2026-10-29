const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // SQLite المدمجة في Node (محتاج Node 22.13+)

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Database ----------
const db = new DatabaseSync(path.join(__dirname, 'tasks.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
// Seed sample tasks automatically
const sampleTasks = [
  ["Study SQL Basics", "Practice SELECT, WHERE, and ORDER BY", 0],
  ["Practice SQL Joins", "Solve INNER JOIN and LEFT JOIN exercises", 0],
  ["Review Database Design", "Study primary keys and foreign keys", 1],
  ["Learn JavaScript", "Practice variables, functions, and arrays", 0],
  ["Build a To-Do App", "Improve the frontend and backend", 0],
  ["Test GET API", "Check the tasks endpoint using Postman", 1],
  ["Test POST API", "Add new tasks through Postman", 0],
  ["Test PUT API", "Update an existing task", 0],
  ["Test DELETE API", "Verify task deletion", 0],
  ["Read API Documentation", "Understand request and response formats", 1],
  ["Fix Project Bugs", "Test the application and fix errors", 0],
  ["Organize Project Files", "Keep frontend and backend files organized", 1],
  ["Upload Project to GitHub", "Push the latest project version", 0],
  ["Create Jira Tasks", "Organize development work into issues", 0],
  ["Review HTML Basics", "Practice forms and semantic elements", 1],
  ["Practice CSS", "Improve layout, spacing, and responsiveness", 0],
  ["Learn Express.js", "Understand routes and middleware", 0],
  ["Review Node.js", "Practice modules and npm commands", 1],
  ["Prepare for Exam", "Review important course topics", 0],
  ["Complete Homework", "Finish pending university assignments", 0],
  ["Read a Technical Article", "Learn something new about web development", 0],
  ["Clean Study Desk", "Organize books and study materials", 1],
  ["Plan Weekly Goals", "Write down the most important tasks", 0],
  ["Back Up Project Files", "Keep a copy of important project files", 0],
  ["Check GitHub Repository", "Review commits and project documentation", 1],
  ["Improve Error Handling", "Handle invalid API requests correctly", 0],
  ["Test Frontend Forms", "Check required fields and validation", 0],
  ["Review Completed Tasks", "Check progress on finished work", 1],
  ["Learn About JSON", "Practice working with JSON objects", 0],
  ["Plan Next Project", "Write ideas for a new web application", 0]
];

const insertSampleTask = db.prepare(`
  INSERT INTO tasks (title, description, completed)
  SELECT ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE title = ?
  )
`);

for (const [title, description, completed] of sampleTasks) {
  insertSampleTask.run(title, description, completed, title);
}

const toTask = (r) => r && { ...r, completed: !!r.completed };

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API ----------
// GET /api/tasks - عرض كل المهام
app.get('/api/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY completed ASC, id DESC').all();
  res.json(rows.map(toTask));
});

// GET /api/tasks/:id - عرض مهمة معينة
app.get('/api/tasks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'المهمة غير موجودة' });
  res.json(toTask(row));
});

// POST /api/tasks - إضافة مهمة
app.post('/api/tasks', (req, res) => {
  const { title, description = '' } = req.body;
  if (!title || !String(title).trim())
    return res.status(400).json({ error: 'عنوان المهمة مطلوب' });
  const info = db
    .prepare('INSERT INTO tasks (title, description) VALUES (?, ?)')
    .run(String(title).trim(), String(description).trim());
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toTask(row));
});

// PUT /api/tasks/:id - تعديل مهمة (العنوان / الوصف / الحالة)
app.put('/api/tasks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'المهمة غير موجودة' });

  const title = req.body.title !== undefined ? String(req.body.title).trim() : row.title;
  const description = req.body.description !== undefined ? String(req.body.description).trim() : row.description;
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : row.completed;
  if (!title) return res.status(400).json({ error: 'عنوان المهمة مطلوب' });

  db.prepare('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?')
    .run(title, description, completed, req.params.id);
  res.json(toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)));
});

// DELETE /api/tasks/:id - حذف مهمة
app.delete('/api/tasks/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'المهمة غير موجودة' });
  res.json({ message: 'تم حذف المهمة' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
