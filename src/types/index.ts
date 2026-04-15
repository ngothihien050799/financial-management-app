export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  createdAt: Date
}

export interface CategoryStats {
  category: string
  total: number
  count: number
  percentage: number
}

export interface FinancialMetrics {
  totalIncome: number
  totalExpense: number
  balance: number
  incomeByCategory: CategoryStats[]
  expenseByCategory: CategoryStats[]
  monthlyTrend: MonthlyData[]
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
  searchText?: string
}
