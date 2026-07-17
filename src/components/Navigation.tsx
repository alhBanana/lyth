import { NavLink } from 'react-router-dom'
import type { NavItem } from '../types'

type NavigationProps = {
  items: NavItem[]
}

export default function Navigation({ items }: NavigationProps) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
              isActive ? 'bg-[#2F5D50] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
