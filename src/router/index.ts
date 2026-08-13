import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
import RecordView from '../pages/RecordView.vue';
import CategoryView from '../pages/CategoryView.vue';
import ListView from '../pages/ListView.vue';
import DetailView from '../pages/DetailView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/record', name: 'record', component: RecordView },
    { path: '/categories', name: 'categories', component: CategoryView },
    { path: '/list', name: 'list', component: ListView },
    { path: '/detail/:id', name: 'detail', component: DetailView },
  ],
});

export default router;
