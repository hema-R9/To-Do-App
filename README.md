# To-Do List App — إدارة المهام

Frontend: HTML / CSS / JavaScript — Backend: Node.js + Express — Database: SQLite (node:sqlite المدمجة في Node، محتاج Node 22.13 أو أحدث)

## التشغيل
```bash
npm install
npm start
```
افتحي المتصفح على http://localhost:3000

## الـ API
| Method | Endpoint | الوظيفة |
|---|---|---|
| GET | /api/tasks | عرض كل المهام |
| GET | /api/tasks/:id | عرض مهمة معينة |
| POST | /api/tasks | إضافة مهمة `{ "title": "...", "description": "..." }` |
| PUT | /api/tasks/:id | تعديل مهمة `{ "title", "description", "completed" }` |
| DELETE | /api/tasks/:id | حذف مهمة |

## اختبار الـ API بـ Postman
1. POST http://localhost:3000/api/tasks — Body (raw, JSON): `{"title":"أذاكر Databases"}`
2. GET http://localhost:3000/api/tasks
3. PUT http://localhost:3000/api/tasks/1 — `{"completed": true}`
4. DELETE http://localhost:3000/api/tasks/1
