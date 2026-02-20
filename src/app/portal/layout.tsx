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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top Nav */}
      <nav style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/portal/dashboard" style={{ 
              fontWeight: 600, 
              color: '#111827',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              GAIB Portal
            </Link>
            <div style={{ display: 'flex', gap: '24px' }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{ 
                    fontSize: '14px', 
                    color: '#4b5563',
                    textDecoration: 'none'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <form action="/api/logout" method="POST">
            <button 
              type="submit" 
              style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}
