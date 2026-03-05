import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Calendar, Tag, FileText, ChevronLeft, DollarSign, CreditCard } from 'lucide-react';

interface WalletTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
}

interface WalletViewProps {
  t: (key: string) => string;
  onBack: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ t, onBack }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('wisebudget_wallet_tx');
      if (!saved) return [];
      const trimmed = String(saved).trim();
      if (trimmed === 'undefined' || trimmed === 'null' || trimmed === '') return [];
      return JSON.parse(trimmed);
    } catch (e) {
      console.error("Error parsing wallet transactions:", e);
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFibModal, setShowFibModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('wisebudget_wallet_tx', JSON.stringify(transactions));
  }, [transactions]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = () => {
    if (!amount || isNaN(Number(amount)) || !category) return;
    
    const newTx: WalletTransaction = {
      id: Date.now().toString(),
      type: txType,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
      note
    };

    setTransactions(prev => [newTx, ...prev]);
    setShowAddModal(false);
    setAmount('');
    setCategory('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    if (confirm('ئایا دڵنیایت لە سڕینەوەی ئەم مامەڵەیە؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
          <ChevronLeft size={24} className="text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">جزدانی من</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wisebudget Tracker</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="bg-gradient-to-br from-primary to-amber-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-white/80 font-bold text-sm uppercase tracking-widest">کۆی گشتی باڵانس</p>
            <button 
              onClick={() => setShowFibModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors border border-white/20"
            >
              <CreditCard size={14} />
              بەستنەوەی FIB
            </button>
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-8">${balance.toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <ArrowDownRight size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">داهات</span>
              </div>
              <p className="text-xl font-black">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-rose-300 mb-1">
                <ArrowUpRight size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">خەرجی</span>
              </div>
              <p className="text-xl font-black">${totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setTxType('income'); setShowAddModal(true); }}
          className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-800/30"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-full">
            <ArrowDownRight size={24} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">زیادکردنی داهات</span>
        </button>
        <button 
          onClick={() => { setTxType('expense'); setShowAddModal(true); }}
          className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform border border-rose-100 dark:border-rose-800/30"
        >
          <div className="p-3 bg-rose-100 dark:bg-rose-800/50 rounded-full">
            <ArrowUpRight size={24} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">زیادکردنی خەرجی</span>
        </button>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 mx-2">دوایین مامەڵەکان</h3>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-white/40 dark:bg-slate-900/40 rounded-[2rem] border border-white/20 dark:border-white/5">
              <Wallet size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 font-bold text-sm">هیچ مامەڵەیەک تۆمار نەکراوە</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/40 dark:border-white/5 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {tx.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">{tx.category}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                    {tx.note && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tx.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-black text-lg ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-6 text-center ${txType === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {txType === 'income' ? 'زیادکردنی داهات' : 'زیادکردنی خەرجی'}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><DollarSign size={12}/> بڕ (Amount)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-2xl outline-none text-slate-900 dark:text-white focus:border-primary text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> جۆر (Category)</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-sm text-slate-900 dark:text-white focus:border-primary"
                  placeholder={txType === 'income' ? 'بۆ نموونە: مووچە، پاداشت...' : 'بۆ نموونە: خواردن، کرێ، سووتەمەنی...'}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><FileText size={12}/> تێبینی (Note)</label>
                <input 
                  type="text" 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-sm text-slate-900 dark:text-white focus:border-primary"
                  placeholder="تێبینی ئارەزوومەندانە..."
                />
              </div>

              <button 
                onClick={handleAdd}
                className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-transform active:scale-95 mt-4 ${txType === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
              >
                تۆمارکردن
              </button>
            </div>
          </div>
        </div>
      )}
      {/* FIB Integration Modal */}
      {showFibModal && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowFibModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-600/30 mb-4">
                <CreditCard size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                بەستنەوەی FIB
              </h3>
              <p className="text-slate-500 font-bold text-sm mt-2">
                هەژماری First Iraqi Bank ببەستەوە بە جزدانەکەتەوە
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed text-center">
                  لە ئێستادا ئەم تایبەتمەندییە لە قۆناغی تاقیکردنەوەدایە (Beta). بۆ بەستنەوەی هەژمارەکەت، پێویستە داواکاری بنێریت بۆ تیمی پشتگیری.
                </p>
              </div>

              <button 
                onClick={() => window.open('https://fib.iq', '_blank')}
                className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-transform active:scale-95 bg-blue-600 shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                کردنەوەی ئەپی FIB
              </button>
              
              <button 
                onClick={() => setShowFibModal(false)}
                className="w-full py-4 rounded-2xl font-black text-lg text-slate-500 bg-slate-100 dark:bg-slate-800 transition-transform active:scale-95"
              >
                داخستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
