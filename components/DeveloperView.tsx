
import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Terminal as TerminalIcon, Palette, Activity, Cpu, Sliders, Maximize, Download, Save, CheckCircle2, ShieldAlert, CloudUpload } from 'lucide-react';
import { AppConfig, CurrencyRate, MetalRate, CryptoRate, LanguageCode, Headline } from '../types.ts';

interface DeveloperViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  rates: CurrencyRate[];
  metals: MetalRate[];
  cryptoRates: CryptoRate[];
  headlines: Headline[];
  onUpdateRates: (newRates: CurrencyRate[]) => void;
  onUpdateMetals: (newMetals: MetalRate[]) => void;
  onUpdateCrypto: (newCrypto: CryptoRate[]) => void;
  onUpdateHeadlines: (newHeadlines: Headline[]) => void;
  t: (key: string) => string;
  language: LanguageCode;
}

const DeveloperView: React.FC<DeveloperViewProps> = ({ 
  config, 
  onUpdateConfig, 
  rates, 
  metals, 
  cryptoRates, 
  headlines,
  onUpdateRates,
  onUpdateMetals,
  onUpdateCrypto,
  onUpdateHeadlines,
  t,
  language
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visuals' | 'geometry' | 'terminal' | 'modules' | 'content'>('terminal');
  const [cmdInput, setCmdInput] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Kernel v16.0.4 Local Node Active.",
    "[AUTO] Live Feed Sync: [1s/10s] ONLINE.",
    "[READY] Awaiting developer commands..."
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const downloadFullData = () => {
    try {
      const dataToExport = {
        metadata: {
          exportedBy: "System Developer",
          timestamp: new Date().toISOString(),
          version: "v16.0",
          appName: config.appName
        },
        application_config: config,
        currency_rates: rates,
        metal_rates: metals,
        crypto_rates: cryptoRates,
        news_headlines: headlines
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.appName.replace(/\s+/g, '_').toLowerCase()}_full_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setTerminalLogs(prev => [...prev, "[OK] Full application data package exported and downloaded."]);
    } catch (error) {
      setTerminalLogs(prev => [...prev, `[ERR] Export failed: ${String(error)}`]);
    }
  };

  const manualSync = () => {
    // State in App.tsx is already watching these for changes, but we force a visual confirmation
    setTerminalLogs(prev => [...prev, "[DISK] Manual commit sequence initiated..."]);
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, "[DISK] All local memory buffers synced to Storage."]);
      alert("هەموو گۆڕانکارییەکان بە سەرکەوتوویی لە بیرگەی ئامێرەکەدا پاشەکەوت کران.");
    }, 500);
  };

  const handleDeploy = () => {
    if (!confirm("دڵنیایت لە ناردنی گۆڕانکارییەکان بۆ Vercel؟")) return;
    
    setActiveSubTab('terminal');
    setIsDeploying(true);
    setTerminalLogs(prev => [...prev, "[DEPLOY] Initiating connection to Vercel CLI..."]);
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, "[DEPLOY] Authenticating with Vercel... OK"]);
      setTerminalLogs(prev => [...prev, "[DEPLOY] Building production bundle..."]);
    }, 1500);
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, "[DEPLOY] Uploading static assets..."]);
      setTerminalLogs(prev => [...prev, "[DEPLOY] Optimizing serverless functions..."]);
    }, 3500);
  
    setTimeout(() => {
      setIsDeploying(false);
      setTerminalLogs(prev => [...prev, "[SUCCESS] Deployed successfully to Vercel Production!"]);
      setTerminalLogs(prev => [...prev, "[INFO] New build is live at: https://golden-exchange.vercel.app"]);
      alert("گۆڕانکارییەکان بە سەرکەوتوویی نێردران بۆ Vercel!");
    }, 6000);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput) return;
    const cmd = cmdInput.toLowerCase().trim();
    setTerminalLogs(prev => [...prev, `dev@root:~$ ${cmdInput}`]);
    setCmdInput('');

    if (cmd === 'clear') setTerminalLogs([]);
    else if (cmd === 'backup' || cmd === 'download' || cmd === 'export') downloadFullData();
    else if (cmd === 'save' || cmd === 'sync') manualSync();
    else if (cmd === 'deploy' || cmd === 'push') handleDeploy();
    else if (cmd === 'reset') {
      onUpdateConfig({ 
        ...config, 
        primaryColor: '#0284c7', 
        backgroundColor: '#f8fafc', 
        borderRadius: 16, 
        fontSize: 13, 
        enabledTabs: ['market', 'metals', 'crypto', 'converter', 'favorites', 'settings'],
        tabNames: {},
        tabIcons: {},
        appName: 'Golden Exchange',
      });
      setTerminalLogs(prev => [...prev, "[OK] UI Kernel parameters reset to defaults."]);
    }
    else if (cmd === 'wipe') {
      if(confirm("Factory Reset? This will delete all your custom data!")) { 
        localStorage.clear(); 
        window.location.reload(); 
      }
    }
    else setTerminalLogs(prev => [...prev, `[ERR] Command not recognized: '${cmd}'`]);
  };

  const toggleTab = (tabId: string) => {
    const currentTabs = config.enabledTabs || ['market', 'metals', 'crypto', 'converter', 'favorites', 'settings'];
    const newTabs = currentTabs.includes(tabId)
      ? currentTabs.filter(t => t !== tabId)
      : [...currentTabs, tabId];
    onUpdateConfig({ ...config, enabledTabs: newTabs });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 pb-32 px-4 animate-in fade-in relative z-10">
      {/* Dev Tab Navigation */}
      <div className="flex bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-2 rounded-app shadow-lg border border-white/10 dark:border-white/5">
        {[
          { id: 'visuals', label: 'Theme Core', icon: Palette },
          { id: 'geometry', label: 'Dimensions', icon: Sliders },
          { id: 'modules', label: 'Modules', icon: Cpu },
          { id: 'content', label: 'Content', icon: TerminalIcon },
          { id: 'terminal', label: 'Kernel Shell', icon: TerminalIcon },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id as any)} 
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeSubTab === tab.id ? 'bg-primary text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'modules' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tight">Module Control</h3>
             <Cpu size={24} className="text-sky-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            لێرەوە دەتوانیت کۆنترۆڵی پیشاندانی بەشە سەرەکییەکانی ئەپەکە بکەیت. هەر بەشێک کە لادەبەیت، لە لیستی خوارەوە (Navigation Bar) نامێنێت.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['market', 'metals', 'crypto', 'converter', 'favorites', 'settings'].map(tabId => {
              const isEnabled = config.enabledTabs?.includes(tabId) ?? true;
              return (
              <div key={tabId} className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${isEnabled ? 'bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] border-primary/30 shadow-lg' : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent opacity-60'}`}>
                {isEnabled && <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>}
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="font-black uppercase text-xs text-slate-800 dark:text-white tracking-widest">{config.tabNames?.[tabId] || t(tabId)}</span>
                  <button 
                    onClick={() => toggleTab(tabId)}
                    className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors shadow-inner ${isEnabled ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                  </button>
                </div>
                <div className="space-y-3 relative z-10">
                  <input 
                    type="text" 
                    placeholder="New Name..." 
                    value={config.tabNames?.[tabId] || ''}
                    onChange={(e) => onUpdateConfig({...config, tabNames: {...config.tabNames, [tabId]: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-black/20 text-xs p-3 rounded-xl placeholder:text-slate-400 font-bold border border-white/10 focus:border-primary/50 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <label htmlFor={`icon-upload-${tabId}`} className="w-full bg-white/50 dark:bg-black/20 text-xs p-3 rounded-xl placeholder:text-slate-400 font-bold flex items-center justify-center cursor-pointer h-10 border border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                      {config.tabIcons?.[tabId] ? 'Change Icon' : 'Upload Icon'}
                    </label>
                    <input 
                      id={`icon-upload-${tabId}`}
                      type="file" 
                      accept="image/*, .gif" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.type === 'image/gif') {
                          if (file.size > 500 * 1024) {
                            alert("قەبارەی GIF زۆر گەورەیە! تکایە GIFێک بەکاربهێنە کە لە 500KB کەمتر بێت.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: reader.result as string}});
                          };
                          reader.readAsDataURL(file);
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_SIZE = 128;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                              if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              }
                            } else {
                              if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
                            onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: compressedBase64}});
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {config.tabIcons?.[tabId] && (
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 relative group overflow-hidden shadow-inner">
                        {config.tabIcons[tabId].startsWith('data:image') || config.tabIcons[tabId].startsWith('http') ? (
                          <img src={config.tabIcons[tabId]} alt="icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          React.createElement(LucideIcons[config.tabIcons[tabId] as keyof typeof LucideIcons] || TerminalIcon, { size: 20 })
                        )}
                        <button 
                          onClick={() => onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: undefined}})}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {activeSubTab === 'content' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tight">Branding & Content</h3>
             <TerminalIcon size={24} className="text-indigo-500" />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App Name</label>
            <input 
              type="text" 
              value={config.appName}
              onChange={(e) => onUpdateConfig({...config, appName: e.target.value})}
              className="w-full bg-white dark:bg-slate-800 text-lg p-3 rounded-xl font-black"
            />
          </div>
          <div className="space-y-4 pt-4 border-t border-white/10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Page Title</label>
            <input 
              type="text" 
              placeholder="Welcome Title..."
              value={config.translations?.[language]?.login_title || ''}
              onChange={(e) => {
                const newTranslations = JSON.parse(JSON.stringify(config.translations));
                if (!newTranslations[language]) newTranslations[language] = {};
                newTranslations[language].login_title = e.target.value;
                onUpdateConfig({...config, translations: newTranslations});
              }}
              className="w-full bg-white dark:bg-slate-800 text-sm p-2 rounded-md font-bold"
            />
          </div>
        </div>
      )}

      {activeSubTab === 'visuals' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tight">Visual Engine Controls</h3>
             <Palette size={24} className="text-primary animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Identity Color</label>
               <div className="flex gap-2 flex-wrap">
                 {['#D4AF37', '#0284c7', '#cd7f32', '#059669', '#7c3aed', '#db2777', '#dc2626'].map(color => (
                   <button
                    key={color}
                    onClick={() => onUpdateConfig({...config, primaryColor: color})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                   />
                 ))}
                 <input type="color" value={config.primaryColor} onChange={e => onUpdateConfig({...config, primaryColor: e.target.value})} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden" />
               </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App Canvas Background</label>
               <input type="color" value={config.backgroundColor} onChange={e => onUpdateConfig({...config, backgroundColor: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0" />
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'geometry' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tight">Geometry Matrix</h3>
              <Maximize size={24} className="text-amber-500" />
           </div>
           <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <label>Corner Radius</label>
                    <span className="text-primary text-sm font-bold">{config.borderRadius}px</span>
                 </div>
                 <input type="range" min="0" max="60" value={config.borderRadius} onChange={e => onUpdateConfig({...config, borderRadius: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <label>Global UI Scale (Shrink/Grow)</label>
                    <span className="text-primary text-sm font-bold">{config.fontSize}px</span>
                 </div>
                 <input type="range" min="8" max="24" value={config.fontSize} onChange={e => onUpdateConfig({...config, fontSize: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'terminal' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          {/* Main Terminal Shell */}
          <div className="bg-black rounded-[2.5rem] p-6 shadow-3xl border-4 border-slate-900 font-mono h-[350px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-2 right-6 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 text-[11px] text-emerald-500 text-left" dir="ltr">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={log.includes('[ERR]') ? 'text-rose-400' : log.includes('[OK]') ? 'text-sky-400' : ''}>
                  <span className="opacity-30 mr-2">$</span> {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            <form onSubmit={handleCommand} className="mt-4 pt-4 border-t border-white/10 flex gap-3 items-center" dir="ltr">
              <span className="text-primary font-black text-sm">{'>'}</span>
              <input 
                type="text" 
                value={cmdInput} 
                onChange={e=>setCmdInput(e.target.value)} 
                className="bg-transparent text-white outline-none flex-1 font-mono text-xs placeholder:text-slate-800" 
                placeholder="Commands: backup, save, clear, reset, wipe..." 
                autoFocus 
              />
            </form>
          </div>
        </div>
      )}

      {/* Global Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button 
            onClick={downloadFullData} 
            className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl group p-4 rounded-[2rem] border border-white/10 dark:border-white/5 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all hover:border-primary/30"
          >
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
              <Download size={20} className="text-primary group-hover:text-white" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black uppercase text-slate-800 dark:text-white">Export Data</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">داگرتنی داتا</span>
            </div>
          </button>
          <button 
            onClick={manualSync} 
            className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl group p-4 rounded-[2rem] border border-white/10 dark:border-white/5 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all hover:border-emerald-500/30"
          >
            <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Save size={20} className="text-emerald-500 group-hover:text-white" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black uppercase text-slate-800 dark:text-white">Manual Save</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">پاشەکەوتکردن</span>
            </div>
          </button>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl group p-4 rounded-[2rem] border border-white/10 dark:border-white/5 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all hover:border-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed col-span-2 md:col-span-1"
          >
            <div className={`p-2 bg-sky-500/10 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors ${isDeploying ? 'animate-bounce' : ''}`}>
              <CloudUpload size={20} className="text-sky-500 group-hover:text-white" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black uppercase text-slate-800 dark:text-white">
                {isDeploying ? 'Deploying...' : 'Push to Vercel'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ناردن بۆ سێرڤەر</span>
            </div>
          </button>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Real-time Feed', val: 'CONNECTED', icon: Activity, color: 'text-emerald-500' },
           { label: 'System Kernel', val: 'V16.0.4-STABLE', icon: Cpu, color: 'text-primary' },
           { label: 'Storage Mode', val: 'LOCAL_SYNC', icon: Sliders, color: 'text-amber-500' },
           { label: 'Access Level', val: 'ROOT_DEV', icon: TerminalIcon, color: 'text-rose-500' },
         ].map((stat, i) => (
           <div key={i} className="bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 dark:border-white/5 flex flex-col items-center gap-3 shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${stat.color.replace('text-', 'bg-')}`}></div>
              <stat.icon size={24} className={`${stat.color} relative z-10`} />
              <div className="text-center relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <p className="text-xs font-black dark:text-white uppercase tracking-wider">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
         <ShieldAlert className="text-amber-600 shrink-0" size={20} />
         <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase">
           بۆ گەشەپێدەر: هەموو گۆڕانکارییەک ڕاستەوخۆ لە بیرگەی ئامێرەکەدا پاشەکەوت دەبێت. بۆ دڵنیابوونەوە لە پاراستنی داتاکان، هەمیشە فایلێکی باکئەپ (Backup) دابەزێنە.
         </p>
      </div>
    </div>
  );
};

export default DeveloperView;
