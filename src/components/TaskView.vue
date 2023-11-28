<!-- TaskView.vue -->
<template>
        <div class="task-page-container">
        <h3 style="font-weight: bold;">Tasks</h3>
        <div class='task-textbox' @keydown="handleKeyDown">
            <div v-for="task in taskList" :key="task.id" class="checkbox checkbox-label-container"
                :class="{ 'selected': task.isSelected, 'task-container-saved': true, 'task-done': task.isDone }"
                v-on:click.self="toggleTaskSelection(task.id)" draggable="true" v-on:dragstart="isDrag = true"
                v-on:dragend="isDrag = false" v-on:drag="toggleTaskIsDragged(task.id)">

                <input class="checkbox-checkbox" type="checkbox" v-model="task.isDone">
                <input class="task-input" ref="taskInputRef" v-model="task.text">
            </div>
            <div class="checkbox checkbox-label-container" @focus="formatEditableContent">
                <input class="checkbox-checkbox" type="checkbox">
                <input class="task-input" v-model="currentTaskText" @keyup.enter="createTask">
            </div>
        </div>
        <button @click="debugFct">debugFct</button>
    </div>

</template>
  
<script>
import { mapState, mapActions } from 'vuex'
//import time_utils.js:
import { getCurrentTime, getCurrentDay } from '../time_utils.js';

