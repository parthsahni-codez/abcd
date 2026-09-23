import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="z-10 text-center max-w-4xl">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          TrendPilot AI is now in Beta
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          The Social Media Agent for Founders.
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto font-light">
          Stop staring at a blank page. TrendPilot AI researches your niche, analyzes viral patterns, and writes 100% original content in your exact brand voice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard" className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-transform hover:scale-105">
            Go to Dashboard
          </Link>
          <Link href="#features" className="px-8 py-4 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors font-medium backdrop-blur-md">
            View Features
          </Link>
        </div>
      </div>
      
      {/* Mocked UI Preview below fold */}
      <div className="z-10 mt-24 max-w-5xl w-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl overflow-hidden shadow-2xl">
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/[0.02]">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="p-8 flex gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-4 w-1/3 bg-white/10 rounded-full animate-pulse"></div>
            <div className="h-4 w-full bg-white/5 rounded-full animate-pulse"></div>
            <div className="h-4 w-5/6 bg-white/5 rounded-full animate-pulse"></div>
            <div className="h-32 w-full bg-blue-900/20 border border-blue-500/20 rounded-xl mt-8"></div>
          </div>
          <div className="flex-1 space-y-4 hidden md:block">
            <div className="h-4 w-1/4 bg-white/10 rounded-full animate-pulse"></div>
            <div className="h-4 w-full bg-white/5 rounded-full animate-pulse"></div>
            <div className="h-4 w-4/5 bg-white/5 rounded-full animate-pulse"></div>
            <div className="h-32 w-full bg-pink-900/20 border border-pink-500/20 rounded-xl mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
