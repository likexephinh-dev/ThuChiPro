import React from 'react';
import { Transaction } from '../types';
import { DeleteIcon, EditIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, deleteTransaction, onEditTransaction }: TransactionListProps): React.ReactElement {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Lịch Sử Giao Dịch</h2>
      {transactions.length === 0 ? (
        <p className="text-text-secondary text-center py-8">Không có giao dịch nào trong khoảng thời gian này.</p>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-primary p-3 rounded-md hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-income' : 'bg-expense'}`}></div>
                 <div>
                    <p className="font-semibold whitespace-pre-wrap">{t.description}</p>
                    <p className="text-sm text-text-secondary">{t.category.name} - {new Date(t.date).toLocaleDateString('vi-VN')}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <button onClick={() => onEditTransaction(t)} className="text-gray-500 hover:text-accent" aria-label={`Chỉnh sửa giao dịch ${t.description}`}>
                  <EditIcon />
                </button>
                <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-expense" aria-label={`Xóa giao dịch ${t.description}`}>
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}