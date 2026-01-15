import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { CalendarIcon } from './icons';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
}

export default function TransactionForm({ addTransaction, incomeCategories, expenseCategories }: TransactionFormProps): React.ReactElement {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    // If there's no selected category or the selected one doesn't exist for the current type, select the first one.
    if (!categoryId || !categories.some(c => c.id === categoryId)) {
      setCategoryId(categories[0]?.id || '');
    }
  }, [type, categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (!selectedCategory) {
      alert("Vui lòng chọn một danh mục hợp lệ. Bạn có thể thêm danh mục mới trong phần Quản lý Danh mục.");
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      description,
      type,
      category: selectedCategory,
      date,
    });

    setAmount('');
    setDescription('');
  };

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Thêm Giao Dịch Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="flex gap-4">
          <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded ${type === 'income' ? 'bg-income text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Thu</button>
          <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded ${type === 'expense' ? 'bg-expense text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Chi</button>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">Số tiền</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" required />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Mô tả</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Tiền thuê mặt bằng tháng 5" className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" rows={3} required />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">Danh mục</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent">
             {categories.length === 0 && <option disabled>Vui lòng thêm danh mục</option>}
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">Ngày</label>
          <div className="relative">
            <input 
              type="date" 
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full bg-primary border border-gray-600 rounded-md p-2 pr-10 focus:ring-accent focus:border-accent appearance-none" 
              style={{ colorScheme: 'dark' }}
              required 
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CalendarIcon />
            </div>
          </div>
        </div>
        
        <button type="submit" className="w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-highlight transition-colors duration-300">Thêm Giao Dịch</button>
      </form>
    </div>
  );
}