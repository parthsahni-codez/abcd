import React from 'react';
import { Hexagon } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F14]/70 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-[#4F9CF9] group-hover:drop-shadow-[0_0_10px_rgba(79,156,249,0.8)] transition-all duration-300">
              <Hexagon size={28} className="fill-[#4F9CF9]/20" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">AutoDevOps</span>
          </Link>
          <div className="flex gap-4 text-sm text-[#9DA7B3]">
            <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
            <span className="hover:text-white transition-colors cursor-pointer">Dashboard</span>
            <span className="hover:text-white transition-colors cursor-pointer">Settings</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
