import { Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  filterMonth: string;
  onFilterChange: (month: string) => void;
}

export default function TransactionList({ transactions, onDelete, filterMonth, onFilterChange }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="bg-secondary rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">📋 Danh sách giao dịch</h2>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-1 bg-primary border border-gray-700 rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-text-secondary py-8">Chưa có giao dịch nào</p>
        ) : (
          transactions.map(tx => (
            <div
              key={tx.id}
              className={`flex justify-between items-start p-4 rounded-xl border-l-4 ${
                tx.type === 'income' 
                  ? 'bg-primary border-income' 
                  : 'bg-primary border-expense'
              }`}
            >
              <div className="flex-1">
                <div className="font-semibold text-text-primary">
                  {tx.description || tx.category.name}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {tx.category.name} • {new Date(tx.date).toLocaleDateString('vi-VN')}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`font-bold text-lg ${
                  tx.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)} đ
                </span>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="text-text-secondary hover:text-expense transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
