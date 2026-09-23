"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FixedPageContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  let targetUrl = searchParams.get('url') || '#';
  
  // Ensure the URL is absolute so the link works correctly
  if (targetUrl !== '#' && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F14] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 rounded-full" />
          <CheckCircle size={80} className="text-green-400 relative z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Website Fixed <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Successfully</span>
          </h1>
          <p className="text-[#9DA7B3] text-lg mb-10">
            All detected issues have been resolved. The CI/CD pipeline has deployed the latest stable build to production.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-[#11161C] border border-white/10 hover:border-white/20 text-white rounded-xl transition-all hover:bg-white/5 flex items-center justify-center gap-2"
            >
              Back to Dashboard
            </Link>
            <a 
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-green-500/10 border border-green-500/30 hover:border-green-500/50 text-green-400 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              View Live Website
              <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function FixedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <FixedPageContent />
    </Suspense>
  );
}
