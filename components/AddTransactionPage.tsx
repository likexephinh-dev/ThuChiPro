import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { Calendar, ChevronLeft, Delete } from 'lucide-react';

interface AddTransactionPageProps {
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
    incomeCategories: Category[];
    expenseCategories: Category[];
}

export default function AddTransactionPage({ onClose, onSave, incomeCategories, expenseCategories }: AddTransactionPageProps) {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState<string>('0');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const categories = type === 'income' ? incomeCategories : expenseCategories;

    const handleKeypadPress = (key: string) => {
        if (key === 'backspace') {
            setAmount(prev => {
                if (prev.length === 1) return '0';
                return prev.slice(0, -1);
            });
        } else if (key === '.') {
            if (!amount.includes('.')) setAmount(prev => prev + '.');
        } else {
            setAmount(prev => {
                if (prev === '0') return key;
                // Limit length to avoid overflow
                if (prev.length > 12) return prev;
                return prev + key;
            });
        }
    };

    const handleSaveInternal = () => {
        if (parseFloat(amount) === 0) return;
        if (!categoryId) {
            // Auto select 'Khác' or first one if not selected
            if (categories.length > 0) {
                const first = categories[0];
                onSave({
                    amount: parseFloat(amount),
                    type,
                    date,
                    category: first,
                    description: description || first.name,
                });
                onClose();
            } else {
                alert("Vui lòng tạo danh mục trước");
            }
            return;
        }

        const selectedCategory = categories.find(c => c.id === categoryId);
        if (selectedCategory) {
            onSave({
                amount: parseFloat(amount),
                type,
                date,
                category: selectedCategory,
                description: description || selectedCategory.name,
            });
            onClose();
        }
    };

    const KeypadButton = ({ label, onClick, special = false }: { label: React.ReactNode, onClick: () => void, special?: boolean }) => (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`h-16 rounded-full text-2xl font-medium flex items-center justify-center transition-all active:scale-95 ${special ? 'bg-accent text-white' : 'bg-primary hover:bg-secondary text-text-primary'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col h-full animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <button onClick={onClose} className="text-accent text-lg">Cancel</button>
                <span className="font-bold text-lg text-white">Add New Transaction</span>
                <button onClick={handleSaveInternal} className="text-accent text-lg font-semibold">Save</button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col px-6">
                {/* Amount Display */}
                <div className="mt-6 mb-8 text-center">
                    <div className="text-5xl font-bold text-white tracking-tight">
                        ${parseFloat(amount).toLocaleString('en-US')}
                    </div>
                </div>

                {/* Type Segmented Control */}
                <div className="bg-secondary p-1 rounded-xl flex mb-6">
                    <button
                        onClick={() => setType('expense')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-white'
                            }`}
                    >
                        Expense
                    </button>
                    <button
                        onClick={() => setType('income')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-white'
                            }`}
                    >
                        Income
                    </button>
                </div>

                {/* Date Picker */}
                <div className="bg-secondary rounded-xl p-3 mb-6 flex items-center justify-between">
                    <div className="text-white font-medium">
                        {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Calendar className="text-text-secondary" />
                    </div>
                </div>

                {/* Description Input (Optional, not main focus in keypad design but needed) */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-secondary text-white p-3 rounded-xl outline-none placeholder:text-gray-500"
                    />
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryId(cat.id)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${categoryId === cat.id
                                    ? (type === 'income' ? 'bg-green-100 text-green-600 ring-2 ring-income' : 'bg-red-100 text-red-600 ring-2 ring-expense')
                                    : 'bg-secondary text-gray-400 group-hover:bg-gray-700'
                                }`}>
                                {/* Placeholder Icon: First char of name */}
                                <span className="text-xl font-bold">{cat.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className={`text-xs text-center truncate w-full ${categoryId === cat.id ? 'text-white font-medium' : 'text-text-secondary'}`}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                    {/* Add Category Button Placeholder */}
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-secondary text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-600">
                            <span className="text-2xl">+</span>
                        </div>
                        <span className="text-xs text-text-secondary">Add</span>
                    </button>
                </div>
            </div>

            {/* Numeric Keypad */}
            <div className="bg-primary pt-2 pb-8 px-6">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <KeypadButton key={num} label={num} onClick={() => handleKeypadPress(num.toString())} />
                    ))}
                    <KeypadButton label="." onClick={() => handleKeypadPress('.')} />
                    <KeypadButton label="0" onClick={() => handleKeypadPress('0')} />
                    <KeypadButton
                        label={<Delete size={24} />}
                        onClick={() => handleKeypadPress('backspace')}
                    />
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleSaveInternal}
                        className="w-full bg-accent text-white h-14 rounded-full font-bold text-lg hover:bg-blue-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
