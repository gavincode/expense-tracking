<template>
  <div class="page record-page">
    <van-nav-bar :title="isEdit ? '编辑支出' : '记一笔'" left-arrow @click-left="goBack" />

    <div class="amount-box" @click="showKeyboard = true">
      <span class="currency">¥</span>
      <span class="amount" :class="{ placeholder: !draft.amount }">
        {{ draft.amount || '0.00' }}
      </span>
    </div>

    <div class="module-card">
      <div class="module-title">分类</div>
      <div class="chip-row">
        <button
          v-for="group in allGroups"
          :key="group.id"
          type="button"
          class="chip cat-chip"
          :class="{ selected: activeGroup?.id === group.id }"
          :style="chipStyle(group)"
          @click="selectGroup(group)"
        >
          {{ group.name }}
        </button>
        <button
          type="button"
          class="chip cat-chip"
          :class="{ selected: !activeGroup && selected?.categoryId === UNCATEGORIZED.id }"
          :style="chipStyle(UNCATEGORIZED)"
          @click="selectUncategorized"
        >
          {{ UNCATEGORIZED.name }}
        </button>
        <button type="button" class="chip add-chip" @click="openAddGroup">+ 添加一级</button>
      </div>

      <template v-if="activeGroup">
        <div class="module-subtitle">
          <span class="dot" :style="{ background: activeGroup.color }" />
          项目
        </div>
        <div class="chip-row">
          <button
            v-for="child in activeChildren"
            :key="child.id"
            type="button"
            class="chip cat-chip"
            :class="{ selected: selectedChild?.id === child.id }"
            :style="chipStyle(activeGroup)"
            @click="selectChild(child)"
          >
            {{ child.name }}
          </button>
          <button type="button" class="chip add-chip" @click="openAddChild">+ 添加项目</button>
        </div>
      </template>

      <div
        v-if="selected"
        class="selected-path"
        :style="activeGroup ? { color: activeGroup.colorDark } : {}"
      >
        已选：{{ selected.path }}
      </div>
    </div>

    <div class="module-card note-module">
      <div class="module-title">备注</div>
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
          class="chip note-chip"
          :class="{ selected: isNoteTagSelected(tag) }"
          @click="toggleNoteTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="module-card date-module" @click="openDatePicker">
      <div class="module-title">日期</div>
      <div class="date-row">
        <span class="date-value">{{ draft.date }}</span>
        <span class="chevron">›</span>
      </div>
    </div>

    <van-popup v-model:show="addPopup" position="bottom" round>
      <div class="add-panel">
        <div class="add-title">{{ addMode === 'group' ? '添加一级分类' : '添加项目' }}</div>
        <van-field v-model="newName" placeholder="输入名称（20 字以内）" maxlength="20" clearable />
        <div class="add-actions">
          <van-button plain round @click="addPopup = false">取消</van-button>
          <van-button type="primary" round @click="confirmAdd">添加</van-button>
        </div>
      </div>
    </van-popup>

    <div class="save-area">
      <van-button type="primary" round block size="large" :disabled="!canSave" @click="save">
        {{ isEdit ? '保存修改' : '保存' }}
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
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '../stores/category';
import { useDraftStore } from '../stores/draft';
import {
  PRESET_CATEGORIES,
  UNCATEGORIZED,
  CUSTOM_GROUP_PALETTE,
  type CategoryGroup,
  type CategoryChild,
} from '../data/categories';
import { NOTE_TAGS } from '../data/note-tags';
import {
  addExpense,
  addCustomCategory,
  listCustomCategories,
  getById,
  updateExpense,
  type ExpenseRecord,
} from '../db/ledger';
import { toCents } from '../utils/money';
import { fromCents } from '../utils/money';

const router = useRouter();
const route = useRoute();
const categoryStore = useCategoryStore();
const { selected } = storeToRefs(categoryStore);
const draft = useDraftStore();

const groups = PRESET_CATEGORIES;
const customGroups = ref<CategoryGroup[]>([]);
const customChildren = ref<Record<string, CategoryChild[]>>({});
const noteTags = NOTE_TAGS;
const activeGroup = ref<CategoryGroup | null>(null);
const selectedChild = ref<CategoryChild | null>(null);
const addPopup = ref(false);
const addMode = ref<'group' | 'child'>('group');
const newName = ref('');

const editingId = computed<number | null>(() => {
  if (route.name !== 'edit') {
    return null;
  }
  const id = Number(route.params.id);
  return Number.isFinite(id) ? id : null;
});
const isEdit = computed(() => editingId.value !== null);

const allGroups = computed<CategoryGroup[]>(() => [...groups, ...customGroups.value]);

const activeChildren = computed<CategoryChild[]>(() => {
  if (!activeGroup.value) {
    return [];
  }
  const customs = customChildren.value[activeGroup.value.id] ?? [];
  return [...activeGroup.value.children, ...customs];
});

const showKeyboard = ref(true);
const showDatePicker = ref(false);
const pickerDate = ref<string[]>(draft.date.split('-'));
const minDate = new Date(2000, 0, 1);
const maxDate = new Date();

const canSave = computed(() => draft.amount.trim() !== '' && !!selected.value);

interface ChipColor {
  color: string;
  colorLight: string;
  colorDark: string;
}

function chipStyle(c: ChipColor): Record<string, string> {
  return {
    '--group-color': c.color,
    '--group-color-light': c.colorLight,
    '--group-color-dark': c.colorDark,
  };
}

