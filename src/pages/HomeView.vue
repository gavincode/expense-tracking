<template>
  <div v-if="!ledgerId" class="page home">
    <header class="home-header">
      <h1 class="home-title">装修账本</h1>
      <p class="home-subtitle">和家人一起记下每一笔装修开销</p>
    </header>

    <div class="create-card">
      <div class="create-title">创建账本</div>
      <van-field
        v-model="newNickname"
        label="我的昵称"
        placeholder="默认：我"
        maxlength="10"
      />
      <van-button
        type="primary"
        round
        block
        size="large"
        class="create-btn"
        :loading="creating"
        @click="createLedger"
      >
        创建账本
      </van-button>
      <p class="hint">创建后生成邀请码，家人加入同一个账本</p>
    </div>
  </div>

  <div v-else class="page home">
    <header class="home-header">
      <div class="header-row">
        <h1 class="home-title">装修账本</h1>
        <div class="header-actions">
          <button type="button" class="action-link" @click="openInvitePopup">邀请</button>
          <button type="button" class="action-link" @click="openNicknamePopup">昵称</button>
          <button type="button" class="action-link" :disabled="syncing" @click="syncAll">
            {{ syncing ? '同步中…' : '同步' }}
          </button>
        </div>
      </div>
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
        <van-swipe-cell v-for="record in records" :key="record.id">
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
              <div class="record-note">
                {{ record.nickname || '我' }} · {{ record.note || record.date }}
              </div>
            </div>
            <div class="record-right">
              <span class="record-amount">¥{{ fromCents(record.amountCents) }}</span>
              <span class="chevron">›</span>
            </div>
          </div>
          <template #right>
            <button type="button" class="swipe-delete" @click="confirmDelete(record)">删除</button>
          </template>
        </van-swipe-cell>
      </div>
      <van-button plain round class="see-all" @click="goList">查看全部</van-button>
    </template>

    <van-empty v-else description="记下第一笔装修支出" />

    <div class="bottom-bar">
      <van-button type="primary" round block size="large" @click="goRecord">记一笔</van-button>
    </div>

    <van-popup v-model:show="nicknamePopup" position="bottom" round>
      <div class="nickname-panel">
        <div class="panel-title">我的昵称</div>
        <van-field v-model="newNickname" placeholder="默认：我" maxlength="10" />
        <div class="panel-actions">
          <van-button plain round @click="nicknamePopup = false">取消</van-button>
          <van-button type="primary" round @click="confirmNickname">确定</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="invitePopup" position="bottom" round>
      <div class="invite-panel">
        <div class="panel-title">邀请家人加入</div>
        <div class="invite-code">{{ inviteCode || '--' }}</div>
        <img v-if="inviteQr" :src="inviteQr" alt="邀请二维码" class="invite-qr" />
        <div class="invite-link">{{ inviteLink }}</div>
        <div class="panel-actions">
          <van-button plain round @click="invitePopup = false">关闭</van-button>
          <van-button type="primary" round @click="copyInviteLink">复制链接</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import {
  listRecent,
  getMonthSummary,
  listCustomCategories,
  deleteExpense,
  type ExpenseRecord,
  type MonthSummary,
  type CustomCategory,
} from '../db/ledger';
import { resolveCategoryColor, type CategoryColorInfo } from '../data/categories';
import { fromCents } from '../utils/money';
import { useDraftStore } from '../stores/draft';
import { useIdentityStore } from '../stores/identity';
import { createLedger as apiCreateLedger } from '../api/client';
import QRCode from 'qrcode';
import { useSync } from '../composables/useSync';
import type { LedgerMember } from '../types/ledger';
import dayjs from 'dayjs';

