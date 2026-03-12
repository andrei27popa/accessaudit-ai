import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="text-2xl font-bold text-brand-600 mb-8">
        AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
