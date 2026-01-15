
import { useState, useEffect } from 'react';
import {
  ShoppingCart, Home, Popcorn, Car, Utensils, Heart,
  ShoppingBag, Lightbulb, BookOpen, Gift, Plane, MoreHorizontal,
  Plus, TrendingUp, TrendingDown, Calendar, X, Trash2, Settings,
  PieChart, BarChart3
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Types
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
}

// Category Icons Map
const categoryIcons: { [key: string]: any } = {
  'shopping-cart': ShoppingCart,
  'home': Home,
  'popcorn': Popcorn,
  'car': Car,
  'utensils': Utensils,
  'heart': Heart,
  'shopping-bag': ShoppingBag,
  'lightbulb': Lightbulb,
  'book': BookOpen,
  'gift': Gift,
  'plane': Plane,
  'more': MoreHorizontal
};

// Default Categories
const defaultCategories: Category[] = [
  { id: 'groceries', name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#10b981' },
  { id: 'rent', name: 'Rent', type: 'expense', icon: 'home', color: '#3b82f6' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'popcorn', color: '#a855f7' },
  { id: 'transport', name: 'Transport', type: 'expense', icon: 'car', color: '#f59e0b' },
  { id: 'eating-out', name: 'Eating Out', type: 'expense', icon: 'utensils', color: '#f97316' },
  { id: 'health', name: 'Health', type: 'expense', icon: 'heart', color: '#ef4444' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
  { id: 'utilities', name: 'Utilities', type: 'expense', icon: 'lightbulb', color: '#14b8a6' },
  { id: 'education', name: 'Education', type: 'expense', icon: 'book', color: '#06b6d4' },
  { id: 'gifts', name: 'Gifts', type: 'expense', icon: 'gift', color: '#d946ef' },
  { id: 'travel', name: 'Travel', type: 'expense', icon: 'plane', color: '#8b7355' },
  { id: 'other', name: 'Other', type: 'expense', icon: 'more', color: '#6b7280' },
  { id: 'salary', name: 'Salary', type: 'income', icon: 'more', color: '#10b981' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'more', color: '#3b82f6' },
];

type ViewType = 'dashboard' | 'reports';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!amount || !selectedCategory) return;

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      description: selectedCategory.name,
      amount: parseFloat(amount),
      type: transactionType,
      category: selectedCategory,
      date: new Date().toISOString()
    };

    setTransactions([newTransaction, ...transactions]);
    setShowAddModal(false);
    setAmount('');
    setSelectedCategory(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredCategories = categories.filter(c => c.type === transactionType);

  // Chart data
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, tx) => {
      const existing = acc.find(item => item.name === tx.category.name);
      if (existing) {
        existing.value += tx.amount;
      } else {
        acc.push({
          name: tx.category.name,
          value: tx.amount,
          color: tx.category.color
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

  // Monthly trend data
  const monthlyData = transactions.reduce((acc, tx) => {
    const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (tx.type === 'income') {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
    } else {
      acc.push({
        month,
        income: tx.type === 'income' ? tx.amount : 0,
        expense: tx.type === 'expense' ? tx.amount : 0
      });
    }
    return acc;
  }, [] as { month: string; income: number; expense: number }[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-md mx-auto min-h-screen bg-slate-900/50 backdrop-blur-sm">
        {currentView === 'dashboard' ? (
          <>
            {/* Dashboard View */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>
              </div>

              {/* Balance Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Wallet Balance</p>
                    <h2 className="text-4xl font-bold">{formatCurrency(balance)}</h2>
                  </div>
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium flex items-center gap-1 transition-colors">
                    <Plus className="w-4 h-4" /> Add Funds
                  </button>
                </div>
                
                <div className="flex gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-300" />
                    <div>
                      <p className="text-xs text-blue-100">Income</p>
                      <p className="font-semibold text-green-300">{formatCurrency(totalIncome)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-300" />
                    <div>
                      <p className="text-xs text-blue-100">Expense</p>
                      <p className="font-semibold text-red-300">-{formatCurrency(totalExpense)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" /> Quick Add
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="px-6 pb-24">
              <h2 className="text-xl font-bold mb-4">Latest Activities</h2>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No transactions yet</p>
                ) : (
                  transactions.slice(0, 10).map(tx => {
                    const Icon = categoryIcons[tx.category.icon];
                    return (
                      <div key={tx.id} className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${tx.category.color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: tx.category.color }} />
                          </div>
                          <div>
                            <p className="font-semibold">{tx.description}</p>
                            <p className="text-sm text-slate-400">
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Reports View */}
            <div className="p-6 pb-24">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Spending Analytics</h1>
                <button className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex gap-2 mb-6 bg-slate-800/50 rounded-2xl p-1">
                <button className="flex-1 py-2 rounded-xl bg-transparent text-slate-400 font-medium">Weekly</button>
                <button className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-medium">Monthly</button>
                <button className="flex-1 py-2 rounded-xl bg-transparent text-slate-400 font-medium">Yearly</button>
              </div>

              {/* Spending by Category */}
              <div className="bg-slate-800/80 rounded-3xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
                {categoryData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                      <p className="text-sm text-slate-400">Total Spent</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-slate-400 py-8">No expense data</p>
                )}
              </div>

              {/* Income vs Expense Trend */}
              <div className="bg-slate-800/80 rounded-3xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Income vs. Expense Trend</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 py-8">No trend data</p>
                )}
              </div>

              {/* Top Spending Categories */}
              <div className="bg-slate-800/80 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4">Top Spending Categories</h3>
                <div className="space-y-4">
                  {categoryData.slice(0, 4).map((cat, index) => {
                    const Icon = categoryIcons[categories.find(c => c.name === cat.name)?.icon || 'more'];
                    const percentage = (cat.value / totalExpense * 100).toFixed(0);
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${cat.color}30` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-sm text-slate-400">{percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: cat.color
                                }}
                              />
                            </div>
                            <span className="font-bold text-sm">{formatCurrency(cat.value)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50">
            <div className="bg-slate-900 rounded-t-3xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setShowAddModal(false)} className="text-blue-400 font-medium">Cancel</button>
                  <h2 className="font-bold text-lg">Add New Transaction</h2>
                  <button
                    onClick={addTransaction}
                    className="text-blue-400 font-semibold disabled:text-slate-600"
                    disabled={!amount || !selectedCategory}
                  >
                    Save
                  </button>
                </div>

                {/* Amount Display */}
                <div className="text-center mb-6 py-8 bg-slate-800/50 rounded-2xl">
                  <span className="text-5xl font-bold text-slate-300">
                    ${amount || '0.00'}
                  </span>
                </div>

                {/* Type Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setTransactionType('expense');
                      setSelectedCategory(null);
                    }}
                    className={`flex-1 py-3 rounded-full font-semibold transition-colors ${
                      transactionType === 'expense' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType('income');
                      setSelectedCategory(null);
                    }}
                    className={`flex-1 py-3 rounded-full font-semibold transition-colors ${
                      transactionType === 'income' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Date */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl flex justify-between items-center">
                  <span className="text-slate-300">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-4 gap-4 mb-6 max-h-64 overflow-y-auto">
                  {filteredCategories.map(cat => {
                    const Icon = categoryIcons[cat.icon];
                    const isSelected = selectedCategory?.id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                          isSelected ? 'bg-blue-600 scale-95' : 'bg-slate-800/50 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}30` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: isSelected ? 'white' : cat.color }} />
                        </div>
                        <span className="text-xs text-center">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <button
                      key={num}
                      onClick={() => setAmount(prev => prev + num.toString())}
                      className="p-4 text-2xl font-semibold bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700 rounded-2xl transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(prev => prev.includes('.') ? prev : prev + '.')}
                    className="p-4 text-2xl font-semibold bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700 rounded-2xl transition-colors"
                  >
                    .
                  </button>
                  <button
                    onClick={() => setAmount(prev => prev + '0')}
                    className="p-4 text-2xl font-semibold bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700 rounded-2xl transition-colors"
                  >
                    0
                  </button>
                  <button
                    onClick={() => setAmount(prev => prev.slice(0, -1))}
                    className="p-4 bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700 rounded-2xl transition-colors flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-6 py-4">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentView === 'dashboard' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Transactions</span>
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentView === 'reports' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <PieChart className="w-6 h-6" />
              <span className="text-xs font-medium">Reports</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400">
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
