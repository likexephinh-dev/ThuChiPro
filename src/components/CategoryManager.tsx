import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { cn } from '../lib/utils';
import { X, Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle, Plus, Trash2 } from 'lucide-react';
import type { Category } from '../types';

const iconMap: Record<string, any> = {
    Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle
};

const iconKeys = Object.keys(iconMap);
const colorOptions = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
];

interface CategoryManagerProps {
    onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
    const { categories, addCategory, updateCategory, deleteCategory } = useStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempCategory, setTempCategory] = useState<Partial<Category>>({});
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setTempCategory(category);
        setIsCreating(false);
    };

    const handleCreate = () => {
        const newCat: Category = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Category',
            icon: 'HelpCircle',
            color: 'bg-gray-500',
            type: 'expense'
        };
        setTempCategory(newCat);
        setEditingId(newCat.id);
        setIsCreating(true);
    };

    const handleSave = () => {
        if (!tempCategory.name || !editingId) return;

        if (isCreating) {
            addCategory(tempCategory as Category);
        } else {
            updateCategory(editingId, tempCategory);
        }
        setEditingId(null);
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this category? Transactions will remain but category info might be lost.')) {
            deleteCategory(id);
            if (editingId === id) {
                setEditingId(null);
                setIsCreating(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black text-white flex flex-col">
            <div className="px-6 py-4 flex justify-between items-center bg-surface border-b border-white/5">
                <h2 className="font-bold text-lg">Manage Categories</h2>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {editingId ? (
                    <div className="bg-surface p-4 rounded-xl space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Name</label>
                            <input
                                value={tempCategory.name || ''}
                                onChange={e => setTempCategory({ ...tempCategory, name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Type Toggle */}
                        <div className="flex gap-2">
                            {(['expense', 'income'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTempCategory({ ...tempCategory, type: t })}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-sm font-medium capitalize",
                                        tempCategory.type === t ? "bg-blue-600 text-white" : "bg-black text-gray-400"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Icons Grid */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {iconKeys.map(key => {
                                    const Icon = iconMap[key];
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setTempCategory({ ...tempCategory, icon: key })}
                                            className={cn(
                                                "p-2 rounded-lg flex items-center justify-center transition-all",
                                                tempCategory.icon === key ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500" : "bg-black text-gray-400"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Colors Grid */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {colorOptions.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTempCategory({ ...tempCategory, color })}
                                        className={cn(
                                            "w-8 h-8 rounded-full",
                                            color,
                                            tempCategory.color === color ? "ring-2 ring-white scale-110" : "opacity-80"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setEditingId(null)} className="flex-1 py-3 bg-gray-700 rounded-xl font-medium">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map(cat => {
                            const Icon = iconMap[cat.icon] || HelpCircle;
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", cat.color || 'bg-gray-500')}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{cat.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{cat.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-white bg-black/50 rounded-lg">Edit</button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg bg-black/50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        <button
                            onClick={handleCreate}
                            className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Category
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

