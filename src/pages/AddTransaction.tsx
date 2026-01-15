import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { Keypad } from '../components/Keypad';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { CategoryManager } from '../components/CategoryManager';
import { Pencil } from 'lucide-react';
import { Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle, Edit3 } from 'lucide-react';
import type { Transaction } from '../types';

const iconMap: Record<string, any> = {
    Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap
};

interface AddTransactionProps {
    onClose: () => void;
    editTransaction?: Transaction | null;
}

export function AddTransaction({ onClose, editTransaction }: AddTransactionProps) {
    const { categories, addTransaction, updateTransaction } = useStore();

    // State initialization
    const [amountStr, setAmountStr] = useState(editTransaction ? editTransaction.amount.toString() : '0');
    const [type, setType] = useState<'income' | 'expense'>(editTransaction ? editTransaction.type : 'expense');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(editTransaction ? editTransaction.categoryId : '');
    const [date, setDate] = useState(editTransaction ? new Date(editTransaction.date) : new Date());
    const [note, setNote] = useState(editTransaction?.note || '');

    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Filter categories by type
    const availableCategories = categories.filter(c => c.type === type);

    const handleKeyPress = (key: string) => {
        if (amountStr === '0' && key !== '.') {
            setAmountStr(key);
        } else {
            if (key === '.' && amountStr.includes('.')) return;
            setAmountStr(prev => prev + key);
        }
    };

    const handleDelete = () => {
        if (amountStr.length <= 1) {
            setAmountStr('0');
        } else {
            setAmountStr(prev => prev.slice(0, -1));
        }
    };

    const handleSave = () => {
        const amount = parseFloat(amountStr);
        if (amount <= 0) return;

        let categoryId = selectedCategoryId;
        if (!categoryId) {
            if (availableCategories.length > 0) categoryId = availableCategories[0].id;
            else return;
        }

        const transactionData = {
            amount,
            type,
            categoryId,
            date: date.toISOString(),
            note: note.trim()
        };

        if (editTransaction) {
            updateTransaction(editTransaction.id, transactionData);
        } else {
            addTransaction({
                ...transactionData,
                id: Math.random().toString(36).substr(2, 9),
            });
        }
        onClose();
    };

    if (showCategoryManager) {
        return <CategoryManager onClose={() => setShowCategoryManager(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col z-[60] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center relative">
                <button onClick={onClose} className="text-blue-500 font-medium">Cancel</button>
                <span className="font-semibold text-lg absolute left-1/2 -translate-x-1/2">
                    {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </span>
                <button onClick={handleSave} className="text-blue-500 font-bold">Save</button>
            </div>

            {/* Amount Display */}
            <div className="py-8 text-center flex items-center justify-center gap-1">
                <span className="text-4xl text-gray-500">$</span>
                <span className="text-6xl font-medium tracking-tight">{amountStr}</span>
            </div>

            {/* Type Switcher */}
            <div className="px-6 mb-6">
                <div className="bg-surface rounded-xl p-1 flex">
                    <button
                        onClick={() => { setType('expense'); setSelectedCategoryId(''); }}
                        className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", type === 'expense' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400')}
                    >
                        Expense
                    </button>
                    <button
                        onClick={() => { setType('income'); setSelectedCategoryId(''); }}
                        className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", type === 'income' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400')}
                    >
                        Income
                    </button>
                </div>
            </div>

            {/* Date */}
            <div className="px-6 mb-4">
                <label className="bg-surface rounded-xl p-3 flex justify-between items-center text-sm font-medium relative cursor-pointer">
                    <span className="z-10">{format(date, 'MMM d, yyyy')}</span>
                    <Calendar className="w-5 h-5 text-gray-400 z-10" />
                    <input
                        type="date"
                        value={format(date, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            if (!e.target.value) return;
                            const newDate = new Date(e.target.value);
                            // Set to noon to avoid timezone rolling issues
                            newDate.setHours(12, 0, 0, 0);
                            setDate(newDate);
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full z-20 cursor-pointer"
                        style={{ WebkitAppearance: 'none' }}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    />
                </label>
            </div>

            {/* Note Input */}
            <div className="px-6 mb-4">
                <div className="bg-surface rounded-xl p-3 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Add a note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-transparent w-full text-white placeholder:text-gray-500 text-sm focus:outline-none"
                    />
                </div>
            </div>

            {/* Categories Grid - Scrollable area */}
            <div className="flex-1 overflow-y-auto px-6 mb-4 min-h-0">
                <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                    {availableCategories.map(item => {
                        const Icon = iconMap[item.icon] || HelpCircle;
                        const isSelected = selectedCategoryId === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedCategoryId(item.id)}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center transition-all border-2",
                                    isSelected ? "border-blue-500 scale-110" : "border-transparent",
                                    item.color || "bg-gray-700"
                                )}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className={cn("text-xs font-medium text-center truncate w-full", isSelected ? "text-blue-400" : "text-gray-400")}>
                                    {item.name}
                                </span>
                            </button>
                        )
                    })}

                    <button
                        onClick={() => setShowCategoryManager(true)}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 hover:border-blue-500 hover:text-blue-500 text-gray-400 transition-all">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-center truncate w-full text-gray-400">
                            Edit
                        </span>
                    </button>
                </div>
            </div>

            {/* Keypad */}
            <div className="mt-auto">
                <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} onSubmit={handleSave} />
            </div>
        </div>
    );
}
