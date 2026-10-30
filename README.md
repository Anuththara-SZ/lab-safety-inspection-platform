# Smart Laboratory Safety Inspection Platform

**Module:** EC4307 Web Application Development, Department of Electrical and Information Engineering, University of Ruhuna
**Stack:** MERN (MongoDB, Express.js, React, Node.js) + Tailwind CSS + JWT authentication

A full-stack web application that digitises laboratory safety inspections: administrators register laboratories and design
checklists, inspectors carry out scored inspections, anyone can report incidents, and a dashboard shows compliance trends.

---

## 1. Features

| Area | Description |
|---|---|
| Authentication | Register / login, bcrypt-hashed passwords, JWT bearer tokens, auto-logout on expiry |
| Role-based access | `admin`, `inspector`, `technician` enforced on **both** API (middleware) and UI (route guards) |
| Laboratories | CRUD, search, hazard-level filter, last inspection date and score |
| Checklist templates | Admin-defined, categorised items (Fire, Chemical, Electrical, PPE...), items can be flagged *critical* |
| Inspections | Schedule from a template, answer Pass / Fail / N/A with remarks, automatic score + risk level, printable report |
| Incidents | Anyone reports; admins/inspectors triage (open, investigating, resolved) and record resolution |
| Dashboard | KPIs, score trend line chart, risk pie chart, incident bar chart, labs overdue (>90 days) |
| User management | Admin creates users, changes roles, deletes accounts |

### Scoring and risk logic (`backend/models/Inspection.js`)
- `score = passed / (passed + failed) x 100` (N/A items are ignored)
- Risk level: **critical** if any *critical* item fails, else **high** (<60%), **medium** (<80%), **low** (>=80%)

### Permissions matrix

| Action | Admin | Inspector | Technician |
|---|:-:|:-:|:-:|
| View labs / dashboard | Y | Y | Y |
| Create / edit / delete labs | Y | | |
| Create / edit / delete checklist templates | Y | | |
| Schedule an inspection | Y (any inspector) | Y (self only) | |
| Submit an inspection | Y | Y (own only) | |
| View inspections | all | own | completed reports only |
| Report an incident | Y | Y | Y |
| Update incident status | Y | Y | |
| Manage users | Y | | |

---

## 2. Architecture

```
React SPA (Vite + Tailwind)  --HTTPS/JSON + JWT-->  Express REST API  --Mongoose-->  MongoDB
  pages / components                                 routes -> middleware -> controllers -> models
  AuthContext + axios interceptor                    helmet, cors, rate-limit, validation, error handler
```

```
lab-safety/
  backend/
    app.js, server.js, seed.js
    config/db.js
    models/        User, Lab, Template, Inspection, Incident
    middleware/    auth.js (protect, authorize), validate.js, errorHandler.js
    controllers/   auth, user, lab, template, inspection, incident, dashboard
    routes/        one router per resource
  frontend/
    src/api.js, context/AuthContext.jsx
    src/components/  Layout, ui (Badge, Modal, StatCard...)
    src/pages/       Login, Register, Dashboard, Labs, Inspections, InspectionDetail,
                     Incidents, Templates, Users
```

### Data model
- **User** `{name, email, password(hash), role}`
- **Lab** `{name, code(unique), building, department, capacity, hazardLevel, status, manager->User, lastInspectionDate, lastScore}`
- **Template** `{title, description, items[{text, category, critical}]}`
- **Inspection** `{lab->Lab, template->Template, inspector->User, scheduledDate, completedDate, status, responses[{text, category, critical, result, remarks}], score, riskLevel, summary}`
  Template items are *copied* into the inspection, so later template edits never alter historical reports.
- **Incident** `{lab->Lab, reportedBy->User, title, description, severity, status, resolution, resolvedAt}`

---

## 3. Running the project

