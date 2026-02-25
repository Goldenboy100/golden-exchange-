
import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { TrendingUp, Settings, Bitcoin, Coins, Calculator, Cpu, Shield } from 'lucide-react';
import { CurrencyRate, MetalRate, CryptoRate, ViewMode, User, ThemeMode, LanguageCode, AppConfig, Headline, Transaction, Product, Category } from './types.ts';
import { INITIAL_RATES, INITIAL_METALS, INITIAL_CRYPTO, TRANSLATIONS_INITIAL, DEFAULT_CONFIG } from './constants.tsx';
import { cryptoService } from './services/cryptoService.ts';
import { marketService } from './services/marketService.ts';
import MarketView from './components/MarketView.tsx';
import MetalsView from './components/MetalsView.tsx';
import CryptoView from './components/CryptoView.tsx';
import Converter from './components/Converter.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import SettingsView from './components/SettingsView.tsx';
import DeveloperView from './components/DeveloperView.tsx';
import FavoritesView from './components/FavoritesView.tsx';
import KargeriDashboard from './components/KargeriDashboard.tsx';
import EditorDashboard from './components/EditorDashboard.tsx';
import AccountsView from './components/AccountsView.tsx';
import Login from './components/Login.tsx';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';

const App: React.FC = () => {
  const STORAGE_KEY = 'golden_v21_data';

  const [appState, setAppState] = useState<'welcome' | 'splash' | 'main'>('welcome');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

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
      if (INITIAL_METALS.length === 0) return [];
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
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_products`); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try { const saved = localStorage.getItem(`${STORAGE_KEY}_categories`); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const [users, setUsers] = useState<User[]>([]);

  // Refs for tracking previous state to detect deletions
  const prevRatesRef = React.useRef<CurrencyRate[]>(rates);
  const prevMetalsRef = React.useRef<MetalRate[]>(metals);
  const prevCryptoRef = React.useRef<CryptoRate[]>(cryptoRates);
  const prevHeadlinesRef = React.useRef<Headline[]>(headlines);
  const prevUsersRef = React.useRef<User[]>(users);
  const prevTransactionsRef = React.useRef<Transaction[]>(transactions);
  const prevProductsRef = React.useRef<Product[]>(products);
  const prevCategoriesRef = React.useRef<Category[]>(categories);

  // Sync Rates to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || rates === prevRatesRef.current) return;
    const prev = prevRatesRef.current;
    const next = rates;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('rates').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('rates').upsert(addedOrUpdated);
        }
      })();
    }
    prevRatesRef.current = next;
  }, [rates]);

  // Sync Metals to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || metals === prevMetalsRef.current) return;
    const prev = prevMetalsRef.current;
    const next = metals;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('metals').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('metals').upsert(addedOrUpdated);
        }
      })();
    }
    prevMetalsRef.current = next;
  }, [metals]);

  // Sync Crypto to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || cryptoRates === prevCryptoRef.current) return;
    const prev = prevCryptoRef.current;
    const next = cryptoRates;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('crypto').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('crypto').upsert(addedOrUpdated);
        }
      })();
    }
    prevCryptoRef.current = next;
  }, [cryptoRates]);

  // Sync Headlines to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || headlines === prevHeadlinesRef.current) return;
    const prev = prevHeadlinesRef.current;
    const next = headlines;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('news').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('news').upsert(addedOrUpdated);
        }
      })();
    }
    prevHeadlinesRef.current = next;
  }, [headlines]);

  // Sync Users to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || users === prevUsersRef.current) return;
    const prev = prevUsersRef.current;
    const next = users;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('users').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('users').upsert(addedOrUpdated);
        }
      })();
    }
    prevUsersRef.current = next;
  }, [users]);

  // Sync Transactions to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || transactions === prevTransactionsRef.current) return;
    const prev = prevTransactionsRef.current;
    const next = transactions;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('transactions').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('transactions').upsert(addedOrUpdated);
        }
      })();
    }
    prevTransactionsRef.current = next;
  }, [transactions]);

  // Sync Products to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || products === prevProductsRef.current) return;
    const prev = prevProductsRef.current;
    const next = products;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('products').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('products').upsert(addedOrUpdated);
        }
      })();
    }
    prevProductsRef.current = next;
  }, [products]);

  // Sync Categories to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || categories === prevCategoriesRef.current) return;
    const prev = prevCategoriesRef.current;
    const next = categories;
    
    const deleted = prev.filter(p => !next.find(n => n.id === p.id));
    const addedOrUpdated = next.filter(n => {
      const p = prev.find(x => x.id === n.id);
      return !p || JSON.stringify(p) !== JSON.stringify(n);
    });

    if (deleted.length > 0 || addedOrUpdated.length > 0) {
      (async () => {
        for (const item of deleted) {
          await supabase.from('categories').delete().eq('id', item.id);
        }
        if (addedOrUpdated.length > 0) {
          await supabase.from('categories').upsert(addedOrUpdated);
        }
      })();
    }
    prevCategoriesRef.current = next;
  }, [categories]);

  // Sync Config to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const { id, ...rest } = config;
      await supabase.from('config').upsert({ id: 1, ...rest });
    })();
  }, [config]);

  // Fetch users from Supabase or API
  useEffect(() => {
    const fetchUsers = async () => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('users')
          .select('*');
        
        if (!error && data && Array.isArray(data)) {
          setUsers(data);
          return;
        }
      }

      // Fallback to local API if Supabase is not configured or fails
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setUsers(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    
    fetchUsers();
    
    // Real-time subscription for Supabase
    let subscription: any;
    if (isSupabaseConfigured()) {
      subscription = supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          fetchUsers();
        })
        .subscribe();
    }

    // Poll as backup if not using Supabase
    const interval = setInterval(fetchUsers, 10000);
    
    return () => {
      clearInterval(interval);
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const saveUsersToApi = async (updatedUsers: User[]) => {
    if (isSupabaseConfigured()) {
      // In Supabase, we usually update individual records, 
      // but for this simple app, we'll sync the whole state if needed
      // or rely on individual update calls.
      return;
    }
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

  // Fetch all data from Supabase or LocalStorage
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured()) return;

      try {
        // Fetch Rates
        const { data: ratesData, error: ratesError } = await supabase.from('rates').select('*');
        if (ratesError) throw ratesError;
        if (ratesData && ratesData.length > 0) setRates(ratesData);

        // Fetch Metals
        const { data: metalsData } = await supabase.from('metals').select('*');
        if (metalsData && metalsData.length > 0) setMetals(metalsData);

        // Fetch Crypto
        const { data: cryptoData } = await supabase.from('crypto').select('*');
        if (cryptoData && cryptoData.length > 0) setCryptoRates(cryptoData);

        // Fetch News
        const { data: newsData } = await supabase.from('news').select('*').order('date', { ascending: false });
        if (newsData && newsData.length > 0) setHeadlines(newsData);

        // Fetch Config
        const { data: configData } = await supabase.from('config').select('*').single();
        if (configData) setConfig(configData);

        // Fetch Transactions
        const { data: transactionsData } = await supabase.from('transactions').select('*');
        if (transactionsData && transactionsData.length > 0) setTransactions(transactionsData);

        // Fetch Products
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData && productsData.length > 0) setProducts(productsData);

        // Fetch Categories
        const { data: categoriesData } = await supabase.from('categories').select('*');
        if (categoriesData && categoriesData.length > 0) setCategories(categoriesData);

        setDbConnected(true);
      } catch (err) {
        console.error("Supabase fetch error:", err);
        setDbConnected(false);
      }
    };

    fetchData();

    // Real-time subscriptions for all tables
    let channels: any[] = [];
    if (isSupabaseConfigured()) {
      const tables = ['rates', 'metals', 'crypto', 'news', 'config', 'transactions', 'products', 'categories'];
      tables.forEach(table => {
        const channel = supabase.channel(`public:${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
            fetchData();
          })
          .subscribe();
        channels.push(channel);
      });
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

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
    // Check if email already exists locally to prevent duplicates
    if (Array.isArray(users) && users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      alert("ئەم ئیمەیڵە پێشتر تۆمار کراوە");
      return;
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (error) {
        alert("هەڵەیەک ڕوویدا لە کاتی تۆمارکردن");
        console.error(error);
      } else {
        setUsers(prev => [...prev, newUser]);
      }
      return;
    }

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

  const handleUpdateUsers = async (update: User[] | ((prev: User[]) => User[])) => {
    const updatedUsers = typeof update === 'function' ? update(users) : update;
    setUsers(updatedUsers);
    
    if (isSupabaseConfigured() && updatedUsers.length > 0) {
      const { error } = await supabase
        .from('users')
        .upsert(updatedUsers, { onConflict: 'id' });
      
      if (error) {
        console.error("Supabase sync error:", error);
      }
    }
    
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
    // Market Service Integration (Global Borsa Data)
    // Fetches data every 5 seconds to simulate live feed from global exchange
    const marketTimer = setInterval(async () => {
      try {
        const { rates: newRates, metals: newMetals } = await marketService.fetchLiveMarketData();
        
        if (newRates && newRates.length > 0) {
          setRates(prev => {
            if (prev.length === 0) return newRates.map(r => ({
              ...r,
              id: r.id || `r_${Math.random().toString(36).substr(2, 9)}`,
              buy: r.buy || 0,
              sell: r.sell || 0,
              change24h: r.change24h || 0,
              lastUpdated: new Date().toISOString(),
              change: 'neutral',
              flag: r.flag || 'https://flagcdn.com/w80/un.png',
              category: r.category || 'local'
            } as CurrencyRate));

            return prev.map(r => {
              const update = newRates.find(u => u.code === r.code && u.category === r.category);
              if (update) {
                const change = update.buy! - r.buy;
                let changeType: 'up' | 'down' | 'neutral' = 'neutral';
                if (change > 0) changeType = 'up';
                if (change < 0) changeType = 'down';

                return {
                  ...r,
                  buy: update.buy || r.buy,
                  sell: update.sell || r.sell,
                  lastUpdated: new Date().toISOString(),
                  change: changeType
                };
              }
              return r;
            });
          });
        }

        if (newMetals && newMetals.length > 0) {
          setMetals(prev => {
            if (prev.length === 0) return newMetals.map(m => ({
              ...m,
              id: m.id || `m_${Math.random().toString(36).substr(2, 9)}`,
              buy: m.buy || 0,
              sell: m.sell || 0,
              change24h: m.change24h || 0,
              lastUpdated: new Date().toISOString(),
              change: 'neutral',
              icon: m.icon || 'https://cdn-icons-png.flaticon.com/512/2536/2536128.png',
              unit: m.unit || '$'
            } as MetalRate));

            return prev.map(m => {
              const update = newMetals.find(u => u.code === m.code && u.category === m.category);
              if (update) {
                const change = update.buy! - m.buy;
                let changeType: 'up' | 'down' | 'neutral' = 'neutral';
                if (change > 0) changeType = 'up';
                if (change < 0) changeType = 'down';

                // Notify on significant gold changes (> 0.50 USD)
                if (Math.abs(change) > 0.50 && m.category === 'gold') {
                   const action = change > 0 ? 'بەرزبووەوە' : 'دابەزی';
                   addNotification(`نرخی ${m.name} ${action} بە بڕی $${Math.abs(change).toFixed(2)}`, changeType, m.id);
                }

                return {
                  ...m,
                  buy: update.buy || m.buy,
                  sell: update.sell || m.sell,
                  lastUpdated: new Date().toISOString(),
                  change: changeType
                };
              }
              return m;
            });
          });
        }
      } catch (err) {
        console.error("Market Service update failed", err);
      }
    }, 5000);

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

    return () => { clearInterval(marketTimer); clearInterval(cryptoTimer); };
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
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
      if (currentUser) localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('بیرگەی ناوخۆیی وێبگەڕ پڕ بووە! تکایە هەندێک داتای بارکراو بسڕەوە یان داتای کەمتر بار بکە (بۆ نموونە، وێنەی بچووکتر).');
      } else {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [rates, metals, headlines, config, theme, language, currentUser, favorites, transactions, products, categories]);

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
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 text-4xl font-black italic tracking-tighter shadow-[0_0_30px_rgba(212,175,55,0.4)] relative z-10 border-2 border-white/20">
            GE
          </div>
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
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform font-black italic tracking-tighter text-lg border border-white/10">
            GE
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{config.appName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${
                dbConnected === true ? 'bg-emerald-500 shadow-emerald-500/50' : 
                dbConnected === false ? 'bg-rose-500 shadow-rose-500/50' : 
                'bg-amber-500 shadow-amber-500/50'
              }`} />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">
                {dbConnected === true ? 'Cloud Sync Active' : 
                 dbConnected === false ? 'Offline Mode' : 
                 'Connecting...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['developer', 'admin', 'staff'].includes(currentUser.role) && (
            <button onClick={() => setView('admin')} className={`p-3 rounded-app transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Shield size="1.25rem" />
            </button>
          )}
          {['developer', 'kargeri'].includes(currentUser.role) && (
            <button onClick={() => setView('kargeri')} className={`p-3 rounded-app transition-all ${view === 'kargeri' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <LucideIcons.Activity size="1.25rem" />
            </button>
          )}
          {['developer', 'editor'].includes(currentUser.role) && (
            <button onClick={() => setView('editor')} className={`p-3 rounded-app transition-all ${view === 'editor' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <LucideIcons.Edit3 size="1.25rem" />
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
          if (!currentUser && (view === 'admin' || view === 'developer' || view === 'settings' || view === 'accounts' || view === 'kargeri' || view === 'editor')) return <Login onLogin={setCurrentUser} onRegister={handleRegister} t={t} config={config} onSwitch={()=>{}} />;
          switch (view) {
            case 'market': return <MarketView rates={rates} headlines={headlines} t={t} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'metals': return <MetalsView metals={metals} t={t} language={language} currentUser={currentUser} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'crypto': return <CryptoView cryptoRates={cryptoRates} t={t} config={config} favorites={favorites} toggleFavorite={toggleFavorite} />;
            case 'converter': return <Converter rates={rates} t={t} />;
            case 'favorites': return <FavoritesView rates={rates} metals={metals} cryptoRates={cryptoRates} favorites={favorites} toggleFavorite={toggleFavorite} t={t} config={config} />;
            case 'admin': return <AdminDashboard rates={rates} metals={metals} cryptoRates={cryptoRates} users={users} headlines={headlines} onUpdateRates={setRates} onUpdateMetals={setMetals} onUpdateCrypto={setCryptoRates} onUpdateUsers={handleUpdateUsers} onUpdateHeadlines={setHeadlines} t={t} currentUser={currentUser!} config={config} onUpdateConfig={setConfig} />;
            case 'accounts': return <AccountsView transactions={transactions} onAddTransaction={(t) => setTransactions(prev => [...prev, t])} onUpdateTransaction={(updatedT) => setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} products={products} onUpdateProducts={setProducts} categories={categories} onUpdateCategories={setCategories} currentUser={currentUser!} config={config} onUpdateConfig={setConfig} t={t} onBack={() => setView('settings')} />;
            case 'kargeri': return <KargeriDashboard users={users} t={t} config={config} />;
            case 'editor': return <EditorDashboard rates={rates} metals={metals} cryptoRates={cryptoRates} headlines={headlines} onUpdateRates={setRates} onUpdateMetals={setMetals} onUpdateCrypto={setCryptoRates} onUpdateHeadlines={setHeadlines} t={t} config={config} onUpdateConfig={setConfig} currentUser={currentUser!} />;
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
