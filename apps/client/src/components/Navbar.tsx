import { NavLink } from "react-router"

const Navbar = () => {
  return (
    <div className="flex flex-row gap-2 w-full bg-gray-100 justify-center py-5">
      <NavLink
        to='/'
        className={({ isActive }) =>
          isActive ? "text-red-500" : "text-black"
        }
      >Home</NavLink>
      <NavLink
        to='/categories'
        className={({ isActive }) =>
          isActive ? "text-red-500" : "text-black"
        }
      >Categories</NavLink>
      <NavLink
        to='/all'
        className={({ isActive }) =>
          isActive ? "text-red-500" : "text-black"
        }
      >All</NavLink>
    </div>
  )
}

export default Navbar
