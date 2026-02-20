
import React, { useState } from 'react';
import { TrendingUp, Key, Mail, ShieldAlert, UserPlus, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

import { AppConfig } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onSwitch: () => void;
  t: (key: string) => string;
  config: AppConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, t, config }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (isRegistering) {
      const newUser: User = {
        id: `u_${Date.now()}`,
        name,
        email,
        password,
        role: 'user',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      onRegister(newUser);
      setSuccess('هەژمارەکەت دروستکرا! چاوەڕێی پەسەندکردنی ئەدمین بە.');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setName('');
    } else {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .eq('password', password)
            .single();
          
          if (!error && data) {
            const user = data;
            if (user.status === 'pending') {
              setError('هەژمارەکەت هێشتا پەسەند نەکراوە. تکایە چاوەڕێ بە.');
            } else if (user.status === 'blocked') {
              setError('هەژمارەکەت ڕاگیراوە!');
            } else if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
              setError('کاتەکەت تەواو بووە! تکایە پەیوەندی بە ئەدمینەوە بکە.');
            } else {
              onLogin(user);
            }
            return;
          }
        }

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const user = await response.json();
          if (user.status === 'pending') {
            setError('هەژمارەکەت هێشتا پەسەند نەکراوە. تکایە چاوەڕێ بە.');
          } else if (user.status === 'blocked') {
            setError('هەژمارەکەت ڕاگیراوە!');
          } else if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
            setError('کاتەکەت تەواو بووە! تکایە پەیوەندی بە ئەدمینەوە بکە.');
          } else {
            onLogin(user);
          }
        } else {
          const err = await response.json();
          setError(err.error || 'زانیارییەکان هەڵەیە!');
        }
      } catch (err) {
        console.error("Login error:", err);
        // Fallback for developer account if server is down
        if (email.toLowerCase().trim() === 'faraj' && password === 'faraj') {
          onLogin({
            id: 'admin',
            name: 'Developer',
            email: 'faraj',
            password: 'faraj',
            role: 'developer',
            status: 'approved',
            createdAt: new Date().toISOString()
          });
        } else {
          setError('پەیوەندی لەگەڵ سێرڤەر نییە! تکایە لاپەڕەکە ڕیفرێش بکەرەوە.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -mr-80 -mt-80 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full -ml-80 -mb-80 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary rounded-[2rem] mb-6 shadow-2xl animate-in zoom-in duration-500 font-black italic tracking-tighter text-3xl">
            GE
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-amber-400 tracking-tight italic mb-2">{config.translations?.[config.language]?.login_title || config.appName}</h1>
          <p className="text-slate-500 dark:text-amber-400/60 font-bold uppercase tracking-[0.3em] text-[10px]">
            {isRegistering ? t('login_join_network') : t('login_secure_terminal')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs rounded-2xl font-black border border-rose-100 dark:border-rose-900 flex items-center gap-3 animate-shake">
              <ShieldAlert size={20} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-black border border-emerald-100 dark:border-emerald-900 flex items-center gap-3 animate-in zoom-in">
              <TrendingUp size={20} />
              {success}
            </div>
          )}
          
          {isRegistering && (
            <div className="space-y-3 animate-in slide-in-from-left-10 fade-in duration-300">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('login_name_label')}</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold text-sm dark:text-white text-right"
                  placeholder={t('login_name_placeholder')}
                />
                <UserPlus className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('email')}</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold text-sm dark:text-white text-right"
                placeholder={t('login_username_placeholder')}
                dir="ltr"
              />
              <Mail className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('password')}</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold text-sm dark:text-white text-right"
                placeholder={t('login_password_placeholder')}
                dir="ltr"
              />
              <Key className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 dark:bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl transition-all transform active:scale-95 text-lg hover:bg-black dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            {isRegistering ? t('login_create_account') : t('login_authenticate')}
            {!isRegistering && <ArrowRight size={20} />}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
              className="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              {isRegistering ? t('login_already_have_account') : t('login_request_access')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
