# Computer Science Student Support Chatbot

Full-stack app using React (Vite) + PHP + MySQL. Designed to run on Windows with WAMP for local development.

## Prerequisites
- Windows 10/11
- WAMP Server (Apache, PHP 8+, MySQL 8)
- Node.js 18+

## Backend (PHP + MySQL)

1) Create database and tables

- Open phpMyAdmin (WAMP) and create database `student_support`.
- Import SQL file:
  - File: `php-backend/sql/schema.sql`

2) Configure Apache site

- Place the backend folder under your web root, e.g. `C:/wamp64/www/php-backend`.
- Ensure Apache allows overrides (so `.htaccess` works).
- Backend entry: `http://localhost/php-backend/public`.

3) Environment

- Optionally set environment variables (via Apache SetEnv or system env):
  - `ALLOWED_ORIGIN` (default `http://localhost:5173`)
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
  - `JWT_SECRET`
  - `OPENAI_API_KEY` (optional for fallback)

4) Create an admin user (optional)

- Register via API `/api/auth/register` with role `admin` (temporarily modify in DB if needed).
- Or insert directly:
```
INSERT INTO users(name, email, password_hash, role, approved)
VALUES ('Admin', 'admin@example.com', '$2y$10$hash_here', 'admin', 1);
```
Use PHP `password_hash('your_password', PASSWORD_BCRYPT)` to get a hash.

## Frontend (React)

1) Install dependencies
```
cd frontend
npm install
```

2) Configure API base URL
- Copy `.env.example` to `.env` and adjust:
```
VITE_API_BASE=http://localhost/php-backend/public
```

3) Run dev server
```
npm run dev
```

4) Build
```
npm run build
```

## App URLs
- Frontend (Vite dev): `http://localhost:5173`
- Backend: `http://localhost/php-backend/public`

## Features
- Admin: Dashboard, Knowledge base (add/import URL), Resources (upload), Students (approve/reject)
- Student: Chat with KB + optional OpenAI fallback, Resources, Profile
- JWT-based auth

## Notes
- To enable OpenAI, set `OPENAI_API_KEY` in the backend environment and restart Apache.
- File uploads are stored in `php-backend/public/uploads`.