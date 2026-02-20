'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  PlusIcon, 
  ListBulletIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'New Site', href: '/sites/new', icon: PlusIcon },
  { name: 'Pipeline', href: '/pipeline', icon: ListBulletIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-card">
        <h1 className="text-2xl font-serif text-gold">GAIB</h1>
        <p className="text-xs text-gray-400 mt-1">Capital Partners</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-navy-card text-gold'
                      : 'text-gray-300 hover:bg-navy-card hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-navy-card">
        <Link
          href="/api/logout"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
