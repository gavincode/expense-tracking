<template>
  <div class="page detail-page">
    <van-nav-bar title="支出详情" left-arrow @click-left="goBack" />

    <div v-if="record" class="detail-card">
      <div class="amount">¥{{ fromCents(record.amountCents) }}</div>
      <van-cell-group inset>
        <van-cell title="分类" :value="record.categoryPath" />
        <van-cell title="日期" :value="record.date" />
        <van-cell title="备注" :value="record.note || '无备注'" />
      </van-cell-group>
      <div class="detail-actions">
        <van-button round block plain type="primary" @click="goEdit">编辑</van-button>
      </div>
    </div>

    <van-empty v-else description="记录不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getById, type ExpenseRecord } from '../db/ledger';
import { fromCents } from '../utils/money';

const route = useRoute();
const router = useRouter();
const record = ref<ExpenseRecord | null>(null);

async function load() {
  const id = Number(route.params.id);
  if (!Number.isFinite(id)) {
    return;
  }
  record.value = (await getById(id)) ?? null;
}

function goBack() {
  router.back();
}

function goEdit() {
  if (record.value?.id !== undefined) {
    router.push(`/edit/${record.value.id}`);
  }
}

onMounted(load);
</script>

<style scoped>
.detail-page {
  padding-top: 0;
}

.detail-card {
  margin-top: var(--space-md);
}

.amount {
  padding: var(--space-lg) 0;
  text-align: center;
  font-size: 44px;
  font-weight: 600;
}

.detail-actions {
  margin-top: var(--space-lg);
  padding: 0 var(--space-md);
}
</style>
