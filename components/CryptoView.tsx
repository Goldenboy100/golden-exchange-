
import React from 'react';
import { CryptoRate, AppConfig } from '../types.ts';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

interface CryptoViewProps {
  cryptoRates: CryptoRate[];
  t: (key: string) => string;
  config: AppConfig;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const CryptoView: React.FC<CryptoViewProps> = ({ cryptoRates, t, config, favorites, toggleFavorite }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
          {t('crypto')}
        </h2>
        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
          Live Market
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoRates.map((crypto) => (
          <div 
            key={crypto.id}
            className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl border border-white/10 dark:border-white/5 p-8 rounded-[2.5rem] shadow-2xl hover:bg-white/10 dark:hover:bg-white/[0.05] hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500"></div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(crypto.id); }}
              className={`absolute top-4 left-4 p-2 rounded-full transition-all z-20 ${favorites.includes(crypto.id) ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
            >
              <Star size={18} fill={favorites.includes(crypto.id) ? "currentColor" : "none"} />
            </button>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-2xl relative">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    src={crypto.icon} 
                    alt={crypto.name} 
                    className="w-full h-full object-contain relative z-10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 z-20 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{crypto.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mt-1">{crypto.symbol}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                crypto.change24h > 0 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : crypto.change24h < 0 
                    ? 'bg-rose-500/10 text-rose-400' 
                    : 'bg-slate-500/10 text-slate-500'
              }`}>
                {crypto.change24h > 0 ? <TrendingUp size={14} /> : crypto.change24h < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                {Math.abs(crypto.change24h)}%
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-50">{t('price')}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform">
                  ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-50">{t('last_update')}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic">
                  {new Date(crypto.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Sparkline simulation */}
            <div className="mt-6 h-10 w-full flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity relative z-10">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm ${crypto.change24h > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ height: `${20 + Math.random() * 80}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-primary/5 border border-primary/10 rounded-app">
        <p className="text-xs text-primary/80 font-medium leading-relaxed italic">
          * {t('market_note')}
        </p>
      </div>
    </div>
  );
};

export default CryptoView;