function safeGet(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

const router = useRouter();
const draft = useDraftStore();
const identity = useIdentityStore();

const records = ref<ExpenseRecord[]>([]);
const monthSummary = ref<MonthSummary>({ totalCents: 0, count: 0 });
const customCategories = ref<CustomCategory[]>([]);

const ledgerId = ref(safeGet('rl_ledger_id'));
const inviteCode = ref(safeGet('rl_invite_code'));
const creating = ref(false);
const nicknamePopup = ref(false);
const invitePopup = ref(false);
const inviteQr = ref('');
const newNickname = ref(identity.nickname);

const inviteLink = computed(() =>
  inviteCode.value ? `${location.origin}/join?code=${inviteCode.value}` : '',
);

const { syncing, syncOnce } = useSync(
  () => ledgerId.value,
  () => inviteCode.value,
  () => {
    loadRecent();
  },
);

const members = computed<LedgerMember[]>(() => {
  try {
    return JSON.parse(safeGet('rl_members') || '[]') as LedgerMember[];
  } catch {
    return [];
  }
});

async function loadRecent() {
  records.value = await listRecent(5);
  monthSummary.value = await getMonthSummary(dayjs().format('YYYY-MM'));
  customCategories.value = await listCustomCategories();
}

async function createLedger() {
  creating.value = true;
  try {
    identity.setNickname(newNickname.value || '我');
    const deviceId = identity.ensureDeviceId();
    const result = await apiCreateLedger();
    safeSet('rl_ledger_id', result.ledgerId);
    safeSet('rl_invite_code', result.inviteCode);
    const creator: LedgerMember = {
      deviceId,
      nickname: identity.nickname,
      joinedAt: Date.now(),
    };
    safeSet('rl_members', JSON.stringify([creator]));
    ledgerId.value = result.ledgerId;
    inviteCode.value = result.inviteCode;
    await syncAll();
    showToast('账本已创建');
  } catch (error) {
    showToast('创建失败：' + String(error));
  } finally {
    creating.value = false;
  }
}

async function syncAll() {
  await syncOnce();
}

function openNicknamePopup() {
  newNickname.value = identity.nickname;
  nicknamePopup.value = true;
}

async function openInvitePopup() {
  invitePopup.value = true;
  if (inviteCode.value) {
    try {
      inviteQr.value = await QRCode.toDataURL(
        `${location.origin}/join?code=${inviteCode.value}`,
        { width: 180, margin: 1 },
      );
    } catch {
      inviteQr.value = '';
    }
  }
}

function fallbackCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

async function copyInviteLink() {
  const text = inviteLink.value;
  try {
    // 安全环境（HTTPS/localhost）下用标准剪贴板 API
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast('链接已复制');
      return;
    }
  } catch {
    // 非安全环境降级到下方兼容方案
  }
  if (fallbackCopy(text)) {
    showToast('链接已复制');
  } else {
    showToast('复制失败，请长按下方链接手动复制');
  }
}

function confirmNickname() {
  identity.setNickname(newNickname.value);
  const next = members.value.map((m) =>
    m.deviceId === identity.deviceId ? { ...m, nickname: identity.nickname } : m,
  );
  safeSet('rl_members', JSON.stringify(next));
  nicknamePopup.value = false;
  showToast('昵称已更新');
}

function categoryColor(record: ExpenseRecord): CategoryColorInfo | null {
  return resolveCategoryColor(record.categoryId, customCategories.value);
}

function categoryStyle(record: ExpenseRecord): Record<string, string> {
  const info = categoryColor(record);
  return info ? { color: info.colorDark } : {};
}

function goRecord() {
  draft.reset();
  router.push('/record');
}

function goList() {
  router.push('/list');
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
  await loadRecent();
}

onMounted(() => {
  if (ledgerId.value) {
    loadRecent();
  }
});
</script>

<style scoped>
.home-header {
  padding: var(--space-lg) var(--space-sm) var(--space-md);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-link {
  appearance: none;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary-dark);
  border-radius: 14px;
  padding: 5px 12px;
  font-size: var(--font-size-sm);
  min-height: 28px;
  cursor: pointer;
}

.action-link:disabled {
  opacity: 0.6;
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

.record-right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.record-amount {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.chevron {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
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

.create-card {
  margin-top: var(--space-lg);
  padding: var(--space-lg) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.create-title {
  margin-bottom: var(--space-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
  text-align: center;
}

.create-btn {
  margin-top: var(--space-lg);
}

.hint {
  margin: var(--space-md) 0 0;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.nickname-panel {
  padding: var(--space-lg) var(--space-md) calc(var(--space-lg) + env(safe-area-inset-bottom));
}

.panel-title {
  margin-bottom: var(--space-md);
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.panel-actions .van-button {
  flex: 1;
}

.invite-panel {
  padding: var(--space-lg) var(--space-md) calc(var(--space-lg) + env(safe-area-inset-bottom));
  text-align: center;
}

.invite-code {
  margin: var(--space-md) 0;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 8px;
  color: var(--color-primary-dark);
}

.invite-qr {
  width: 180px;
  height: 180px;
  border-radius: 8px;
}

.invite-link {
  margin: var(--space-md) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  word-break: break-all;
}
</style>
