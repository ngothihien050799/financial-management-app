<template>
  <v-app style="background-color: #fafbfc">
    <!-- Premium App Bar with Gradient -->
    <v-app-bar
      app
      elevation="4"
      style="background: linear-gradient(135deg, #1f3a93 0%, #2e5090 100%)"
    >
      <div class="d-flex align-center w-100">
        <div class="app-title">
          <v-icon size="28" class="mr-2">mdi-chart-line-variant</v-icon>
          <span class="font-weight-bold">Financial Dashboard</span>
        </div>

        <v-spacer></v-spacer>

        <!-- Wallet Selector - Premium -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="white"
              class="mr-4 wallet-btn"
              rounded
            >
              <v-icon left>mdi-wallet-outline</v-icon>
              <span class="font-weight-medium">{{
                currentWallet?.name || "Chọn ví"
              }}</span>
              <v-icon right size="18">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list class="wallet-menu">
            <v-list-item
              v-for="wallet in wallets"
              :key="wallet.id"
              @click="store.setCurrentWallet(wallet.id)"
              :class="{ 'wallet-active': currentWalletId === wallet.id }"
              class="wallet-item"
            >
              <template v-slot:prepend>
                <span class="wallet-icon">{{ wallet.icon }}</span>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ wallet.name }}
              </v-list-item-title>
              <template v-slot:append>
                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="
                      currentWalletId === wallet.id ? 'primary' : 'secondary'
                    "
                    text-color="white"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ formatCurrency(wallet.balance) }}
                  </v-chip>
                  <v-btn
                    v-if="wallet.id !== 'default' && wallets.length > 1"
                    icon
                    size="x-small"
                    color="error"
                    @click.stop="deleteWallet(wallet.id)"
                    class="ml-2"
                  >
                    <v-icon size="18">mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              @click="showAddWalletDialog = true"
              class="add-wallet-btn"
            >
              <template v-slot:prepend>
                <v-icon color="secondary">mdi-plus-circle</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium text-secondary">
                Thêm ví mới
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn icon @click="drawer = !drawer" variant="text" color="white">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Modern Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      elevation="4"
      class="modern-drawer"
    >
      <div class="drawer-header">
        <div class="d-flex align-center">
          <v-icon size="32" color="white">mdi-wallet</v-icon>
          <span class="ml-3 font-weight-bold text-h6">Menu</span>
        </div>
      </div>

      <v-divider class="my-4"></v-divider>

      <v-list>
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :to="item.route"
          @click="currentPage = item.component"
          class="menu-item"
          :class="{ 'menu-active': currentPage === item.component }"
        >
          <template v-slot:prepend>
            <v-icon
              :color="currentPage === item.component ? 'primary' : 'undefined'"
            >
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <!-- Dashboard Component -->
        <dashboard v-if="currentPage === 'Dashboard'" />
        <!-- Income Expense Management -->
        <income-expense v-else-if="currentPage === 'IncomeExpense'" />
        <!-- Analytics -->
        <analytics v-else-if="currentPage === 'Analytics'" />
      </v-container>
    </v-main>

    <!-- Add Wallet Dialog - Premium -->
    <v-dialog v-model="showAddWalletDialog" persistent max-width="500px">
      <v-card elevation="8" rounded="lg" class="add-wallet-card">
        <v-card-title class="gradient-title">
          <v-icon left>mdi-plus-circle</v-icon>
          Thêm ví mới
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="addNewWallet">
            <v-text-field
              v-model="newWallet.name"
              label="Tên ví"
              placeholder="Ví 1, Tiền nhà, Quỹ tiết kiệm..."
              variant="outlined"
              required
              class="mb-4"
              prepend-inner-icon="mdi-wallet"
              rounded
            ></v-text-field>

            <v-text-field
              v-model="newWallet.description"
              label="Mô tả"
              placeholder="Mô tả chi tiết về ví..."
              variant="outlined"
              class="mb-4"
              prepend-inner-icon="mdi-text"
              rounded
            ></v-text-field>

            <v-text-field
              v-model="newWallet.icon"
              label="Icon (Emoji)"
              placeholder="💰, 🏠, 🏦, ..."
              variant="outlined"
              maxlength="2"
              class="mb-4"
              prepend-inner-icon="mdi-emoticon-happy-outline"
              rounded
            ></v-text-field>

            <div class="d-flex gap-3 justify-end mt-6">
              <v-btn
                variant="outlined"
                color="primary"
                @click="showAddWalletDialog = false"
                rounded
                class="px-6"
              >
                Hủy
              </v-btn>
              <v-btn
                color="primary"
                @click="addNewWallet"
                :loading="isLoading"
                rounded
                class="px-6"
                elevation="2"
              >
                <v-icon left>mdi-check-circle</v-icon>
                Tạo ví
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Dashboard from "./pages/Dashboard.vue";
import IncomeExpense from "./pages/IncomeExpense.vue";
import Analytics from "./pages/Analytics.vue";
import { useTransactionStore } from "./stores/transactionStore";

