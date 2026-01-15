import { useStore } from '../stores/useStore';
import { format } from 'date-fns';
import { Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMemo } from 'react';

const iconMap: Record<string, any> = {
    Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap
};

import type { Transaction } from '../types';

interface TransactionListProps {
    onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ onEditTransaction }: TransactionListProps) {
    const { transactions, categories } = useStore();

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <div className="space-y-3">
                {sortedTransactions.map((transaction) => {
                    const category = getCategory(transaction.categoryId);
                    const Icon = category && iconMap[category.icon] ? iconMap[category.icon] : HelpCircle;

                    return (
                        <div
                            key={transaction.id}
                            onClick={() => onEditTransaction(transaction)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-surface active:scale-[0.99] transition-transform cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", category?.color || 'bg-gray-500')}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{category?.name} - {transaction.note}</p>
                                    <p className="text-sm text-gray-400">{format(new Date(transaction.date), 'MMM d')}</p>
                                </div>
                            </div>
                            <p className={cn("font-semibold", transaction.type === 'expense' ? 'text-red-400' : 'text-green-400')}>
                                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
