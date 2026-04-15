<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>💰 Financial Management Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Wallet Selector -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" color="white" class="mr-4">
            <v-icon left>mdi-wallet</v-icon>
            {{ currentWallet?.name || "Chọn ví" }}
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="wallet in wallets"
            :key="wallet.id"
            @click="store.setCurrentWallet(wallet.id)"
          >
            <template v-slot:prepend>
              <v-list-item-title
                >{{ wallet.icon }} {{ wallet.name }}</v-list-item-title
              >
            </template>
            <template v-slot:append>
              <v-chip
                :color="currentWalletId === wallet.id ? 'primary' : 'default'"
                size="small"
              >
                {{ formatCurrency(wallet.balance) }}
              </v-chip>
            </template>
          </v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item @click="showAddWalletDialog = true">
            <template v-slot:prepend>
              <v-icon>mdi-plus</v-icon>
            </template>
            <v-list-item-title>Thêm ví mới</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :to="item.route"
          @click="currentPage = item.component"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <!-- Dashboard Component -->
        <dashboard v-if="currentPage === 'Dashboard'" />
        <!-- Income Expense Management -->
        <income-expense v-else-if="currentPage === 'IncomeExpense'" />
        <!-- Analytics -->
        <analytics v-else-if="currentPage === 'Analytics'" />
      </v-container>
    </v-main>

    <!-- Add Wallet Dialog -->
    <v-dialog v-model="showAddWalletDialog" persistent max-width="500">
      <v-card>
        <v-card-title>Thêm ví mới</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addNewWallet">
            <v-text-field
              v-model="newWallet.name"
              label="Tên ví"
              placeholder="Ví 1, Tiền nhà, Quỹ tiết kiệm..."
              outlined
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="newWallet.description"
              label="Mô tả"
              placeholder="Mô tả chi tiết về ví..."
              outlined
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="newWallet.icon"
              label="Icon (Emoji)"
              placeholder="💰, 🏠, 🏦, ..."
              outlined
              maxlength="2"
              class="mb-4"
            ></v-text-field>

            <div class="d-flex gap-2 justify-end">
              <v-btn variant="outlined" @click="showAddWalletDialog = false">
                Hủy
              </v-btn>
              <v-btn color="primary" @click="addNewWallet" :loading="isLoading">
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
    alert("Lỗi khi tạo ví. Vui lò bỏ lỡ khi thiếu Firebase.");
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

<style scoped></style>
