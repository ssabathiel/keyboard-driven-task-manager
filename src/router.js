// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Pomodoro from './components/Pomodoro.vue';
import CalendarTaskView from './components/CalendarTaskView.vue';
import TaskView from './components/TaskView.vue';

const routes = [
  { path: '/', component: CalendarTaskView },
  { path: '/taskview', component: TaskView },
  { path: '/pomodoro', component: Pomodoro },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;