<!-- src/DemoApp.vue -->
<template>
  <div class='demo-app'>
    <div class="demo-app-sidebar">
      <router-link to="/">
        <img class="side-bar-icon" src="./icons/calendar.svg" alt="Home">
      </router-link>
      <router-link to="/pomodoro">
        <img class="side-bar-icon" src="./icons/focus.svg" alt="Pomodoro">
      </router-link>
      <router-link to="/taskview">
        <img class="side-bar-icon" src="./icons/list.svg" alt="Taskview">
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
// Your script here
</script>

<style scoped>
.demo-app-sidebar {
  position: fixed;
  left: 0;
  height: 100%;
  width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #111010;
  margin: 0;
  padding: 0;
  padding-top: 20px;
  border: none;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  padding-right: 0;
  margin-left: 30px;
}

.side-bar-icon {
  filter: invert(40%);
}
</style>