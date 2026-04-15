export interface Wallet {
  id: string
  name: string
  description: string
  icon: string
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  walletId: string
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
  walletId?: string
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
  searchText?: string
}
