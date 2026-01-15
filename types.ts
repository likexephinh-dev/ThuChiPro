
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id:string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
}
