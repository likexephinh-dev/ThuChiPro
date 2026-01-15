import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../types';
import { CHART_COLORS } from '../constants';
import { useState } from 'react';

interface Props {
  transactions: Transaction[];
}

export default function ExpenseChart({ transactions }: Props) {
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const filteredTransactions = transactions.filter(t => t.type === chartType);
  
  const categoryData = filteredTransactions.reduce((acc, tx) => {
    const existing = acc.find(item => item.name === tx.category.name);
    if (existing) {
      existing.value += tx.amount;
    } else {
      acc.push({ name: tx.category.name, value: tx.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="bg-secondary rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary">📊 Phân bổ</h3>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as 'expense' | 'income')}
          className="px-3 py-1 bg-primary border border-gray-700 rounded-lg text-text-primary text-sm focus:outline-none"
        >
          <option value="expense">Chi tiêu</option>
          <option value="income">Thu nhập</option>
        </select>
      </div>

      {categoryData.length === 0 ? (
        <p className="text-center text-text-secondary py-8">Chưa có dữ liệu</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
