import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import Header from '../components/Header'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full pt-20 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
