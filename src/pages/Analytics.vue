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
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import type { FinancialMetrics } from "@/types";
import Chart from "chart.js/auto";

const store = useTransactionStore();
const metrics = computed<FinancialMetrics>(() => store.getMetrics());

const expenseAnalysisChart = ref<HTMLCanvasElement | null>(null);
const incomeAnalysisChart = ref<HTMLCanvasElement | null>(null);
const comparisonChart = ref<HTMLCanvasElement | null>(null);

const chartInstances: Chart[] = [];

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
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
      },
    },
  });

  chartInstances.push(chart);
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
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
      },
    },
  });

  chartInstances.push(chart);
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
          borderRadius: [8, 8, 0, 0],
        },
        {
          label: "Chi Tiêu",
          data: monthlyData.map((m) => m.expense),
          backgroundColor: "#f44336",
          borderRadius: [8, 8, 0, 0],
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
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value as number);
            },
          },
        },
      },
    },
  });

  chartInstances.push(chart);
};

onMounted(() => {
  setTimeout(() => {
    initializeExpenseAnalysis();
    initializeIncomeAnalysis();
    initializeComparison();
  }, 100);
});
</script>

<style scoped>
.analytics {
  padding: 20px 0;
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

.summary-box {
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.summary-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.summary-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
}

.income-color {
  color: #4caf50;
}

.expense-color {
  color: #f44336;
}

.text-muted {
  color: #999;
}

.text-right {
  text-align: right;
}

.font-weight-bold {
  font-weight: 700;
}
</style>
