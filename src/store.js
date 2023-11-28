// store.js
import { createStore } from 'vuex'
import fs from 'fs'

export default createStore({
  state: {
    taskList: [],
    events: [
        { title: 'Firrst Event', date: '2023-11-28T13:00-14:00' },
    ],
    showEventForm: false,
  },
  mutations: {
    setTaskList(state, tasks) {
      state.taskList = tasks
    },
    deleteTask(state, taskID) {
        state.taskList = state.taskList.filter(task => task.id !== taskID);
    },
    addEvent(state, event) {
        state.events.push(event);
      },
        toggleShowEventForm(state) {
            state.showEventForm = !state.showEventForm;
        },
  },
  actions: {
    fetchTasks({ commit }) {
      fs.readFile('tasks.json', (err, data) => {
        if (err) throw err
        commit('setTaskList', JSON.parse(data))
      })
    },
    saveTasks({ state }) {
      fs.writeFile('tasks.json', JSON.stringify(state.taskList), (err) => {
        if (err) throw err
      })
    }
  }
})