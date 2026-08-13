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
          <van-swipe-cell v-for="record in group.records" :key="record.id">
            <div class="record-row" @click="goEdit(record.id)">
              <div class="record-main">
                <div class="record-category" :style="categoryStyle(record)">
                  <span
                    v-if="categoryColor(record)"
                    class="cat-dot"
                    :style="{ background: categoryColor(record)!.color }"
                  />
                  {{ record.categoryPath }}
                </div>
                <div class="record-note">{{ record.note || '无备注' }}</div>
              </div>
              <div class="record-amount">¥{{ fromCents(record.amountCents) }}</div>
            </div>
            <template #right>
              <button type="button" class="swipe-delete" @click="confirmDelete(record)">删除</button>
            </template>
          </van-swipe-cell>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import {
  listAll,
  deleteExpense,
  listCustomCategories,
  type ExpenseRecord,
  type CustomCategory,
} from '../db/ledger';
import { resolveCategoryColor, type CategoryColorInfo } from '../data/categories';
import { fromCents } from '../utils/money';

interface DayGroup {
  date: string;
  totalCents: number;
  records: ExpenseRecord[];
}

const router = useRouter();
const records = ref<ExpenseRecord[]>([]);
const customCategories = ref<CustomCategory[]>([]);

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
  customCategories.value = await listCustomCategories();
}

function categoryColor(record: ExpenseRecord): CategoryColorInfo | null {
  return resolveCategoryColor(record.categoryId, customCategories.value);
}

function categoryStyle(record: ExpenseRecord): Record<string, string> {
  const info = categoryColor(record);
  return info ? { color: info.colorDark } : {};
}

function goBack() {
  router.back();
}

function goEdit(id?: number) {
  if (id !== undefined) {
    router.push(`/edit/${id}`);
  }
}

async function confirmDelete(record: ExpenseRecord) {
  if (record.id === undefined) {
    return;
  }
  try {
    await showConfirmDialog({
      title: '删除这笔支出？',
      message: '删除后不可恢复',
      confirmButtonText: '删除',
      confirmButtonColor: '#ee0a24',
    });
  } catch {
    return;
  }
  await deleteExpense(record.id);
  showToast('已删除');
  await load();
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

.record-row:active {
  background: var(--color-border);
}

.record-category {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.cat-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
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

.swipe-delete {
  appearance: none;
  border: none;
  height: 100%;
  min-width: 72px;
  background: #ee0a24;
  color: #ffffff;
  font-size: var(--font-size-md);
  cursor: pointer;
}
</style>
