import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-xl flex flex-col p-4">
        <div className="text-xl font-bold tracking-tight mb-8">TrendPilot AI</div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">Overview</Link>
          <Link href="/dashboard/trends" className="block px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">Trending Topics</Link>
          <Link href="/dashboard/generate" className="block px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">Generate Post</Link>
          <Link href="/dashboard/analytics" className="block px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors">Analytics</Link>
        </nav>
        <div className="mt-auto">
          <Link href="/settings" className="block px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Settings</Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
