<template>
  <div class="page list-page">
    <van-nav-bar title="全部支出" left-arrow @click-left="goBack" />

    <van-empty v-if="!groups.length" description="还没有记录，记下第一笔装修支出吧" />

    <template v-else>
      <div v-for="group in groups" :key="group.date" class="day-group">
        <div class="day-header">
          <span>{{ group.date }}</span>
          <span class="day-total">¥{{ fromCents(group.totalCents) }}</span>
        </div>
        <div class="card">
          <div
            v-for="record in group.records"
            :key="record.id"
            class="record-row"
            @click="goDetail(record.id)"
          >
            <div class="record-main">
              <div class="record-category">{{ record.categoryPath }}</div>
              <div class="record-note">{{ record.note || '无备注' }}</div>
            </div>
            <div class="record-amount">¥{{ fromCents(record.amountCents) }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { listAll, type ExpenseRecord } from '../db/ledger';
import { fromCents } from '../utils/money';

interface DayGroup {
  date: string;
  totalCents: number;
  records: ExpenseRecord[];
}

const router = useRouter();
const records = ref<ExpenseRecord[]>([]);

const groups = computed<DayGroup[]>(() => {
  const map = new Map<string, DayGroup>();
  for (const record of records.value) {
    const existing = map.get(record.date);
    if (existing) {
      existing.records.push(record);
      existing.totalCents += record.amountCents;
    } else {
      map.set(record.date, {
        date: record.date,
        totalCents: record.amountCents,
        records: [record],
      });
    }
  }
  return Array.from(map.values());
});

async function load() {
  records.value = await listAll();
}

function goBack() {
  router.back();
}

function goDetail(id?: number) {
  if (id !== undefined) {
    router.push(`/detail/${id}`);
  }
}

onMounted(load);
</script>

<style scoped>
.list-page {
  padding-top: 0;
}

.day-group {
  margin-bottom: var(--space-lg);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--space-sm) var(--space-sm) var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.day-total {
  font-weight: 600;
  color: var(--color-text);
}

.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  min-height: var(--touch-target);
  border-bottom: 1px solid var(--color-border);
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
}
</style>