**Prerequisites:** Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env        # edit MONGO_URI and JWT_SECRET
npm run seed                # optional: demo data + demo accounts
npm run dev                 # http://localhost:5000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
```

**Demo accounts** (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@lab.com | Admin@123 |
| Inspector | inspector@lab.com | Inspector@123 |
| Technician | tech@lab.com | Tech@123 |

**Production build:** `cd frontend && npm run build`, then serve `dist/` (set `VITE_API_URL` to the API URL at build time and
`CLIENT_URL` in the backend `.env`).

---

## 4. REST API reference

All routes except `/auth/register`, `/auth/login` and `/health` require `Authorization: Bearer <token>`.

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create technician account, returns JWT |
| POST | `/api/auth/login` | public | Returns JWT + user |
| GET | `/api/auth/me` | any | Current user |
| GET | `/api/dashboard` | any | Aggregated statistics |
| GET | `/api/labs?search=&hazardLevel=&status=` | any | List labs |
| GET | `/api/labs/:id` | any | Lab details |
| POST / PUT / DELETE | `/api/labs[/:id]` | admin | Manage labs |
| GET | `/api/templates[/:id]` | any | Checklist templates |
| POST / PUT / DELETE | `/api/templates[/:id]` | admin | Manage templates |
| GET | `/api/inspections?status=&lab=&riskLevel=` | any (filtered by role) | List inspections |
| GET | `/api/inspections/:id` | any | Full inspection with responses |
| POST | `/api/inspections` | admin, inspector | Schedule from template |
| PUT | `/api/inspections/:id/submit` | admin, assigned inspector | Submit answers, compute score |
| DELETE | `/api/inspections/:id` | admin | Delete |
| GET | `/api/incidents?status=&severity=` | any (technician: own) | List incidents |
| POST | `/api/incidents` | any | Report incident |
| PUT | `/api/incidents/:id` | admin, inspector | Update status / resolution |
| DELETE | `/api/incidents/:id` | admin | Delete |
| GET | `/api/users/staff` | admin, inspector | Names for dropdowns |
| GET / POST | `/api/users` | admin | List / create users |
| PUT | `/api/users/:id/role` | admin | Change role |
| DELETE | `/api/users/:id` | admin | Delete user |

Errors are returned as `{ "message": "..." }` with proper status codes (400, 401, 403, 404, 409, 500).

### Example
```bash
TOKEN=$(curl -s -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@lab.com","password":"Admin@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -H "Authorization: Bearer $TOKEN" localhost:5000/api/labs
```

---

## 5. Security measures

- Passwords hashed with **bcrypt** (10 rounds), never returned (`select: false`)
- **JWT** with expiry; verified on every request; user re-loaded from DB so deleted users lose access
- **Authorization middleware** per route + ownership checks (inspectors only submit their own inspections)
- Self-registration cannot choose a role (prevents privilege escalation)
- **helmet** security headers, **CORS** restricted to `CLIENT_URL`, **rate limiting** (stricter on `/auth`)
- Input validation with **express-validator** + Mongoose schema validation; search input regex-escaped (no ReDoS / injection)
- Centralised error handler (no stack traces in production)

## 6. Performance, usability and scalability notes (LO-4 justification)

- Stateless JWT API, so the backend scales horizontally behind a load balancer
- List endpoints use `.select('-responses')` to avoid sending large nested arrays; dashboard uses parallel `Promise.all` + MongoDB aggregation
- Debounced search, responsive Tailwind layout, progress indicator and per-item validation in the checklist form
- Natural next steps: pagination, indexes on `Inspection.lab/status`, refresh tokens, file/photo evidence upload, email reminders, QR codes per lab

## 7. Mapping to module learning outcomes

| LO | Evidence in this project |
|---|---|
| LO-1 Core components | React front-end, Express back-end, MongoDB database layers; client-server over HTTP |
| LO-2 Frameworks and tools | React, React Router, Tailwind CSS, Vite, Express, Mongoose, Recharts |
| LO-3 RESTful APIs, auth, security | Resource-based REST API, JWT auth, RBAC, bcrypt, helmet, rate limiting, validation |
| LO-4 Full-stack design | Layered architecture, data model, scoring algorithm, justified design decisions (sections 2, 5, 6) |

## 8. Suggested demo script (final project evaluation)

1. Register a new user, so it is a technician; show restricted menu; report an incident.
2. Log in as **admin**: add a lab, create a checklist (mark an item critical), promote the new user to inspector.
3. Log in as **inspector**: schedule an inspection, fail a critical item (note: remarks required), submit, see **critical** risk and printable report.
4. Return to the **dashboard**: charts and overdue labs update.
5. Show `403` from the API when a technician calls `POST /api/labs`.
