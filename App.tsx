
import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { TrendingUp, Settings, Bitcoin, Coins, Calculator, Cpu, Shield } from 'lucide-react';
import { CurrencyRate, MetalRate, CryptoRate, ViewMode, User, ThemeMode, LanguageCode, AppConfig, Headline } from './types.ts';
import { INITIAL_RATES, INITIAL_METALS, INITIAL_CRYPTO, TRANSLATIONS_INITIAL, DEFAULT_CONFIG } from './constants.tsx';
import { cryptoService } from './services/cryptoService.ts';
import MarketView from './components/MarketView.tsx';
import MetalsView from './components/MetalsView.tsx';
import CryptoView from './components/CryptoView.tsx';
import Converter from './components/Converter.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import SettingsView from './components/SettingsView.tsx';
import DeveloperView from './components/DeveloperView.tsx';
import FavoritesView from './components/FavoritesView.tsx';
import Login from './components/Login.tsx';

const App: React.FC = () => {
  const STORAGE_KEY = 'golden_v15_data';

  const [appState, setAppState] = useState<'welcome' | 'splash' | 'main'>('welcome');

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('main');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const [rates, setRates] = useState<CurrencyRate[]>(() => {
    try { 
      const saved = localStorage.getItem(`${STORAGE_KEY}_rates`); 
      if (!saved) return INITIAL_RATES;
      const data = JSON.parse(saved);
      if (!Array.isArray(data)) return INITIAL_RATES;
      // Ensure uniqueness by name and category (case-insensitive)
      return data.filter((v: any, i: number, a: any[]) => 
        a.findIndex(t => t.name.toLowerCase().trim() === v.name.toLowerCase().trim() && t.category === v.category) === i
      );
    } catch { return INITIAL_RATES; }
  });
  const [metals, setMetals] = useState<MetalRate[]>(() => {
    try { 
      const saved = localStorage.getItem(`${STORAGE_KEY}_metals`); 
      if (!saved) return INITIAL_METALS;
      const data = JSON.parse(saved);
      if (!Array.isArray(data)) return INITIAL_METALS;
      // Ensure uniqueness by name and category (case-insensitive)
      return data.filter((v: any, i: number, a: any[]) => 
        a.findIndex(t => t.name.toLowerCase().trim() === v.name.toLowerCase().trim() && t.category === v.category) === i
      );
    } catch { return INITIAL_METALS; }
  });
  const [cryptoRates, setCryptoRates] = useState<CryptoRate[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_crypto`); return saved ? JSON.parse(saved) : INITIAL_CRYPTO; } catch { return INITIAL_CRYPTO; }
  });
  const [headlines, setHeadlines] = useState<Headline[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_news`); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [config, setConfig] = useState<AppConfig>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_config`); return saved ? JSON.parse(saved) : DEFAULT_CONFIG; } catch { return DEFAULT_CONFIG; }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_user`); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_favorites`); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const saveUsersToApi = async (updatedUsers: User[]) => {
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
    } catch (err) {
      console.error("Failed to save users to API:", err);
    }
  };

  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem(`${STORAGE_KEY}_theme`) as ThemeMode) || 'dark');
  const [language, setLanguage] = useState<LanguageCode>(() => (localStorage.getItem(`${STORAGE_KEY}_lang`) as LanguageCode) || 'ku');
  const [view, setView] = useState<ViewMode>('market');

  const t = useCallback((key: string): string => {
    const langTrans = config.translations?.[language] || TRANSLATIONS_INITIAL[language];
    // Fallback to TRANSLATIONS_INITIAL if the key is missing in the saved config
    return (langTrans as any)[key] || (TRANSLATIONS_INITIAL[language] as any)[key] || key;
  }, [language, config]);

  // Update users in local storage (keeping as secondary backup)
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users_list`, JSON.stringify(users));
  }, [users]);

  const handleRegister = async (newUser: User) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        setUsers(prev => [...prev, newUser]);
      } else {
        const err = await response.json();
        alert(err.error || "تۆمارکردن سەرکەوتوو نەبوو");
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    saveUsersToApi(updatedUsers);
  };

  // --- NOTIFICATION SYSTEM ---
  const [notifications, setNotifications] = useState<{ id: string, text: string, type: 'up' | 'down' }[]>([]);

  const addNotification = useCallback((text: string, type: 'up' | 'down', itemId?: string) => {
    if (!config.notificationsEnabled) return;

    // For item-specific notifications (like price changes)
    if (itemId) {
      // If there are no favorites at all, don't send any price-change notifications.
      if (favorites.length === 0) return;
      // If there are favorites, only send notifications for those items.
      if (!favorites.includes(itemId)) return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [config.notificationsEnabled, favorites]);

  // --- LIVE SIMULATION ENGINE ---
  useEffect(() => {
    // Global & Toman simulation every 3 seconds (Live Market feel)
    const globalTimer = setInterval(() => {
      setRates(prev => prev.map(r => {
        if (r.category === 'local' || r.category === 'transfer') return r;
        
        const volatility = r.category === 'global' ? 10 : 50;
        const change = (Math.random() - 0.5) * volatility;
        const newBuy = r.buy + change;
        const newSell = r.sell + change;
        const newChange24h = (r.change24h || 0) + (Math.random() - 0.5) * 0.02;

        if (Math.abs(change) > 25) { // Only notify significant changes (> 25 IQD)
           const type = change > 0 ? 'up' : 'down';
           const action = change > 0 ? 'بەرزبووەوە' : 'دابەزی';
           addNotification(`نرخی ${r.name} ${action} بە بڕی ${Math.abs(Math.round(change))} دینار`, type, r.id);
        }

        return { 
          ...r, 
          buy: Math.round(newBuy), 
          sell: Math.round(newSell), 
          change24h: Number(newChange24h.toFixed(2)),
          lastUpdated: new Date().toISOString(), 
          change: change > 0 ? 'up' : 'down' 
        };
      }));
      setMetals(prev => prev.map(m => {
        if (m.category === 'global' || m.category === 'gold') {
          const volatility = m.category === 'global' ? 0.5 : 500;
          const change = (Math.random() - 0.5) * volatility;
          const newBuy = m.buy + change;
          const newSell = m.sell + change;
          const newChange24h = (m.change24h || 0) + (Math.random() - 0.5) * 0.05;

          if (Math.abs(change) > 150 && m.category === 'gold') { // Only notify significant gold changes (> 150 IQD)
             const type = change > 0 ? 'up' : 'down';
             const action = change > 0 ? 'بەرزبووەوە' : 'دابەزی';
             addNotification(`نرخی ${m.name} ${action} بە بڕی ${Math.abs(Math.round(change))} دینار`, type, m.id);
          }

          return { 
            ...m, 
            buy: Number(newBuy.toFixed(m.category === 'global' ? 2 : 0)), 
            sell: Number(newSell.toFixed(m.category === 'global' ? 2 : 0)), 
            change24h: Number(newChange24h.toFixed(2)),
            lastUpdated: new Date().toISOString(), 
            change: change > 0 ? 'up' : 'down' 
          };
        }
        return m;
      }));
    }, 3000);

    // Silver simulation every 2 seconds
    const silverTimer = setInterval(() => {
      setMetals(prev => prev.map(m => {
        if (m.category === 'silver') {
          const change = (Math.random() - 0.5) * 5;
          const newChange24h = (m.change24h || 0) + (Math.random() - 0.5) * 0.1;
          return { 
            ...m, 
            buy: Math.round(m.buy + change), 
            sell: Math.round(m.sell + change), 
            change24h: Number(newChange24h.toFixed(2)),
            lastUpdated: new Date().toISOString(), 
            change: change > 0 ? 'up' : 'down' 
          };
        }
        return m;
      }));
    }, 2000);

    // Crypto simulation every 10 seconds (Real Data)
    const cryptoTimer = setInterval(async () => {
      try {
        const updates = await cryptoService.fetchRates();
        if (updates && updates.length > 0) {
          setCryptoRates(prev => prev.map(c => {
            const update = updates.find(u => u.symbol === c.symbol);
            if (update) {
              return { 
                ...c, 
                price: update.price || c.price, 
                change24h: update.change24h || c.change24h, 
                lastUpdated: new Date().toISOString() 
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error("Crypto update failed", err);
      }
    }, 10000);

    return () => { clearInterval(globalTimer); clearInterval(silverTimer); clearInterval(cryptoTimer); };
  }, []);


  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.className = theme;
      root.style.setProperty('--primary-color', config.primaryColor);
      root.style.setProperty('--bg-color', theme === 'dark' ? '#0f172a' : config.backgroundColor || '#f8fafc');
      root.style.setProperty('--card-color', theme === 'dark' ? '#1e293b' : config.cardColor || '#ffffff');
      root.style.setProperty('--app-radius', `${config.borderRadius}px`);
      root.style.setProperty('--app-font-size', `${config.fontSize}px`);
      root.style.fontSize = `${config.fontSize}px`;
      
      localStorage.setItem(`${STORAGE_KEY}_rates`, JSON.stringify(rates));
      localStorage.setItem(`${STORAGE_KEY}_metals`, JSON.stringify(metals));
      localStorage.setItem(`${STORAGE_KEY}_crypto`, JSON.stringify(cryptoRates));
      localStorage.setItem(`${STORAGE_KEY}_news`, JSON.stringify(headlines));
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
      localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
      localStorage.setItem(`${STORAGE_KEY}_lang`, language);
      localStorage.setItem(`${STORAGE_KEY}_favorites`, JSON.stringify(favorites));
      if (currentUser) localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('بیرگەی ناوخۆیی وێبگەڕ پڕ بووە! تکایە هەندێک داتای بارکراو بسڕەوە یان داتای کەمتر بار بکە (بۆ نموونە، وێنەی بچووکتر).');
      } else {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [rates, metals, headlines, config, theme, language, currentUser, favorites]);

  // Check for user expiration
  useEffect(() => {
    if (!currentUser || !currentUser.expiresAt) return;

    const checkExpiration = () => {
      if (new Date(currentUser.expiresAt!) < new Date()) {
        alert('کاتەکەت تەواو بووە! تکایە پەیوەندی بە ئەدمینەوە بکە.');
        setCurrentUser(null);
        localStorage.removeItem(`${STORAGE_KEY}_user`);
      }
    };

    checkExpiration(); // Check immediately
    const timer = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [currentUser]);

  // --- WELCOME & SPLASH SCREENS ---
  if (appState === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Shield size="5rem" className="text-amber-400 relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          بەخێر بێن بۆ <span className="text-amber-400">Golden Exchange</span>
        </h1>
        <p className="text-slate-400 mb-12 text-lg max-w-md">
          باشترین و خێراترین سەرچاوە بۆ زانینی نرخی دراو و کانزا و کریپتۆ لە عێراق و جیهان
        </p>
        <button 
          onClick={() => setAppState('splash')}
          className="group relative px-8 py-4 bg-amber-500 text-slate-900 font-black text-xl rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            دەستپێکردن <TrendingUp size="1.25rem" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    );
  }

  if (appState === 'splash') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <div className="relative">
          {/* Background effects */}
          <div className="absolute -inset-20 bg-amber-500/10 blur-[100px] rounded-full animate-pulse"></div>
          <div className="absolute -inset-40 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-75"></div>
          
          {/* Main Text */}
          <h1 className="text-[15vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-tighter drop-shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-in zoom-in-50 duration-1000 fill-mode-forwards">
            GOLDEN
          </h1>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
        </div>
      </div>
    );
  }

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} onRegister={handleRegister} onSwitch={()=>{}} t={t} config={config} />; 
  }

  return (
    <div className="min-h-screen bg-appBg text-slate-900 flex flex-col font-sans transition-all duration-300 overflow-x-hidden relative" style={{ fontSize: `var(--app-font-size)` }}>
      {/* Notifications */}
      <div className="fixed top-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-top-full duration-500 pointer-events-auto max-w-md w-full">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'up' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
               {n.type === 'up' ? <TrendingUp size="1rem" /> : <LucideIcons.TrendingDown size="1rem" />}
             </div>
             <div className="flex-1">
               <p className="text-xs font-black leading-relaxed">{n.text}</p>
             </div>
             <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors">
               <LucideIcons.X size="0.875rem" />
             </button>
          </div>
        ))}
      </div>

      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 px-6 py-4 flex justify-between items-center shadow-lg relative">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('market')}>
          <div className="w-10 h-10 rounded-app bg-primary flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform">
            <TrendingUp size="1.5rem" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{config.appName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">{t('last_update')}: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['developer', 'admin', 'staff'].includes(currentUser.role) && (
            <button onClick={() => setView('admin')} className={`p-3 rounded-app transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Shield size="1.25rem" />
            </button>
          )}
          {currentUser.role === 'developer' && (
            <button onClick={() => setView('developer')} className={`p-3 rounded-app transition-all ${view === 'developer' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Cpu size="1.25rem" />
            </button>
          )}
          <button onClick={() => setView('settings')} className={`p-3 rounded-app transition-all ${view === 'settings' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
            <Settings size="1.25rem" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-6 px-4 md:px-12 no-scrollbar">
        {(() => {
          if (!currentUser && (view === 'admin' || view === 'developer' || view === 'settings')) return <Login onLogin={setCurrentUser} onRegister={handleRegister} t={t} config={config} onSwitch={()=>{}} />;
          switch (view) {
            case 'market': return <MarketView rates={rates} headlines={headlines} t={t} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'metals': return <MetalsView metals={metals} t={t} language={language} currentUser={currentUser} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'crypto': return <CryptoView cryptoRates={cryptoRates} t={t} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'converter': return <Converter rates={rates} t={t} />;
            case 'favorites': return <FavoritesView rates={rates} metals={metals} cryptoRates={cryptoRates} favorites={favorites} toggleFavorite={toggleFavorite} t={t} config={config} />;
            case 'admin': return <AdminDashboard rates={rates} metals={metals} cryptoRates={cryptoRates} users={users} headlines={headlines} onUpdateRates={setRates} onUpdateMetals={setMetals} onUpdateCrypto={setCryptoRates} onUpdateUsers={handleUpdateUsers} onUpdateHeadlines={setHeadlines} t={t} currentUser={currentUser!} config={config} onUpdateConfig={setConfig} />;
            case 'developer': return <DeveloperView config={config} onUpdateConfig={setConfig} rates={rates} metals={metals} cryptoRates={cryptoRates} headlines={headlines} onUpdateRates={setRates} onUpdateMetals={setMetals} onUpdateCrypto={setCryptoRates} onUpdateHeadlines={setHeadlines} t={t} language={language} />;
            case 'settings': return <SettingsView currentUser={currentUser} onUpdateUser={handleUpdateUser} onViewChange={setView} onLogout={() => {setCurrentUser(null); localStorage.removeItem(`${STORAGE_KEY}_user`);}} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} t={t} config={config} onUpdateConfig={setConfig} />;
            default: return <MarketView rates={rates} headlines={headlines} t={t} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
          }
        })()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/30 dark:border-white/10 p-2 flex justify-around items-center rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] z-[110]">
        {[
          { id: 'market', icon: TrendingUp },
          { id: 'metals', icon: Coins },
          { id: 'favorites', icon: LucideIcons.Star },
          { id: 'crypto', icon: Bitcoin },
          { id: 'converter', icon: Calculator },
          { id: 'settings', icon: Settings },
        ].filter(item => config.enabledTabs?.includes(item.id) ?? true).map((item) => {
          const IconComponent = LucideIcons[config.tabIcons?.[item.id] as keyof typeof LucideIcons] || item.icon;
          const tabName = config.tabNames?.[item.id] || t(item.id);
          return (
            <button 
              key={item.id} 
              onClick={() => setView(item.id as ViewMode)} 
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${view === item.id ? 'bg-primary text-white shadow-lg -translate-y-1' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {config.tabIcons?.[item.id]?.startsWith('data:image') || config.tabIcons?.[item.id]?.startsWith('http') ? (
                <img src={config.tabIcons[item.id]} alt={item.id} className="w-6 h-6 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
              ) : (
                <IconComponent size="1.5rem" strokeWidth={2.5} />
              )}
              <span className="text-[0.5rem] font-bold mt-1 leading-tight">{tabName}</span>
            </button>
          )}
        )}
      </nav>
    </div>
  );
};

export default App;
