
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptoRates.map((crypto) => (
          <div 
            key={crypto.id}
            className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-slate-900/40 border border-amber-200/50 dark:border-amber-500/20 p-5 rounded-app shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-400/20 transition-all"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(crypto.id); }}
              className={`absolute top-2 right-2 p-2 rounded-full transition-all z-20 ${favorites.includes(crypto.id) ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
            >
              <Star size={16} fill={favorites.includes(crypto.id) ? "currentColor" : "none"} />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(crypto.id); }}
              className={`absolute top-2 left-2 p-2 rounded-full transition-all z-20 ${favorites.includes(crypto.id) ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
            >
              <Star size={16} fill={favorites.includes(crypto.id) ? "currentColor" : "none"} />
            </button>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-2 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
                  <img 
                    src={crypto.icon} 
                    alt={crypto.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-amber-50 tracking-tight">{crypto.name}</h3>
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{crypto.symbol}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                crypto.change24h > 0 
                  ? 'bg-emerald-500/10 text-emerald-600' 
                  : crypto.change24h < 0 
                    ? 'bg-rose-500/10 text-rose-600' 
                    : 'bg-slate-500/10 text-slate-500'
              }`}>
                {crypto.change24h > 0 ? <TrendingUp size={12} /> : crypto.change24h < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {Math.abs(crypto.change24h)}%
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('price')}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                  ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('last_update')}</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {new Date(crypto.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Sparkline simulation */}
            <div className="mt-4 h-8 w-full flex items-end gap-0.5 opacity-30 group-hover:opacity-60 transition-opacity relative z-10">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm ${crypto.change24h > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ height: `${Math.random() * 100}%` }}
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
