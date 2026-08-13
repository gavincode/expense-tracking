import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
import RecordView from '../pages/RecordView.vue';
import CategoryView from '../pages/CategoryView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/record', name: 'record', component: RecordView },
    { path: '/categories', name: 'categories', component: CategoryView },
  ],
});

export default router;
