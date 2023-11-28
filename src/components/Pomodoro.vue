<template>
  <div class="container">
    <div class="circle"
      :style="{ 'background-image': `conic-gradient(from 0deg at 50% 50%, #3c77fcff ${(25*60-timer) / (25 * 60) * 100}%, rgba(255, 225, 255, 0.2) ${(25*60-timer) / (25 * 60) * 100}% 100%)` }">
      <div class="timer-text">
        {{ minutes }}:{{ seconds < 10 ? '0' + seconds : seconds }} </div>
      </div>
      <button class="button" @click="toggleTimer">
        {{ isRunning ? 'Stop' : 'Continue' }}
      </button>
    </div>
</template>

<script>
export default {
  name: 'Pomodoro',
  data() {
    return {
      timer: 25 * 60,
      isRunning: false,
      interval: null,
      circumference: 2 * Math.PI * 78
    };
  },
  computed: {
    minutes() {
      return Math.floor(this.timer / 60);
    },
    seconds() {
      return this.timer % 60;
    }
  },
  methods: {
    startTimer() {
      this.isRunning = true;
      this.interval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.stopTimer();
        }
      }, 1000);
    },
    stopTimer() {
      this.isRunning = false;
      clearInterval(this.interval);
    },
    toggleTimer() {
      if (this.isRunning) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
}

.circle {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  border-radius: 50%;
  overflow: hidden;
  z-index: 2;
}

.circle::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border-radius: 50%;
  background: #1E1E1E;
  z-index: 1;
  mask: radial-gradient(farthest-side, black 70%, transparent 71%);
}

.timer-text {
  z-index: 3;
}

.button {
  background-color: #3c77fcff;
  width: 100px;
  border-top-left-radius: 50px;
  border-top-right-radius: 50px;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
  border: none;
  padding: 0.6em 1em;
  color: white;
  font-size: 0.8em;
  cursor: pointer;
  margin: 3em;
  font-weight: 600;
} 

</style>