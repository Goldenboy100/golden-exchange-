import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  Newspaper, TrendingUp, Coins, 
  Shield, Check, Link as LinkIcon,
  RefreshCw, Smartphone
} from 'lucide-react';
import { CurrencyRate, MetalRate, CryptoRate, Headline, AppConfig, User } from '../types.ts';
import { INITIAL_RATES, INITIAL_METALS, INITIAL_CRYPTO } from '../constants.tsx';

interface EditorDashboardProps {
  rates: CurrencyRate[];
  metals: MetalRate[];
  cryptoRates: CryptoRate[];
  headlines: Headline[];
  onUpdateRates: (newRates: CurrencyRate[] | ((prev: CurrencyRate[]) => CurrencyRate[])) => void;
  onUpdateMetals: (newMetals: MetalRate[] | ((prev: MetalRate[]) => MetalRate[])) => void;
  onUpdateCrypto: (newCrypto: CryptoRate[] | ((prev: CryptoRate[]) => CryptoRate[])) => void;
  onUpdateHeadlines: (newHeadlines: Headline[] | ((prev: Headline[]) => Headline[])) => void;
  t: (key: string) => string;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  currentUser: User;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ 
  rates, metals, cryptoRates, headlines, 
  onUpdateRates, onUpdateMetals, onUpdateCrypto, onUpdateHeadlines, t,
  config, onUpdateConfig, currentUser
}) => {
  const [tab, setTab] = useState<'rates' | 'metals' | 'crypto' | 'news'>('rates');

  const availableTabs = [
    { id: 'rates', label: t('currencies'), icon: TrendingUp },
    { id: 'metals', label: t('metals'), icon: Coins },
    { id: 'crypto', label: t('crypto'), icon: Shield },
    { id: 'news', label: t('headlines'), icon: Newspaper },
  ];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (item: any) => {
    setEditForm({ ...item });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    if (tab === 'rates') {
      setEditForm({ name: '', code: 'USD/IQD', symbol: 'IQD', buy: 0, sell: 0, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' });
    } else if (tab === 'metals') {
      setEditForm({ name: '', code: '21K', unit: '$', buy: 0, sell: 0, category: 'gold', icon: 'https://cdn-icons-png.flaticon.com/512/261/261917.png' });
    } else if (tab === 'crypto') {
      setEditForm({ name: '', symbol: 'BTC', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' });
    } else if (tab === 'news') {
      setEditForm({ text: '', active: true });
    }
  };

  const saveEdit = () => {
    if (!editForm) return;

    const now = new Date().toISOString();
    
    if (tab === 'news') {
      onUpdateHeadlines(prev => isAdding ? [{ ...editForm, id: `h_${Date.now()}`, date: now }, ...prev] : prev.map(h => h.id === editingId ? { ...editForm, date: now } : h));
    } else {
      const finalItem = { 
        ...editForm, 
        buy: parseFloat(String(editForm.buy).replace(/,/g, '')) || 0,
        sell: parseFloat(String(editForm.sell).replace(/,/g, '')) || 0,
        lastUpdated: now 
      };

      if (tab === 'rates') {
        const rateItem = { ...finalItem, change24h: parseFloat(String(editForm.change24h)) || 0 };
        onUpdateRates(prev => isAdding ? [{ ...rateItem, id: `r_${Date.now()}`, change: 'neutral' }, ...prev] : prev.map(r => r.id === editingId ? rateItem : r));
      } else if (tab === 'metals') {
        const metalItem = { ...finalItem, change24h: parseFloat(String(editForm.change24h)) || 0 };
        onUpdateMetals(prev => isAdding ? [{ ...metalItem, id: `m_${Date.now()}`, change: 'neutral' }, ...prev] : prev.map(m => m.id === editingId ? metalItem : m));
      } else if (tab === 'crypto') {
        const cryptoItem = { ...editForm, price: parseFloat(String(editForm.price).replace(/,/g, '')) || 0, change24h: parseFloat(String(editForm.change24h)) || 0, lastUpdated: now };
        onUpdateCrypto(prev => isAdding ? [{ ...cryptoItem, id: `c_${Date.now()}` }, ...prev] : prev.map(c => c.id === editingId ? cryptoItem : c));
      }
    }
    setEditingId(null);
    setEditForm(null);
  };

  const deleteItem = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
    
    if (tab === 'rates') onUpdateRates(prev => prev.filter(x => x.id !== id));
    else if (tab === 'metals') onUpdateMetals(prev => prev.filter(x => x.id !== id));
    else if (tab === 'crypto') onUpdateCrypto(prev => prev.filter(x => x.id !== id));
    else onUpdateHeadlines(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20 animate-in fade-in">
      <div className="bg-card p-4 rounded-app border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-right">
          <h2 className="text-xl font-black flex items-center gap-2 dark:text-white uppercase italic">
            <Edit3 size={20} className="text-primary" /> Editor Panel
          </h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
          {availableTabs.map(tItem => (
            <button 
              key={tItem.id} 
              onClick={() => setTab(tItem.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all whitespace-nowrap ${tab === tItem.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
            >
              <tItem.icon size={14} /> {tItem.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => onUpdateConfig({...config, notificationsEnabled: !config.notificationsEnabled})}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${config.notificationsEnabled ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-500'}`}
          >
            <Smartphone size={14} />
            {config.notificationsEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={startAdd} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm">بڕگەی نوێ</button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 relative z-10">
        <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">بابەت</div>
          <div className="col-span-4 text-center">{tab === 'crypto' ? 'Price' : (tab === 'news' ? 'Status' : 'کڕین / فرۆشتن')}</div>
          <div className="col-span-3 text-center">کردار</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tab === 'rates' && rates.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-5 flex items-center gap-4 pl-4">
                <img src={item.flag} className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-white/10" referrerPolicy="no-referrer" />
                <div>
                  <div className="font-black dark:text-white text-sm">{item.name}</div>
                  <div className="text-[10px] text-primary font-bold tracking-wider">{item.code}</div>
                </div>
              </div>
              <div className="col-span-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{item.buy.toLocaleString()}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-rose-600 dark:text-rose-400 font-black text-lg">{item.sell.toLocaleString()}</span>
                </div>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${item.change24h && item.change24h > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.change24h ? `${item.change24h > 0 ? '+' : ''}${item.change24h}%` : '0%'}
                </div>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {tab === 'metals' && metals.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-5 flex items-center gap-4 pl-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl p-2 flex items-center justify-center border border-white/10">
                  <img src={item.icon} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="font-black dark:text-white text-sm">{item.name}</div>
                  <div className="text-[10px] text-amber-500 font-bold tracking-wider">{item.code}</div>
                </div>
              </div>
              <div className="col-span-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{item.buy.toLocaleString()}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-rose-600 dark:text-rose-400 font-black text-lg">{item.sell.toLocaleString()}</span>
                </div>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${item.change24h && item.change24h > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.change24h ? `${item.change24h > 0 ? '+' : ''}${item.change24h}%` : '0%'}
                </div>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {tab === 'crypto' && cryptoRates.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-5 flex items-center gap-4 pl-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl p-2 flex items-center justify-center border border-white/10">
                  <img src={item.icon} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="font-black dark:text-white text-sm">{item.name}</div>
                  <div className="text-[10px] text-primary font-bold tracking-wider">{item.symbol}</div>
                </div>
              </div>
              <div className="col-span-4 text-center flex flex-col items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">${item.price.toLocaleString()}</span>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${item.change24h > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.change24h > 0 ? '+' : ''}{item.change24h}%
                </div>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {tab === 'news' && headlines.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-9 pl-4">
                <div className="font-bold dark:text-white text-sm line-clamp-2">{item.text}</div>
                <div className="text-[9px] text-slate-400 mt-1">{new Date(item.date).toLocaleString()}</div>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingId && editForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-app p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black dark:text-white uppercase italic">{isAdding ? 'بڕگەی نوێ' : 'دەستکاری'}</h3>
              <button onClick={() => setEditingId(null)} className="p-2 text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              {tab === 'news' ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">دەقی هەواڵ (News Text)</label>
                  <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary h-24" value={editForm.text || ''} onChange={e => setEditForm({...editForm, text: e.target.value})} />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-600 uppercase">{tab === 'crypto' ? 'Price' : 'کڕین (Buy)'}</label>
                      <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={tab === 'crypto' ? (editForm.price || '') : (editForm.buy || '')} onChange={e => setEditForm({...editForm, [tab === 'crypto' ? 'price' : 'buy']: e.target.value})} />
                    </div>
                    {tab !== 'crypto' ? (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-rose-600 uppercase">فرۆشتن (Sell)</label>
                        <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={editForm.sell || ''} onChange={e => setEditForm({...editForm, sell: e.target.value})} />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">24h %</label>
                        <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={editForm.change24h || ''} onChange={e => setEditForm({...editForm, change24h: e.target.value})} />
                      </div>
                    )}
                  </div>
                  {tab !== 'crypto' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">24h %</label>
                      <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={editForm.change24h || ''} onChange={e => setEditForm({...editForm, change24h: e.target.value})} />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><LinkIcon size={10}/> وێنە / ئاڵا</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-[10px] dark:text-white" dir="ltr" value={tab === 'rates' ? (editForm.flag || '') : (editForm.icon || '')} onChange={e => setEditForm({...editForm, [tab === 'crypto' ? 'icon' : (tab === 'rates' ? 'flag' : 'icon')]: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">کۆد / سیمبول</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white uppercase" value={tab === 'crypto' ? (editForm.symbol || '') : (editForm.code || '')} onChange={e => setEditForm({...editForm, [tab === 'crypto' ? 'symbol' : 'code']: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">جۆر</label>
                      <select disabled={tab === 'crypto'} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                        {tab === 'rates' ? (
                          <>
                            <option value="local">LOCAL</option>
                            <option value="transfer">TRANSFER</option>
                            <option value="toman">TOMAN</option>
                            <option value="global">GLOBAL</option>
                          </>
                        ) : (
                          <>
                            <option value="gold">GOLD</option>
                            <option value="silver">SILVER</option>
                            <option value="global">GLOBAL</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <button onClick={saveEdit} className="w-full bg-primary text-white py-3 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mt-2 transition-transform active:scale-95">
                <Check size={16}/> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorDashboard;
