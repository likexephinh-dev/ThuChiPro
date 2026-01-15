
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';

interface DailyTrendChartProps {
  transactions: Transaction[];
  startDate: string;
  endDate: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary p-3 border border-gray-600 rounded shadow-lg">
        <p className="label text-text-secondary">{`Ngày: ${label}`}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: ${formatCurrency(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DailyTrendChart({ transactions, startDate, endDate }: DailyTrendChartProps): React.ReactElement {

  const trendData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const data: { date: string, Thu: number, Chi: number }[] = [];
    const transactionsByDate: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      if (!transactionsByDate[t.date]) {
        transactionsByDate[t.date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        transactionsByDate[t.date].income += t.amount;
      } else {
        transactionsByDate[t.date].expense += t.amount;
      }
    });

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayData = transactionsByDate[dateString] || { income: 0, expense: 0 };
      data.push({
        date: new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        'Thu': dayData.income,
        'Chi': dayData.expense,
      });
    }
    
    return data;
  }, [transactions, startDate, endDate]);
  
  const yAxisFormatter = (tick: number) => {
    if (tick >= 1000000000) return `${(tick / 1000000000).toFixed(1)} Tỷ`;
    if (tick >= 1000000) return `${(tick / 1000000).toFixed(1)} Tr`;
    if (tick >= 1000) return `${(tick / 1000).toFixed(0)} K`;
    return tick.toString();
  };

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Biểu Đồ Dòng Tiền</h2>
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-text-secondary">Không có dữ liệu để hiển thị biểu đồ.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" tickFormatter={yAxisFormatter} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="Thu" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
            <Line type="monotone" dataKey="Chi" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
