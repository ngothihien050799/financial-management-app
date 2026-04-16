<template>
  <div class="analytics">
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>Phân Tích Chi Tiêu Theo Danh Mục</v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="expenseAnalysisChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>Phân Tích Thu Nhập Theo Danh Mục</v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="incomeAnalysisChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>So Sánh Thu Chi Theo Tháng</v-card-title>
          <v-card-text>
            <div class="chart-container" style="height: 400px">
              <canvas ref="comparisonChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>Thống Kê Chi Tiêu</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in metrics.expenseByCategory"
                :key="item.category"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getCategoryColor(item.category)"
                    size="small"
                  ></v-avatar>
                </template>
                <v-list-item-title>{{ item.category }}</v-list-item-title>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="font-weight-bold">
                      {{ formatCurrency(item.total) }}
                    </div>
                    <small class="text-muted"
                      >{{ item.percentage.toFixed(1) }}%</small
                    >
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>Thống Kê Thu Nhập</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in metrics.incomeByCategory"
                :key="item.category"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getCategoryColor(item.category)"
                    size="small"
                  ></v-avatar>
                </template>
                <v-list-item-title>{{ item.category }}</v-list-item-title>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="font-weight-bold">
                      {{ formatCurrency(item.total) }}
                    </div>
                    <small class="text-muted"
                      >{{ item.percentage.toFixed(1) }}%</small
                    >
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Báo Cáo Tóm Tắt</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Tổng Thu Nhập</div>
                  <div class="summary-value income-color">
                    {{ formatCurrency(metrics.totalIncome) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Tổng Chi Tiêu</div>
                  <div class="summary-value expense-color">
                    {{ formatCurrency(metrics.totalExpense) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Tỷ Lệ Chi/Thu</div>
                  <div class="summary-value">{{ getRatio() }}%</div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Số Dư</div>
                  <div
                    class="summary-value"
                    :style="{
                      color: metrics.balance >= 0 ? '#4CAF50' : '#f44336',
                    }"
                  >
                    {{ formatCurrency(metrics.balance) }}
                  </div>
                </div>
              </v-col>
            </v-row>
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
const metrics = computed<FinancialMetrics>(() => store.getMetrics());

const expenseAnalysisChart = ref<HTMLCanvasElement | null>(null);
const incomeAnalysisChart = ref<HTMLCanvasElement | null>(null);
const comparisonChart = ref<HTMLCanvasElement | null>(null);

const chartInstances = ref<{
  expense?: Chart;
  income?: Chart;
  comparison?: Chart;
}>({});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getRatio = () => {
  if (metrics.value.totalIncome === 0) return 0;
  return (
    (metrics.value.totalExpense / metrics.value.totalIncome) *
    100
  ).toFixed(1);
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Lương: "#4CAF50",
    "Phụ cấp": "#8BC34A",
    "Tiền thưởng": "#CDDC39",
    "Đầu tư": "#2196F3",
    "Ăn uống": "#FF9800",
    "Giao thông": "#FF5722",
    "Sức khỏe": "#E91E63",
    "Giáo dục": "#9C27B0",
    "Giải trí": "#00BCD4",
    "Mua sắm": "#FFC107",
    "Nhà cửa": "#607D8B",
    Khác: "#9E9E9E",
  };
  return colors[category] || "#B0BEC5";
};

const destroyCharts = () => {
  if (chartInstances.value.expense) {
    chartInstances.value.expense.destroy();
  }
  if (chartInstances.value.income) {
    chartInstances.value.income.destroy();
  }
  if (chartInstances.value.comparison) {
    chartInstances.value.comparison.destroy();
  }
};

const initializeExpenseAnalysis = () => {
  if (!expenseAnalysisChart.value) return;

  const ctx = expenseAnalysisChart.value.getContext("2d");
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: metrics.value.expenseByCategory.map((item) => item.category),
      datasets: [
        {
          label: "Chi Tiêu",
          data: metrics.value.expenseByCategory.map((item) => item.total),
          backgroundColor: metrics.value.expenseByCategory.map((item) =>
            getCategoryColor(item.category),
          ),
          borderRadius: 12,
          borderWidth: 0,
          hoverBackgroundColor: metrics.value.expenseByCategory.map(
            (item) => getCategoryColor(item.category) + "dd",
          ),
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
          callbacks: {
            label: function (context: any) {
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
              return `${value}`;
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
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });

  chartInstances.value.expense = chart;
};

const initializeIncomeAnalysis = () => {
  if (!incomeAnalysisChart.value) return;

  const ctx = incomeAnalysisChart.value.getContext("2d");
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: metrics.value.incomeByCategory.map((item) => item.category),
      datasets: [
        {
          label: "Thu Nhập",
          data: metrics.value.incomeByCategory.map((item) => item.total),
          backgroundColor: metrics.value.incomeByCategory.map((item) =>
            getCategoryColor(item.category),
          ),
          borderRadius: 12,
          borderWidth: 0,
          hoverBackgroundColor: metrics.value.incomeByCategory.map(
            (item) => getCategoryColor(item.category) + "dd",
          ),
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
          callbacks: {
            label: function (context: any) {
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
              return `${value}`;
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
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });

  chartInstances.value.income = chart;
};

const initializeComparison = () => {
  if (!comparisonChart.value) return;

  const ctx = comparisonChart.value.getContext("2d");
  if (!ctx) return;

  const monthlyData = metrics.value.monthlyTrend;

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthlyData.map((m) => m.month),
      datasets: [
        {
          label: "Thu Nhập",
          data: monthlyData.map((m) => m.income),
          backgroundColor: "#4CAF50",
          borderRadius: [12, 12, 0, 0],
          borderSkipped: false,
          borderWidth: 0,
          hoverBackgroundColor: "#45a049",
        },
        {
          label: "Chi Tiêu",
          data: monthlyData.map((m) => m.expense),
          backgroundColor: "#f44336",
          borderRadius: [12, 12, 0, 0],
          borderSkipped: false,
          borderWidth: 0,
          hoverBackgroundColor: "#d32f2f",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
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
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
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
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });

  chartInstances.value.comparison = chart;
};

const initializeCharts = () => {
  destroyCharts();
  setTimeout(() => {
    initializeExpenseAnalysis();
    initializeIncomeAnalysis();
    initializeComparison();
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
.analytics {
  padding: 20px 0;
  animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.summary-box {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.summary-box::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2196f3, transparent);
}

.summary-box:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.summary-label {
  font-size: 11px;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 700;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #333 0%, #555 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.income-color {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.expense-color {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%) !important;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .analytics {
    padding: 12px 0;
  }

  .chart-container {
    height: 250px;
  }

  .summary-box {
    padding: 16px;
    margin-bottom: 12px;
  }

  .summary-value {
    font-size: 18px;
  }

  .summary-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .analytics {
    padding: 8px 0;
  }

  .chart-container {
    height: 200px;
  }

  .summary-box {
    padding: 12px;
  }

  .summary-value {
    font-size: 16px;
  }
}
</style>
