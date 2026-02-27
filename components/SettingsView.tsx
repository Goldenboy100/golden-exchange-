
import React, { useState, useRef } from 'react';
import { Settings, ChevronLeft, Moon, Languages, ShieldCheck, LogOut, Check, User as UserIcon, Crown, Shield, Gem, Pen, Cpu, DollarSign, Database, AlertCircle } from 'lucide-react';
import { User, ViewMode, ThemeMode, LanguageCode, AppConfig } from '../types.ts';
import { isSupabaseConfigured } from '../src/lib/supabase';

interface SettingsViewProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onViewChange: (view: ViewMode) => void;
  onLogout: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  config: AppConfig;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentUser, onUpdateUser, onViewChange, onLogout, theme, setTheme, language, setLanguage, t
}) => {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  const roleIcons: Record<string, React.ReactElement> = {
    developer: <img src="https://i.ibb.co/tqBvB4S/crown.gif" alt="Crown" className="w-4 h-4" />,
    admin: <ShieldCheck size={14} className="text-emerald-500" />,
    'VIP+': <img src="https://i.ibb.co/cQx9cZc/gem.gif" alt="Gem" className="w-4 h-4" />,
    VIP: <Crown size={14} className="text-amber-500" />,
    staff: <Shield size={14} className="text-primary" />,
    user: <UserIcon size={14} className="text-slate-500" />,
  };

  const handleNameSave = () => {
    if (currentUser && name.trim() !== '') {
      onUpdateUser({ ...currentUser, name: name.trim() });
      setIsEditingName(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateUser({ ...currentUser, avatar: event.target.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleVipPurchase = () => {
    const message = encodeURIComponent("سڵاو، دەمەوێت هەژماری VIP بکڕم. ئەمەش وێنەی پسوڵەکەمە:");
    window.open(`https://wa.me/9647519055494?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pt-2 pb-24 max-w-xl mx-auto animate-in fade-in duration-500 px-2">
      <div className="flex justify-between items-center px-4 mb-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic tracking-tighter mb-1 uppercase">{t('settings')}</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('system_preferences')}</p>
        </div>
        <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-lg">
          <Settings size={28} />
        </div>
      </div>

      {currentUser && (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl p-6 flex items-center gap-5">
          <div className="relative group">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUser.email}`}
              alt="User Avatar"
              className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white/50 shadow-md object-cover"
            />
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pen size={20} />
            </button>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-transparent border-b-2 border-primary/50 text-xl font-black text-slate-900 dark:text-white focus:outline-none w-full"
                  autoFocus
                />
                <button onClick={handleNameSave} className="text-primary"><Check size={20} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-black text-xl text-slate-900 dark:text-white">{currentUser.name}</h2>
                <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-primary"><Pen size={14} /></button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              {roleIcons[currentUser.role] || <UserIcon size={14} className="text-slate-500" />}
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{currentUser.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* This space is intentionally left blank after removing the developer panel button */}

      <div className="space-y-4 relative z-10">
        <h3 className="text-[9px] font-black text-slate-400 mx-4 uppercase tracking-[0.4em]">{t('database_status')}</h3>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSupabaseConfigured() ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <Database size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">Supabase Cloud</p>
                <p className={`text-[10px] font-bold mt-0.5 ${isSupabaseConfigured() ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isSupabaseConfigured() ? 'Connected / پەیوەست کراوە' : 'Not Connected / پەیوەست نییە'}
                </p>
              </div>
            </div>
            {!isSupabaseConfigured() && (
              <div className="p-2 bg-rose-500 text-white rounded-full animate-pulse">
                <AlertCircle size={16} />
              </div>
            )}
          </div>
          
          {!isSupabaseConfigured() && (
            <div className="mt-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
                ⚠️ ئاگاداری: بنکەی زانیاری (Database) پەیوەست نەکراوە. بۆ ئەوەی لە Vercel کار بکات، پێویستە VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY لە ڕێکخستنەکانی Vercel زیاد بکەیت.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <h3 className="text-[9px] font-black text-slate-400 mx-4 uppercase tracking-[0.4em]">{t('preferences')}</h3>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden divide-y divide-white/10 dark:divide-white/5">
          <button 
            onClick={() => setShowThemeModal(true)} 
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Moon size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('interface')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t(theme + '_mode')} Active</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>
          
          <button 
            onClick={() => setShowLanguageModal(true)} 
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Languages size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('language')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{language === 'ku' ? 'کوردی' : language === 'ar' ? 'العربية' : 'English'}</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>

          {['VIP', 'VIP+', 'admin', 'developer'].includes(currentUser?.role || '') ? (
            <button 
              onClick={() => onViewChange('accounts')} 
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                  <DollarSign size={20} />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('accounts_transactions')}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-0.5">{t('premium_ledger_feature')}</p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-slate-300" />
            </button>
          ) : (
            <button 
              onClick={() => setShowVipModal(true)} 
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-gradient-to-r from-amber-500/5 to-transparent"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 animate-pulse">
                  <Crown size={20} />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('buy_vip')}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-0.5">{t('get_features')}</p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-slate-300" />
            </button>
          )}
        </div>
      </div>

      <button 
        onClick={onLogout} 
        className="w-full p-6 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/50 font-black text-xl uppercase tracking-widest active:scale-95 transition-all"
      >
        {t('logout')}
      </button>

      {/* VIP Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowVipModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-amber-500/20">
             <div className="text-center mb-8">
               <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/30 mb-4">
                 <Crown size={40} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('vip_membership')}</h2>
               <p className="text-amber-500 font-black text-lg mt-2">20,000 IQD / {t('lifetime')}</p>
             </div>

             <div className="space-y-4 mb-8">
               {[
                 'unlimited_product_registration',
                 'profit_loss_calculation',
                 'inventory_management',
                 '24_7_technical_support'
               ].map((feature, i) => (
                 <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                   <div className="p-1 bg-emerald-500 rounded-full text-white">
                     <Check size={12} strokeWidth={4} />
                   </div>
                   <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{t(feature)}</span>
                 </div>
               ))}
             </div>

             <div className="space-y-3">
               <button 
                 onClick={() => window.open('https://fib.iq', '_blank')}
                 className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <DollarSign size={24} />
                 {t('pay_with_fib')}
               </button>
               
               <button 
                 onClick={() => {
                   const subject = encodeURIComponent(t('vip_activation_request'));
                   const body = encodeURIComponent(`${t('fib_payment_message')}\nMy Email: ${currentUser?.email}\nMy ID: ${currentUser?.id}`);
                   window.open(`mailto:emily@example.com?subject=${subject}&body=${body}`, '_blank');
                 }}
                 className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <span className="truncate">{t('email_notification')}</span>
               </button>
             </div>
             
             <p className="text-center text-[10px] text-slate-400 mt-4 font-bold">
               {t('fib_account_number')}: 07519055494
             </p>
          </div>
        </div>
      )}


      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowLanguageModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
             <h2 className="text-2xl font-black text-center mb-8 dark:text-white uppercase italic tracking-tighter">{t('system_language')}</h2>
             <div className="space-y-3">
                {['ku', 'ar', 'en'].map(l => (
                  <button 
                    key={l} 
                    onClick={() => {setLanguage(l as LanguageCode); setShowLanguageModal(false);}} 
                    className={`w-full p-6 flex items-center justify-between rounded-2xl font-black transition-all ${language === l ? 'bg-primary text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 dark:text-white'}`}
                  >
                    <span className="text-base">{l === 'ku' ? 'کوردی' : l === 'ar' ? 'العربية' : 'English'}</span>
                    {language === l && <Check size={24} />}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
      
      {/* Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowThemeModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
             <h2 className="text-2xl font-black text-center mb-8 dark:text-white uppercase italic tracking-tighter">{t('interface_theme')}</h2>
             <div className="space-y-3">
                {['light', 'dark', 'system'].map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => {setTheme(opt as ThemeMode); setShowThemeModal(false);}} 
                    className={`w-full p-6 flex items-center justify-between rounded-2xl font-black transition-all ${theme === opt ? 'bg-primary text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 dark:text-white'}`}
                  >
                    <span className="text-base uppercase">{t(opt + '_mode')}</span>
                    {theme === opt && <Check size={24} />}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
