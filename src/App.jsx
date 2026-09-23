import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import UserLayout from './layouts/UserLayout'
import EventApprovals from './pages/admin/EventApprovals'
import AdminOverview from './pages/admin/Overview'
import AdminRewards from './pages/admin/Rewards'
import AdminUsers from './pages/admin/Users'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Attendees from './pages/organizer/Attendees'
import CreateEvent from './pages/organizer/CreateEvent'
import OrganizerDashboard from './pages/organizer/Dashboard'
import EventDetails from './pages/user/EventDetails'
import EventsList from './pages/user/EventsList'
import JoinedConfirmation from './pages/user/JoinedConfirmation'
import MapDiscovery from './pages/user/MapDiscovery'
import UserRewards from './pages/user/Rewards'
import ProtectedRoute from './routes/ProtectedRoute'

const organizerLinks = [
  { to: '/organizer', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/organizer/create', label: 'Create Event', icon: 'add_circle' },
]

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true, icon: 'dashboard' },
  { to: '/admin/approvals', label: 'Event Approvals', icon: 'fact_check' },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/rewards', label: 'Rewards', icon: 'military_tech' },
]

const createEventAction = (
  <Link
    to="/organizer/create"
    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-95 transition-opacity"
  >
    <span className="material-symbols-outlined text-[16px]">add</span>
    <span className="hidden sm:inline">Create Event</span>
  </Link>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute allow={['user']} />}>
          <Route element={<UserLayout />}>
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/joined" element={<JoinedConfirmation />} />
            <Route path="/map" element={<MapDiscovery />} />
            <Route path="/rewards" element={<UserRewards />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['organizer']} />}>
          <Route
            element={
              <DashboardLayout
                subtitle="Organizer Portal"
                badgeLabel="People & Culture"
                links={organizerLinks}
                primaryAction={createEventAction}
              />
            }
          >
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/create" element={<CreateEvent />} />
            <Route path="/organizer/events/:id/attendees" element={<Attendees />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['admin']} />}>
          <Route
            element={<DashboardLayout subtitle="Admin Portal" badgeLabel="Platform & HR" badgeIcon="shield_person" links={adminLinks} />}
          >
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/approvals" element={<EventApprovals />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
