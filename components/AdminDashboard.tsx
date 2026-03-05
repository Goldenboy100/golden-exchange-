
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  Newspaper, TrendingUp, Coins, UserCog, 
  Shield, Check, Image as ImageIcon, Link as LinkIcon,
  RefreshCw, Smartphone, Database, ShieldAlert
} from 'lucide-react';
import { CurrencyRate, MetalRate, CryptoRate, User, Headline, AppConfig } from '../types.ts';
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
  // Available tabs based on role
  const availableTabs = [
    { id: 'rates', label: 'دراوەکان', icon: Coins, roles: ['developer', 'admin', 'editor'] },
    { id: 'metals', label: 'کانزاکان', icon: Shield, roles: ['developer', 'admin', 'editor'] },
    { id: 'crypto', label: 'کریپتۆ', icon: TrendingUp, roles: ['developer', 'admin', 'editor'] },
    { id: 'news', label: 'هەواڵ', icon: Newspaper, roles: ['developer', 'admin', 'editor'] },
    { id: 'users', label: 'بەکارهێنەران', icon: UserCog, roles: ['developer', 'staff', 'admin'] },
  ].filter(tabItem => tabItem.roles.includes(currentUser.role));

  const [tab, setTab] = useState<'rates' | 'metals' | 'crypto' | 'news' | 'users'>('rates');

  // Ensure valid tab selection
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(t => t.id === tab)) {
      setTab(availableTabs[0].id as any);
    }
  }, [currentUser.role, availableTabs, tab]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
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

  const startEdit = (item: any) => {
    setEditForm({ ...item });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    setEditForm({ name: '', email: '', password: '', role: 'user', status: 'approved' });
  };

  const saveEdit = () => {
    if (!editForm) return;

    const now = new Date().toISOString();
    
    if (tab === 'rates') onUpdateRates(prev => isAdding ? [{ ...editForm, id: `r_${Date.now()}` }, ...prev] : prev.map(x => x.id === editingId ? editForm : x));
    if (tab === 'metals') onUpdateMetals(prev => isAdding ? [{ ...editForm, id: `m_${Date.now()}` }, ...prev] : prev.map(x => x.id === editingId ? editForm : x));
    if (tab === 'crypto') onUpdateCrypto(prev => isAdding ? [{ ...editForm, id: `c_${Date.now()}` }, ...prev] : prev.map(x => x.id === editingId ? editForm : x));
    if (tab === 'news') onUpdateHeadlines(prev => isAdding ? [{ ...editForm, id: `n_${Date.now()}`, date: now }, ...prev] : prev.map(x => x.id === editingId ? editForm : x));
    if (tab === 'users') {
      const userItem = { ...editForm };
      onUpdateUsers(prev => isAdding ? [{ ...userItem, id: `u_${Date.now()}`, createdAt: now }, ...prev] : prev.map(u => u.id === editingId ? userItem : u));
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
    if (tab === 'metals') onUpdateMetals(prev => prev.filter(x => x.id !== id));
    if (tab === 'crypto') onUpdateCrypto(prev => prev.filter(x => x.id !== id));
    if (tab === 'news') onUpdateHeadlines(prev => prev.filter(x => x.id !== id));
    if (tab === 'users') onUpdateUsers(prev => prev.filter(x => x.id !== id));
  };

  const clearAllData = () => {
    if (!confirm('ئایا دڵنیایت لە سڕینەوەی هەموو داتاکانی ئەم بەشە؟ ئەم کارە ناگەڕێتەوە.')) return;
    if (tab === 'rates') onUpdateRates([]);
    if (tab === 'metals') onUpdateMetals([]);
    if (tab === 'crypto') onUpdateCrypto([]);
    if (tab === 'news') onUpdateHeadlines([]);
    if (tab === 'users') onUpdateUsers(prev => prev.filter(u => u.role === 'developer')); // Keep admin
  };

  const resetToDefault = () => {
    if (!confirm('ئایا دڵنیایت لە گەڕاندنەوەی داتاکانی ئەم بەشە بۆ باری بنەڕەتی؟')) return;
    if (tab === 'rates') onUpdateRates(INITIAL_RATES);
    if (tab === 'metals') onUpdateMetals(INITIAL_METALS);
    if (tab === 'crypto') onUpdateCrypto(INITIAL_CRYPTO);
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
          {['rates', 'metals', 'crypto'].includes(tab) && (
            <button onClick={resetToDefault} className="bg-white dark:bg-slate-700 text-slate-500 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all shadow-sm">گەڕاندنەوەی بنەڕەتی</button>
          )}
          <button onClick={clearAllData} className="bg-white dark:bg-slate-700 text-slate-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all shadow-sm">سڕینەوەی هەموو</button>
          <button onClick={startAdd} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm">بڕگەی نوێ</button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 relative z-10">
        <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">بابەت</div>
          <div className="col-span-4 text-center">{tab === 'crypto' ? 'Price' : (tab === 'news' ? 'Status' : (tab === 'users' ? 'Role / Status' : 'کڕین / فرۆشتن'))}</div>
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
          {tab === 'users' && Array.isArray(users) && users.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-5 flex items-center gap-4 pl-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-black uppercase text-lg border border-white/10">
                  {item.name.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="font-black dark:text-white text-sm truncate">{item.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold truncate">{item.email}</div>
                </div>
              </div>
              <div className="col-span-4 text-center flex flex-col items-center justify-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${item.role === 'developer' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{item.role}</span>
                <button 
                  onClick={() => toggleUserStatus(item)}
                  disabled={item.role === 'developer'}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm ${
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
              <div className="col-span-3 flex justify-center gap-2">
                {(() => {
                  const canEdit = currentUser.role === 'developer' || (currentUser.role === 'admin' && item.role !== 'developer') || (currentUser.role === 'staff' && item.role === 'user');
                  if (canEdit) return <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>;
                  return null;
                })()}
                {(() => {
                  const canDelete = currentUser.role === 'developer' || (currentUser.role === 'admin' && item.role !== 'developer' && item.role !== 'admin');
                  if (canDelete && item.id !== currentUser.id) return <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>;
                  return null;
                })()}
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
              {tab === 'rates' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">کۆد (Code)</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.code || ''} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">هێما (Symbol)</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.symbol || ''} onChange={e => setEditForm({...editForm, symbol: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">کڕین (Buy)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black outline-none text-lg text-emerald-600 dark:text-emerald-400 focus:border-emerald-500" value={editForm.buy || ''} onChange={e => setEditForm({...editForm, buy: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">فرۆشتن (Sell)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black outline-none text-lg text-rose-600 dark:text-rose-400 focus:border-rose-500" value={editForm.sell || ''} onChange={e => setEditForm({...editForm, sell: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">بەش (Category)</label>
                      <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.category || 'local'} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                        <option value="local">ناوخۆ (Local)</option>
                        <option value="global">جیهانی (Global)</option>
                        <option value="toman">تمەن (Toman)</option>
                        <option value="transfer">حەواڵە (Transfer)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">گۆڕانکاری (24h %)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.change24h || ''} onChange={e => setEditForm({...editForm, change24h: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ImageIcon size={12}/> ئاڵا (Flag URL)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none text-[10px] text-slate-500 focus:border-primary" value={editForm.flag || ''} onChange={e => setEditForm({...editForm, flag: e.target.value})} placeholder="https://flagcdn.com/w80/us.png" />
                  </div>
                </>
              )}
              {tab === 'metals' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">کۆد (Code)</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.code || ''} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">یەکە (Unit)</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.unit || ''} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">کڕین (Buy)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black outline-none text-lg text-emerald-600 dark:text-emerald-400 focus:border-emerald-500" value={editForm.buy || ''} onChange={e => setEditForm({...editForm, buy: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">فرۆشتن (Sell)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black outline-none text-lg text-rose-600 dark:text-rose-400 focus:border-rose-500" value={editForm.sell || ''} onChange={e => setEditForm({...editForm, sell: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">بەش (Category)</label>
                      <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.category || 'gold'} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                        <option value="gold">زێڕ (Gold)</option>
                        <option value="silver">زیو (Silver)</option>
                        <option value="global">بۆرسە (Global)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">گۆڕانکاری (24h %)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.change24h || ''} onChange={e => setEditForm({...editForm, change24h: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ImageIcon size={12}/> ئایکۆن (Icon URL)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none text-[10px] text-slate-500 focus:border-primary" value={editForm.icon || ''} onChange={e => setEditForm({...editForm, icon: e.target.value})} placeholder="https://cdn-icons-png.flaticon.com/..." />
                  </div>
                </>
              )}
              {tab === 'crypto' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ناو (Name)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">هێما (Symbol)</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.symbol || ''} onChange={e => setEditForm({...editForm, symbol: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">نرخ (Price)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black outline-none text-lg text-emerald-600 dark:text-emerald-400 focus:border-emerald-500" value={editForm.price || ''} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ImageIcon size={12}/> ئایکۆن (Icon URL)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none text-[10px] text-slate-500 focus:border-primary" value={editForm.icon || ''} onChange={e => setEditForm({...editForm, icon: e.target.value})} placeholder="https://cryptologos.cc/..." />
                  </div>
                </>
              )}
              {tab === 'news' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">دەقی هەواڵ (Headline Text)</label>
                    <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary h-24 resize-none" value={editForm.text || ''} onChange={e => setEditForm({...editForm, text: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><LinkIcon size={12}/> بەستەر (Link URL - Optional)</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none text-[10px] text-slate-500 focus:border-primary" value={editForm.link || ''} onChange={e => setEditForm({...editForm, link: e.target.value})} placeholder="https://..." />
                  </div>
                </>
              )}
              {tab === 'users' && (
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
                            <option value="VIP">VIP</option>
                            <option value="VIP+">VIP+</option>
                            <option value="admin">Admin</option>
                            <option value="kargeri">Kargeri</option>
                            <option value="editor">Editor</option>
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
