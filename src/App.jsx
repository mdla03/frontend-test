import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import Profile from './pages/user/Profile'
import ProtectedRoute from './routes/ProtectedRoute'

const organizerLinks = [
  { to: '/organizer', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/organizer/create', label: 'Create Event', icon: 'add_circle' },
  { to: '/organizer/attendees', label: 'Attendees', icon: 'group' },
]

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true, icon: 'dashboard' },
  { to: '/admin/approvals', label: 'Event Approvals', icon: 'fact_check' },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/rewards', label: 'Rewards', icon: 'military_tech' },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute allow={['user', 'organizer']} />}>
          <Route element={<UserLayout />}>
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/joined" element={<JoinedConfirmation />} />
            <Route path="/map" element={<MapDiscovery />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['organizer']} />}>
          <Route
            element={
              <DashboardLayout subtitle="Organizer Portal" links={organizerLinks} />
            }
          >
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/create" element={<CreateEvent />} />
            <Route path="/organizer/attendees" element={<Attendees />} />
            <Route path="/organizer/events/:id/attendees" element={<Attendees />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['admin']} />}>
          <Route
            element={<DashboardLayout subtitle="Admin Portal" links={adminLinks} />}
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