export default {
    name: 'TaskView',
    data() {
        return {
            currentTaskText: '',
            isCurrentTaskDone: false,
            selectedTask: null,
            draggedTask: null,
            isDrag: false
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleGlobalKeyDown);
        console.log("tasks: ", this.taskList)
    },
    computed: {
        ...mapState(['taskList', 'events'])
    },
    methods: {
        ...mapActions(['saveTasks']),
        updateTasks(newTasks) {
            this.taskList = newTasks
            this.saveTasks()
        },
        createTask() {
            if (this.currentTaskText.trim() !== '') {
                const taskId = 'task-' + Math.random().toString(36).substr(2, 9);
                this.taskList.push({
                    id: taskId,
                    text: this.currentTaskText.trim(),
                    note: '',
                    isSelected: false,
                    isDone: false,
                    isDragged: false
                });
                this.resetCurrentTask();
            }
        },
        toggleTaskSelection(taskId) {
            const task = this.taskList.find(t => t.id === taskId);
            if (task) {
                //task.isSelected = !task.isSelected;
                console.log('defining draggedTask: setting this.draggedTask = task');
                this.draggedTask = task;
                task.isSelected = !task.isSelected;
                if (task.isSelected) {
                    this.selectedTask = task;
                }
                else {
                    this.selectedTask = null;
                }
            }
        },
        addOneHour(date, time) {
            console.log('date: ', date);
            console.log('time: ', time);

            let startTime = new Date(date + 'T' + time);
            let endDateTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // One hour later

            let endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5)
            console.log('endDateTime.toTimeString(): ', endDateTime.toTimeString());
            // get date from endDateTime:
            let endDay = endDateTime.toLocaleDateString();

            return [endDay, endTime]
        },
        saveHoveredDay(day) {
            this.dragDay = day;
            console.log('hoveredDay: ', day);
        },
        saveHoveredTime(time) {
            this.dragTime = time;
            console.log('hoveredTime: ', time);
        },
        debugFct() {
            console.log('isDrag: ', this.isDrag);
            console.log('this.events: ', this.events);
        },

        toggleTaskIsDragged(taskId) {
            const task = this.taskList.find(t => t.id === taskId);
            if (task) {
                task.isDragged = !task.isDragged;
                this.draggedTask = task;
            }
        },

        updateTaskCompletion(taskId, isDone) {
            const task = this.taskList.find(t => t.id === taskId);
            if (task) {
                task.isDone = isDone;
            }
        },
        timeGridSlotMouseOver(i) {
            {
                if (this.isDragManuell) {
                    let timeGridSlot = this.timeGridSlot;
                    let timeGridCol = this.timeGridCol;
                    let time = timeGridSlot[i].getAttribute('data-time');
                    this.saveHoveredTime(time)
                    timeGridSlot[i].style.pointerEvents = 'none';
                    // check all elements in list timeGridCol whether I am hovering over it:
                    for (let j = 0; j < timeGridCol.length; j++) {
                        // if mousover timeGridCol[j] (check first by getting mouse position and check whether within timeGridCol[j].getBoundingClientRect()): then get day = timeGridCol[i].getAttribute('data-date'):
                        // get mouse-position:
                        let mousePosition = {
                            x: event.clientX,
                            y: event.clientY
                        };
                        // get position of timeGridCol[j]:
                        let timeGridColPosition = timeGridCol[j].getBoundingClientRect();
                        // check whether mousePosition is within timeGridColPosition:
                        if (mousePosition.x >= timeGridColPosition.left &&
                            mousePosition.x <= timeGridColPosition.right &&
                            mousePosition.y >= timeGridColPosition.top &&
                            mousePosition.y <= timeGridColPosition.bottom) {
                            let day = timeGridCol[j].getAttribute('data-date');
                            this.saveHoveredDay(day)
                            // reset timeGridSlot[i].style.pointerEvents = 'none' to default:
                            timeGridSlot[i].style.pointerEvents = 'auto';
                            // remove any mouseover eventlistener on timeGridSlot[j] for all j != i:
                            // do the same loop over all timegrid-slot elements
                            for (let k = 0; k < timeGridSlot.length; k++) {
                                // give time as an argument to the function that is called when mouseover event is triggered
                                timeGridSlot[k].removeEventListener('mouseover', () => this.timeGridSlotMouseOver(k));
                            }

                            // Create new event with draggedTask and dragDay and dragTime:
                            // get start and end time of draggedTask:
                            let start = this.dragDay;
                            let startTime = this.dragTime;
                            let [endDay, endTime] = this.addOneHour(start, startTime);
                            //replace all "/" with - in currentDay:
                            endDay = endDay.replace(/\//g, '-');
                            endDay = endDay.slice(-4) + "-" + endDay.slice(0, -5);
                            // yyyy-mm-dd: if month or day is < 10, add 0 in front:
                            let endDaySplit = endDay.split('-');
                            if (endDaySplit[1].length < 2) {
                                endDaySplit[1] = '0' + endDaySplit[1];
                            }
                            // same for the day, but only for string between last - and 'T'
                            //endDaySplit[2] = endDaySplit[2].split('T')[0];
                            if (endDaySplit[2].length < 2) {
                                endDaySplit[2] = '0' + endDaySplit[2];
                            }
                            endDay = endDaySplit.join('-');
                            endTime = endTime + ':00'
                            let title = this.draggedTask.text;
                            this.newEvent = {
                                title: title,
                                start: start,
                                end: endDay,
                                startTime: startTime,
                                endTime: endTime,
                            };

                            let eventy = {
                                title: this.newEvent.title,
                                start: this.newEvent.start + 'T' + this.newEvent.startTime,
                                end: this.newEvent.end + 'T' + this.newEvent.endTime,
                                allDay: false,
                            }
                            this.$store.commit('addEvent', eventy);

                        }
                    }
                }
                this.isDragManuell = false;
            }
        },

        resetCurrentTask() {
            this.currentTaskText = '';
            this.isCurrentTaskDone = false;
        },
        handleGlobalKeyDown(e) {
            if (e.ctrlKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.shiftKey) {
                if (this.selectedTask) {
                    let index = this.taskList.indexOf(this.selectedTask);
                    this.selectedTask.isSelected = false;

                    if (e.key === 'ArrowDown' && index < this.taskList.length - 1) {
                        this.selectedTask = this.taskList[index + 1];
                    } else if (e.key === 'ArrowUp' && index > 0) {
                        this.selectedTask = this.taskList[index - 1];
                    }

                    this.selectedTask.isSelected = true;
                } else {
                    if (e.key === 'ArrowDown') {
                        this.selectedTask = this.taskList[0];
                    } else if (e.key === 'ArrowUp') {
                        this.selectedTask = this.taskList[this.taskList.length - 1];
                    }

                    this.selectedTask.isSelected = true;
                }
            }
            // add shortcut similar to if (e.ctrlKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')), but with shiftKey:
            // if shiftKey is pressed and ArrowDown or ArrowUp is pressed, then move task up or down in taskList:
            if (e.ctrlKey && e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                if (this.selectedTask) {
                    let index = this.taskList.indexOf(this.selectedTask);
                    this.selectedTask.isSelected = false;
                    let selectedTask = this.selectedTask
                    let selectedTaskCopy = { ...selectedTask }
                    if (e.key === 'ArrowDown' && index < this.taskList.length - 1) {
                        // move task down in taskList:
                        this.taskList.splice(index, 1);
                        this.taskList.splice(index + 1, 0, selectedTaskCopy);
                        // select task again:
                        this.selectedTask = this.taskList[index + 1];
                    } else if (e.key === 'ArrowUp' && index > 0) {
                        // move task up in taskList:
                        this.taskList.splice(index, 1);
                        this.taskList.splice(index - 1, 0, selectedTaskCopy);
                        // select task again:
                        this.selectedTask = this.taskList[index - 1];
                    }

                    this.selectedTask.isSelected = true;
                }
            }

            // add shortcut: if e.key === delete and task is selected, delete task
            if (e.key === 'Delete') {
                // dummy element
                var myElement = document.getElementById('task-input');

                // check for focus
                var isFocused = (document.activeElement === myElement);
                if (this.selectedTask) {

                    this.$store.commit('deleteTask', this.selectedTask.id);

                }

            }

            if (e.ctrlKey && e.key === 'm') {
                // dummy element
                var myElement = document.getElementById('task-input');

                // check for focus
                var isFocused = (document.activeElement === myElement);

                if (this.selectedTask) {

                    let currentTime = getCurrentTime() + ":00"
                    let currentDay = getCurrentDay()
                    //replace all "/" with - in currentDay:
                    currentDay = currentDay.replace(/\//g, '-');
                    // change order strings: from month-day-year to year-month-day: e.g. 12-31-2021 to 2021-12-31
                    // get last 4 characters of currentDay add them to the beginning of currentDay and remove last 4 characters:
                    currentDay = currentDay.slice(-4) + "-" + currentDay.slice(0, -5);

                    let [endDay, endTime] = this.addOneHour(currentDay, currentTime);
                    // create event with task-text as title at current time and date
                    // this.newEvent.title = this.selectedTask.text;
                    // this.newEvent.start = currentDay
                    // this.newEvent.end = endDay
                    // this.newEvent.startTime = currentTime
                    // this.newEvent.endTime = endTime
                    //   this.calendarOptions.events = [
                    //     ...this.calendarOptions.events,
                    //     {
                    //       title: this.newEvent.title,
                    //       start: this.newEvent.start + 'T' + this.newEvent.startTime,
                    //       end: this.newEvent.end + 'T' + this.newEvent.endTime,
                    //       allDay: false,
                    //     }
                    //   ];

                    let eventy = {
                        title: this.selectedTask.text,
                        start: currentDay + 'T' + currentTime,
                        end: endDay + 'T' + endTime,
                        allDay: false,
                    }
                    this.$store.commit('addEvent', eventy);
                }
            }

        },
    },

    watch: {
        isDrag: function (newVal, oldVal) {
            if (newVal) {
                this.isDragManuell = true;
                console.log('isDrag: ', newVal);
                // track-mouse-position. if mouse hovers over element with class fc-scrollgrid-section, identify td element with class 'timegrid-slot' where we are hovering over
                let fcScrollGridSection = document.getElementsByClassName('fc-scrollgrid-section')[0];
                this.timeGridCol = document.getElementsByClassName('fc-timegrid-col');
                this.timeGridSlot = document.getElementsByClassName('fc-timegrid-slot');

                // do the same loop over all timegrid-slot elements
                for (let i = 0; i < this.timeGridSlot.length; i++) {
                    // give time as an argument to the function that is called when mouseover event is triggered
                    this.timeGridSlot[i].addEventListener('mouseover', () => this.timeGridSlotMouseOver(i)
                    );
                }

            }

        }
    },
}
</script>

<style lang="css">
.task-textbox {
  /* Styles to make it look like a textarea */
  border: 1px hidden #ddd;
  border-radius: 4px;
  padding: 10px 0px;
  margin-top: 10px;
  height: calc(100% - 40px);
  overflow-y: auto;
  white-space: pre-wrap;
  color: rgba(255, 225, 255, 1.0);
  font-weight: normal;
  /* Preserve line breaks */
}

.task-page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  padding-right: 0;
  margin-top: 40px;
}

.selected {
  border: 1px solid white;
}

.task-input {
  background: none;
  border: none;
  color: white;
}

.checkbox input,
.checkbox label {
  display: inline-block;
  vertical-align: middle;
}

.checkbox-checkbox {
  margin-right: 6px;
}

.checkbox-label-container {
  margin: 2px 10px;
}

.task-container-saved {
  /* display: flex; */
  /* align-items: center; Align checkbox and text centers horizontally */
  background-color: #165390;
  /* Example background color 3788D8 */
  border-radius: 10px;
  /* Rounded corners */
  padding: 5px 10px;
  /* Padding inside the container */
  margin: 10px 0;
  /* Margin around the container */
}

.task-not-done {
  background-color: #165390;
  color: rgba(255, 255, 255, 1.0);
}

.task-done {
  background-color: rgba(34, 73, 113, 0.567);
  color: rgba(255, 255, 255, 0.68);
}
</style>