
import React from 'react';
import { BalanceIcon, ExpenseIcon, IncomeIcon } from './icons';

interface SummaryCardProps {
  title: string;
  amount: number;
  type?: 'income' | 'expense' | 'balance';
}

export default function SummaryCard({ title, amount, type }: SummaryCardProps): React.ReactElement {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  let amountColorClass = 'text-text-primary';
  let icon: React.ReactNode;

  if (type === 'income') {
    amountColorClass = 'text-income';
    icon = <IncomeIcon />;
  } else if (type === 'expense') {
    amountColorClass = 'text-expense';
    icon = <ExpenseIcon />;
  } else if (type === 'balance') {
    icon = <BalanceIcon />;
    if (amount < 0) {
      amountColorClass = 'text-expense';
    } else if (amount > 0) {
      amountColorClass = 'text-income';
    }
  }

  return (
    <div className="bg-secondary p-5 rounded-lg shadow-lg flex items-center gap-4 transition-transform transform hover:scale-105 duration-300">
      <div className="bg-primary p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-text-secondary text-sm">{title}</p>
        <p className={`text-2xl font-bold ${amountColorClass}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
