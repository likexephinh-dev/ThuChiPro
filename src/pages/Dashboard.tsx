import { User, Plus } from 'lucide-react';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionList';

import type { Transaction } from '../types';

interface DashboardProps {
    onAddTransaction: () => void;
    onEditTransaction: (transaction: Transaction) => void;
}

export function Dashboard({ onAddTransaction, onEditTransaction }: DashboardProps) {
    return (
        <div className="pb-24 pt-6 px-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                </div>
                <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white border border-white/10">
                    <User className="w-5 h-5" />
                </button>
            </div>

            <BalanceCard />

            <button
                onClick={onAddTransaction}
                className="w-full py-4 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-2 text-white font-semibold mb-8 shadow-lg shadow-blue-500/20"
            >
                <Plus className="w-5 h-5" />
                Quick Add
            </button>

            <TransactionList onEditTransaction={onEditTransaction} />
        </div>
    );
}
