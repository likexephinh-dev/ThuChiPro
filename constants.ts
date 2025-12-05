
import { Category } from './types';

export const INITIAL_INCOME_CATEGORIES: Category[] = [
  { id: 'cat_inc_1', name: 'Vốn góp', type: 'income' },
  { id: 'cat_inc_2', name: 'Tiền gửi xe', type: 'income' },
];

export const INITIAL_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat_exp_1', name: 'Chi phí nhân viên', type: 'expense' },
  { id: 'cat_exp_2', name: 'Mua sắm', type: 'expense' },
  { id: 'cat_exp_3', name: 'Tiền điện', type: 'expense' },
  { id: 'cat_exp_4', name: 'Tiền thuê mặt bằng', type: 'expense' },
  { id: 'cat_exp_5', name: 'Khác', type: 'expense' },
];

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
