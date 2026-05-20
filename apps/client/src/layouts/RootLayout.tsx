import { Outlet } from "react-router"
import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/sonner"

const RootLayout = () => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-right"/>
    </div>
  )
}

export default RootLayout
