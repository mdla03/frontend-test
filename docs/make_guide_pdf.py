"""Render the plain-language "how to explain the architecture" guide to PDF.

Same fpdf2 route as make_pdf.py (no pandoc or headless browser on this machine),
so the source is the limited HTML subset write_html() supports. Keep table cells
free of nested tags - fpdf2 raises on those.
"""

from fpdf import FPDF

HTML = """
<h1>Explaining the Spaces Architecture</h1>
<p><i>A speaking guide. Read this, not the technical document, before you present.</i></p>

<h2>The idea in one sentence</h2>
<p>Spaces has three parts - the frontend people use, the API that holds the rules, and the
backend that keeps the records - and the middle part is where every decision gets made, which
is what makes the approvals and the attendance trustworthy.</p>

<p>If you only get one sentence out, that is the one. Everything below is support for it.</p>

<h2>The three names, and what they mean</h2>
<p>These are the labels on the diagram. Say the plain name first and the technical one second,
never the other way round.</p>

<table width="100%">
<thead><tr><th width="22%">On the diagram</th><th width="30%">Say it as</th><th width="48%">Its job</th></tr></thead>
<tr><td>1. FRONTEND</td><td>the app people use</td><td>What appears on the phone or laptop. Shows screens and asks for things. Decides nothing.</td></tr>
<tr><td>2. API</td><td>the rules, our own server</td><td>Receives every request and runs four checks before anything happens.</td></tr>
<tr><td>3. BACKEND</td><td>the records</td><td>The database. One copy of what is true, reached only through the API.</td></tr>
</table>

<p>One honesty note, in case a developer is listening: strictly, the API and the database
together are what people mean by "the backend". They are split on the diagram because they do
different jobs and the split is the whole point. If someone raises it, agree and move on -
"fair, I have split the backend in two here so you can see where the rules sit."</p>

<h2>The analogy to lead with</h2>
<p>Treat it like walking into an office building.</p>
<ul>
<li>The <b>frontend</b> is the lobby. It is what you see, and it is where you say what you want.</li>
<li>The <b>API</b> is the security desk. It checks your ID is genuine, looks up who you are today, checks whether your role is allowed in that room, and checks the room is actually yours.</li>
<li>The <b>backend</b> is the records room. Nobody walks in. The security desk goes and gets what you asked for.</li>
</ul>
<p>The point of the analogy is the second part. A lobby can be decorated any way you like - it
is the security desk that makes the building safe. Same here: the checks live on our server,
not in the browser, because anything running on someone's own device can be tampered with.</p>

<h2>The 60-second version</h2>
<p>Deliver this without the diagram. It should sound like talking, not reading.</p>

<p><i>"Spaces is an events platform for our own employees. Somebody opens it, browses what is
happening, and joins. Organizers run events, and an admin approves them before anyone can
see them."</i></p>

<p><i>"Under that it is three layers. There is the frontend, the app itself, on your phone or
your laptop. Behind it is the API - our own server, and that is where every rule lives. Is
this person signed in, what is their role, are they allowed to do this, is this actually their
event. And behind that is the backend, the database, which is the one place the real records
live."</i></p>

<p><i>"The important part is the middle. All the checking happens on our server, never on the
person's device. That is why we can trust that an event really was approved by an admin, and
that an attendance record is real."</i></p>

<h2>The 3-minute walkthrough</h2>
<p>Now put the diagram up. Walk it top to bottom, one row of icons at a time, and say what
each stop is <i>for</i> before you say what it is made of. The icons are there so you can
point; do not read the labels aloud.</p>

<table width="100%">
<thead><tr><th width="26%">Point at</th><th width="74%">Say roughly this</th></tr></thead>
<tr><td>1. FRONTEND, the three icons</td><td>"This is the part people actually touch. Three kinds of people use it - employees, organizers and admins - and each one sees a different set of screens. That middle icon is the doorman: it only shows you the pages your role is meant to see. And when you sign in, the app holds on to a pass, which it shows every single time it asks for anything."</td></tr>
<tr><td>The first arrow down</td><td>"So every action - joining an event, creating one, approving one - goes down this arrow, and it always carries that pass."</td></tr>
<tr><td>2. API, the four icons</td><td>"This is our own server, and it is the heart of the whole thing. Four checks, always in this order. Is the pass real. Who are you today - and we look that up fresh every time, so if an admin changes somebody's role it applies immediately, not tomorrow. Is your role allowed to do this at all. And finally, is this actually yours - an organizer can edit their own event, not somebody else's."</td></tr>
<tr><td>The note beneath them</td><td>"All four of those happen here, on our server. Never in the browser. Anything running on a person's own device can be changed by that person, so it cannot be the thing that decides what they are allowed to do."</td></tr>
<tr><td>3. BACKEND, the three icons</td><td>"And this is the database - one copy of what is true. People, events, sign-ups, rewards. It also does the clever bits: working out which events are near you for the map, and adding up the rewards for the leaderboard. Notice nothing in the top row reaches it directly. Everything goes through the middle."</td></tr>
<tr><td>The footnote</td><td>Only if a developer has raised it. "Yes - normally the API and the database together get called the backend. I have split them because they do different jobs."</td></tr>
</table>

<h2>Say it this way, not that way</h2>
<p>Every term on the left will lose part of the room. The right-hand column says the same
thing and keeps everyone.</p>

<table width="100%">
<thead><tr><th width="38%">Instead of</th><th width="62%">Say</th></tr></thead>
<tr><td>React SPA / client</td><td>the frontend - the app people use</td></tr>
<tr><td>Express / Node service</td><td>the API - our server, where the rules live</td></tr>
<tr><td>Postgres / Supabase</td><td>the backend - the records, the one place the real data lives</td></tr>
<tr><td>JWT / token</td><td>a sign-in pass the app carries</td></tr>
<tr><td>Authentication</td><td>checking the pass is real</td></tr>
<tr><td>Authorisation / role check</td><td>checking what that person is allowed to do</td></tr>
<tr><td>Endpoint / API route</td><td>a request the app can make</td></tr>
<tr><td>Query</td><td>looking something up</td></tr>
<tr><td>PostGIS / geospatial</td><td>working out which events are near you</td></tr>
<tr><td>Hashing / bcrypt</td><td>passwords are stored scrambled, so even we cannot read them</td></tr>
<tr><td>Approval workflow</td><td>an admin has to say yes before anyone sees it</td></tr>
</table>

<h2>The three points worth landing</h2>
<p>If the room remembers nothing else, aim for these. Each one is a decision, with a reason -
that is what makes it sound considered rather than accidental.</p>

<ul>
<li><b>The rules live in one place.</b> Not scattered across screens. One server, one set of checks, every request. That is why a rule cannot be skipped by going a different way round.</li>
<li><b>We check who you are every single time.</b> We do not take your word for it from when you signed in. If your role changes, it applies straight away.</li>
<li><b>Nothing reaches the records directly.</b> The app never touches the database. It asks, and the server decides whether to go and get it.</li>
</ul>

<h2>Questions you will actually get</h2>

<p><b>"Is this secure?"</b><br/>
"Passwords are stored scrambled, so nobody can read them back - not even us. You get a
sign-in pass that expires. And every request is re-checked on the server, so the app on your
phone cannot grant itself permissions it does not have."</p>

<p><b>"What happens if two people join the last slot at the same time?"</b><br/>
Be straight: "Right now the number of places is shown but not enforced at the moment of
joining, so that race is possible. It is on the list, and the fix is to make the database
enforce it rather than the app." Saying this before you are caught on it reads as competence.
Bluffing does not.</p>

<p><b>"Can an organizer edit someone else's event?"</b><br/>
"No. That is the fourth check. The server confirms the event actually belongs to them before
it saves anything."</p>

<p><b>"How does the map know what is near me?"</b><br/>
"The database works that out. We ask it for events within a certain distance and it returns
them already sorted by how close they are - so your phone is not downloading everything and
sifting through it."</p>

<p><b>"Why build it rather than buy something off the shelf?"</b><br/>
"Because the approval flow is ours. An event needs an admin to sign it off, and an employee
needs approving before they can organise. A generic events tool does not have that, and it is
the part that makes this usable inside the company."</p>

<p><b>"How hard is it to add a feature?"</b><br/>
"The three layers are separate, so most changes touch one of them. A new screen does not
require touching the records. A new rule does not require touching the screens."</p>

<p><b>"What would you do next?"</b><br/>
"Enforce the place limit properly, with a waiting list - the records are already set up to
hold one. Then give out the rewards automatically when attendance is marked, so joining an
event runs through to the leaderboard without anyone doing it by hand."</p>

<h2>If someone technical is in the room</h2>
<p>Do not switch registers for the whole talk - one person's curiosity is not worth losing
everyone else. Give a one-line answer and offer the detail afterwards.</p>

<table width="100%">
<thead><tr><th width="42%">If they ask</th><th width="58%">One line back</th></tr></thead>
<tr><td>What is the stack?</td><td>"React and Vite on the front, Express on Node behind it, Supabase Postgres underneath. Happy to go through the detail after."</td></tr>
<tr><td>Why not call the database directly?</td><td>"We wanted one place where the rules are enforced, and we did not want a database credential sitting in the browser."</td></tr>
<tr><td>Is Row Level Security on?</td><td>"Not currently - the server holds the only credential and enforces everything. If anything ever talks to the database directly, RLS becomes mandatory. It is written up as a known gap."</td></tr>
<tr><td>Where is the token stored?</td><td>"Local storage today. Moving it to a cookie is the hardening step that is on the list."</td></tr>
<tr><td>Any tests?</td><td>"Not yet. The highest value ones would be tests that drive the API end to end, and that is what I would write first."</td></tr>
</table>

<p>Then point them at the technical document. It has all of it, including the limitations,
written down.</p>

<h2>Presenting: a few rules</h2>
<ul>
<li><b>Say what it is for before what it is built with.</b> "This is where the rules live" lands; "this is the Express layer" does not.</li>
<li><b>Follow the arrows.</b> The diagram is one journey, top to bottom. Tell it in that order and nobody gets lost.</li>
<li><b>Name the limitations yourself.</b> You already know the two: places are not enforced at the moment of joining, and rewards are not yet given out automatically. Saying them first is strength.</li>
<li><b>Do not read the boxes aloud.</b> They can read. Say the thing the box does not say - why it is there.</li>
<li><b>Keep the technical document closed</b> unless someone asks for that level. Offer it; do not open it.</li>
</ul>
"""


def main() -> None:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(18, 15, 18)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    pdf.write_html(HTML, table_line_separators=True)
    out = "/Users/mark03/Developer/personal-projects/frontend/docs/Spaces-Architecture-Explainer-Guide.pdf"
    pdf.output(out)
    print("wrote", out, pdf.page_no(), "pages")


if __name__ == "__main__":
    main()
