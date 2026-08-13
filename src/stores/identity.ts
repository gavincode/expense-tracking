import { defineStore } from 'pinia';
import { ref } from 'vue';

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
    // 无 localStorage 环境（如测试）忽略
  }
}

export const useIdentityStore = defineStore('identity', () => {
  const deviceId = ref(safeGet('rl_device_id'));
  const nickname = ref(safeGet('rl_nickname') || '我');

  function ensureDeviceId(): string {
    if (!deviceId.value) {
      deviceId.value = crypto.randomUUID();
      safeSet('rl_device_id', deviceId.value);
    }
    return deviceId.value;
  }

  function setNickname(name: string): void {
    nickname.value = name.trim() || '我';
    safeSet('rl_nickname', nickname.value);
  }

  return { deviceId, nickname, ensureDeviceId, setNickname };
});
