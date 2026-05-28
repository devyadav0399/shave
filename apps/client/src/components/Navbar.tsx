import { NavLink } from "react-router"

const Navbar = () => {
  return (
    <div className="flex flex-row gap-1 w-full bg-white border-b border-border justify-center py-3 px-6 shadow-sm">
      {[
        { to: '/', label: 'Home' },
        { to: '/categories', label: 'Categories' },
        { to: '/all', label: 'All' },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export default Navbar
