'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/projects', label: 'Projects', icon: '📁' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-brand-600">
            AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-1">{user.name}</div>
          <div className="text-xs text-gray-500 mb-3">{user.email}</div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
