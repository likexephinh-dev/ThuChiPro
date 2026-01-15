import { create } from 'zustand';
import type { Category, Transaction } from '../types';

interface AppState {
    transactions: Transaction[];
    categories: Category[];
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    fetchData: () => Promise<void>;
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addCategory: (category: Category) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getTransactionsByDate: (date: Date) => Transaction[];
}

export const useStore = create<AppState>((set, get) => ({
    transactions: [],
    categories: [],

    // Initialize (fetch data)
    fetchData: async () => {
        const { data: cats } = await supabase.from('categories').select('*');
        const { data: txs } = await supabase.from('transactions').select('*');

        if (cats) set({ categories: cats });
        if (txs) set({ transactions: txs });
    },

    // Transaction Actions
    addTransaction: async (transaction) => {
        const { id, ...rest } = transaction; // Let Supabase gen ID or use provided if UUID
        // For simplicity in this local-first to DB migration, if ID is random string, omit it to let DB gen UUID
        // or we can just send it if we ensure it's UUID.
        // Actually, our current ID gen is Math.random which is NOT UUID. 
        // Better to let Supabase generate ID and return it.

        // Optimistic update
        set((state) => ({ transactions: [transaction, ...state.transactions] }));

        const { data, error } = await supabase.from('transactions').insert({
            amount: transaction.amount,
            type: transaction.type,
            category_id: transaction.categoryId,
            date: transaction.date,
            note: transaction.note
        }).select().single();

        if (data) {
            // Update the optimistic item with real ID from DB
            set((state) => ({
                transactions: state.transactions.map(t => t.id === transaction.id ? { ...t, id: data.id } : t)
            }));
        } else if (error) {
            console.error('Error adding transaction:', error);
            // Revert on error? For now just log.
        }
    },

    updateTransaction: async (id, updates) => {
        // Optimistic
        set((state) => ({
            transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
        }));

        const { error } = await supabase.from('transactions').update({
            amount: updates.amount,
            type: updates.type,
            category_id: updates.categoryId,
            date: updates.date,
            note: updates.note
        }).eq('id', id);

        if (error) console.error('Error updating transaction:', error);
    },

    deleteTransaction: async (id) => {
        set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) console.error('Error deleting transaction:', error);
    },

    // Category Actions
    addCategory: async (category) => {
        set((state) => ({ categories: [...state.categories, category] }));

        const { data, error } = await supabase.from('categories').insert({
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type
        }).select().single();

        if (data) {
            set((state) => ({
                categories: state.categories.map(c => c.id === category.id ? { ...c, id: data.id } : c)
            }));
        } else if (error) {
            console.error('Error adding category:', error);
        }
    },

    updateCategory: async (id, updates) => {
        set((state) => ({
            categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }));

        const { error } = await supabase.from('categories').update(updates).eq('id', id);
        if (error) console.error('Error updating category:', error);
    },

    deleteCategory: async (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) console.error('Error deleting category:', error);
    },

    getTransactionsByDate: () => {
        return get().transactions;
    }
}));