const drawer = ref(false);
const currentPage = ref("Dashboard");
const showAddWalletDialog = ref(false);
const store = useTransactionStore();

const wallets = computed(() => store.getWallets());
const currentWalletId = computed(() => store.currentWalletId.value);
const currentWallet = computed(() => store.getCurrentWallet());
const isLoading = computed(() => store.isLoading.value);

const newWallet = ref({
  name: "",
  description: "",
  icon: "💰",
});

const menuItems = [
  {
    title: "Dashboard",
    icon: "mdi-home-outline",
    component: "Dashboard",
    route: "/",
  },
  {
    title: "Quản Lý Thu Chi",
    icon: "mdi-cash-multiple",
    component: "IncomeExpense",
    route: "/income-expense",
  },
  {
    title: "Thống Kê - Báo Cáo",
    icon: "mdi-chart-line",
    component: "Analytics",
    route: "/analytics",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

const addNewWallet = async () => {
  try {
    if (!newWallet.value.name.trim()) {
      alert("Vui lòng nhập tên ví");
      return;
    }

    await store.addWallet({
      name: newWallet.value.name,
      description: newWallet.value.description,
      icon: newWallet.value.icon || "💰",
      balance: 0,
    });

    // Reset form
    newWallet.value = {
      name: "",
      description: "",
      icon: "💰",
    };
    showAddWalletDialog.value = false;
  } catch (err) {
    console.error("Error adding wallet:", err);
    alert("Lỗi khi tạo ví. Vui lòng bỏ lỡ khi thiếu Firebase.");
  }
};

const deleteWallet = async (walletId: string) => {
  if (
    confirm(
      "Bạn có chắc chắn muốn xóa ví này? Tất cả giao dịch trong ví sẽ bị xóa.",
    )
  ) {
    try {
      await store.deleteWallet(walletId);
      alert("Xóa ví thành công");
    } catch (err) {
      console.error("Error deleting wallet:", err);
      alert(
        `Lỗi khi xóa ví: ${err instanceof Error ? err.message : "Lỗi không xác định"}`,
      );
    }
  }
};

// Load data when app mounts
onMounted(async () => {
  try {
    await store.loadWallets();
    await store.loadTransactions();
  } catch (err) {
    console.error("Failed to load data:", err);
  }
});
</script>

<style scoped>
/* Modern App Design */
.app-title {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.wallet-btn {
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  border-color: rgba(255, 255, 255, 0.6) !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.wallet-menu {
  border-radius: 12px;
}

.wallet-item {
  transition: all 0.2s ease;
}

.wallet-item:hover {
  background-color: rgba(31, 58, 147, 0.05);
}

.wallet-active {
  background-color: rgba(31, 58, 147, 0.1) !important;
  border-left: 4px solid #1f3a93;
}

.wallet-icon {
  font-size: 1.5rem;
  display: inline-block;
  margin-right: 12px;
}

.add-wallet-btn {
  transition: all 0.2s ease;
}

.add-wallet-btn:hover {
  background-color: rgba(6, 214, 160, 0.1);
}

.modern-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.drawer-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #1f3a93 0%, #2e5090 100%);
  color: white;
  border-radius: 0 0 16px 0;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(31, 58, 147, 0.08);
}

.menu-active {
  background-color: rgba(31, 58, 147, 0.12);
}

.main-content {
  background-color: #fafbfc;
}

.add-wallet-card {
  border-radius: 16px;
}

.gradient-title {
  background: linear-gradient(135deg, #1f3a93 0%, #06d6a0 100%);
  color: white;
  font-weight: 600;
}

/* Form improvements */
:deep(.v-text-field) {
  margin-bottom: 16px;
}

:deep(.v-text-field--outlined) .v-field {
  border-radius: 8px;
}

/* Dialog buttons */
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.3px;
}

/* Card styles */
:deep(.v-card) {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

:deep(.v-card):hover {
  box-shadow: 0 12px 24px rgba(31, 58, 147, 0.12) !important;
}

/* Responsive */
@media (max-width: 600px) {
  .app-title {
    font-size: 1.1rem;
  }

  .wallet-btn {
    padding: 0 12px !important;
  }
}
</style>
