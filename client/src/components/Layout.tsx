import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <TopBar />
        <main className="flex-1 p-4 lg:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
