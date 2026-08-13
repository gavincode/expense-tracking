import { defineStore } from 'pinia';
import { ref } from 'vue';
import dayjs from 'dayjs';

/** 记账草稿：跨页面（记账页 ↔ 分类页）保持输入，保存成功后重置。 */
export const useDraftStore = defineStore('record-draft', () => {
  const amount = ref('');
  const note = ref('');
  const date = ref(dayjs().format('YYYY-MM-DD'));

  function reset() {
    amount.value = '';
    note.value = '';
    date.value = dayjs().format('YYYY-MM-DD');
  }

  return { amount, note, date, reset };
});
