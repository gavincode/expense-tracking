import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  Button,
  Cell,
  CellGroup,
  DatePicker,
  Empty,
  Field,
  NavBar,
  NumberKeyboard,
  Popup,
} from 'vant';
import App from './App.vue';
import router from './router';
import 'vant/lib/index.css';
import './styles/tokens.css';
import { registerSW } from 'virtual:pwa-register';

const app = createApp(App);

[Button, Cell, CellGroup, DatePicker, Empty, Field, NavBar, NumberKeyboard, Popup].forEach(
  (component) => app.use(component),
);

app.use(createPinia()).use(router).mount('#app');

registerSW({ immediate: true });
