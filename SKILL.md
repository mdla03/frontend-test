---
name: techcare
description: Deep, code-verified reference for the TechCare clinic management system monorepo (Express/TypeScript + Neon Postgres backend, React 19/Vite/Tailwind frontend). Use this skill whenever working on the TechCare codebase — adding or fixing API routes/controllers, changing the Postgres schema, wiring up frontend pages under frontend/src/users/**, debugging auth/JWT, file uploads (Multer+Cloudinary), the queue system, billing, or the ETL tools/ scripts. Trigger on mentions of "TechCare", clinic management system, front desk / lab staff / doctor / admin dashboards, queue_entries, patients table, or any file path under backend/src or frontend/src/users. Also use to explain the project to a new contributor or to onboard changes consistently with existing (sometimes inconsistent) conventions.
---

# TechCare Clinic Management System

TechCare is a full-stack clinic information system: patient registration, a
priority queue for consultation/laboratory services, doctor consultations,
lab results, billing, and admin user/service/activity management.

This skill is derived directly from reading the repository source (not from
the project's own auto-generated `README.md`/`SKILL.md`, which are high-level
and in places inaccurate). Where the real code diverges from what you'd
expect, that is called out explicitly under **Known Issues & Gotchas** —
read that section before making changes, since several endpoints are
half-finished or have live bugs.

## Repository layout

```
TechCare-main/
├── package.json              # root: npm run dev/build/start, delegates via --prefix
├── backend/                  # Express 5 + TypeScript API, ESM ("type": "module")
│   ├── package.json          # dev: nodemon+tsx, build: tsc, start: node dist/server.js
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts             # app entrypoint, mounts routers, serves frontend/dist
│       ├── websocket.ts          # ws server, built but NOT wired into server.ts
│       ├── config/
│       │   ├── db.ts             # neon() client + CREATE TABLE IF NOT EXISTS schema (source of truth)
│       │   ├── env.ts            # process.env wrapper (ENV.*)
│       │   └── cloudinary.ts     # cloudinary v2 config from ENV
│       ├── middlewares/
│       │   ├── auth.middleware.ts    # Bearer JWT -> looks up user, sets req.user
│       │   ├── admin.middleware.ts   # requires req.user.role === "admin" (see bug below)
│       │   ├── multer.middleware.ts  # disk storage, image-only filter, 5MB limit
│       │   └── test.middleware.ts    # authenticateToken — legacy/duplicate of auth.middleware
│       ├── routes/
│       │   ├── auth.route.ts     # POST /login
│       │   ├── admin.route.ts    # users, services, activities
│       │   ├── fdstaff.route.ts  # patients, billing, queues, services (front desk)
│       │   ├── test.routes.ts    # legacy/demo routes, mounted at /api/test
│       │   ├── doctor.route.ts   # STUB — empty router, not imported by server.ts
│       │   ├── labstaff.route.ts # EMPTY FILE (0 bytes) — not implemented, not mounted
│       │   └── patient.route.ts  # EMPTY FILE (0 bytes) — not implemented, not mounted
│       ├── controllers/
│       │   ├── auth/postRequests.controller.ts       # login()
│       │   ├── admin/getRequests.controller.ts        # getAllUsers, getAllservices, getMyActivities, getAllActivities
│       │   ├── admin/postRequests.controller.ts       # addUser, addService, addActivity
│       │   ├── admin/updateRequests.controller.ts     # updateUser
│       │   ├── fdstaff/getRequests.controller.ts       # getAllPatients, getAllBilling, getAllQueueEntries, getAllservices
│       │   ├── fdstaff/postRequests.controller.ts      # addPatient, addBills, addQueueEntry
│       │   ├── fdstaff/updateRequests.controller.ts    # updatePatient, serveQueueEntry, skipQueueEntry
│       │   ├── fdstaff/deleteRequest.controller.ts     # deleteQueue, deletePatient
│       │   ├── fdstaff.controller.ts                  # STUB — all functions empty bodies
│       │   ├── laboratorystaff.controller.ts          # STUB — all functions empty bodies
│       │   ├── patient.controller.ts                  # STUB — all functions empty bodies
│       │   └── test.controller.ts                    # legacy/demo: signIn, getUser, getMyAccount, uploadImage
│       ├── utils/
│       │   ├── calculateAge.ts    # (also duplicated in frontend/src/utils)
│       │   └── generateId.ts      # human-readable ID generators, see "ID scheme" below
│       └── types/express.d.ts     # augments Express.Request with `user` (see bug below)
├── frontend/                  # React 19 + Vite 8 + Tailwind 4 + react-router 8, TypeScript
│   ├── package.json
│   ├── components.json        # shadcn config
│   └── src/
│       ├── main.tsx / App.tsx     # top-level <Routes> (see Routing table below)
│       ├── auth/                  # LoginPage, SignupPage, components/LeftSideBackground
│       ├── lib/axios.ts           # shared axios instance, injects Bearer token from localStorage
│       ├── lib/utils.ts, protectRoute.ts (empty)
│       ├── components/ui/         # shadcn/ui primitives
│       ├── queue/QueueTracking.tsx    # public-facing queue display
│       ├── utils/calculateAge.ts, cnhelper.ts
│       └── users/                     # one folder per role — see "Frontend role modules" below
│           ├── admin/          {Admin.tsx, components/, pages/}
│           ├── doctor/         {DoctorDashboard.tsx, 2 empty stub .tsx files}
│           ├── frontdesk_staff/{FrontdeskStaff.tsx, components/, pages/}
│           ├── laboratory_staff/{LaboratoryStaff.tsx, pages/}
│           └── patient/        {PatientInformation.tsx}
├── tools/                     # standalone, NOT wired into the app
│   ├── README.md              # "ETL pipeline to handle messy existing medical records"
│   ├── data cleaning/         # pipeline.py, messydata.ipynb, cleaned-data_0..9.csv
│   └── data/clinic_data_example.csv
├── README.md                  # project's own high-level architecture doc (generic, keep as-is)
└── SKILL.md                   # project's own prior skill file (superseded in detail by this one)
```

## Tech stack

- **Backend**: Node.js, Express 5, TypeScript, ESM modules (`"type": "module"`, imports use `.js` extensions even for `.ts` files). Dev via `nodemon` + `tsx`; build via `tsc`; run via `node dist/server.js`.
- **Database**: Neon serverless Postgres via `@neondatabase/serverless`'s tagged-template `sql` client (no ORM). Schema is created imperatively in `connectNeon()` with `CREATE TABLE IF NOT EXISTS` — **`backend/src/config/db.ts` is the single source of truth for the schema**, there are no migration files.
- **Auth**: `jsonwebtoken` + `bcryptjs`. Two parallel/duplicate auth implementations exist (see Gotchas).
- **File storage**: `multer` (disk, temp) → `cloudinary` (permanent, `secure_url` stored in Postgres).
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, `react-router` 8, `axios`, shadcn/ui (`@base-ui/react`, `class-variance-authority`, `tailwind-merge`), `lucide-react` icons, `html2canvas` (used for ID card export).
- **Realtime**: a `ws`-based WebSocket server exists (`backend/src/websocket.ts`) but is **not currently initialized** in `server.ts` (the call is commented out).

## Architecture

```
Browser (React SPA)
   │  axios (Bearer token from localStorage)
   ▼
Express app (backend/src/server.ts)
   │  app.use("/api/test", ...)
   │  app.use("/api/auth", ...)
   │  app.use("/api/admin", ...)
   │  app.use("/api/fdstaff", ...)
   │  (unmatched routes fall through to serving frontend/dist/index.html — SPA fallback)
   ▼
Routes → Middleware (auth/admin/multer) → Controllers → sql`` tagged templates → Neon Postgres
```

In production, the backend also serves the built frontend as static files
(`frontendPath = ../../frontend/dist`) and sends `index.html` for any
unmatched route, so the whole app can be deployed as a single Node service
(live at `https://techcare-hui6.onrender.com` per the project README).

## Database schema (from `backend/src/config/db.ts`)

All tables use `SERIAL id PRIMARY KEY` plus a separate human-readable
string ID (see "ID scheme"). Foreign keys reference the **string** ID
columns, not the serial `id`.

| Table | Key columns | Notes |
|---|---|---|
| `users` | `user_id` (PK-ish, unique), `username`, `password` (bcrypt hash), `role`, `full_name`, `email`, `contact_number` | Role values used in practice: `"Administrator"`, `"Doctor"`, `"Front Desk"` / front desk staff, `"Lab Staff"` (exact casing per comment in `db.ts`; not enforced by an enum). |
| `patients` | `patient_id`, `last_name`, `first_name`, `date_of_birth`, `sex`, `contact_number`, `email`, `address`, `emergency_contact`, `image_url` | No `deleted` flag exists despite comments referencing soft-delete; `deletePatient` does a hard `DELETE`. |
| `services` | `service_type`, `service_id`, `service_name` (unique), `price`, `active` (bool) | `service_type` distinguishes `"consultation"` vs `"laboratory"` and drives queue-ID/number generation. |
| `queue_entries` | `queue_id`, `patient_id` → patients, `patient_name` (denormalized), `queue_number`, `service_id`/`service_name`/`service_type` → services, `is_priority`, `status` (default `'waiting'`) | One row per visit. `status` values used in code: `'waiting'`, `'serving'`. |
| `consultations` | `consultation_id`, `patient_id`, `doctor_id` → users, `queue_id` (unique) → queue_entries, `reason`, `findings` JSONB, `prescription` JSONB, `status` (default `'Open'`) | `findings` shape: `{chief_complaint, physical_examination, blood_pressure, heart_rate, temperature, weight, clinical_findings, diagnosis, treatment_plan}`. `prescription` shape: `{diagnosis, additional_instructions, items:[{medication_name, dosage, frequency, duration}]}`. **No controller currently reads/writes this table** — doctor flow is unimplemented. |
| `lab_requests` | `request_id`, `consultation_id`, `patient_id`, `doctor_id`, `test_type`, `results` JSONB, `status` (default `'Pending'`) | `results` shape: `{technician_id, red_blood_cells, white_blood_cells, platelets, hemoglobin, hematocrit, mcv, glucose, cholesterol, additional_findings, result_status, is_released}`. **No controller currently reads/writes this table.** |
| `bills` | `bill_id`, `patient_id`, `items` JSONB, `discount_pct`, `total_amount`, `payment_method` (default `'Cash'`), `status` (default `'Unpaid'`), `receipt_id` (unique), `receipt_issued_at`, `billed_at` | See **Gotcha #2** — `addBills` writes to a column (`services_ids`) that isn't in this schema. |
| `system_activity` | `activity_id`, `user_id` → users, `service_name` → services(service_name), `details` JSONB | Audit log, written by admin activity endpoints. |

## ID generation scheme (`backend/src/utils/generateId.ts`)

All IDs are generated app-side (not DB sequences/UUIDs), by querying the max
existing ID for the relevant scope and incrementing. Format:

| Entity | Format | Reset cadence |
|---|---|---|
| User | `U-YY-MMDD-NNNN` | daily |
| Patient | `P-YY-MMDD-NNNN` | daily |
| Service | `S-YY-MM-NNN` | monthly |
| System activity | `ACT-YYMMDD-HHMM-NNNN` | per minute |
| Consultation queue | `CONS-NNNN` | never resets (monotonic across all time) |
| Laboratory queue | `LAB-NNNN` | never resets (monotonic across all time) |

Queue **numbers** (display position, distinct from queue **IDs**) are
generated separately per `service_type` via
`generateQueueNumberConsultation` / `generateQueueNumberLaboratory`, and are
actively re-shuffled by `serveQueueEntry`/`skipQueueEntry` (see below) —
these are NOT the same value as the `CONS-####`/`LAB-####` ID.

## API reference

Base URL prefix per router, mounted in `server.ts`. **Only** `test`, `auth`,
`admin`, and `fdstaff` routers are actually mounted; `doctor`, `labstaff`,
`patient` routes are not wired up even though route files/stubs exist.

### `POST /api/auth/login`
Body: `{ username, password }`. Looks up user by username, `bcrypt.compare`s
password, on success returns `{ message, user, token, refreshToken }`.
`token` is signed with `{user_id}`, expires in **5 minutes**;
`refreshToken` expires in 1 day. Neither login failure path returns a 4xx —
both "Invalid username" and "Invalid password" respond `200`.

### `/api/admin/*` (`admin.route.ts`) — auth/admin middleware currently **commented out**, routes are unprotected
| Method | Path | Controller | Notes |
|---|---|---|---|
| GET | `/services` | `getAllservices` | all rows, no `active` filter (unlike fdstaff version) |
| GET | `/activity` | `getMyActivities` | activities for `req.user.user_id` — **bug**: only returns `response[0]`, i.e. one row, despite the name/comments implying a list |
| GET | `/activities` | `getAllActivities` | all activities JOINed with `users.username` |
| GET | `/users` | `getAllUsers` | all rows from `users`, including password hashes |
| POST | `/add-user` | `addUser` | body: `{username, password, role, full_name, email, contact_number}`; hashes password, checks username/email/contact uniqueness, generates `user_id`, returns a JWT (noted in code as "for testing purposes... will be removed") |
| POST | `/services` | `addService` | body: `{service_name, price, service_type}`; checks name uniqueness, generates `service_id` |
| PATCH | `/users/:user_id` | `updateUser` | partial update via `COALESCE`; re-hashes password only if provided |
| POST | `/activities` | `addActivity` | body: `{activity_id, service_name, details}`; `activity_id` in body is ignored — a fresh one is generated server-side |

### `/api/fdstaff/*` (`fdstaff.route.ts`) — no auth middleware applied
| Method | Path | Controller | Notes |
|---|---|---|---|
| GET | `/patients` | `getAllPatients` | all patients |
| GET | `/billing` | `getAllBilling` | **bug**: queries `FROM billing`, but the table is named `bills` — this endpoint will throw a DB error as written |
| GET | `/services` | `getAllservices` | filters `WHERE active = TRUE` |
| GET | `/queues` | `getAllQueueEntries` | ordered by `queue_number ASC` |
| POST | `/patients` | `addPatient` | `multipart/form-data`, `upload.single("image")`; requires `last_name, first_name, date_of_birth, sex` + an image file; checks for duplicate patient by name+dob+contact+email; uploads image to Cloudinary folder `"products"`; **note**: on validation failure the handler falls through without calling `res.status().json()` in some branches inside the catch block — check for hanging responses if editing |
| POST | `/billing` | `addBills` | body: `{patient_id, services_ids[], discount_pct, custom_service[], payment_method, status}`; looks up each `service_id`'s price, sums with custom line items, applies `discount_pct`; **bug**: `INSERT INTO bills (... services_ids ...)` but `bills` table has no `services_ids` column (it has `items JSONB` instead) — will throw as written |
| POST | `/queues` | `addQueueEntry` | body: `{patient_id?, service_id, service_name, is_priority}`; looks up `service_type` from `services`, branches ID/number generation by type; `patient_id` optional (walk-ins) |
| PUT | `/queues/:queue_id` | `serveQueueEntry` | marks entry `status='serving'`, sets its `queue_number = 0`, then decrements `queue_number` for everyone behind it (same `service_type`, `status='waiting'`) |
| PATCH | `/queues/:queue_id` | `skipQueueEntry` | swaps the skipped entry with the person immediately behind (scoped by `service_type` + `status='waiting'`) |
| PUT | `/patients/:patient_id` | `updatePatient` | `multipart/form-data`, `upload.single("image")` optional — keeps existing `image_url` if no new file |
| DELETE | `/queues/:queue_id` | `deleteQueue` | hard delete, 404 if not found |
| DELETE | `/patients/:patient_id` | `deletePatient` | hard delete, 404 if not found |

### `/api/test/*` (`test.routes.ts`) — legacy/demo scaffolding, not part of the real flow
| Method | Path | Controller | Notes |
|---|---|---|---|
| POST | `/sign-in` | `signIn` | signs a JWT from the *entire request body* with no password check — do not use as a model for real auth |
| POST | `/` | `getUser` | protected by `authenticateToken` (from `test.middleware.ts`), but the handler body is empty |
| GET | `/get-my-account` | `getMyAccount` | protected; returns `created_at` for `req.user.user_id` |

### Not implemented (files exist but are empty stubs / unmounted)
- `doctor.route.ts` — empty `Router()`, not imported in `server.ts`.
- `labstaff.route.ts`, `patient.route.ts` — 0-byte files.
- `fdstaff.controller.ts` (searchPatients, getPatientRecords, registerPatient, assignQueueNumber, calculateServiceFees, sendLaboratoryRequest), `laboratorystaff.controller.ts` (releaseLaboratoryResults, viewPendingLabRequests), `patient.controller.ts` (downloadLaboratoryResults, viewLaboratoryResults, trackQueueStatus) — all function bodies are empty. This is where consultation/lab-result/queue-tracking business logic needs to be built.

## Auth & middleware flow

```
Client: Authorization: Bearer <token>
   │
authMiddleware (backend/src/middlewares/auth.middleware.ts)
   │  jwt.verify(token, JWT_SECRET) → { user_id }
   │  SELECT * FROM users WHERE user_id = decoded.user_id
   │  req.user = <full user row>
   ▼
adminMiddleware (optional, backend/src/middlewares/admin.middleware.ts)
   │  requires req.user.role === "admin"
   ▼
Controller
```

**Currently, none of the mounted routers apply `authMiddleware` or
`adminMiddleware`** — `admin.route.ts` has `router.use(authMiddleware,
adminMiddleware)` commented out, and `fdstaff.route.ts` never imports them
at all. Treat all currently-mounted endpoints as unauthenticated in their
present state; re-enabling that middleware is a likely task.

There is a **second, parallel auth implementation** in
`test.middleware.ts` (`authenticateToken`) used only by the legacy
`/api/test` routes — it sets `req.user = decoded` (the raw JWT payload)
rather than looking up a full user row, which is a different shape than
what `authMiddleware` sets. Don't mix the two.

## Frontend

### Routing (`frontend/src/App.tsx`)
| Path | Component |
|---|---|
| `/` | redirects to `/login` |
| `/login` | `auth/LoginPage.tsx` |
| `/sign-up` | `auth/SignupPage.tsx` |
| `/admin` | `users/admin/Admin.tsx` |
| `/doctor` | `users/doctor/DoctorDashboard.tsx` |
| `/patient` | `users/patient/PatientInformation.tsx` |
| `/laboratory-staff` | `users/laboratory_staff/pages/LabstaffDashbaord.tsx` (typo in filename, kept as-is) |
| `/frontdesk-staff` | `users/frontdesk_staff/FrontdeskStaff.tsx` |
| `/queue-tracking` | `queue/QueueTracking.tsx` |

There is no route guard wired up (`lib/protectRoute.ts` exists but is
empty) — any route is reachable regardless of login state or role. Login
(`auth/LoginPage.tsx`) stores the JWT in `localStorage.getItem("token")`
and navigates to `` `/${user.role}` `` — meaning **the DB `role` string
must exactly match one of the router paths above** (lowercased path
segments) for post-login navigation to land correctly; this is fragile
against the `role` casing used in `db.ts` comments (e.g. `"Administrator"`
won't route to `/admin`).

### Per-role module pattern
Every role folder under `frontend/src/users/<role>/` follows the same
shape and should be extended consistently:

```
<Role>.tsx                # shell: owns page-level state, calls loadData(), renders <SideBar> + active page
  components/SideBar.tsx  # nav; drives `page` via ?page= query param (useSearchParams)
  components/Header.tsx
  pages/<Feature>.tsx      # one file per sidebar destination, receives state + setters + loadData as props
```

`loadData` is a `useCallback` in the shell component that fires parallel
`api.get(...)` calls (via `frontend/src/lib/axios.ts`) and pushes results
into local `useState`. Child pages receive data/loaders as props rather
than fetching themselves — follow this pattern rather than introducing
new data-fetching libraries (no React Query/SWR is used anywhere).

- **`admin/`**: `Admin.tsx` shell; pages `AdminDashboard`, `UserManagement`, `ServicePricing`, `ActivityMonitoring`; components `AddUserModal`, `UpdateUserModal`, `AddService`, `ActivityDetails`.
- **`frontdesk_staff/`**: `FrontdeskStaff.tsx` shell; pages `FrontdeskDashboard`, `PatientRegistration`, `PatientRecords`, `QueueManagement`, `Billing` (also an unused `Test.tsx`); components `SubmitNewQueue`, `LabAndConsuQueues`, `NowServing`, `EditPatientRecord`, `IdCard` (uses `html2canvas` to export a patient ID card as an image).
- **`laboratory_staff/`**: `LaboratoryStaff.tsx` shell; pages `LabstaffDashbaord` (typo, keep), `LaboratoryRequestsQueue`, `LaboratoryResults` — these pages exist but have no matching backend endpoints yet (see "Not implemented" above), so they are UI-only/mocked at present.
- **`doctor/`**: only `DoctorDashboard.tsx` has content; `ProvideDigitalizedFindings.tsx` and `ProvideDigitalizedPrescriptions.tsx` are empty files — this is the least-built role, matching the unimplemented `consultations` backend.
- **`patient/`**: single `PatientInformation.tsx` (patient-facing view).

### Shared infra
- `lib/axios.ts` — single `api` axios instance, `baseURL` from `VITE_API_BASE_URL`, request interceptor injects `Authorization: Bearer <token>` from `localStorage`. Use this instance rather than raw `axios` or `fetch`.
- `components/ui/` — shadcn/ui primitives (button, dialog, etc.) generated via `components.json`; extend by adding new shadcn components rather than hand-rolling primitives.
- `utils/calculateAge.ts` — duplicated logic also present in `backend/src/utils/calculateAge.ts`; keep both in sync if the age rule changes, or better, note this duplication if asked to refactor.

## `tools/` — data cleaning ETL (standalone)

Not part of the running app; a Python/Jupyter workflow for cleaning messy
legacy clinic CSV exports into a format matching the `patients` table
shape, per `tools/README.md` ("Testing and example on how to initialize an
ETL pipeline to handle messy existing medical records"). Contains
`pipeline.py`, `messydata.ipynb`, `clinic_data_example.csv`, and 10
`cleaned-data_N.csv` output samples. Treat this as reference/example code,
not something imported by the backend.

## Local dev workflow

```bash
# from repo root
npm run dev     # -> npm run dev --prefix backend (nodemon + tsx, backend only)
npm run build    # builds backend (tsc) then frontend (tsc -b && vite build)
npm run start    # node dist/server.js (serves API + built frontend together)

# frontend dev server (separate terminal, for HMR)
cd frontend && npm run dev   # vite, needs VITE_API_BASE_URL env pointing at backend
```

Backend `.env` (see project README):
```
DATABASE_URL=<neon connection string>
NODE_ENV=development
PORT=5000
JWT_SECRET=...
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

`connectNeon()` runs all `CREATE TABLE IF NOT EXISTS` statements on server
boot — starting the backend against a fresh database is sufficient to
provision the schema; there is no separate migration/seed step.

Manual smoke test (per project README): run `npm run build` then `npm run
dev`, then hit `GET http://localhost:3000/` and `GET
http://localhost:3000/api/admin` with Postman. (Default `PORT` is
actually `5000` per `env.ts`; the README's `3000` looks stale — verify
against the running server's log line, which prints the actual port.)

Live deployment referenced in the README: `https://techcare-hui6.onrender.com`.

## Coding conventions to follow when extending this repo

- **SQL**: always use the `sql` tagged template from `config/db.ts` with
  interpolated `${}` params (never string-concatenate queries — the
  existing code is consistently parameterized, keep it that way).
- **IDs**: generate human-readable IDs via `utils/generateId.ts` helpers
  rather than exposing the internal `SERIAL id`; add a new generator
  function there following the existing `prefix + date-scope + sequence`
  pattern if you add a new entity.
- **Controllers**: split by HTTP verb group per resource
  (`getRequests.controller.ts`, `postRequests.controller.ts`,
  `updateRequests.controller.ts`, `deleteRequest.controller.ts`) inside a
  `controllers/<role>/` folder, matching `admin/` and `fdstaff/`. New
  roles (doctor, labstaff, patient) should follow the same subfolder
  split rather than the flat single-file stub pattern currently sitting
  in `fdstaff.controller.ts` / `laboratorystaff.controller.ts` /
  `patient.controller.ts`.
- **Routes**: import controllers with explicit `.js` extensions (required
  for ESM + TS `moduleResolution` in this project) even though the source
  files are `.ts`.
- **Responses**: existing handlers return `{ message, <resource> }` on
  success and `{ error }` (sometimes `{ message }`) on failure, with
  inconsistent status codes (many failure paths return `200` — see login).
  Prefer correct status codes in new code, but don't assume callers rely
  on that (frontend currently checks payload shape, not status).
- **Frontend**: match the shell + `pages/` + `components/` + `loadData`
  prop-drilling pattern described above; don't introduce a global state
  library — state currently lives in each role's shell component.

## Known Issues & Gotchas (read before editing)

1. **Admin routes are unauthenticated** — `router.use(authMiddleware,
   adminMiddleware)` is commented out in `admin.route.ts`; `fdstaff.route.ts`
   never imports auth middleware at all.
2. **`GET /api/fdstaff/billing` is broken** — queries `FROM billing`, a
   table that doesn't exist (the real table is `bills`).
3. **`POST /api/fdstaff/billing` is broken** — inserts into a
   `services_ids` column that doesn't exist on `bills` (schema has `items
   JSONB` instead); the insert will throw.
4. **`GET /api/admin/activity` (singular, "my activities") only returns
   one row** (`response[0]`) despite intending to return the caller's full
   activity list.
5. **Two parallel auth systems** exist (`auth.middleware.ts` /
   `admin.middleware.ts` vs `test.middleware.ts`), setting `req.user` to
   different shapes (full DB row vs raw JWT payload). Don't mix them in
   one route.
6. **`adminMiddleware` checks `req.user.role !== "admin"`** (lowercase),
   but the `role` values described in `db.ts`'s own comments are
   capitalized (`"Administrator"`, `"Doctor"`, etc.) — as written this
   check would reject a real admin. Verify actual stored role strings
   before re-enabling this middleware.
7. **Login access token expires in 5 minutes** with no refresh flow wired
   up on the frontend (the `refreshToken` is returned by the API but
   never used in `LoginPage.tsx`/`lib/axios.ts`) — sessions will go stale
   quickly as currently implemented.
8. **`consultations` and `lab_requests` tables are defined but unused** —
   no controller reads or writes them yet; the doctor and lab-staff
   backend flows are entirely unimplemented despite frontend pages
   existing for them.
9. **WebSocket server is built but not started** — `initializeWebSocket`
   is commented out in `server.ts`; nothing currently pushes realtime
   queue updates, the frontend must be polling/refetching instead.
10. **No route guards on the frontend** — any URL is reachable without a
    valid token or matching role; `lib/protectRoute.ts` is an empty file.
11. **Role-based post-login redirect is fragile** — `navigate(`/${role}`)`
    requires `role` (as stored in Postgres) to lowercase-match one of the
    literal router paths (`admin`, `doctor`, `patient`,
    `laboratory-staff`, `frontdesk-staff`); mismatched casing/naming will
    silently 404 via the SPA fallback.
12. Several files are intentionally empty stubs, not bugs to "fix" by
    deleting: `doctor.route.ts`, `labstaff.route.ts`, `patient.route.ts`,
    `lib/protectRoute.ts`, and the empty functions in
    `fdstaff.controller.ts` / `laboratorystaff.controller.ts` /
    `patient.controller.ts` / `doctor/ProvideDigitalized*.tsx` — these
    mark where future work is expected to land.
