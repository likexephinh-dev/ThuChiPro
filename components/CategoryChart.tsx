
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';
import { CHART_COLORS } from '../constants';

interface CategoryChartProps {
  transactions: Transaction[];
}

interface ChartData {
  name: string;
  value: number;
}

export default function CategoryChart({ transactions }: CategoryChartProps): React.ReactElement {
  const expenseData: ChartData[] = useMemo(() => {
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const formattedValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
      return (
        <div className="bg-primary p-2 border border-gray-600 rounded">
          <p className="text-text-secondary">{`${name} : ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Phân Tích Chi Tiêu</h2>
      {expenseData.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-text-secondary">Không có dữ liệu chi tiêu để hiển thị.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={5}
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
