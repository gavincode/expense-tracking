<template>
  <div class="page record-page">
    <van-nav-bar title="记一笔" left-arrow @click-left="goBack" />

    <div class="amount-box" @click="showKeyboard = true">
      <span class="currency">¥</span>
      <span class="amount" :class="{ placeholder: !draft.amount }">
        {{ draft.amount || '0.00' }}
      </span>
    </div>

    <section class="picker-section">
      <div class="section-label">分类</div>
      <div class="chip-row">
        <button
          type="button"
          class="chip"
          :class="{ selected: !activeGroup && selected?.categoryId === UNCATEGORIZED.id }"
          @click="selectUncategorized"
        >
          {{ UNCATEGORIZED.name }}
        </button>
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="chip"
          :class="{ selected: activeGroup?.id === group.id }"
          @click="selectGroup(group)"
        >
          {{ group.name }}
        </button>
      </div>

      <template v-if="activeGroup">
        <div class="section-label sub">项目</div>
        <div class="chip-row">
          <button
            v-for="child in activeGroup.children"
            :key="child.id"
            type="button"
            class="chip"
            :class="{ selected: selectedChild?.id === child.id }"
            @click="selectChild(child)"
          >
            {{ child.name }}
          </button>
        </div>
      </template>

      <div v-if="selected" class="selected-path">已选：{{ selected.path }}</div>
    </section>

    <van-cell title="日期" is-link :value="draft.date" @click="openDatePicker" />

    <section class="picker-section">
      <div class="section-label">备注</div>
      <van-field
        v-model="draft.note"
        type="textarea"
        placeholder="选填，如：定金、尾款"
        rows="2"
        autosize
        maxlength="200"
        show-word-limit
      />
      <div class="chip-row">
        <button
          v-for="tag in noteTags"
          :key="tag"
          type="button"
          class="chip"
          :class="{ selected: isNoteTagSelected(tag) }"
          @click="toggleNoteTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </section>

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
      :model-value="draft.amount"
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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '../stores/category';
import { useDraftStore } from '../stores/draft';
import { PRESET_CATEGORIES, UNCATEGORIZED, type CategoryGroup, type CategoryChild } from '../data/categories';
import { NOTE_TAGS } from '../data/note-tags';
import { addExpense } from '../db/ledger';
import { toCents } from '../utils/money';

const router = useRouter();
const categoryStore = useCategoryStore();
const { selected } = storeToRefs(categoryStore);
const draft = useDraftStore();

const groups = PRESET_CATEGORIES;
const noteTags = NOTE_TAGS;
const activeGroup = ref<CategoryGroup | null>(null);
const selectedChild = ref<CategoryChild | null>(null);

const showKeyboard = ref(false);
const showDatePicker = ref(false);
const pickerDate = ref<string[]>(draft.date.split('-'));
const minDate = new Date(2000, 0, 1);
const maxDate = new Date();

const canSave = computed(() => draft.amount.trim() !== '' && !!selected.value);

onMounted(() => {
  if (!selected.value) {
    categoryStore.setSelected({
      categoryId: UNCATEGORIZED.id,
      name: UNCATEGORIZED.name,
      path: UNCATEGORIZED.name,
    });
  }
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function selectGroup(group: CategoryGroup) {
  if (activeGroup.value?.id === group.id) {
    activeGroup.value = null;
    return;
  }
  activeGroup.value = group;
  selectedChild.value = null;
}

function selectChild(child: CategoryChild) {
  if (!activeGroup.value) {
    return;
  }
  selectedChild.value = child;
  categoryStore.setSelected({
    categoryId: child.id,
    name: child.name,
    path: `${activeGroup.value.name}/${child.name}`,
  });
}

function selectUncategorized() {
  activeGroup.value = null;
  selectedChild.value = null;
  categoryStore.setSelected({
    categoryId: UNCATEGORIZED.id,
    name: UNCATEGORIZED.name,
    path: UNCATEGORIZED.name,
  });
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

function isNoteTagSelected(tag: string): boolean {
  return draft.note
    .split('、')
    .map((s) => s.trim())
    .includes(tag);
}

function toggleNoteTag(tag: string) {
  const parts = draft.note
    .split('、')
    .map((s) => s.trim())
    .filter(Boolean);
  const index = parts.indexOf(tag);
  if (index >= 0) {
    parts.splice(index, 1);
  } else {
    parts.push(tag);
  }
  draft.note = parts.join('、');
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
  padding: var(--space-lg) var(--space-md) var(--space-sm);
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

.picker-section {
  margin-top: var(--space-md);
}

.section-label {
  margin: 0 var(--space-sm) var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.section-label.sub {
  margin-top: var(--space-sm);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: 0 var(--space-sm);
}

.chip {
  appearance: none;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 16px;
  padding: 8px 14px;
  font-size: var(--font-size-sm);
  line-height: 1;
  min-height: 32px;
  cursor: pointer;
}

.chip.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
  font-weight: 500;
}

.selected-path {
  margin: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
}

.save-area {
  margin-top: var(--space-lg);
}
</style>
