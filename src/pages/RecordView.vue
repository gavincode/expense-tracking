<template>
  <div class="page record-page">
    <van-nav-bar title="记一笔" left-arrow @click-left="goBack" />

    <div class="amount-box" @click="showKeyboard = true">
      <span class="currency">¥</span>
      <span class="amount" :class="{ placeholder: !amount }">{{ amount || '0.00' }}</span>
    </div>

    <van-cell
      title="分类"
      is-link
      :value="selected?.path ?? '请选择'"
      :value-class="selected ? '' : 'placeholder-value'"
      @click="goCategories"
    />

    <div class="save-area">
      <van-button type="primary" round block size="large" :disabled="!canSave" @click="save">
        保存
      </van-button>
    </div>

    <van-number-keyboard
      :model-value="amount"
      :show="showKeyboard"
      theme="custom"
      close-button-text="完成"
      @input="onInput"
      @delete="onDelete"
      @close="showKeyboard = false"
      @blur="showKeyboard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '../stores/category';
import { addExpense } from '../db/ledger';
import { toCents } from '../utils/money';
import dayjs from 'dayjs';

const router = useRouter();
const categoryStore = useCategoryStore();
const { selected } = storeToRefs(categoryStore);

const amount = ref('');
const showKeyboard = ref(true);

const canSave = computed(() => amount.value.trim() !== '' && !!selected.value);

function goBack() {
  router.back();
}

function goCategories() {
  router.push('/categories');
}

function onInput(key: string) {
  if (key === '.') {
    if (!amount.value.includes('.')) {
      amount.value += '.';
    }
    return;
  }
  if (!/^\d$/.test(key)) {
    return;
  }
  const [intPart, decPart = ''] = amount.value.split('.');
  if (decPart.length >= 2) {
    return;
  }
  if (intPart.length >= 9) {
    return;
  }
  amount.value += key;
}

function onDelete() {
  amount.value = amount.value.slice(0, -1);
}

async function save() {
  let amountCents: number;
  try {
    amountCents = toCents(amount.value);
  } catch {
    showToast('请输入有效金额');
    return;
  }
  if (!selected.value) {
    showToast('请选择分类');
    return;
  }
  await addExpense({
    amountCents,
    categoryId: selected.value.categoryId,
    categoryPath: selected.value.path,
    date: dayjs().format('YYYY-MM-DD'),
  });
  showToast('已保存');
  router.push('/');
}
</script>

<style scoped>
.record-page {
  padding-top: 0;
}

.amount-box {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  padding: var(--space-lg) var(--space-md);
  cursor: pointer;
}

.currency {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.amount {
  font-size: 42px;
  font-weight: 600;
  letter-spacing: 1px;
}

.amount.placeholder {
  color: var(--color-text-secondary);
}

.save-area {
  margin-top: var(--space-lg);
}
</style>
