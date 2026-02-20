
import React, { useState } from 'react';
import { Search, Activity, Clock, Star } from 'lucide-react';
import { CurrencyRate, AppConfig, Headline } from '../types.ts';

interface MarketViewProps {
  rates: CurrencyRate[];
  headlines: Headline[];
  t: (key: string) => string;
  config: AppConfig;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ rates, headlines, t, favorites, toggleFavorite }) => {
  const [activeTab, setActiveTab] = useState('local');
  const [search, setSearch] = useState('');

  const filteredRates = rates
    .filter(r => r.category === activeTab)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
      {/* Headlines Marquee */}
      {headlines.length > 0 && (
        <div className="mx-2 bg-slate-900 dark:bg-black rounded-xl overflow-hidden py-2 border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-primary px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest z-10 shadow-xl">
              {t('headlines')}
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="animate-marquee whitespace-nowrap flex gap-12 text-[11px] font-bold text-slate-300 italic">
                {headlines.filter(h => h.active).map(h => (
                  <span key={h.id}>• {h.text}</span>
                ))}
                {/* Duplicate for seamless loop */}
                {headlines.filter(h => h.active).map(h => (
                  <span key={`dup-${h.id}`}>• {h.text}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-3 px-2 relative z-10">
        <div className="flex-1 flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl overflow-x-auto no-scrollbar gap-1">
          {['local', 'transfer', 'toman', 'global'].map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === id ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t(`market_${id}`)}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <input 
            type="text" 
            placeholder="گەڕان..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3 pr-10 rounded-2xl outline-none font-bold text-xs shadow-xl dark:text-white placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 relative z-10">
        <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <div className="col-span-6">دراو</div>
          <div className="col-span-3 text-center">کڕین</div>
          <div className="col-span-3 text-center">فرۆشتن</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRates.length > 0 ? filteredRates.map((rate) => (
            <div key={rate.id} className="grid grid-cols-12 p-5 items-center bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-slate-900/40 border border-amber-200/50 dark:border-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all rounded-2xl mb-2 mx-2 relative group">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(rate.id); }}
                className={`absolute top-2 left-2 p-2 rounded-full transition-all z-20 ${favorites.includes(rate.id) ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
              >
                <Star size={16} fill={favorites.includes(rate.id) ? "currentColor" : "none"} />
              </button>
              <div className="col-span-6 flex items-center gap-3 pl-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 blur-md opacity-20 rounded-full"></div>
                  <img src={rate.flag} alt={rate.code} className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-amber-100 dark:border-amber-900/50 relative z-10" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-amber-50 truncate tracking-tight">{rate.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10">{rate.code}</span>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${rate.change24h && rate.change24h > 0 ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'}`}>
                       {rate.change24h && rate.change24h > 0 ? '▲' : '▼'} {rate.change24h ? `${Math.abs(rate.change24h)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-lg font-black text-blue-600 dark:text-blue-400 tabular-nums drop-shadow-sm">{rate.buy.toLocaleString()}</span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums drop-shadow-sm">{rate.sell.toLocaleString()}</span>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center opacity-40"><Activity size={40} className="mx-auto mb-2" /><p className="font-black text-[10px] uppercase">{t('no_data')}</p></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
         <div className="bg-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <Clock size={20} className="text-primary" />
            <p className="text-[10px] font-black dark:text-white italic">{new Date().toLocaleTimeString('ku-IQ')}</p>
         </div>
         <div className="bg-slate-900 p-3 rounded-xl flex items-center justify-center text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">ئەم نرخانە تەنها بۆ زانیارییە.</p>
         </div>
      </div>
    </div>
  );
};

export default MarketView;
