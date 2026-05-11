import { Outlet } from "react-router"
import Navbar from "@/components/Navbar"

const RootLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto w-5xl mx-auto shadow-[-8px_7px_34px_-3px_rgba(0,0,0,0.1)]">
        <Outlet />
      </div>
      <Navbar />
    </div>
  )
}

export default RootLayout
