export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    icon: string; // We'll use Lucide icon names or similar
    color: string; // Tailwind color class or hex
    type: TransactionType;
}

export interface AppState {
    transactions: Transaction[];
    categories: Category[];
    fetchData: () => Promise<void>;
    addTransaction: (transaction: Transaction) => void;
}

export interface Transaction {
    id: string;
    amount: number;
    categoryId: string;
    date: string; // ISO string
    note?: string;
    type: TransactionType;
}
