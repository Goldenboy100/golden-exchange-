import React, { useMemo } from 'react';
import { User, AppConfig } from '../types.ts';
import { Activity, Users, Eye, TrendingUp, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface KargeriDashboardProps {
  users: User[];
  t: (key: string) => string;
  config: AppConfig;
}

const KargeriDashboard: React.FC<KargeriDashboardProps> = ({ users, t, config }) => {
  // --- Analytics Logic ---
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'approved').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const vipUsers = users.filter(u => u.role === 'VIP' || u.role === 'VIP+').length;

  // Mock Daily Views Data (Simulated for "Digital" feel)
  const dailyViewsData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        name: date.toLocaleDateString('ku-IQ', { weekday: 'short' }),
        views: Math.floor(Math.random() * 500) + 1200, // Random between 1200-1700
        registrations: Math.floor(Math.random() * 10) + 2,
      });
    }
    return data;
  }, []);

  // Monthly Stats (Mock)
  const monthlyStats = useMemo(() => [
    { name: 'Jan', users: 40, views: 2400 },
    { name: 'Feb', users: 30, views: 1398 },
    { name: 'Mar', users: 20, views: 9800 },
    { name: 'Apr', users: 27, views: 3908 },
    { name: 'May', users: 18, views: 4800 },
    { name: 'Jun', users: 23, views: 3800 },
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24 px-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 dark:border-white/5 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
            <Activity className="animate-pulse" />
            Kargeri Control Center
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Real-time Analytics & User Management</p>
        </div>
        <div className="text-right hidden md:block relative z-10">
          <div className="text-3xl font-black text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">System Time</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Active Now', val: activeUsers, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'VIP Members', val: vipUsers, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Pending Requests', val: pendingUsers, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border ${stat.border} bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-md flex flex-col items-center justify-center gap-2 shadow-lg group hover:scale-[1.02] transition-all relative overflow-hidden`}>
            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            <stat.icon size={32} className={`${stat.color} drop-shadow-sm relative z-10`} />
            <div className="text-4xl font-black text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums mt-2 relative z-10">
              {stat.val}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${stat.color} opacity-80 relative z-10`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <div className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            Daily Traffic (Views)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyViewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Registrations Chart */}
        <div className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Monthly Growth (Users)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Log (Mock) */}
      <div className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl transition-all group">
        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock size={20} className="text-amber-500" />
          Live System Logs
        </h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            { time: '10:42:05', msg: 'New user registration: user_8821', type: 'info' },
            { time: '10:40:12', msg: 'Database sync completed (14ms)', type: 'success' },
            { time: '10:38:55', msg: 'High traffic alert: +150 active sessions', type: 'warning' },
            { time: '10:35:20', msg: 'System health check: OK', type: 'success' },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-slate-500 font-bold">{log.time}</span>
              <span className={`flex-1 font-bold ${
                log.type === 'success' ? 'text-emerald-500' : 
                log.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
              }`}>
                {log.msg}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'success' ? 'bg-emerald-500' : 
                log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              } animate-pulse`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KargeriDashboard;
