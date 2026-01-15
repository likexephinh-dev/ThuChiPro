
import React, { useState, useRef, ChangeEvent } from 'react';
import { Category, TransactionType } from '../types';
import { EditIcon, DeleteIcon, DownloadIcon, UploadIcon, ExcelIcon, CloudUploadIcon, CloudDownloadIcon } from './icons';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string, categoryType: TransactionType) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onBackup: () => void;
  onRestore: (event: ChangeEvent<HTMLInputElement>) => void;
  onExportExcel: () => void;
  onSyncToCloud: () => void;
  onLoadFromCloud: () => void;
  isSyncing: boolean;
}

const CategoryList = ({ 
  categories, 
  title, 
  categoryType,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory
}: { 
  categories: Category[], 
  title: string, 
  categoryType: TransactionType,
  onUpdateCategory: (category: Category) => void,
  onDeleteCategory: (categoryId: string, categoryType: TransactionType) => void,
  onAddCategory: (category: Omit<Category, 'id'>) => void
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCancel = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleSave = (category: Category) => {
    if (editingCategoryName.trim() === '') {
      alert('Tên danh mục không được để trống.');
      return;
    }
    onUpdateCategory({ ...category, name: editingCategoryName.trim() });
    handleCancel();
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() === '') {
        alert('Tên danh mục không được để trống.');
        return;
    }
    onAddCategory({ name: newCategoryName.trim(), type: categoryType });
    setNewCategoryName('');
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-text-secondary border-b border-gray-700 pb-1">{title}</h3>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat.id} className="flex items-center justify-between bg-primary p-2 rounded-md">
            {editingCategoryId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="flex-grow bg-gray-800 border border-gray-600 rounded-md p-1 text-sm focus:ring-accent focus:border-accent"
                  autoFocus
                />
                <div className="flex gap-2 ml-2">
                  <button onClick={() => handleSave(cat)} className="text-sm bg-accent px-2 py-1 rounded hover:bg-highlight">Lưu</button>
                  <button onClick={handleCancel} className="text-sm bg-gray-600 px-2 py-1 rounded hover:bg-gray-500">Hủy</button>
                </div>
              </>
            ) : (
              <>
                <span>{cat.name}</span>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(cat)} className="text-gray-500 hover:text-accent" aria-label={`Chỉnh sửa danh mục ${cat.name}`}>
                    <EditIcon />
                  </button>
                  <button onClick={() => onDeleteCategory(cat.id, cat.type)} className="text-gray-500 hover:text-expense" aria-label={`Xóa danh mục ${cat.name}`}>
                    <DeleteIcon />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddNewCategory} className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Tên danh mục mới"
          className="flex-grow bg-primary border border-gray-600 rounded-md p-1.5 text-sm focus:ring-accent focus:border-accent"
        />
        <button type="submit" className="text-sm bg-highlight px-3 py-1.5 rounded-md hover:bg-accent">Thêm</button>
      </form>
    </div>
  );
};


export default function CategoryManagerModal({
  isOpen,
  onClose,
  incomeCategories,
  expenseCategories,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  onBackup,
  onRestore,
  onExportExcel,
  onSyncToCloud,
  onLoadFromCloud,
  isSyncing,
}: CategoryManagerModalProps): React.ReactElement | null {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-manager-title"
    >
      <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 id="category-manager-title" className="text-xl font-bold">Quản Lý Danh Mục & Dữ Liệu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-6">
            <CategoryList 
                categories={incomeCategories} 
                title="Danh Mục Thu"
                categoryType="income"
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                onAddCategory={onAddCategory}
            />
            <CategoryList 
                categories={expenseCategories} 
                title="Danh Mục Chi" 
                categoryType="expense"
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                onAddCategory={onAddCategory}
            />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-text-secondary">Dữ Liệu</h3>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
               <button 
                onClick={onSyncToCloud} 
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-grow sm:flex-grow-0 justify-center ${isSyncing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <CloudUploadIcon />
                {isSyncing ? 'Đang xử lý...' : 'Đồng bộ lên Cloud'}
              </button>
              <button 
                onClick={onLoadFromCloud} 
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-grow sm:flex-grow-0 justify-center ${isSyncing ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
              >
                <CloudDownloadIcon />
                {isSyncing ? 'Đang xử lý...' : 'Tải từ Cloud'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start border-t border-gray-700 pt-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onRestore} 
                className="hidden"
                accept="application/json"
              />
              <button onClick={handleRestoreClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex-grow sm:flex-grow-0 justify-center">
                <UploadIcon />
                Khôi Phục
              </button>
              <button onClick={onBackup} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex-grow sm:flex-grow-0 justify-center">
                <DownloadIcon />
                Sao Lưu (JSON)
              </button>
               <button onClick={onExportExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-grow sm:flex-grow-0 justify-center">
                <ExcelIcon />
                Xuất Excel
              </button>
            </div>

            <div className="flex justify-end pt-2">
                <button
                onClick={onClose}
                className="px-6 py-2 rounded-md text-sm font-medium bg-accent hover:bg-highlight transition-colors"
                >
                Đóng
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
