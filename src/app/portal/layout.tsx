import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard' },
  { name: 'New Site', href: '/portal/new-site' },
  { name: 'Pipeline', href: '/portal/pipeline' },
  { name: 'Leads', href: '/portal/leads' },
  { name: 'Reports', href: '/portal/reports' },
  { name: 'Settings', href: '/portal/settings' },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal/dashboard" className="font-semibold text-gray-900">
              GAIB Portal
            </Link>
            <div className="flex gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
