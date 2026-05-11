import { Outlet } from "react-router"
import Navbar from "@/components/Navbar"

const RootLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <Navbar />
    </div>
  )
}

export default RootLayout
