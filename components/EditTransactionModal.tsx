import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
}

export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onSave,
  incomeCategories,
  expenseCategories,
}: EditTransactionModalProps): React.ReactElement | null {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (transaction) {
      setCategoryId(transaction.category.id);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
    }
  }, [transaction]);

  if (!isOpen || !transaction) {
    return null;
  }

  const availableCategories = transaction.type === 'income' ? incomeCategories : expenseCategories;
  
  const handleSave = () => {
    const selectedCategory = availableCategories.find(c => c.id === categoryId);
    if (!amount || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (description.trim() === '') {
        alert('Mô tả không được để trống.');
        return;
    }
    if (selectedCategory) {
      onSave({ ...transaction, category: selectedCategory, amount: parseFloat(amount), description: description.trim() });
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-transaction-title"
    >
      <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <h2 id="edit-transaction-title" className="text-xl font-bold mb-4">Chỉnh Sửa Giao Dịch</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-text-secondary mb-1">Mô tả</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent"
              rows={3}
              required
            />
          </div>
           <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-text-secondary mb-1">Số tiền</label>
            <input
              type="number"
              id="edit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-text-secondary mb-1">Danh mục</label>
            <select
              id="edit-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent"
            >
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-white hover:bg-highlight transition-colors"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}