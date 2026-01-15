import { useState, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { cn } from '../lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle } from 'lucide-react';

const iconMap: Record<string, any> = {
    Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap
};

type GroupedTransactions = Record<string, import('../types').Transaction[]>;

import type { Transaction } from '../types';

interface TransactionsProps {
    onEditTransaction: (transaction: Transaction) => void;
}

export function Transactions({ onEditTransaction }: TransactionsProps) {
    const { transactions, categories } = useStore();
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        if (filterType !== 'all') {
            filtered = transactions.filter(t => t.type === filterType);
        }
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType]);

    const groupedTransactions: GroupedTransactions = useMemo(() => {
        const groups: GroupedTransactions = {};
        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            let key = format(date, 'MMM d, yyyy');
            if (isToday(date)) key = 'Today';
            if (isYesterday(date)) key = 'Yesterday';

            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filteredTransactions]);

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <div className="pb-24 pt-6 px-6">
            <h1 className="text-2xl font-bold text-white mb-6">Transactions</h1>

            {/* Tabs */}
            <div className="flex p-1 bg-surface rounded-xl mb-6">
                {(['all', 'income', 'expense'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilterType(tab)}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                            filterType === tab ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-6">
                {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
                    <div key={dateLabel}>
                        <h3 className="text-gray-500 text-sm font-medium mb-3 pl-1">{dateLabel}</h3>
                        <div className="space-y-3">
                            {items.map(t => {
                                const category = getCategory(t.categoryId);
                                const Icon = category && iconMap[category.icon] ? iconMap[category.icon] : HelpCircle;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => onEditTransaction(t)}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-white/5 active:scale-[0.99] transition-transform cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", category?.color || 'bg-gray-500')}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{category?.name}</p>
                                                {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                                            </div>
                                        </div>
                                        <p className={cn("font-semibold", t.type === 'expense' ? 'text-red-400' : 'text-green-400')}>
                                            {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
