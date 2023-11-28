// src/main.js
import { createApp } from 'vue';
import router from './router';
import store from './store'; 
import './style.css';
import DemoApp from './DemoApp.vue';

createApp(DemoApp)
  .use(router)
  .use(store)
  .mount('#app');