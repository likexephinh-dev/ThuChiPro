import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export default function Summary({ transactions }: Props) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-secondary rounded-2xl p-6 text-center shadow-lg">
        <div className="text-text-secondary text-sm mb-1">Thu</div>
        <div className="text-2xl font-bold text-income">
          {formatCurrency(totalIncome)} đ
        </div>
      </div>

      <div className="bg-secondary rounded-2xl p-6 text-center shadow-lg">
        <div className="text-text-secondary text-sm mb-1">Chi</div>
        <div className="text-2xl font-bold text-expense">
          {formatCurrency(totalExpense)} đ
        </div>
      </div>

      <div className="bg-secondary rounded-2xl p-6 text-center shadow-lg">
        <div className="text-text-secondary text-sm mb-1">Số dư</div>
        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-accent' : 'text-expense'}`}>
          {formatCurrency(balance)} đ
        </div>
      </div>
    </div>
  );
}
