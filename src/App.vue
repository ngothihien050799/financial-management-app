<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>💰 Financial Management Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
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
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Dashboard from "./pages/Dashboard.vue";
import IncomeExpense from "./pages/IncomeExpense.vue";
import Analytics from "./pages/Analytics.vue";
import { useTransactionStore } from "./stores/transactionStore";

const drawer = ref(false);
const currentPage = ref("Dashboard");
const store = useTransactionStore();

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

// Load transactions from Firebase when app mounts
onMounted(async () => {
  try {
    await store.loadTransactions();
  } catch (err) {
    console.error("Failed to load transactions:", err);
    // Falls back to sample data if Firebase is not configured
  }
});
</script>

<style scoped></style>
