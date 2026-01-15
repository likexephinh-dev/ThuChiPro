import { ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { useMemo } from 'react';

export function BalanceCard() {
    const transactions = useStore((state) => state.transactions);

    const { totalBalance, monthlyIncome, monthlyExpense } = useMemo(() => {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });

        return {
            totalBalance: income - expense,
            monthlyIncome: income, // Simplified for now (total)
            monthlyExpense: expense
        };
    }, [transactions]);

    return (
        <div className="p-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl mb-6">
            <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold mb-6">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-1 text-blue-100/70 text-xs font-medium mb-1">
                            <ArrowUp className="w-3 h-3" />
                            <span>Income</span>
                        </div>
                        <p className="text-lg font-semibold">${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-purple-100/70 text-xs font-medium mb-1">
                            <ArrowDown className="w-3 h-3" />
                            <span>Expense</span>
                        </div>
                        <p className="text-lg font-semibold">${monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
