<template>
  <div class="page home">
    <header class="home-header">
      <h1 class="home-title">装修账本</h1>
      <p class="home-subtitle">记下每一笔装修开销</p>
    </header>

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-label">本月合计</div>
        <div class="summary-value">¥{{ fromCents(monthSummary.totalCents) }}</div>
      </div>
      <div class="summary-divider" />
      <div class="summary-item">
        <div class="summary-label">本月笔数</div>
        <div class="summary-value">{{ monthSummary.count }}</div>
      </div>
    </div>

    <template v-if="records.length">
      <div class="section-title">最近记录</div>
      <div class="card">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-row"
          @click="goDetail(record.id)"
        >
          <div class="record-main">
            <div class="record-category">{{ record.categoryPath }}</div>
            <div class="record-note">{{ record.note || record.date }}</div>
          </div>
          <div class="record-right">
            <span class="record-amount">¥{{ fromCents(record.amountCents) }}</span>
            <span class="chevron">›</span>
          </div>
        </div>
      </div>
      <van-button plain round class="see-all" @click="goList">查看全部</van-button>
    </template>

    <van-empty v-else description="记下第一笔装修支出" />

    <div class="bottom-bar">
      <van-button type="primary" round block size="large" @click="goRecord">记一笔</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { listRecent, getMonthSummary, type ExpenseRecord, type MonthSummary } from '../db/ledger';
import { fromCents } from '../utils/money';
import dayjs from 'dayjs';

const router = useRouter();
const records = ref<ExpenseRecord[]>([]);
const monthSummary = ref<MonthSummary>({ totalCents: 0, count: 0 });

async function loadRecent() {
  records.value = await listRecent(5);
  monthSummary.value = await getMonthSummary(dayjs().format('YYYY-MM'));
}

function goRecord() {
  router.push('/record');
}

function goList() {
  router.push('/list');
}

function goDetail(id?: number) {
  if (id !== undefined) {
    router.push(`/detail/${id}`);
  }
}

onMounted(loadRecent);
</script>

<style scoped>
.home-header {
  padding: var(--space-lg) var(--space-sm) var(--space-md);
}

.home-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
}

.home-subtitle {
  margin: var(--space-xs) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.section-title {
  margin: var(--space-md) var(--space-sm) var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: var(--space-sm);
  padding: var(--space-lg) var(--space-md);
  background: var(--color-primary-light);
  border-radius: var(--radius-card);
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
}

.summary-value {
  margin-top: var(--space-xs);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: rgba(143, 174, 139, 0.35);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  min-height: var(--touch-target);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.record-row:active {
  background: var(--color-border);
}

.record-row:last-child {
  border-bottom: none;
}

.record-category {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.record-note {
  margin-top: 2px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-amount {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.record-right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.chevron {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
  background: var(--color-bg);
  max-width: 640px;
  margin: 0 auto;
}

.see-all {
  margin-top: var(--space-md);
  width: 100%;
  color: var(--color-primary-dark);
  border-color: var(--color-primary);
}
</style>
