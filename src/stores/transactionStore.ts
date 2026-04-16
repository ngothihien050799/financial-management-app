import { reactive, ref } from 'vue'
import type { Transaction, Wallet, FinancialMetrics, MonthlyData, CategoryStats } from '@/types'
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

const isLoading = ref(false)
const error = ref<string | null>(null)
const currentWalletId = ref<string>('all')

const state = reactive<{ wallets: Wallet[]; transactions: Transaction[] }>({
  wallets: [
    {
      id: 'default',
      name: 'Ví Chính',
      description: 'Ví chính',
      icon: '💰',
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  transactions: [
    {
      id: '1',
      walletId: 'default',
      type: 'income',
      category: 'Lương',
      amount: 10000000,
      description: 'Lương tháng',
      date: new Date(2024, 2, 1).toISOString(),
      createdAt: new Date()
    },
    {
      id: '2',
      walletId: 'default',
      type: 'expense',
      category: 'Ăn uống',
      amount: 1000000,
      description: 'Ăn cơm',
      date: new Date(2024, 2, 5).toISOString(),
      createdAt: new Date()
    }
  ]
})

// Initialize current wallet - defaults to showing all wallets
if (!currentWalletId.value || currentWalletId.value !== 'all') {
  currentWalletId.value = 'all'
}


// Wallet Methods
const addWallet = async (wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  isLoading.value = true
  error.value = null
  try {
    const walletsRef = collection(db, 'wallets')
    const docRef = await addDoc(walletsRef, {
      ...wallet,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    const newWallet: Wallet = {
      ...wallet,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    state.wallets.push(newWallet)
    currentWalletId.value = newWallet.id
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi tạo ví'
    console.error('Error adding wallet:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const deleteWallet = async (walletId: string) => {
  isLoading.value = true
  error.value = null
  try {
    if (state.wallets.length <= 1) {
      throw new Error('Phải giữ lại ít nhất 1 ví')
    }

    await deleteDoc(doc(db, 'wallets', walletId))

    // Xóa tất cả transactions trong wallet
    const walletTransactions = state.transactions.filter(t => t.walletId === walletId)
    for (const t of walletTransactions) {
      await deleteDoc(doc(db, 'transactions', t.id))
    }

    // Cập nhật state
    const walletIndex = state.wallets.findIndex(w => w.id === walletId)
    if (walletIndex > -1) {
      state.wallets.splice(walletIndex, 1)
    }

    state.transactions = state.transactions.filter(t => t.walletId !== walletId)

    if (currentWalletId.value === walletId) {
      currentWalletId.value = state.wallets[0]?.id || 'default'
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi xóa ví'
    console.error('Error deleting wallet:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const updateWallet = async (walletId: string, updates: Partial<Wallet>) => {
  isLoading.value = true
  error.value = null
  try {
    const walletRef = doc(db, 'wallets', walletId)
    const dataToUpdate = { ...updates, updatedAt: Timestamp.now() }
    await updateDoc(walletRef, dataToUpdate)

    const wallet = state.wallets.find(w => w.id === walletId)
    if (wallet) {
      Object.assign(wallet, updates)
      wallet.updatedAt = new Date()
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi cập nhật ví'
    console.error('Error updating wallet:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const setCurrentWallet = (walletId: string) => {
  const wallet = state.wallets.find(w => w.id === walletId)
  if (wallet) {
    currentWalletId.value = walletId
  }
}

// Transaction Methods

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

    const newTransaction: Transaction = {
      ...transaction,
      id: docRef.id,
      createdAt: new Date()
    }
    state.transactions.push(newTransaction)
    
    // Update wallet balance
    updateWalletBalance(transaction.walletId)
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
    const transaction = state.transactions.find(t => t.id === id)
    if (!transaction) throw new Error('Giao dịch không tồn tại')

    await deleteDoc(doc(db, 'transactions', id))

    const index = state.transactions.findIndex(t => t.id === id)
    if (index > -1) {
      const deleted = state.transactions.splice(index, 1)[0]
      updateWalletBalance(deleted.walletId)
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
    const transaction = state.transactions.find(t => t.id === id)
    if (!transaction) throw new Error('Giao dịch không tồn tại')

    const transactionRef = doc(db, 'transactions', id)
    const dataToUpdate: any = { ...updatedData }

    if (dataToUpdate.date) {
      dataToUpdate.date = Timestamp.fromDate(new Date(dataToUpdate.date))
    }

    await updateDoc(transactionRef, dataToUpdate)

    Object.assign(transaction, updatedData)
    updateWalletBalance(transaction.walletId)
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi cập nhật giao dịch'
    console.error('Error updating transaction:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const updateWalletBalance = (walletId: string) => {
  const wallet = state.wallets.find(w => w.id === walletId)
  if (wallet) {
    const walletTransactions = state.transactions.filter(t => t.walletId === walletId)
    const income = walletTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = walletTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    wallet.balance = income - expense
  }
}

// Get Methods
const getWallets = () => state.wallets
const getCurrentWallet = () => state.wallets.find(w => w.id === currentWalletId.value)
const getTransactionsByWallet = (walletId: string) => 
  state.transactions.filter(t => t.walletId === walletId)

const getTransactions = () => currentWalletId.value === 'all' 
  ? state.transactions 
  : getTransactionsByWallet(currentWalletId.value)

const loadWallets = async () => {
  isLoading.value = true
  error.value = null
  try {
    const walletsRef = collection(db, 'wallets')
    const querySnapshot = await getDocs(walletsRef)
    
    state.wallets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      icon: doc.data().icon,
      balance: doc.data().balance || 0,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }))

    if (state.wallets.length > 0 && !currentWalletId.value) {
      currentWalletId.value = state.wallets[0].id
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi tải ví'
    console.error('Error loading wallets:', err)
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
      walletId: doc.data().walletId || 'default',
      type: doc.data().type,
      category: doc.data().category,
      amount: doc.data().amount,
      description: doc.data().description,
      date: doc.data().date?.toDate?.()?.toISOString() || new Date().toISOString(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))

    // Update wallet balances
    state.wallets.forEach(wallet => {
      updateWalletBalance(wallet.id)
    })
  } catch (err: any) {
    error.value = err.message || 'Lỗi khi tải giao dịch'
    console.error('Error loading transactions:', err)
  } finally {
    isLoading.value = false
  }
}

// Metrics Methods

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

const calculateCategoryStats = (type: 'income' | 'expense', walletId?: string): CategoryStats[] => {
  const filtered = walletId 
    ? state.transactions.filter(t => t.walletId === walletId && t.type === type)
    : state.transactions.filter(t => t.type === type)
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

const getMonthlyTrend = (walletId?: string): MonthlyData[] => {
  const monthlyData: Record<string, { income: number; expense: number }> = {}

  const walletTransactions = walletId 
    ? state.transactions.filter(t => t.walletId === walletId)
    : state.transactions
    
  walletTransactions.forEach(t => {
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
  // If currentWalletId is empty string, show all wallets
  const useAllWallets = !currentWalletId.value || currentWalletId.value === 'all'
  const walletTransactions = useAllWallets 
    ? state.transactions 
    : getTransactions()

  const totalIncome = walletTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = walletTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeByCategory: calculateCategoryStats('income', useAllWallets ? undefined : currentWalletId.value),
    expenseByCategory: calculateCategoryStats('expense', useAllWallets ? undefined : currentWalletId.value),
    monthlyTrend: getMonthlyTrend(useAllWallets ? undefined : currentWalletId.value)
  }
}

export const useTransactionStore = () => ({
  state,
  isLoading,
  error,
  currentWalletId,
  
  // Wallet methods
  addWallet,
  deleteWallet,
  updateWallet,
  setCurrentWallet,
  getWallets,
  getCurrentWallet,
  
  // Transaction methods
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getTransactions,
  getTransactionsByWallet,
  getMetrics,
  
  // Load methods
  loadWallets,
  loadTransactions
})
