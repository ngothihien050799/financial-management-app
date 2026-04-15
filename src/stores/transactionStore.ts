import { reactive, ref, computed } from 'vue'
import type { Transaction, FinancialMetrics, MonthlyData, CategoryStats } from '@/types'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  getTransactions: () => Transaction[]
  getMetrics: () => FinancialMetrics
  loadTransactions: () => Promise<void>
}

const isLoading = ref(false)
const error = ref<string | null>(null)

const state = reactive<{ transactions: Transaction[] }>({
  transactions: [
    {
      id: '1',
      type: 'income',
      category: 'Lương',
      amount: 15000000,
      description: 'Lương tháng 3',
      date: new Date(2024, 2, 1).toISOString(),
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'expense',
      category: 'Ăn uống',
      amount: 2000000,
      description: 'Ăn cơm hàng ngày',
      date: new Date(2024, 2, 5).toISOString(),
      createdAt: new Date()
    },
    {
      id: '3',
      type: 'expense',
      category: 'Giao thông',
      amount: 500000,
      description: 'Xăng xe',
      date: new Date(2024, 2, 6).toISOString(),
      createdAt: new Date()
    },
    {
      id: '4',
      type: 'income',
      category: 'Phụ cấp',
      amount: 2000000,
      description: 'Thưởng hiệu suất',
      date: new Date(2024, 2, 10).toISOString(),
      createdAt: new Date()
    },
    {
      id: '5',
      type: 'expense',
      category: 'Sức khỏe',
      amount: 800000,
      description: 'Khám sức khỏe định kỳ',
      date: new Date(2024, 2, 12).toISOString(),
      createdAt: new Date()
    }
  ]
})

const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  isLoading.value = true
  error.value = null
  try {
    const transactionsRef = collection(db, 'transactions')
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      createdAt: Timestamp.now()
    })

    // Thêm vào state UI
    const newTransaction: Transaction = {
      ...transaction,
      id: docRef.id,
      createdAt: new Date()
    }
    state.transactions.push(newTransaction)
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi thêm giao dịch'
    console.error('Error adding transaction:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const deleteTransaction = async (id: string) => {
  isLoading.value = true
  error.value = null
  try {
    await deleteDoc(doc(db, 'transactions', id))

    // Xóa từ state UI
    const index = state.transactions.findIndex(t => t.id === id)
    if (index > -1) {
      state.transactions.splice(index, 1)
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi xóa giao dịch'
    console.error('Error deleting transaction:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
  isLoading.value = true
  error.value = null
  try {
    const transactionRef = doc(db, 'transactions', id)
    const dataToUpdate: any = { ...updatedData }

    // Convert date to Timestamp if it exists
    if (dataToUpdate.date) {
      dataToUpdate.date = Timestamp.fromDate(new Date(dataToUpdate.date))
    }

    await updateDoc(transactionRef, dataToUpdate)

    // Cập nhật state UI
    const transaction = state.transactions.find(t => t.id === id)
    if (transaction) {
      Object.assign(transaction, updatedData)
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi cập nhật giao dịch'
    console.error('Error updating transaction:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const loadTransactions = async () => {
  isLoading.value = true
  error.value = null
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(transactionsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)

    state.transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      type: doc.data().type,
      category: doc.data().category,
      amount: doc.data().amount,
      description: doc.data().description,
      date: doc.data().date?.toDate?.()?.toISOString() || new Date().toISOString(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi tải giao dịch'
    console.error('Error loading transactions:', err)
    // Giữ dữ liệu local nếu Firebase không thể tải
  } finally {
    isLoading.value = false
  }
}

const getTransactions = () => state.transactions

const calculateCategoryStats = (type: 'income' | 'expense'): CategoryStats[] => {
  const filtered = state.transactions.filter(t => t.type === type)
  const grouped = groupedTransactions(filtered)
  
  const total = filtered.reduce((sum, t) => sum + t.amount, 0)
  
  return Object.entries(grouped).map(([category, transactions]) => {
    const categoryTotal = transactions.reduce((sum, t) => sum + t.amount, 0)
    return {
      category,
      total: categoryTotal,
      count: transactions.length,
      percentage: total > 0 ? (categoryTotal / total) * 100 : 0
    }
  })
}

const groupedTransactions = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = []
      }
      acc[transaction.category].push(transaction)
      return acc
    },
    {} as Record<string, Transaction[]>
  )
}

const getMonthlyTrend = (): MonthlyData[] => {
  const monthlyData: Record<string, { income: number; expense: number }> = {}
  
  state.transactions.forEach(t => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 }
    }
    
    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount
    } else {
      monthlyData[monthKey].expense += t.amount
    }
  })
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      balance: data.income - data.expense
    }))
}

const getMetrics = (): FinancialMetrics => {
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeByCategory: calculateCategoryStats('income'),
    expenseByCategory: calculateCategoryStats('expense'),
    monthlyTrend: getMonthlyTrend()
  }
}

export const useTransactionStore = () => ({
  state,
  isLoading,
  error,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getTransactions,
  getMetrics,
  loadTransactions
})
