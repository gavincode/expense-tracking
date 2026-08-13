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

    <van-cell
      title="日期"
      is-link
      :value="date"
      @click="openDatePicker"
    />

    <van-field
      v-model="note"
      type="textarea"
      label="备注"
      placeholder="选填，如：定金、尾款"
      rows="2"
      autosize
      maxlength="200"
      show-word-limit
    />

    <div class="save-area">
      <van-button type="primary" round block size="large" :disabled="!canSave" @click="save">
        保存
      </van-button>
    </div>

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="pickerDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

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
import { useDraftStore } from '../stores/draft';
import { addExpense } from '../db/ledger';
import { toCents } from '../utils/money';

const router = useRouter();
const categoryStore = useCategoryStore();
const { selected } = storeToRefs(categoryStore);

const draft = useDraftStore();
const { amount, note, date } = storeToRefs(draft);
const showKeyboard = ref(false);
const showDatePicker = ref(false);
const pickerDate = ref<string[]>(draft.date.split('-'));
const minDate = new Date(2000, 0, 1);
const maxDate = new Date();

const canSave = computed(() => amount.value.trim() !== '' && !!selected.value);

function goBack() {
  router.back();
}

function goCategories() {
  showKeyboard.value = false;
  router.push('/categories');
}

function onInput(key: string) {
  if (key === '.') {
    if (!draft.amount.includes('.')) {
      draft.amount += '.';
    }
    return;
  }
  if (!/^\d$/.test(key)) {
    return;
  }
  const [intPart, decPart = ''] = draft.amount.split('.');
  if (decPart.length >= 2) {
    return;
  }
  if (intPart.length >= 9) {
    return;
  }
  draft.amount += key;
}

function onDelete() {
  draft.amount = draft.amount.slice(0, -1);
}

function openDatePicker() {
  pickerDate.value = draft.date.split('-');
  showDatePicker.value = true;
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  draft.date = selectedValues.join('-');
  showDatePicker.value = false;
}

async function save() {
  let amountCents: number;
  try {
    amountCents = toCents(draft.amount);
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
    date: draft.date,
    note: draft.note,
  });
  draft.reset();
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
