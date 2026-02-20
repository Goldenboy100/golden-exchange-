
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

const MetalsView: React.FC<MetalsViewProps> = ({ metals, t, currentUser, config, favorites, toggleFavorite }) => {
  const [activeTab, setActiveTab] = useState('gold');
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'gold', label: t('metal_gold'), icon: '🥇' },
    { id: 'silver', label: t('metal_silver'), icon: '🥈' },
    { id: 'global', label: t('metal_global'), icon: '🌍' }
  ];

  const filteredMetals = metals
    .filter(m => m.category === activeTab)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  const globalSpotMetals = metals.filter(m => m.category === 'global');

  const renderTrendIcon = (change: string) => {
      if (change === 'up') return <ArrowUpRight size={14} strokeWidth={3} />;
      if (change === 'down') return <ArrowDownRight size={14} strokeWidth={3} />;
      return <Minus size={14} strokeWidth={3} />;
  };

  const trendColor = (change: string) => {
      if (change === 'up') return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      if (change === 'down') return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      return 'bg-slate-100 text-slate-400 dark:bg-slate-800';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 pt-4 max-w-7xl mx-auto px-2">
      
      {/* GLOBAL SPOT LIGHTBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {globalSpotMetals.map(metal => (
          <div key={metal.id} className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all" />
            <div className="flex justify-between items-center relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2">
                     <img src={metal.icon} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Global Spot Market</h4>
                    <p className="text-lg font-black text-white italic">{metal.name}</p>
                  </div>
               </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-white">
                   <span className="text-2xl font-black tabular-nums">{metal.buy.toLocaleString()}</span>
                   <span className="text-xs text-slate-500 font-bold">{metal.unit}</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                   <div className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-black ${metal.change24h && metal.change24h > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                      {renderTrendIcon(metal.change)} {metal.change24h ? `${metal.change24h > 0 ? '+' : ''}${metal.change24h}%` : '0%'}
                   </div>
                </div>
             </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="flex-1 flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1 border border-white/20 dark:border-white/5 shadow-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative md:w-80">
          <input 
            type="text" 
            placeholder="گەڕان بۆ زێڕ و عەیارە..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 pr-12 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm shadow-xl dark:text-white placeholder:text-slate-400"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        </div>
      </div>

      {/* Main Metals Board */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden relative z-10">
        <div className="grid grid-cols-12 gap-2 bg-white/20 dark:bg-white/5 p-8 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">
          <div className="col-span-6 pr-1">{t('name_code')}</div>
          <div className="col-span-3 text-center text-emerald-600 dark:text-emerald-500">{t('buy')}</div>
          <div className="col-span-3 text-center text-rose-600 dark:text-rose-500">{t('sell')}</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredMetals.length > 0 ? filteredMetals.map((metal, idx) => (
            <div 
              key={metal.id} 
              className={`grid grid-cols-12 gap-2 p-6 items-center transition-all bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-slate-900/40 border border-amber-200/50 dark:border-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-2xl mb-3 mx-2 group relative`}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(metal.id); }}
                className={`absolute top-2 left-2 p-2 rounded-full transition-all z-20 ${favorites.includes(metal.id) ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
              >
                <Star size={16} fill={favorites.includes(metal.id) ? "currentColor" : "none"} />
              </button>
              <div className="col-span-6 flex items-center gap-4 pl-6">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-200 dark:border-amber-700 shadow-lg shrink-0 bg-amber-50 dark:bg-amber-900/20 p-2 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 bg-amber-400 blur-md opacity-20 rounded-full"></div>
                  <img src={metal.icon} alt={metal.code} className="w-full h-full object-contain relative z-10" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-black text-slate-900 dark:text-amber-50 truncate leading-tight mb-1 italic tracking-tight">{metal.name}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10 shadow-sm">{metal.code}</span>
                     <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${metal.change24h && metal.change24h > 0 ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'}`}>
                        {metal.change24h ? `${metal.change24h > 0 ? '▲' : '▼'} ${Math.abs(metal.change24h)}%` : '—'}
                     </div>
                  </div>
                </div>
              </div>

              <div className="col-span-3 flex flex-col items-center justify-center">
                <span className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter drop-shadow-sm">
                  {metal.buy.toLocaleString()}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase mt-0.5 tracking-wider">{metal.unit} / BUY</span>
              </div>

              <div className="col-span-3 flex flex-col items-center justify-center">
                <span className="text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tighter drop-shadow-sm">
                  {metal.sell.toLocaleString()}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase mt-0.5 tracking-wider">{metal.unit} / SELL</span>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Activity size={60} className="text-slate-200 dark:text-slate-800 mb-4" />
              <p className="font-black text-[12px] uppercase tracking-[0.5em] text-slate-400 italic">{t('no_data')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Report</p>
               <p className="text-xs font-bold dark:text-white leading-relaxed">ئەم نرخانە بەستراونەتەوە بە دوایین گۆڕانکارییەکان بۆرسەی جیهانییەوە.</p>
            </div>
         </div>
         <div className="bg-amber-500/10 dark:bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/20 flex items-center gap-5 shadow-lg">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600">
               <Globe size={24} />
            </div>
            <div>
               <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Global Market Link</p>
               <p className="text-xs font-bold dark:text-amber-500 leading-relaxed italic uppercase">Spot prices sync active with XAU/USD.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MetalsView;
