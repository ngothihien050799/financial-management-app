<template>
  <div class="dashboard">
    <!-- Loading overlay -->
    <v-progress-linear
      v-if="store.isLoading.value"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear>

    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card class="metric-card income-card" elevation="2">
          <v-card-text>
            <div class="metric-label">Tổng Thu Nhập</div>
            <div class="metric-value">
              {{ formatCurrency(metrics.totalIncome) }}
            </div>
            <v-progress-linear
              value="100"
              color="green"
              class="mt-2"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="metric-card expense-card" elevation="2">
          <v-card-text>
            <div class="metric-label">Tổng Chi Tiêu</div>
            <div class="metric-value">
              {{ formatCurrency(metrics.totalExpense) }}
            </div>
            <v-progress-linear
              value="100"
              color="red"
              class="mt-2"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="metric-card balance-card" elevation="2">
          <v-card-text>
            <div class="metric-label">Số Dư</div>
            <div
              class="metric-value"
              :style="{ color: metrics.balance >= 0 ? '#4CAF50' : '#f44336' }"
            >
              {{ formatCurrency(metrics.balance) }}
            </div>
            <v-progress-linear
              :value="getBalancePercentage()"
              :color="metrics.balance >= 0 ? 'green' : 'red'"
              class="mt-2"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="metric-card stats-card" elevation="2">
          <v-card-text>
            <div class="metric-label">Số Giao Dịch</div>
            <div class="metric-value">{{ transactions.length }}</div>
            <small class="text-muted">Tổng cộng</small>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title>Chi Tiêu Theo Danh Mục</v-card-title>
          <v-card-text>
            <div id="expense-pie-chart" class="chart-container">
              <canvas ref="expensePieChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title>Thu Nhập Theo Danh Mục</v-card-title>
          <v-card-text>
            <div id="income-pie-chart" class="chart-container">
              <canvas ref="incomePieChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Xu Hướng Thu Chi Hàng Tháng</v-card-title>
          <v-card-text>
            <div id="monthly-trend-chart" class="chart-container">
              <canvas ref="monthlyChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Giao Dịch Gần Đây</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Danh Mục</th>
                  <th>Mô Tả</th>
                  <th>Số Tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="transaction in recentTransactions"
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
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import type { FinancialMetrics } from "@/types";
import Chart from "chart.js/auto";

const store = useTransactionStore();
const transactions = computed(() => store.getTransactions());
const metrics = computed<FinancialMetrics>(() => store.getMetrics());

const expensePieChart = ref<HTMLCanvasElement | null>(null);
const incomePieChart = ref<HTMLCanvasElement | null>(null);
const monthlyChart = ref<HTMLCanvasElement | null>(null);

const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5).reverse();
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const getBalancePercentage = () => {
  if (metrics.value.totalIncome === 0) return 0;
  return Math.min(
    (metrics.value.balance / metrics.value.totalIncome) * 100,
    100,
  );
};

const initializePieChart = (
  canvasRef: HTMLCanvasElement | null,
  data: any[],
  label: string,
  color: string,
) => {
  if (!canvasRef) return;

  new Chart(canvasRef, {
    type: "doughnut",
    data: {
      labels: data.map(
        (item) => `${item.category} (${item.percentage.toFixed(1)}%)`,
      ),
      datasets: [
        {
          data: data.map((item) => item.total),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#C9CBCF",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

const initializeLineChart = () => {
  if (!monthlyChart.value) return;

  const monthlyData = metrics.value.monthlyTrend;

  new Chart(monthlyChart.value, {
    type: "line",
    data: {
      labels: monthlyData.map((m) => m.month),
      datasets: [
        {
          label: "Thu Nhập",
          data: monthlyData.map((m) => m.income),
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Chi Tiêu",
          data: monthlyData.map((m) => m.expense),
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Số Dư",
          data: monthlyData.map((m) => m.balance),
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return new Intl.NumberFormat("vi-VN").format(value as number);
            },
          },
        },
      },
    },
  });
};

onMounted(() => {
  setTimeout(() => {
    initializePieChart(
      expensePieChart.value,
      metrics.value.expenseByCategory,
      "Chi Tiêu",
      "red",
    );
    initializePieChart(
      incomePieChart.value,
      metrics.value.incomeByCategory,
      "Thu Nhập",
      "green",
    );
    initializeLineChart();
  }, 100);
});
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.metric-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0;
}

.income-card {
  border-left: 4px solid #4caf50;
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.1) 0%,
    transparent 100%
  );
}

.expense-card {
  border-left: 4px solid #f44336;
  background: linear-gradient(
    135deg,
    rgba(244, 67, 54, 0.1) 0%,
    transparent 100%
  );
}

.balance-card {
  border-left: 4px solid #2196f3;
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.1) 0%,
    transparent 100%
  );
}

.stats-card {
  border-left: 4px solid #ff9800;
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.1) 0%,
    transparent 100%
  );
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

.text-muted {
  color: #999;
}
</style>
