import { useMemo, useState } from 'react';
import { useStore } from '../stores/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap, HelpCircle } from 'lucide-react';
import { subMonths, format, isSameMonth, isSameYear } from 'date-fns';

const iconMap: Record<string, any> = {
    Utensils, Car, ShoppingBag, Film, Heart, Book, Banknote, Zap
};

export function Reports() {
    const { transactions, categories } = useStore();
    const [chartType, setChartType] = useState<'income' | 'expense'>('expense');
    const [dateFilter, setDateFilter] = useState<'monthly' | 'yearly' | 'all'>('monthly');

    const filteredTransactions = useMemo(() => {
        if (dateFilter === 'all') return transactions;

        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (dateFilter === 'monthly') return isSameMonth(tDate, now) && isSameYear(tDate, now);
            if (dateFilter === 'yearly') return isSameYear(tDate, now);
            return true;
        });
    }, [transactions, dateFilter]);

    const spendingByCategory = useMemo(() => {
        // 1. Group by category based on chart type
        const categoryTotals: Record<string, number> = {};
        let total = 0;

        filteredTransactions.forEach(t => {
            if (t.type === chartType) {
                categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
                total += t.amount;
            }
        });

        // 2. Map to chart data
        return Object.entries(categoryTotals).map(([catId, amount]) => {
            const cat = categories.find(c => c.id === catId);
            const defaultColor = chartType === 'income' ? '#22c55e' : '#ef4444'; // Green for income, Red for expense base

            return {
                name: cat?.name || 'Unknown',
                value: amount,
                color: cat?.color ? '#' + (cat.color.includes('orange') ? 'f97316' :
                    cat.color.includes('yellow') ? 'eab308' :
                        cat.color.includes('pink') ? 'ec4899' :
                            cat.color.includes('purple') ? 'a855f7' :
                                cat.color.includes('red') ? 'ef4444' :
                                    cat.color.includes('blue') ? '60a5fa' :
                                        cat.color.includes('green') ? '22c55e' :
                                            cat.color.includes('teal') ? '14b8a6' : '9ca3af')
                    : defaultColor,
                percentage: total > 0 ? (amount / total) * 100 : 0,
                icon: cat?.icon
            };
        }).sort((a, b) => b.value - a.value);

    }, [filteredTransactions, categories, chartType]);

    const profitData = useMemo(() => {
        // ... (keep existing profit data logic)
        // Group by month
        const monthlyData: Record<string, { income: number, expense: number }> = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(new Date(), i);
            const key = format(d, 'MMM');
            monthlyData[key] = { income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const d = new Date(t.date);
            const key = format(d, 'MMM');
            if (monthlyData[key]) {
                if (t.type === 'income') monthlyData[key].income += t.amount;
                else monthlyData[key].expense += t.amount;
            }
        });

        return Object.entries(monthlyData).map(([name, { income, expense }]) => ({
            name,
            Income: income,
            Expense: expense,
            Profit: income - expense
        }));
    }, [transactions]);

    const totalAmount = spendingByCategory.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="pb-24 pt-6 px-6">
            <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

            {/* Filter Toggles */}
            <div className="flex p-1 bg-surface rounded-xl mb-6">
                {(['monthly', 'yearly', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setDateFilter(f)}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                            dateFilter === f ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Profit Chart */}
            <div className="bg-surface rounded-3xl p-6 mb-6">
                <h3 className="text-white font-semibold mb-2">Monthly Profit</h3>
                <div className="h-48 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none' }}
                                cursor={{ fill: '#ffffff10' }}
                            />
                            <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Income vs Expense Comparison Chart (New) */}
            <div className="bg-surface rounded-3xl p-6 mb-6">
                <h3 className="text-white font-semibold mb-2">Income vs Expense</h3>
                <div className="h-48 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none' }}
                                cursor={{ fill: '#ffffff10' }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Chart Card */}
            <div className="bg-surface rounded-3xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                    <div className="flex p-1 bg-black/30 rounded-lg">
                        <button
                            onClick={() => setChartType('expense')}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", chartType === 'expense' ? 'bg-red-500/20 text-red-500' : 'text-gray-400')}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setChartType('income')}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", chartType === 'income' ? 'bg-green-500/20 text-green-500' : 'text-gray-400')}
                        >
                            Income
                        </button>
                    </div>
                </div>

                <h3 className="text-white font-semibold mb-4 text-center capitalize">{chartType} Breakdown</h3>
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={spendingByCategory}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {spendingByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', borderColor: '#333' }}
                                itemStyle={{ color: 'white' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-gray-400 text-xs text-nowrap">Total</p>
                        <p className={cn("text-xl font-bold", chartType === 'income' ? 'text-green-500' : 'text-white')}>
                            ${totalAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Spending List */}
            <h3 className="text-lg font-bold text-white mb-4">Top Spending Categories</h3>
            <div className="space-y-4">
                {spendingByCategory.map((item, index) => {
                    const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : HelpCircle;
                    return (
                        <div key={index} className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-white")}>
                                {/* In a real app we'd map color properly but for now gray bg is simpler */}
                                <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-white">{item.name}</span>
                                    <span className="text-sm font-bold text-white">${item.value.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 w-8 text-right">{Math.round(item.percentage)}%</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
