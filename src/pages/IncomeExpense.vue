<template>
  <div class="income-expense">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Quản Lý Thu Chi</v-card-title>
          <v-card-text>
            <v-alert
              v-if="store.currentWalletId.value === 'all'"
              type="warning"
              class="mb-4"
            >
              <v-icon left>mdi-information-outline</v-icon>
              Vui lòng chọn một ví cụ thể để thêm giao dịch
            </v-alert>

            <div class="d-flex gap-2 mb-4 mt-5">
              <v-btn
                class="income-btn flex-grow-1"
                size="large"
                elevation="2"
                :disabled="store.currentWalletId.value === 'all'"
                @click="openAddDialog('income')"
              >
                <v-icon left>mdi-plus-circle</v-icon>
                Thêm Thu Nhập
              </v-btn>
              <v-btn
                class="expense-btn flex-grow-1"
                size="large"
                elevation="2"
                :disabled="store.currentWalletId.value === 'all'"
                @click="openAddDialog('expense')"
              >
                <v-icon left>mdi-minus-circle</v-icon>
                Thêm Chi Tiêu
              </v-btn>
            </div>

            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filterText"
                  label="Tìm kiếm"
                  placeholder="Tìm kiếm giao dịch..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filterType"
                  :items="typeOptions"
                  label="Loại"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filterCategory"
                  :items="categoryOptions"
                  label="Danh Mục"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Danh Sách Giao Dịch</v-card-title>
          <v-card-text>
            <!-- Loading indicator -->
            <v-progress-linear
              v-if="store.isLoading.value"
              indeterminate
              color="primary"
              class="mb-4"
            ></v-progress-linear>

            <!-- Error message -->
            <v-alert v-if="store.error.value" type="error" class="mb-4">{{
              store.error.value
            }}</v-alert>
            <v-table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Danh Mục</th>
                  <th>Mô Tả</th>
                  <th>Số Tiền</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                >
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>
                    <v-chip
                      :color="transaction.type === 'income' ? 'green' : 'red'"
                      text-color="white"
                      size="small"
                    >
                      {{ transaction.type === "income" ? "Thu" : "Chi" }}
                    </v-chip>
                  </td>
                  <td>{{ transaction.category }}</td>
                  <td>{{ transaction.description }}</td>
                  <td
                    :style="{
                      color: transaction.type === 'income' ? 'green' : 'red',
                      fontWeight: 'bold',
                    }"
                  >
                    {{ transaction.type === "income" ? "+" : "-" }}
                    {{ formatCurrency(transaction.amount) }}
                  </td>
                  <td>
                    <v-btn
                      icon
                      size="small"
                      color="primary"
                      @click="editTransaction(transaction)"
                      class="mr-2"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="deleteTransactionConfirm(transaction.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title
          >{{ editingId ? "Chỉnh Sửa" : "Thêm" }} Giao Dịch</v-card-title
        >
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveTransaction">
            <v-select
              v-model="formData.type"
              :items="typeOptions"
              label="Loại"
              variant="outlined"
              class="mb-4"
              :rules="[(v) => !!v || 'Loại là bắt buộc']"
            ></v-select>

            <v-select
              v-model="formData.category"
              :items="getRelevantCategories()"
              label="Danh Mục"
              variant="outlined"
              class="mb-4"
              :rules="[(v) => !!v || 'Danh Mục là bắt buộc']"
            ></v-select>

            <v-text-field
              v-model="formData.description"
              label="Mô Tả"
              variant="outlined"
              class="mb-4"
              :rules="[(v) => !!v || 'Mô Tả là bắt buộc']"
            ></v-text-field>

            <v-text-field
              v-model.number="formData.amount"
              label="Số Tiền"
              type="number"
              variant="outlined"
              class="mb-4"
              :rules="[
                (v) => !!v || 'Số Tiền là bắt buộc',
                (v) => v > 0 || 'Số Tiền phải lớn hơn 0',
              ]"
            ></v-text-field>

            <v-text-field
              v-model="formData.date"
              type="date"
              label="Ngày"
              variant="outlined"
              class="mb-4"
              :rules="[(v) => !!v || 'Ngày là bắt buộc']"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog" :disabled="store.isLoading.value"
            >Hủy</v-btn
          >
          <v-btn
            color="primary"
            @click="saveTransaction"
            :loading="store.isLoading.value"
            >Lưu</v-btn
          >
        </v-card-actions>
        <v-card-text v-if="store.error.value" class="error-text">
          <v-alert type="error" class="mt-2">{{ store.error.value }}</v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="300px">
      <v-card>
        <v-card-title>Xác Nhận Xóa</v-card-title>
        <v-card-text>Bạn có chắc chắn muốn xóa giao dịch này?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="showDeleteConfirm = false"
            :disabled="store.isLoading.value"
            >Hủy</v-btn
          >
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="store.isLoading.value"
            >Xóa</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import type { Transaction } from "@/types";

const store = useTransactionStore();
const transactions = computed(() => store.getTransactions());