onMounted(async () => {
  await loadCustom();
  draft.reset();
  if (editingId.value !== null) {
    const record = await getById(editingId.value);
    if (!record) {
      showToast('记录不存在或已删除');
      router.replace('/list');
      return;
    }
    prefillRecord(record);
  } else if (!selected.value) {
    categoryStore.setSelected({
      categoryId: UNCATEGORIZED.id,
      name: UNCATEGORIZED.name,
      path: UNCATEGORIZED.name,
    });
  }
});

function prefillRecord(record: ExpenseRecord) {
  draft.amount = fromCents(record.amountCents);
  draft.date = record.date;
  draft.note = record.note;
  const matched = allGroups.value
    .map((group) => {
      const preset = group.children.find((c) => c.id === record.categoryId);
      const custom = (customChildren.value[group.id] ?? []).find((c) => c.id === record.categoryId);
      return { group, child: preset ?? custom ?? null };
    })
    .find((entry) => entry.child !== null);
  if (matched) {
    activeGroup.value = matched.group;
    selectedChild.value = matched.child;
    categoryStore.setSelected({
      categoryId: matched.child!.id,
      name: matched.child!.name,
      path: `${matched.group.name}/${matched.child!.name}`,
    });
    return;
  }
  if (record.categoryId === UNCATEGORIZED.id) {
    selectUncategorized();
    return;
  }
  // 分类已被删除：保留原路径文本快照
  categoryStore.setSelected({
    categoryId: record.categoryId,
    name: record.categoryPath,
    path: record.categoryPath,
  });
}

async function loadCustom() {
  const items = await listCustomCategories();
  customGroups.value = items
    .filter((c) => c.groupId === null)
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      colorLight: c.colorLight,
      colorDark: c.colorDark,
      children: [],
    }));
  const map: Record<string, CategoryChild[]> = {};
  for (const c of items) {
    if (c.groupId !== null) {
      (map[c.groupId] ??= []).push({ id: c.id, name: c.name });
    }
  }
  customChildren.value = map;
}

function openAddGroup() {
  showKeyboard.value = false;
  addMode.value = 'group';
  newName.value = '';
  addPopup.value = true;
}

function openAddChild() {
  showKeyboard.value = false;
  addMode.value = 'child';
  newName.value = '';
  addPopup.value = true;
}

async function confirmAdd() {
  const name = newName.value.trim();
  if (!name) {
    showToast('请输入名称');
    return;
  }
  if (addMode.value === 'group') {
    if (allGroups.value.some((g) => g.name === name)) {
      showToast('该分类已存在');
      return;
    }
    const palette = CUSTOM_GROUP_PALETTE[customGroups.value.length % CUSTOM_GROUP_PALETTE.length];
    const id = `custom-${Date.now()}`;
    const group: CategoryGroup = { id, name, ...palette, children: [] };
    await addCustomCategory({ id, groupId: null, name, ...palette });
    customGroups.value.push(group);
    activeGroup.value = group;
    selectedChild.value = null;
    categoryStore.setSelected({ categoryId: id, name, path: name });
  } else {
    if (!activeGroup.value) {
      return;
    }
    if (activeChildren.value.some((c) => c.name === name)) {
      showToast('该项目已存在');
      return;
    }
    const id = `custom-${Date.now()}`;
    const child: CategoryChild = { id, name };
    await addCustomCategory({
      id,
      groupId: activeGroup.value.id,
      name,
      color: '',
      colorLight: '',
      colorDark: '',
    });
    customChildren.value = {
      ...customChildren.value,
      [activeGroup.value.id]: [...(customChildren.value[activeGroup.value.id] ?? []), child],
    };
    selectChild(child);
  }
  newName.value = '';
  addPopup.value = false;
}

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
  showKeyboard.value = false;
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
  if (editingId.value !== null) {
    await updateExpense(editingId.value, {
      amountCents,
      categoryId: selected.value.categoryId,
      categoryPath: selected.value.path,
      date: draft.date,
      note: draft.note,
    });
  } else {
    await addExpense({
      amountCents,
      categoryId: selected.value.categoryId,
      categoryPath: selected.value.path,
      date: draft.date,
      note: draft.note,
    });
  }
  draft.reset();
  if (editingId.value !== null) {
    showToast('已更新');
    router.replace(`/detail/${editingId.value}`);
  } else {
    showToast('已保存');
    router.push('/');
  }
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

.module-card {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.module-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.module-title::before {
  content: '';
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--color-primary);
}

.module-card .module-title::before {
  background: var(--color-primary);
}

.module-card.note-module .module-title::before {
  background: var(--color-accent);
}

.module-subtitle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin: var(--space-sm) var(--space-xs) var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.module-subtitle .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
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

.chip.cat-chip {
  background: var(--group-color-light, var(--color-primary-light));
  border-color: var(--group-color-light, var(--color-primary-light));
  color: var(--group-color-dark, var(--color-primary-dark));
}

.chip.cat-chip.selected {
  background: var(--group-color, var(--color-primary));
  border-color: var(--group-color, var(--color-primary));
  color: #ffffff;
  font-weight: 600;
}

.chip.note-chip {
  background: var(--color-accent-light);
  border-color: var(--color-accent-light);
  color: var(--color-accent-dark);
}

.chip.note-chip.selected {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
}

.chip.add-chip {
  background: transparent;
  border-style: dashed;
  border-color: var(--color-text-secondary);
  color: var(--color-text-secondary);
}

.selected-path {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
}

.date-module {
  cursor: pointer;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

.date-value {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.chevron {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.save-area {
  margin-top: var(--space-lg);
}

.add-panel {
  padding: var(--space-lg) var(--space-md) calc(var(--space-lg) + env(safe-area-inset-bottom));
}

.add-title {
  margin-bottom: var(--space-md);
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.add-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.add-actions .van-button {
  flex: 1;
}
</style>
