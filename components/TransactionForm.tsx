
import { useState, FormEvent } from 'react';
import { PlusCircle, Settings } from 'lucide-react';
import { Category } from '../types';

interface Props {
  onSubmit: (transaction: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: Category;
    date: string;
  }) => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
  onAddCategory: (name: string, type: 'income' | 'expense') => void;
  onOpenCategoryManager: () => void;
}

export default function TransactionForm({
  onSubmit,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onOpenCategoryManager
}: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const category = categories.find(c => c.id === categoryId);
    if (!amount || !category) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategoryId('');
  };

  const handleQuickAddCategory = () => {
    const name = prompt('Tên danh mục mới:');
    if (name) {
      onAddCategory(name, type);
    }
  };

  return (
    <div className="bg-secondary rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">➕ Thêm giao dịch</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Số tiền</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Loại</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'income' | 'expense');
              setCategoryId('');
            }}
            className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Danh mục</label>
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex-1 px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleQuickAddCategory}
              className="px-3 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary hover:bg-accent transition-colors"
              title="Thêm danh mục"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="px-3 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary hover:bg-accent transition-colors"
              title="Quản lý danh mục"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Mô tả</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Ăn trưa..."
            className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Ngày</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Thêm giao dịch
        </button>
      </form>
    </div>
  );
}
