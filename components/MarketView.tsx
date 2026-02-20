
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
            <div key={rate.id} className="grid grid-cols-12 p-6 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-3 mx-3 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500"></div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(rate.id); }}
                className={`absolute top-4 left-4 p-2 rounded-full transition-all z-20 ${favorites.includes(rate.id) ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
              >
                <Star size={18} fill={favorites.includes(rate.id) ? "currentColor" : "none"} />
              </button>

              <div className="col-span-6 flex items-center gap-4 pl-8">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                  <img src={rate.flag} alt={rate.code} className="w-14 h-14 rounded-2xl object-cover shadow-2xl border border-white/20 relative z-10 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 z-20 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors">{rate.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{rate.code}</span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${rate.change24h && rate.change24h > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                       {rate.change24h && rate.change24h > 0 ? '▲' : '▼'} {rate.change24h ? `${Math.abs(rate.change24h)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-3 text-center flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform">{rate.buy.toLocaleString()}</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-50">Buy / کڕین</span>
              </div>

              <div className="col-span-3 text-center flex flex-col items-center">
                <span className="text-2xl font-black text-primary tabular-nums tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform">{rate.sell.toLocaleString()}</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-50">Sell / فرۆشتن</span>
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
