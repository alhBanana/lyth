import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
            <TopBar />
            <div className="rounded-[2rem] border border-[#E8E4DD] bg-white/95 p-5 shadow-sm shadow-slate-200/10 sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
