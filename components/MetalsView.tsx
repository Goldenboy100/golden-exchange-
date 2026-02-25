
import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, Minus, Activity, TrendingUp, Globe, Coins, Star } from 'lucide-react';
import { MetalRate, AppConfig, User, LanguageCode } from '../types.ts';

interface MetalsViewProps {
  metals: MetalRate[];
  t: (key: string) => string;
  language: LanguageCode;
  currentUser: User | null;
  config?: AppConfig;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const MetalsView: React.FC<MetalsViewProps> = ({ metals, t, favorites, toggleFavorite }) => {
  const [search, setSearch] = useState('');

  // Filter only global spot metals (Borsa)
  const borsaMetals = metals
    .filter(m => m.category === 'global')
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  const renderTrendIcon = (change: string) => {
      if (change === 'up') return <ArrowUpRight size={14} strokeWidth={3} />;
      if (change === 'down') return <ArrowDownRight size={14} strokeWidth={3} />;
      return <Minus size={14} strokeWidth={3} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 pt-4 max-w-7xl mx-auto px-2">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3 justify-end">
            <Globe className="text-amber-500" size={32} /> بۆرسەی جیهانی
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 opacity-60 italic">Global Spot Market Rates (XAU/XAG)</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="گەڕان لە بۆرسە..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 pr-12 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm shadow-xl dark:text-white placeholder:text-slate-400"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        </div>
      </div>

      {/* Main Borsa Board */}
      <div className="space-y-6 relative z-10">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden">
           <div className="grid grid-cols-12 gap-2 bg-white/20 dark:bg-white/5 p-8 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">
              <div className="col-span-6 pr-1">ناوی کانزا / کۆد</div>
              <div className="col-span-3 text-center text-emerald-600 dark:text-emerald-500">کڕین (Buy)</div>
              <div className="col-span-3 text-center text-rose-600 dark:text-rose-500">فرۆشتن (Sell)</div>
           </div>
           
           <div className="p-4 space-y-4">
              {borsaMetals.map((metal) => (
                <div 
                  key={metal.id} 
                  className="grid grid-cols-12 gap-2 p-8 items-center transition-all bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] border border-white/10 dark:border-white/5 rounded-[2.5rem] group relative overflow-hidden shadow-lg"
                >
                  {/* Background Glow */}
                  <div className={`absolute -right-10 -top-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500`}></div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(metal.id); }}
                    className={`absolute top-6 left-6 p-2 rounded-full transition-all z-20 ${favorites.includes(metal.id) ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Star size={20} fill={favorites.includes(metal.id) ? "currentColor" : "none"} />
                  </button>

                  <div className="col-span-6 flex items-center gap-6 pl-10">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0 bg-white/5 p-3 group-hover:scale-110 transition-transform duration-500 relative">
                      <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                      <img src={metal.icon} alt={metal.code} className="w-full h-full object-contain relative z-10" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xl font-black text-slate-900 dark:text-white truncate leading-tight mb-1 italic tracking-tight group-hover:text-amber-400 transition-colors">{metal.name}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/10 shadow-sm">{metal.code}</span>
                         <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${metal.change24h && metal.change24h > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                            {renderTrendIcon(metal.change)} {metal.change24h ? `${metal.change24h > 0 ? '+' : ''}${metal.change24h}%` : '0%'}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform">
                      {metal.buy.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-[0.3em] opacity-50">{metal.unit} / OUNCE</span>
                  </div>

                  <div className="col-span-3 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-3xl font-black text-amber-500 tabular-nums tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform">
                      {metal.sell.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-[0.3em] opacity-50">{metal.unit} / OUNCE</span>
                  </div>
                </div>
              ))}

              {borsaMetals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Activity size={60} className="text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="font-black text-[12px] uppercase tracking-[0.5em] text-slate-400 italic">داتاکە نەدۆزرایەوە</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
         <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 flex items-center gap-6 shadow-xl group hover:bg-white/50 transition-all">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
               <TrendingUp size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Market Sync</p>
               <p className="text-sm font-bold dark:text-white leading-relaxed italic">ئەم نرخانە ڕاستەوخۆ لە بۆرسەی جیهانییەوە وەردەگیرێن و بەردەوام نوێ دەبنەوە.</p>
            </div>
         </div>
         <div className="bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-amber-500/20 flex items-center gap-6 shadow-xl group hover:bg-amber-500/10 transition-all">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
               <Globe size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Global Standard</p>
               <p className="text-sm font-bold dark:text-amber-500 leading-relaxed italic uppercase tracking-tight">XAU/USD & XAG/USD Real-time connectivity active.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MetalsView;
