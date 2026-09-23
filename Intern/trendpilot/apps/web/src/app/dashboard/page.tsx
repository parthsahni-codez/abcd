import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-neutral-400 mt-2">Welcome back. Here is what is trending today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
          <div className="text-sm font-medium text-neutral-400">Total Generated Posts</div>
          <div className="text-3xl font-bold mt-2">128</div>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
          <div className="text-sm font-medium text-neutral-400">Avg Engagement Rate</div>
          <div className="text-3xl font-bold mt-2 text-green-400">+14.2%</div>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
          <div className="text-sm font-medium text-neutral-400">Active Trends</div>
          <div className="text-3xl font-bold mt-2">12</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-medium tracking-tight mb-4">Trending Right Now</h2>
        <div className="space-y-4">
          {/* Trend Item Mock */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex justify-between items-center hover:bg-neutral-800/50 transition-colors cursor-pointer group">
            <div>
              <div className="text-lg font-medium group-hover:text-white transition-colors">AI Agents in SaaS</div>
              <div className="text-sm text-neutral-500 mt-1">Growth: +45% • High Comment Rate</div>
            </div>
            <Link href="/dashboard/generate" className="px-4 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors">
              Draft Post
            </Link>
          </div>
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex justify-between items-center hover:bg-neutral-800/50 transition-colors cursor-pointer group">
            <div>
              <div className="text-lg font-medium group-hover:text-white transition-colors">Founder Stories (Bootstrapped)</div>
              <div className="text-sm text-neutral-500 mt-1">Growth: +22% • Storytelling Hook</div>
            </div>
            <Link href="/dashboard/generate" className="px-4 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors">
              Draft Post
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
