
import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { Transaction, Category, TransactionType } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_INCOME_CATEGORIES, INITIAL_EXPENSE_CATEGORIES } from './constants';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCard from './components/SummaryCard';
import CategoryChart from './components/CategoryChart';
import { MenuIcon } from './components/icons';
import DateRangePicker from './components/DateRangePicker';
import DailyTrendChart from './components/DailyTrendChart';
import EditTransactionModal from './components/EditTransactionModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import Sidebar from './components/Sidebar';
import ReportsPage from './pages/ReportsPage';

export default function App(): React.ReactElement {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [incomeCategories, setIncomeCategories] = useLocalStorage<Category[]>('incomeCategories', INITIAL_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useLocalStorage<Category[]>('expenseCategories', INITIAL_EXPENSE_CATEGORIES);
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'reports'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);


  const getMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getMonthRange());

  useEffect(() => {
    setFilterCategory('all');
  }, [filterType]);

  const handleDateChange = (startDate: string, endDate: string) => {
    if (startDate && endDate && startDate > endDate) {
      setDateRange({ startDate: endDate, endDate: startDate });
    } else {
      setDateRange({ startDate, endDate });
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    setEditingTransaction(null);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: crypto.randomUUID() };
    if (newCategory.type === 'income') {
      setIncomeCategories(prev => [...prev, newCategory]);
    } else {
      setExpenseCategories(prev => [...prev, newCategory]);
    }
    return newCategory;
  };

  const updateCategory = (updatedCategory: Category) => {
    if (updatedCategory.type === 'income') {
      setIncomeCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    } else {
      setExpenseCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    }
    setTransactions(prev => prev.map(t => {
      if (t.category.id === updatedCategory.id) {
        return { ...t, category: updatedCategory };
      }
      return t;
    }));
  };

  const deleteCategory = (categoryId: string, categoryType: TransactionType) => {
    const isCategoryUsed = transactions.some(t => t.category.id === categoryId);
    if (isCategoryUsed) {
      alert('Không thể xóa danh mục này vì nó đã được sử dụng trong một hoặc nhiều giao dịch.');
      return;
    }

    if (categoryType === 'income') {
      setIncomeCategories(prev => prev.filter(c => c.id !== categoryId));
    } else {
      setExpenseCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };


  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleBackup = () => {
    const dataToBackup = {
      transactions,
      incomeCategories,
      expenseCategories,
    };
    const dataStr = JSON.stringify(dataToBackup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `quan-ly-thu-chi-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleRestore = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Định dạng tệp không hợp lệ.');
        }
        const restoredData = JSON.parse(text);
        
        if (
          !restoredData.transactions || 
          !restoredData.incomeCategories || 
          !restoredData.expenseCategories ||
          !Array.isArray(restoredData.transactions) ||
          !Array.isArray(restoredData.incomeCategories) ||
          !Array.isArray(restoredData.expenseCategories)
        ) {
          throw new Error('Tệp sao lưu không hợp lệ hoặc bị hỏng.');
        }
        
        if (window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu không? Tất cả dữ liệu hiện tại sẽ bị ghi đè.')) {
          setTransactions(restoredData.transactions);
          setIncomeCategories(restoredData.incomeCategories);
          setExpenseCategories(restoredData.expenseCategories);
          alert('Khôi phục dữ liệu thành công!');
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục dữ liệu:", error);
        alert(`Đã xảy ra lỗi khi khôi phục dữ liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        return t.date >= dateRange.startDate && t.date <= dateRange.endDate;
      })
      .filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
      })
      .filter(t => {
        if (filterCategory === 'all') return true;
        return t.category.id === filterCategory;
      });
  }, [transactions, dateRange, filterType, filterCategory]);

  const categoryFilterOptions = useMemo(() => {
    if (filterType === 'income') return incomeCategories;
    if (filterType === 'expense') return expenseCategories;
    return [];
  }, [filterType, incomeCategories, expenseCategories]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [filteredTransactions]);

  const Dashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <TransactionForm 
            addTransaction={addTransaction}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
          />

          <div className="bg-secondary p-4 rounded-lg shadow-lg">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'all' ? 'bg-accent text-white shadow-md' : 'bg-primary text-text-secondary hover:bg-gray-700'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'income' ? 'bg-income text-white shadow-md' : 'bg-primary text-text-secondary hover:bg-gray-700'
                }`}
              >
                Thu
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'expense' ? 'bg-expense text-white shadow-md' : 'bg-primary text-text-secondary hover:bg-gray-700'
                }`}
              >
                Chi
              </button>
              <div className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:min-w-[200px]">
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  disabled={filterType === 'all'}
                  className="w-full bg-primary border border-gray-600 rounded-md p-2 text-sm focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Lọc theo danh mục"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categoryFilterOptions.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="Số Dư" amount={balance} type="balance"/>
            <SummaryCard title="Tổng Thu" amount={totalIncome} type="income" />
            <SummaryCard title="Tổng Chi" amount={totalExpense} type="expense" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
             <CategoryChart transactions={filteredTransactions} />
             <DailyTrendChart transactions={filteredTransactions} startDate={dateRange.startDate} endDate={dateRange.endDate} />
          </div>
          <TransactionList 
            transactions={filteredTransactions} 
            deleteTransaction={deleteTransaction} 
            onEditTransaction={setEditingTransaction}
          />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary font-sans text-text-primary flex">
       <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />
      
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
        <header className="bg-secondary p-4 shadow-md flex items-center">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 p-2 rounded-md hover:bg-primary">
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-bold text-center text-text-primary">
            {activeView === 'dashboard' ? 'Trang Chủ' : 'Báo Cáo & Phân Tích'}
          </h1>
        </header>

        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          {activeView === 'dashboard' ? <Dashboard /> : <ReportsPage allTransactions={transactions} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />}
        </main>
      </div>

      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={updateTransaction}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onAddCategory={addCategory}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />
    </div>
  );
}
