
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  Newspaper, TrendingUp, Coins, UserCog, 
  Shield, Check, Image as ImageIcon, Link as LinkIcon,
  RefreshCw, Smartphone, Database, ShieldAlert
} from 'lucide-react';
import { CurrencyRate, MetalRate, CryptoRate, User, Headline, AppConfig } from '../types.ts';
import { shweService } from '../services/shweService.ts';
import { INITIAL_RATES, INITIAL_METALS, INITIAL_CRYPTO } from '../constants.tsx';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';

interface AdminDashboardProps {
  rates: CurrencyRate[];
  metals: MetalRate[];
  cryptoRates: CryptoRate[];
  users: User[];
  headlines: Headline[];
  onUpdateRates: (newRates: CurrencyRate[] | ((prev: CurrencyRate[]) => CurrencyRate[])) => void;
  onUpdateMetals: (newMetals: MetalRate[] | ((prev: MetalRate[]) => MetalRate[])) => void;
  onUpdateCrypto: (newCrypto: CryptoRate[] | ((prev: CryptoRate[]) => CryptoRate[])) => void;
  onUpdateUsers: (newUsers: User[] | ((prev: User[]) => User[])) => void;
  onUpdateHeadlines: (newHeadlines: Headline[] | ((prev: Headline[]) => Headline[])) => void;
  t: (key: string) => string;
  currentUser: User;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  rates, metals, cryptoRates, users, headlines, 
  onUpdateRates, onUpdateMetals, onUpdateCrypto, onUpdateUsers, onUpdateHeadlines, t, currentUser,
  config, onUpdateConfig
}) => {
  const [tab, setTab] = useState<'rates' | 'metals' | 'crypto' | 'news' | 'users'>(() => {
    if (currentUser.role === 'staff') return 'users';
    return 'rates';
  });

  // Available tabs based on role
  const availableTabs = [
    { id: 'rates', label: t('currencies'), icon: TrendingUp, roles: ['developer', 'admin'] },
    { id: 'metals', label: t('metals'), icon: Coins, roles: ['developer', 'admin'] },
    { id: 'crypto', label: t('crypto'), icon: Shield, roles: ['developer', 'admin'] },
    { id: 'news', label: t('headlines'), icon: Newspaper, roles: ['developer', 'admin'] },
    { id: 'users', label: 'بەکارهێنەران', icon: UserCog, roles: ['developer', 'staff'] },
  ].filter(t => t.roles.includes(currentUser.role));

  // Ensure valid tab selection
  useEffect(() => {
    if (currentUser.role === 'staff' && tab !== 'users') {
      setTab('users');
    } else if (currentUser.role === 'admin' && tab === 'users') {
      setTab('rates');
    }
  }, [currentUser.role, tab]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          setDbError(error.message);
        } else {
          setDbError(null);
        }
      }
    };
    checkConnection();
  }, []);

  const handleShweSync = async () => {
    setIsSyncing(true);
    setSyncStatus('خەریکی وەرگرتنی نرخەکانە لە SHWE...');
    try {
      const data = await shweService.fetchRates();
      
      // Update or Add Rates
      onUpdateRates(prev => {
        let updated = [...prev];
        data.rates.forEach(sr => {
          const index = updated.findIndex(r => r.name === sr.name && r.category === sr.category);
          if (index !== -1) {
            updated[index] = { ...updated[index], buy: sr.buy || updated[index].buy, sell: sr.sell || updated[index].sell, lastUpdated: new Date().toISOString(), change: 'neutral' };
          } else {
            updated.push({
              id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: sr.name || 'Unknown',
              code: sr.code || '???',
              symbol: 'IQD',
              buy: sr.buy || 0,
              sell: sr.sell || 0,
              change24h: 0,
              lastUpdated: new Date().toISOString(),
              change: 'neutral',
              flag: sr.flag || 'https://flagcdn.com/w80/un.png',
              category: sr.category as any || 'local'
            });
          }
        });
        return updated;
      });

      // Update or Add Metals
      onUpdateMetals(prev => {
        let updated = [...prev];
        data.metals.forEach(sm => {
          const index = updated.findIndex(m => m.name === sm.name && m.category === sm.category);
          if (index !== -1) {
            updated[index] = { ...updated[index], buy: sm.buy || updated[index].buy, sell: sm.sell || updated[index].sell, lastUpdated: new Date().toISOString(), change: 'neutral' };
          } else {
            updated.push({
              id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: sm.name || 'Unknown',
              code: sm.code || '???',
              buy: sm.buy || 0,
              sell: sm.sell || 0,
              change24h: 0,
              lastUpdated: new Date().toISOString(),
              change: 'neutral',
              icon: sm.icon || 'https://cdn-icons-png.flaticon.com/512/2415/2415255.png',
              category: sm.category as any || 'gold',
              unit: sm.unit || 'Mithqal'
            });
          }
        });
        return updated;
      });

      setSyncStatus('هەموو نرخەکان بە سەرکەوتوویی لە SHWE وەرگیران و زانیارییە نوێیەکان زیادکران!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (error) {
      setSyncStatus('هەڵەیەک ڕوویدا لە کاتی وەرگرتنی نرخەکان.');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

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
      setEditForm({ name: '', code: '21K', unit: 'د.ع', buy: 0, sell: 0, category: 'gold', icon: 'https://cdn-icons-png.flaticon.com/512/261/261917.png' });
    } else if (tab === 'crypto') {
      setEditForm({ name: '', symbol: 'BTC', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' });
    } else if (tab === 'news') {
      setEditForm({ text: '', active: true });
    } else {
      setEditForm({ name: '', email: '', password: '', role: 'user', status: 'approved' });
    }
  };

  const saveEdit = () => {
    if (!editForm) return;

    const now = new Date().toISOString();
    
    if (tab === 'users') {
      const userItem = { ...editForm };
      onUpdateUsers(prev => isAdding ? [{ ...userItem, id: `u_${Date.now()}`, createdAt: now }, ...prev] : prev.map(u => u.id === editingId ? userItem : u));
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
      } else {
        onUpdateHeadlines(prev => isAdding ? [{ ...editForm, id: `h_${Date.now()}`, date: now }, ...prev] : prev.map(h => h.id === editingId ? { ...editForm, date: now } : h));
      }
    }
    setEditingId(null);
    setEditForm(null);
  };

  const deleteItem = (id: string) => {
    // Removed confirm dialog to fix potential blocking issues on some devices
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
    
    // Use functional update to ensure we have the latest state
    if (tab === 'rates') onUpdateRates(prev => prev.filter(x => x.id !== id));
    else if (tab === 'metals') onUpdateMetals(prev => prev.filter(x => x.id !== id));
    else if (tab === 'crypto') onUpdateCrypto(prev => prev.filter(x => x.id !== id));
    else if (tab === 'users') onUpdateUsers(prev => prev.filter(x => x.id !== id));
    else onUpdateHeadlines(prev => prev.filter(x => x.id !== id));
  };

  const clearAllData = () => {
    if (!confirm('ئایا دڵنیایت لە سڕینەوەی هەموو داتاکانی ئەم بەشە؟ ئەم کارە ناگەڕێتەوە.')) return;
    if (tab === 'rates') onUpdateRates([]);
    else if (tab === 'metals') onUpdateMetals([]);
    else if (tab === 'crypto') onUpdateCrypto([]);
    else if (tab === 'users') onUpdateUsers(prev => prev.filter(u => u.role === 'developer')); // Keep admin
    else onUpdateHeadlines([]);
  };

  const resetToDefaults = () => {
    if (!confirm('ئایا دڵنیایت لە گەڕانەوە بۆ نرخە سەرەتاییەکان؟ هەموو گۆڕانکارییەکانت دەسڕێنەوە.')) return;
    if (tab === 'rates') onUpdateRates(INITIAL_RATES);
    else if (tab === 'metals') onUpdateMetals(INITIAL_METALS);
    else if (tab === 'crypto') onUpdateCrypto(INITIAL_CRYPTO);
  };

  const toggleUserStatus = (user: User) => {
    // Staff can only toggle 'user' role
    if (currentUser.role === 'staff' && user.role !== 'user') return;
    // Admins cannot toggle developers
    if (user.role === 'developer') return;

    let newStatus: 'approved' | 'blocked' | 'pending';
    
    if (user.status === 'pending') {
      newStatus = 'approved';
    } else if (user.status === 'approved') {
      newStatus = 'blocked';
    } else {
      newStatus = 'approved';
    }

    onUpdateUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20 animate-in fade-in">
      {!isSupabaseConfigured() && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-app flex items-start gap-3">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="text-right">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">ئاگاداری: سیستەمی ئۆنلاین چالاک نییە</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
              بۆ ئەوەی مۆبایلەکان بەیەکەوە ببەسترێنەوە، دەبێت Supabase چالاک بکەیت. تا ئەوە نەکەیت، داواکارییەکان لە مۆبایلەکانی ترەوە ناگەن بە تۆ.
            </p>
          </div>
        </div>
      )}
      <div className="bg-card p-4 rounded-app border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isSupabaseConfigured() ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'}`}>
            <Database size={20} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Status</p>
            <p className={`text-sm font-bold ${dbError ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
              {isSupabaseConfigured() 
                ? (dbError ? `Error: ${dbError}` : 'Supabase Cloud (Connected)') 
                : 'Local Storage (Setup Supabase)'}
            </p>
            {dbError && dbError.includes('row-level security') && (
              <p className="text-[9px] text-red-400 font-bold mt-1">تکایە RLS لە Supabase بکوژێنەوە (Disable RLS)</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black flex items-center gap-2 dark:text-white uppercase italic">
            <Shield size={20} className="text-primary" /> {t('admin_title')}
          </h2>
          {syncStatus && (
            <div className="text-[9px] font-bold text-primary animate-pulse mt-1">
              {syncStatus}
            </div>
          )}
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
          {tab !== 'users' && (
            <button 
              onClick={handleShweSync} 
              disabled={isSyncing}
              className="flex items-center gap-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              Sync SHWE
            </button>
          )}
          <button 
            onClick={() => onUpdateConfig({...config, notificationsEnabled: !config.notificationsEnabled})}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${config.notificationsEnabled ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-500'}`}
          >
            <Smartphone size={14} />
            {config.notificationsEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={clearAllData} className="bg-white dark:bg-slate-700 text-slate-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all shadow-sm">سڕینەوەی هەموو</button>
          <button onClick={resetToDefaults} className="bg-white dark:bg-slate-700 text-slate-500 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all shadow-sm">گەڕانەوە بۆ سەرەتا</button>
          <button onClick={startAdd} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm">بڕگەی نوێ</button>
        </div>
      </div>

      <div className="bg-card rounded-app border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-right text-[11px]">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr className="text-slate-400 font-black uppercase">
              <th className="p-3">بابەت</th>
              <th className="p-3 text-center">{tab === 'crypto' ? 'Price ($)' : (tab === 'news' ? 'Status' : (tab === 'users' ? 'Role / Status' : (tab === 'rates' ? 'کڕین / فرۆشتن / 24h' : 'کڕین / فرۆشتن')))}</th>
              <th className="p-3 text-center">کردار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tab === 'rates' && rates.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.flag} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                    <div>
                      <div className="font-black dark:text-white">{item.name}</div>
                      <div className="text-[9px] text-primary font-bold">{item.code}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black">
                  <div className="flex flex-col items-center">
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400">{item.buy.toLocaleString()}</span> / <span className="text-rose-600 dark:text-rose-400">{item.sell.toLocaleString()}</span>
                    </div>
                    <div className={`text-[9px] ${item.change24h && item.change24h > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.change24h ? `${item.change24h > 0 ? '+' : ''}${item.change24h}%` : '0%'}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => startEdit(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"><Edit3 size={14}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {tab === 'metals' && metals.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5"><img src={item.icon} className="w-full h-full object-contain" /></div>
                    <div>
                      <div className="font-black dark:text-white">{item.name}</div>
                      <div className="text-[9px] text-amber-500 font-bold">{item.code}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black">
                  <div className="flex flex-col items-center">
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400">{item.buy.toLocaleString()}</span> / <span className="text-rose-600 dark:text-rose-400">{item.sell.toLocaleString()}</span>
                    </div>
                    <div className={`text-[9px] ${item.change24h && item.change24h > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.change24h ? `${item.change24h > 0 ? '+' : ''}${item.change24h}%` : '0%'}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => startEdit(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"><Edit3 size={14}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {tab === 'crypto' && cryptoRates.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5"><img src={item.icon} className="w-full h-full object-contain" /></div>
                    <div>
                      <div className="font-black dark:text-white">{item.name}</div>
                      <div className="text-[9px] text-primary font-bold">{item.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black">
                  <span className="text-emerald-600 dark:text-emerald-400">${item.price.toLocaleString()}</span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => startEdit(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"><Edit3 size={14}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {tab === 'news' && headlines.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3" colSpan={2}>
                  <div className="font-bold dark:text-white truncate max-w-xs">{item.text}</div>
                  <div className="text-[9px] text-slate-400">{new Date(item.date).toLocaleString()}</div>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => startEdit(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"><Edit3 size={14}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {tab === 'users' && Array.isArray(users) && users.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">{item.name.substring(0, 2)}</div>
                    <div>
                      <div className="font-black dark:text-white">{item.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold">{item.email}</div>
                      {item.expiresAt && (
                        <div className={`text-[8px] font-bold mt-0.5 ${new Date(item.expiresAt) < new Date() ? 'text-rose-500' : 'text-amber-500'}`}>
                          Expires: {new Date(item.expiresAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase ${item.role === 'developer' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{item.role}</span>
                      <button 
                        onClick={() => toggleUserStatus(item)}
                        disabled={item.role === 'developer'}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm ${
                          item.status === 'approved' 
                            ? 'bg-emerald-500 text-white hover:bg-rose-500' 
                            : (item.status === 'pending' 
                                ? 'bg-amber-500 text-white animate-pulse hover:bg-emerald-600' 
                                : 'bg-rose-500 text-white hover:bg-emerald-600')
                        }`}
                      >
                        {item.status === 'approved' ? 'Approved' : (item.status === 'pending' ? 'Approve Now' : 'Unblock')}
                      </button>
                  </div>
                </td>
                <td className="p-3 text-center space-x-2">
                  {/* Edit Button Logic */}
                  {(() => {
                    const canEdit = 
                      currentUser.role === 'developer' || 
                      (currentUser.role === 'admin' && item.role !== 'developer') ||
                      (currentUser.role === 'staff' && item.role === 'user');
                    
                    if (canEdit) {
                      return <button onClick={() => startEdit(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"><Edit3 size={14}/></button>;
                    }
                    return null;
                  })()}

                  {/* Delete Button Logic */}
                  {(() => {
                    const canDelete = 
                      currentUser.role === 'developer' || 
                      (currentUser.role === 'admin' && item.role !== 'developer' && item.role !== 'admin');
                    
                    if (canDelete && item.id !== currentUser.id) {
                      return <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>;
                    }
                    return null;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              ) : tab === 'users' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ئیمەیڵ (Email)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">وشەی نهێنی (Password)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.password || ''} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">ڕۆڵ (Role)</label>
                      <select 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" 
                        value={editForm.role} 
                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                        disabled={currentUser.role === 'staff' && editForm.role !== 'user'} // Staff cannot change role of non-users
                      >
                        <option value="user">User</option>
                        {(currentUser.role === 'admin' || currentUser.role === 'developer') && (
                          <>
                            <option value="staff">Staff</option>
                            <option value="VIP+">VIP+</option>
                            <option value="admin">Admin</option>
                          </>
                        )}
                        {currentUser.role === 'developer' && (
                          <option value="developer">Developer (Super Admin)</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">دۆخ (Status)</label>
                      <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">کاتی بەسەرچوون (Expiration)</label>
                    <div className="flex gap-2">
                      <input 
                        type="datetime-local" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary ltr" 
                        value={editForm.expiresAt ? new Date(editForm.expiresAt).toISOString().slice(0, 16) : ''} 
                        onChange={e => setEditForm({...editForm, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined})} 
                      />
                      <button 
                        onClick={() => setEditForm({...editForm, expiresAt: undefined})}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-500"
                        title="Clear Expiration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                      {[
                        { label: '1h', val: 1 * 60 * 60 * 1000 },
                        { label: '24h', val: 24 * 60 * 60 * 1000 },
                        { label: '7d', val: 7 * 24 * 60 * 60 * 1000 },
                        { label: '30d', val: 30 * 24 * 60 * 60 * 1000 },
                      ].map(opt => (
                        <button 
                          key={opt.label}
                          onClick={() => setEditForm({...editForm, expiresAt: new Date(Date.now() + opt.val).toISOString()})}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                        >
                          +{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-600 uppercase">{tab === 'crypto' || tab === 'metals' ? 'Price' : 'کڕین'}</label>
                      <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={tab === 'crypto' ? (editForm.price || '') : (tab === 'metals' ? (editForm.buy || '') : (editForm.buy || ''))} onChange={e => setEditForm({...editForm, [tab === 'crypto' ? 'price' : 'buy']: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-rose-600 uppercase">{tab === 'crypto' || tab === 'metals' || tab === 'rates' ? '24h %' : 'فرۆشتن'}</label>
                      <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white" value={tab === 'crypto' || tab === 'metals' || tab === 'rates' ? (editForm.change24h || '') : (editForm.sell || '')} onChange={e => setEditForm({...editForm, [tab === 'crypto' || tab === 'metals' || tab === 'rates' ? 'change24h' : 'sell']: e.target.value})} />
                    </div>
                  </div>
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

export default AdminDashboard;
