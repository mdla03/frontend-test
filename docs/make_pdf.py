"""Render the Spaces technical documentation to PDF.

fpdf2 is the only PDF toolchain installed on this machine (no pandoc, no
headless Chrome), so the doc is authored as the limited HTML subset that
FPDF.write_html() understands: headings, p, ul/li, table, b, i, code.
"""

from fpdf import FPDF

HTML = """
<h1>Spaces - Technical Documentation</h1>
<p><i>Employee community events platform for Manulife Philippines. Prepared for pitch review.</i></p>

<h2>1. What the system does</h2>
<p>Spaces lets Manulife Philippines employees discover, join and run internal community
events - volunteer drives, wellness sessions, sports and networking meetups. Events are
either <b>on-site</b> (mapped with a real coordinate) or <b>virtual</b> (a meeting link).
Attendance earns rewards, which roll up into a leaderboard.</p>

<p>Three roles, one codebase:</p>
<ul>
<li><b>user</b> (employee) - browses approved events, registers, cancels, views own rewards.</li>
<li><b>organizer</b> - everything a user can do, plus creates and edits own events and views their attendee lists. Employees apply for this role; an admin approves.</li>
<li><b>admin</b> - approves or rejects submitted events, manages users and roles, views analytics.</li>
</ul>

<p>Two governance gates define the product: every event needs admin approval before it is
visible or joinable, and every organizer needs admin approval before they can publish.</p>

<h2>2. Tech stack</h2>
<table width="100%">
<thead><tr><th width="28%">Layer</th><th width="34%">Choice</th><th width="38%">Why</th></tr></thead>
<tr><td>Frontend framework</td><td>React 19</td><td>Component model; current stable major</td></tr>
<tr><td>Build tool</td><td>Vite 8</td><td>Fast dev server + HMR; ES module native</td></tr>
<tr><td>Routing</td><td>React Router 7</td><td>Nested routes, layout routes, route guards</td></tr>
<tr><td>Styling</td><td>Tailwind CSS 4 + daisyUI 5</td><td>CSS-first config via @theme tokens; Material 3 design tokens defined once in index.css</td></tr>
<tr><td>Maps</td><td>Leaflet + react-leaflet</td><td>Open source, no API key, no per-load billing</td></tr>
<tr><td>HTTP client</td><td>axios</td><td>Request interceptor attaches the JWT in one place</td></tr>
<tr><td>Linting</td><td>oxlint</td><td>Rust-based, near-instant on this codebase size</td></tr>
<tr><td>Backend runtime</td><td>Node.js (ESM)</td><td>Same language as frontend; one mental model</td></tr>
<tr><td>Backend framework</td><td>Express 4</td><td>Minimal routing + middleware; no framework lock-in</td></tr>
<tr><td>Database</td><td>Supabase (managed Postgres)</td><td>Postgres with PostGIS and pgcrypto available; hosted, no ops</td></tr>
<tr><td>DB access</td><td>@supabase/supabase-js (PostgREST)</td><td>No ORM layer to maintain; raw SQL still available via RPC</td></tr>
<tr><td>Geospatial</td><td>PostGIS (geography, 4326)</td><td>Radius search done in the database, not in JS</td></tr>
<tr><td>Auth</td><td>jsonwebtoken + bcryptjs</td><td>Stateless tokens; bcrypt cost factor 10</td></tr>
<tr><td>Config</td><td>dotenv with fail-fast validation</td><td>Missing env var crashes at boot, not at first request</td></tr>
</table>

<h2>3. Architecture</h2>

<h3>3.1 Shape</h3>
<p>Three tiers, strictly separated. The browser never talks to the database.</p>

<pre>
  Browser (React SPA, Vite)
        |  HTTPS, JSON, Authorization: Bearer &lt;JWT&gt;
        v
  Express API (Node)   |-- authMiddleware --&gt; requireRole --&gt; controller
        |  supabase-js, service_role key
        v
  Supabase Postgres (+ PostGIS, pgcrypto, 3 SQL RPCs)
</pre>

<p><b>Why the API tier exists at all.</b> Supabase can be called directly from the browser.
It was deliberately not done that way: doing so would push authorization into Row Level
Security policies and expose the database surface to the client. Routing everything through
Express keeps one enforcement point, keeps the database credential server-side, and leaves
the option to swap Supabase for any Postgres later without touching the frontend.</p>

<h3>3.2 Request lifecycle</h3>
<ul>
<li>axios interceptor in <code>src/lib/api.js</code> reads the token from localStorage and sets the Authorization header on every request.</li>
<li><code>authMiddleware</code> verifies the JWT signature, then re-loads the user row from the database by <code>sub</code>. The token is not trusted for role data - the role is read fresh each request, so an admin demoting a user takes effect immediately rather than at token expiry.</li>
<li><code>requireRole(...roles)</code> is a small factory returning a middleware; it 403s anything outside the allowed set.</li>
<li>The controller performs the query and returns <code>{ data }</code> or <code>{ error }</code>. Response envelope is uniform across every endpoint.</li>
</ul>

<h3>3.3 Code layout</h3>
<table width="100%">
<thead><tr><th width="42%">Path</th><th width="58%">Contents</th></tr></thead>
<tr><td>backend/src/config</td><td>env validation, Supabase client singleton</td></tr>
<tr><td>backend/src/middlewares</td><td>auth.middleware.js, role.middleware.js</td></tr>
<tr><td>backend/src/routes</td><td>One router per resource: auth, events, me, rewards, admin</td></tr>
<tr><td>backend/src/controllers</td><td>Grouped by resource, then split by HTTP verb (getRequests, postRequests, updateRequests, deleteRequest)</td></tr>
<tr><td>backend/src/utils</td><td>jwt.js (sign/verify), password.js (hash/compare)</td></tr>
<tr><td>backend/sql</td><td>schema.sql, setup.sql (schema + demo accounts), idempotent migrate_*.sql, seed_*.sql</td></tr>
<tr><td>src/pages</td><td>Split by role: auth/, user/, organizer/, admin/</td></tr>
<tr><td>src/layouts</td><td>UserLayout (header + bottom nav), DashboardLayout (sidebar, used by both portals)</td></tr>
<tr><td>src/routes</td><td>ProtectedRoute - the single client-side guard</td></tr>
</table>

<h2>4. Data model</h2>
<p>Four tables. All primary keys are <code>uuid</code> defaulting to <code>gen_random_uuid()</code>.
Every status column is a <code>check</code> constraint rather than an enum type, so values can be
widened by a migration without an ALTER TYPE.</p>

<table width="100%">
<thead><tr><th width="26%">Table</th><th width="74%">Key columns</th></tr></thead>
<tr><td>users</td><td>name, email (unique), password (bcrypt hash), role (user | organizer | admin), organizer_status (none | pending | approved | rejected), img_url, created_at</td></tr>
<tr><td>events</td><td>title, description, event_category (Sports | Lifestyle | Community | Networking | Others), address, location (geography point 4326), latitude, longitude, start/end date and time, capacity, status (submitted | cancelled | completed), fee_type (free | paid), reward_type, modality, approval_status (pending | approved | rejected | changes_requested), organizer_id, approved_by, img_url</td></tr>
<tr><td>event_registrations</td><td>event_id, user_id, registration_date, status (registered | waitlisted | cancelled), unique (event_id, user_id)</td></tr>
<tr><td>rewards</td><td>user_id, event_id (nullable, ON DELETE SET NULL), type, amount, status (pending | granted)</td></tr>
</table>

<p><b>Referential policy is intentional per relation.</b> Deleting an event cascades its
registrations - a registration has no meaning without its event. Deleting an event only nulls
the link on rewards, because a reward already granted is a record of something the employee
actually did and must survive.</p>

<p>Indexes cover the real query paths: events by organizer and by approval_status,
registrations by event and by user, rewards by user.</p>

<h3>4.1 Stored procedures (RPC)</h3>
<p>Three things PostgREST cannot express, pushed into SQL functions:</p>
<ul>
<li><code>nearby_events(lat, lng, radius_m)</code> - <code>ST_DWithin</code> filter on approved events with a location, ordered by <code>ST_Distance</code>. Radius search in the database; the client never downloads events to filter them.</li>
<li><code>leaderboard_rewards()</code> - sum of granted reward amounts grouped by user, ordered descending.</li>
<li><code>monthly_registrations()</code> - registrations grouped by <code>date_trunc('month', ...)</code> for the admin analytics chart.</li>
</ul>

<h2>5. API surface</h2>
<p>All routes are prefixed <code>/api</code>. "Auth" means a valid Bearer token is required.</p>

<table width="100%">
<thead><tr><th width="38%">Endpoint</th><th width="30%">Purpose</th><th width="32%">Access</th></tr></thead>
<tr><td>GET /api/health</td><td>Liveness probe</td><td>public</td></tr>
<tr><td>POST /api/auth/register</td><td>Create account, returns token</td><td>public</td></tr>
<tr><td>POST /api/auth/login</td><td>Exchange credentials for token</td><td>public</td></tr>
<tr><td>GET /api/auth/me</td><td>Current user from token</td><td>auth</td></tr>
<tr><td>GET /api/me</td><td>Current user (used by ProtectedRoute)</td><td>auth</td></tr>
<tr><td>GET /api/me/registrations</td><td>Own registrations, event embedded</td><td>auth</td></tr>
<tr><td>GET /api/me/rewards</td><td>Own rewards + granted total</td><td>auth</td></tr>
<tr><td>POST /api/me/apply-organizer</td><td>Raise organizer application</td><td>auth, role user</td></tr>
<tr><td>GET /api/events</td><td>List, filterable by category / modality / title search</td><td>auth</td></tr>
<tr><td>GET /api/events/nearby</td><td>Radius search (PostGIS RPC)</td><td>auth</td></tr>
<tr><td>GET /api/events/:id</td><td>Single event + taken count</td><td>auth</td></tr>
<tr><td>POST /api/events</td><td>Create event (submitted / pending)</td><td>organizer</td></tr>
<tr><td>PATCH /api/events/:id</td><td>Edit own event</td><td>organizer (owner)</td></tr>
<tr><td>PATCH /api/events/:id/status</td><td>Approve or reject</td><td>admin</td></tr>
<tr><td>POST /api/events/:id/register</td><td>Join an approved event</td><td>role user</td></tr>
<tr><td>DELETE /api/events/:id/register</td><td>Cancel registration (soft)</td><td>role user</td></tr>
<tr><td>GET /api/events/:id/registrations</td><td>Attendee list</td><td>admin, or owning organizer</td></tr>
<tr><td>GET /api/leaderboard</td><td>Reward leaderboard</td><td>auth</td></tr>
<tr><td>GET /api/admin/users</td><td>All users</td><td>admin</td></tr>
<tr><td>PATCH /api/admin/users/:id</td><td>Edit name, role, organizer_status, img_url</td><td>admin</td></tr>
<tr><td>GET /api/admin/analytics</td><td>Event and registration totals, by month</td><td>admin</td></tr>
</table>

<h2>6. Authorization model</h2>
<p>Authorization is enforced at three depths, because role alone is not enough:</p>
<ul>
<li><b>Authentication</b> - <code>authMiddleware</code>, mounted with <code>router.use()</code> at the top of every protected router. A route added later is guarded by default; nothing has to be remembered per route.</li>
<li><b>Role</b> - <code>requireRole('organizer')</code> and friends on the specific routes.</li>
<li><b>Ownership</b> - role is not sufficient for organizer routes. <code>PATCH /events/:id</code> loads the row and 403s if <code>organizer_id</code> is not the caller; <code>GET /events/:id/registrations</code> does the same, while still letting an admin through. Without this, any organizer could edit any other organizer's event.</li>
</ul>
<p><b>Query-level scoping.</b> <code>listEvents</code> narrows by role inside the query itself: a
<code>user</code> sees only <code>approval_status = 'approved'</code>. Unapproved events are not filtered
out in the browser - they never leave the database.</p>

<h2>7. Implementation decisions worth defending</h2>
<ul>
<li><b>Registration cancel is a soft state change, not a delete.</b> Status moves to <code>cancelled</code> and the row stays. That preserves history, and combined with the <code>unique (event_id, user_id)</code> constraint it means re-joining must be an <code>upsert</code> with <code>onConflict: 'event_id,user_id'</code> - a plain insert would violate the constraint.</li>
<li><b>Remaining capacity is computed by the database.</b> Event queries select <code>*, event_registrations(count)</code> filtered to <code>status = 'registered'</code>, so the taken count arrives with the event in one round trip. No N+1, and no denormalised counter that can drift out of sync.</li>
<li><b>Role is re-read on every request, not taken from the JWT.</b> The token carries only <code>sub</code> and <code>role</code>; the middleware re-queries the user. Slightly more work per request, but privilege changes apply instantly.</li>
<li><b>The client re-syncs the user on entering any protected route.</b> <code>ProtectedRoute</code> calls <code>/me</code> and replaces the cached user, so an approved organizer application appears without the user logging out and back in. A 401 there clears local state.</li>
<li><b>Coordinates are stored twice, on purpose.</b> <code>latitude</code>/<code>longitude</code> as plain doubles for the client to read, plus a PostGIS <code>geography</code> column written as <code>SRID=4326;POINT(lng lat)</code> for the distance query. Note the order inversion - PostGIS takes longitude first.</li>
<li><b>Setting a role manually clears any open application.</b> If an admin changes <code>role</code> without passing <code>organizer_status</code>, the status is reset to <code>none</code>, so no user is left in a contradictory "organizer, still pending" state.</li>
<li><b>Env vars fail fast.</b> <code>required()</code> throws at import time. A missing key stops the process at boot with a named error rather than producing confusing 500s in production.</li>
<li><b>Cover images are size-capped.</b> Covers arrive as base64 data URLs, so the JSON body limit is raised to 4 MB and <code>createEvent</code> rejects an <code>img_url</code> over 2 MB with a 413.</li>
</ul>

<h2>8. Known limitations and the planned fix</h2>
<p>Stating these before being asked is stronger than being caught by them.</p>
<table width="100%">
<thead><tr><th width="46%">Limitation</th><th width="54%">Fix when it matters</th></tr></thead>
<tr><td>The backend uses the Supabase service_role key, which bypasses Row Level Security entirely. All authorization lives in Express.</td><td>Acceptable while the API is the only client. Before any direct browser-to-Supabase access, RLS policies become mandatory.</td></tr>
<tr><td>JWT is stored in localStorage, readable by any injected script (XSS).</td><td>Move to an httpOnly, SameSite cookie with a CSRF token.</td></tr>
<tr><td>No refresh tokens; the 1-day token cannot be revoked before expiry.</td><td>Short access token + refresh token, or a server-side deny list.</td></tr>
<tr><td>No rate limiting on login - brute force is only slowed by bcrypt cost.</td><td>express-rate-limit keyed on IP and email.</td></tr>
<tr><td>capacity is stored and displayed but not enforced server-side; the waitlisted status exists unused.</td><td>Enforce in a transaction or a DB trigger - checking in JS races under concurrent joins.</td></tr>
<tr><td>Rewards are inserted by seed data; there is no automated grant on attendance.</td><td>Grant on an organizer marking attendance, or on event completion.</td></tr>
<tr><td>No pagination on list endpoints.</td><td>Range headers via PostgREST once volume justifies it.</td></tr>
<tr><td>Base64 cover images live in a text column, bloating rows and responses.</td><td>Supabase Storage; keep only the object URL in the row.</td></tr>
<tr><td>No automated test suite.</td><td>Integration tests over the API against a throwaway schema give the most coverage per line written.</td></tr>
<tr><td>login() collapses a query error and a missing user into the same 401, which hides real database faults during debugging.</td><td>Distinguish error from a null row; log the former, return 401 only for the latter.</td></tr>
</table>

<h2>9. Questions to be ready for</h2>

<p><b>Why a custom Express API instead of calling Supabase from the browser?</b><br/>
To keep one authorization boundary. Direct access would move every rule into RLS policies
and put the database credential in the client. The API also keeps the frontend portable to
any Postgres host.</p>

<p><b>Why not Supabase Auth, given you use Supabase?</b><br/>
The user table needs role and organizer_status as first-class, admin-editable columns, and
every route already goes through the API. Custom JWT plus bcrypt keeps the identity model in
one place. The <code>auth_user_id</code> column is already present as the migration path if
Supabase Auth is adopted later.</p>

<p><b>Why no ORM?</b><br/>
Four tables and PostgREST cover the CRUD. An ORM would add a schema definition to keep in
sync with the SQL for no gain at this size, and the three genuinely complex queries are SQL
functions anyway.</p>

<p><b>How does a user become an organizer?</b><br/>
<code>POST /api/me/apply-organizer</code> sets <code>organizer_status</code> to <code>pending</code>.
An admin sets role and status via <code>PATCH /api/admin/users/:id</code>. The next protected
route entry re-syncs the client from <code>/me</code>, so the portal appears without a re-login.</p>

<p><b>How does an event become visible?</b><br/>
Created as <code>status = 'submitted'</code>, <code>approval_status = 'pending'</code>. An admin
sets <code>approved</code> or <code>rejected</code>, which also records <code>approved_by</code>.
Only approved events reach a <code>user</code>, and registration re-checks approval, so an
event rejected between page load and click cannot be joined.</p>

<p><b>How does map search work?</b><br/>
The <code>nearby_events</code> RPC runs <code>ST_DWithin</code> against a geography column and
orders by distance. Filtering in Postgres rather than in JavaScript means the payload is
already scoped to the radius.</p>

<p><b>What stops one organizer editing another's event?</b><br/>
An ownership check inside the controller, not just the role middleware. The row is loaded and
<code>organizer_id</code> compared to <code>req.user.id</code> before any write.</p>

<p><b>What happens if a user cancels and rejoins?</b><br/>
The row is reused. Cancel sets <code>status = 'cancelled'</code>; rejoining upserts on the
unique <code>(event_id, user_id)</code> pair back to <code>registered</code>. A plain insert
would violate the constraint.</p>

<p><b>How are passwords stored?</b><br/>
bcrypt at cost 10 via bcryptjs, hashed in the API. Seeded demo accounts use Postgres
<code>crypt(..., gen_salt('bf', 10))</code>, which produces a compatible hash. The password
column is stripped from every response before it is sent.</p>

<p><b>What is the biggest security gap today?</b><br/>
The service_role key. It is full database admin and bypasses RLS, so a compromised API
process is a compromised database. It is kept out of version control, and any key that has
been copied between machines should be rotated in the Supabase dashboard.</p>

<p><b>Does this scale?</b><br/>
To the intended population - one company's employees - comfortably, since the heavy work
(distance search, aggregation, counting) is already in Postgres with indexes on the real
query paths. The first things to break are the missing pagination and the base64 images,
both listed above with their fixes.</p>

<p><b>How would you deploy it?</b><br/>
Static frontend build to any CDN host; the Express API as a Node service with the env vars
set in the platform, not in a file; <code>CORS_ORIGIN</code> pinned to the deployed frontend
origin rather than <code>*</code>; Supabase already managed.</p>

<p><b>What would you build next?</b><br/>
Server-side capacity enforcement with the waitlist that the schema already anticipates, then
automated reward granting on attendance - together they close the loop from joining an event
to appearing on the leaderboard.</p>
"""


def main() -> None:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(18, 15, 18)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    pdf.write_html(HTML, table_line_separators=True)
    out = "/Users/mark03/Developer/personal-projects/frontend/docs/Spaces-Technical-Documentation.pdf"
    pdf.output(out)
    print("wrote", out, pdf.page_no(), "pages")


if __name__ == "__main__":
    main()