const showDialog = ref(false);
const showDeleteConfirm = ref(false);
const filterText = ref("");
const filterType = ref<"income" | "expense" | null>(null);
const filterCategory = ref<string | null>(null);
const editingId = ref<string | null>(null);
const deleteId = ref<string | null>(null);
const form = ref();

const typeOptions = [
  { title: "Thu Nhập", value: "income" },
  { title: "Chi Tiêu", value: "expense" },
];

const incomeCategories = ["Lương", "Phụ cấp", "Tiền thưởng", "Đầu tư", "Khác"];

const expenseCategories = [
  "Ăn uống",
  "Giao thông",
  "Sức khỏe",
  "Giáo dục",
  "Giải trí",
  "Mua sắm",
  "Nhà cửa",
  "Khác",
];

const categoryOptions = computed(() => {
  const allCategories = [
    ...new Set([...incomeCategories, ...expenseCategories]),
  ];
  return allCategories.sort();
});

const formData = ref({
  type: "expense" as "income" | "expense",
  category: "",
  description: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
});

const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    const matchText =
      t.description.toLowerCase().includes(filterText.value.toLowerCase()) ||
      t.category.toLowerCase().includes(filterText.value.toLowerCase());
    const matchType = !filterType.value || t.type === filterType.value;
    const matchCategory =
      !filterCategory.value || t.category === filterCategory.value;
    return matchText && matchType && matchCategory;
  });
});

const getRelevantCategories = () => {
  return formData.value.type === "income"
    ? incomeCategories
    : expenseCategories;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const openAddDialog = (type: "income" | "expense") => {
  editingId.value = null;
  formData.value = {
    type,
    category: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  };
  showDialog.value = true;
};

const editTransaction = (transaction: Transaction) => {
  editingId.value = transaction.id;
  formData.value = {
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date.split("T")[0],
  };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  editingId.value = null;
};

const saveTransaction = async () => {
  if (!form.value.validate()) return;

  try {
    if (editingId.value) {
      await store.updateTransaction(editingId.value, {
        ...formData.value,
        date: new Date(formData.value.date).toISOString(),
      });
    } else {
      // Use first wallet if 'all' is selected
      const walletId =
        store.currentWalletId.value === "all"
          ? store.getWallets()[0]?.id || "default"
          : store.currentWalletId.value;

      await store.addTransaction({
        ...formData.value,
        walletId: walletId,
        date: new Date(formData.value.date).toISOString(),
      });
    }

    closeDialog();

    // Show success notification
    if (store.error.value) {
      store.error.value = null;
    }
  } catch (err: any) {
    console.error("Error saving transaction:", err);
    // Error is already set in store.error
  }
};

const deleteTransactionConfirm = (id: string) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (deleteId.value) {
    try {
      await store.deleteTransaction(deleteId.value);
    } catch (err: any) {
      console.error("Error deleting transaction:", err);
      // Error is already set in store.error
    }
  }
  showDeleteConfirm.value = false;
  deleteId.value = null;
};
</script>

<style scoped>
.income-expense {
  padding: 0;
}

/* Card styling */
:deep(.v-card) {
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

:deep(.v-card):hover {
  box-shadow: 0 8px 16px rgba(31, 58, 147, 0.12) !important;
}

:deep(.v-card-title) {
  background: linear-gradient(135deg, #1f3a93 0%, #2e5090 100%);
  color: white;
  padding: 20px 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Button styling */
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

/* Income button */
:deep(.income-btn) {
  background: linear-gradient(135deg, #4caf50 0%, #06d6a0 100%) !important;
}

:deep(.income-btn):hover {
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3) !important;
  transform: translateY(-2px);
}

:deep(.expense-btn) {
  background: linear-gradient(135deg, #f44336 0%, #ff6f00 100%) !important;
}

:deep(.expense-btn):hover {
  box-shadow: 0 8px 16px rgba(244, 67, 54, 0.3) !important;
  transform: translateY(-2px);
}

/* Form fields */
:deep(.v-text-field) {
  border-radius: 8px;
}

:deep(.v-select) {
  border-radius: 8px;
}

/* Table styling */
:deep(.v-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-table thead tr) {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8eaf0 100%);
  font-weight: 700;
  color: #1f3a93;
}

:deep(.v-table tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #e8eaed;
}

:deep(.v-table tbody tr):hover {
  background-color: rgba(31, 58, 147, 0.04);
}

:deep(.v-chip) {
  font-weight: 600;
}

/* Dialog styling */
:deep(.v-dialog .v-card) {
  border-radius: 16px;
}

:deep(.v-dialog .v-card-title) {
  background: linear-gradient(135deg, #1f3a93 0%, #06d6a0 100%);
}

/* Error styling */
.error-text {
  color: #e53935;
  font-size: 14px;
  font-weight: 500;
}

/* Action buttons in table */
:deep(.v-btn.action-btn) {
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.v-btn.action-btn):hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 600px) {
  :deep(.v-card-text) {
    padding: 16px;
  }
}
</style>
