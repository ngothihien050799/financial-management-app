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
import { ref, computed, onMounted, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import type { FinancialMetrics } from "@/types";
import Chart from "chart.js/auto";

const store = useTransactionStore();
const transactions = computed(() => store.getTransactions());
const metrics = computed<FinancialMetrics>(() => store.getMetrics());

const expensePieChart = ref<HTMLCanvasElement | null>(null);
const incomePieChart = ref<HTMLCanvasElement | null>(null);
const monthlyChart = ref<HTMLCanvasElement | null>(null);

const chartInstances = ref<{
  expense?: Chart;
  income?: Chart;
  monthly?: Chart;
}>({});

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

const destroyCharts = () => {
  if (chartInstances.value.expense) {
    chartInstances.value.expense.destroy();
  }
  if (chartInstances.value.income) {
    chartInstances.value.income.destroy();
  }
  if (chartInstances.value.monthly) {
    chartInstances.value.monthly.destroy();
  }
};

const initializePieChart = (
  canvasRef: HTMLCanvasElement | null,
  data: any[],
  label: string,
  color: string,
  chartType: "expense" | "income",
) => {
  if (!canvasRef) return;

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B88B",
    "#A9DFBF",
  ];

  const chart = new Chart(canvasRef, {
    type: "doughnut",
    data: {
      labels: data.map(
        (item) => `${item.category} (${item.percentage.toFixed(1)}%)`,
      ),
      datasets: [
        {
          data: data.map((item) => item.total),
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 3,
          hoverBorderWidth: 5,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1000,
        easing: "easeInOutQuart",
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 13, weight: "normal" },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
          },
          onClick: null,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function (context: any) {
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed);
              return `${context.label.split("(")[0].trim()}: ${value}`;
            },
          },
        },
      },
    },
  });

  if (chartType === "expense") {
    chartInstances.value.expense = chart;
  } else {
    chartInstances.value.income = chart;
  }
};

const initializeLineChart = () => {
  if (!monthlyChart.value) return;

  const monthlyData = metrics.value.monthlyTrend;

  const chart = new Chart(monthlyChart.value, {
    type: "line",
    data: {
      labels: monthlyData.map((m) => m.month),
      datasets: [
        {
          label: "Thu Nhập",
          data: monthlyData.map((m) => m.income),
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          borderWidth: 3,
          tension: 0.5,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#4CAF50",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
        {
          label: "Chi Tiêu",
          data: monthlyData.map((m) => m.expense),
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.15)",
          borderWidth: 3,
          tension: 0.5,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#f44336",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
        {
          label: "Số Dư",
          data: monthlyData.map((m) => m.balance),
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.15)",
          borderWidth: 3,
          tension: 0.5,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#2196F3",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      animation: {
        duration: 1500,
        easing: "easeInOutQuart",
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 13, weight: "normal" },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
          },
          onClick: null,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function (context: any) {
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
              return `${context.dataset.label}: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
          ticks: {
            font: { size: 12 },
            callback: function (value) {
              return new Intl.NumberFormat("vi-VN").format(value as number);
            },
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            font: { size: 12 },
          },
        },
      },
    },
  });

  chartInstances.value.monthly = chart;
};

const initializeCharts = () => {
  destroyCharts();
  setTimeout(() => {
    initializePieChart(
      expensePieChart.value,
      metrics.value.expenseByCategory,
      "Chi Tiêu",
      "red",
      "expense",
    );
    initializePieChart(
      incomePieChart.value,
      metrics.value.incomeByCategory,
      "Thu Nhập",
      "green",
      "income",
    );
    initializeLineChart();
  }, 100);
};

onMounted(() => {
  initializeCharts();
});

watch(
  () => store.currentWalletId.value,
  () => {
    initializeCharts();
  },
);
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.metric-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, currentColor, transparent);
}

.metric-label {
  font-size: 12px;
  color: #9e9e9e;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 700;
}

.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin: 10px 0;
  background: linear-gradient(135deg, #333 0%, #555 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.income-card {
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.12) 0%,
    rgba(76, 175, 80, 0.02) 100%
  );
  border-left: 5px solid #4caf50;
}

.income-card .metric-value {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.expense-card {
  background: linear-gradient(
    135deg,
    rgba(244, 67, 54, 0.12) 0%,
    rgba(244, 67, 54, 0.02) 100%
  );
  border-left: 5px solid #f44336;
}

.expense-card .metric-value {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.balance-card {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.12) 0%,
    rgba(33, 150, 243, 0.02) 100%
  );
  border-left: 5px solid #2196f3;
}

.balance-card .metric-value {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-card {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.12) 0%,
    rgba(255, 152, 0, 0.02) 100%
  );
  border-left: 5px solid #ff9800;
}

.stats-card .metric-value {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.text-muted {
  color: #bdbdbd;
  font-weight: 500;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px 0;
  }

  .metric-value {
    font-size: 20px;
  }

  .metric-label {
    font-size: 11px;
  }

  .chart-container {
    height: 250px;
    margin: 15px 0;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 8px 0;
  }

  .metric-card {
    border-radius: 12px;
  }

  .metric-value {
    font-size: 18px;
  }

  .metric-label {
    font-size: 10px;
  }

  .chart-container {
    height: 200px;
  }
}
</style>
