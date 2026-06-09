# Student Management CRUD App

**Date:** June 9, 2026 (Day 5)
**Stack:** React + Node.js/Express + PostgreSQL

---

## What I Built

A full-stack student management application with:
- CRUD operations for student records
- Dashboard with statistics
- Search and filtering
- Form validation
- Responsive design

## How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL

### Database Setup
```bash
psql -U postgres -f server/schema.sql
```

### Backend
```bash
cd server
npm install
cp .env.example .env  # Update with your PostgreSQL credentials
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | Get all students |
| GET | /api/students/:id | Get student by ID |
| POST | /api/students | Create new student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/students/stats | Get dashboard stats |

## Project Structure

```
Task5/
├── server/
│   ├── src/
│   │   ├── config/database.ts
│   │   ├── controllers/student.controller.ts
│   │   ├── middleware/validation.ts
│   │   ├── routes/student.routes.ts
│   │   └── index.ts
│   ├── schema.sql
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── api/students.ts
│   │   ├── components/
│   │   │   ├── StudentForm.tsx
│   │   │   └── StudentList.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── README.md
```
