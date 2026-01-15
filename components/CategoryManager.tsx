import { useState } from 'react';
import { X, Trash2, Edit2, Check } from 'lucide-react';
import { Category } from '../types';

interface Props {
  incomeCategories: Category[];
  expenseCategories: Category[];
  onAdd: (name: string, type: 'income' | 'expense') => void;
  onDelete: (id: string, type: 'income' | 'expense') => void;
  onUpdate: (id: string, name: string, type: 'income' | 'expense') => void;
  onClose: () => void;
}

export default function CategoryManager({
  incomeCategories,
  expenseCategories,
  onAdd,
  onDelete,
  onUpdate,
  onClose
}: Props) {
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const categories = modalType === 'income' ? incomeCategories : expenseCategories;

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAdd(newCategoryName.trim(), modalType);
      setNewCategoryName('');
    }
  };

  const handleUpdate = (id: string) => {
    if (editingName.trim()) {
      onUpdate(id, editingName.trim(), modalType);
      setEditingId(null);
      setEditingName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-text-primary">⚙️ Quản lý danh mục</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={modalType === 'expense'}
                onChange={() => setModalType('expense')}
                className="mr-2"
              />
              <span className="text-text-primary font-semibold">Chi tiêu</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={modalType === 'income'}
                onChange={() => setModalType('income')}
                className="mr-2"
              />
              <span className="text-text-primary font-semibold">Thu nhập</span>
            </label>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Tên danh mục mới..."
              className="flex-1 px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90"
            >
              Thêm
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-3 bg-primary rounded-lg border border-gray-700">
                {editingId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                      className="flex-1 px-3 py-1 bg-secondary border border-gray-700 rounded text-text-primary focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="p-2 text-accent hover:bg-secondary rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName('');
                      }}
                      className="p-2 text-text-secondary hover:bg-secondary rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-text-primary">{cat.name}</span>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="p-2 text-text-secondary hover:text-accent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(cat.id, modalType)}
                      className="p-2 text-text-secondary hover:text-expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
