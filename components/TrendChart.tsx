import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export default function TrendChart({ transactions }: Props) {
  const monthlyData = transactions.reduce((acc, tx) => {
    const month = tx.date.substring(0, 7);
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (tx.type === 'income') {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
    } else {
      acc.push({
        month,
        income: tx.type === 'income' ? tx.amount : 0,
        expense: tx.type === 'expense' ? tx.amount : 0
      });
    }
    return acc;
  }, [] as { month: string; income: number; expense: number }[]);

  monthlyData.sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="bg-secondary rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">📈 Xu hướng theo tháng</h3>
      
      {monthlyData.length === 0 ? (
        <p className="text-center text-text-secondary py-8">Chưa có dữ liệu</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'}
              contentStyle={{ backgroundColor: '#21222C', border: '1px solid #444' }}
            />
            <Legend />
            <Bar dataKey="income" fill="#16a34a" name="Thu" />
            <Bar dataKey="expense" fill="#dc2626" name="Chi" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
