<script>
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from '../event-utils'
import { Splitpanes, Pane } from 'splitpanes'
import TaskView from '../components/TaskView.vue';
import CalendarForm from '../components/CalendarForm.vue';
import 'splitpanes/dist/splitpanes.css' //https://github.com/antoniandre/splitpanes
//import { handleGlobalKeyDown } from './globalKeydownHandler'


export default defineComponent({
  name: 'CalendarTaskView',
  mounted() {
    window.addEventListener('keydown', this.handleGlobalKeyDown);

    this.$nextTick(() => {
      this.initializeTaskTextbox();
      //this.adjustSidebarTop();
      //window.addEventListener('resize', this.adjustSidebarTop);
    });
    console.log('this.calendarOptions.events: ', this.calendarOptions.events);

    document.addEventListener('keydown', (event) => {

      if (event.ctrlKey && event.key === 't') {
        console.log('pressed ctrl+t');
        event.preventDefault();
        // Execute your shortcut functionality
      }
    });

  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeyDown);
    //window.removeEventListener('resize', this.adjustSidebarTop);
  },
  components: {
    FullCalendar,
    Splitpanes,
    Pane,
    TaskView,
    CalendarForm
  },

  computed: {
    ...mapState(['taskList', 'events', 'showEventForm']),
    calendarOptions() {
    // This is the getter function
    return {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin // needed for dateClick
      ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialView: 'timeGridWeek',
      initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      select: (selectInfo) => this.handleDateSelect(selectInfo),
      eventClick: (selectInfo) => this.handleEventClick(selectInfo),
      eventsSet: (selectInfo) => this.handleEvents(selectInfo),
      nowIndicator: true,
      businessHours: false,
      firstDay: 1,
      // contentHeight:"auto",
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      displayEventTime: false, // Set to false if you don't want to display the time on events
      events: this.events,
      // [
      //   { title: 'Firrst Event', date: '2023-12-02T13:00-14:00' },
      // ],
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    };
  },
  calendarKey() {
    return this.events.length;
  },
  },

  data() {
    return {
      currentTimeGridSlot_index: null,
      selectedTask: null,
      isDrag: false,
      draggedTask: null,
      dragTime: null,
      dragDay: null,
      initTaskText: '',
      currentTaskText: '',
      views: ['dayGridMonth', 'timeGridWeek', 'timeGridDay'],
      currentViewIndex: 1, // Start at week view (index 1 in the views array)
      currentEvents: [],
      newEvent: {
        title: '',
        start: '',
        end: '',
        startTime: '',
        endTime: '',
        color: ''
      },

    }
  },
  methods: {
    goToPomodoroPage() {
      this.$router.push('/pomodoro');
    },
    handleGlobalKeyDown(e) {
      // add shorcut: if ctrl+shift+p call function: goToPomodoroPage()
      if (e.ctrlKey && e.altKey && e.key === 'p') {
        this.goToPomodoroPage();
      }
      if (e.ctrlKey && e.altKey) {
        switch (e.key) {
          case 'n':
            this.newEvent.startTime = this.getCurrentTime()
            this.newEvent.endTime = this.getCurrentTimePlusOneHour()
            this.$store.commit('toggleShowEventForm')
            this.$nextTick(() => {
              this.$refs.titleInput.focus();
            });
            break;
          case 'd':
            this.changeView('dayGridDay');
            break;
          case 'w':
            this.changeView('timeGridWeek'); // or 'dayGridWeek'
            break;
          case 'm':
            this.changeView('dayGridMonth');
            break;
        }
      }
      if (e.ctrlKey && e.key === 'ArrowRight') {
        this.cycleView('next');
      }
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        this.cycleView('previous');
      }

      if (e.ctrlKey && e.key === 'q') {
        //document.querySelector('.task-input').focus();
        // do same but focus on last element with class ".task-input":
        document.querySelectorAll('.task-input')[document.querySelectorAll('.task-input').length - 1].focus();
      }


      // Here comees the functionality to delete tasks when deleting the checkbox
      let selection = window.getSelection();
      if (!selection.rangeCount) return;

      let range = selection.getRangeAt(0);
      let currentDiv = range.startContainer;

      // Navigate up to the div element
      while (currentDiv && currentDiv.nodeName !== 'DIV') {
        currentDiv = currentDiv.parentNode;
      }

      if (e.key === 'Backspace' && currentDiv && currentDiv.classList.contains('task-container-saved')) {
        // Check if the cursor is at the start of the div (just after the checkbox)
        if (range.startOffset === 1) {
          e.preventDefault(); // Prevent default backspace behavior

          // Get the ID of the div
          let taskId = currentDiv.id;

          // Remove the task from taskList
          this.taskList = this.taskList.filter(task => task.id !== taskId);

          // Remove the div from the DOM
          currentDiv.parentNode.removeChild(currentDiv);
        }
      }
    },

    setTaskTimeRange(taskId, timeRange) {
      const task = this.taskList.find(t => t.id === taskId);
      if (task) {
        task.timeRange = timeRange;
      }
    },

    changeTaskProject(taskId, project) {
      const task = this.taskList.find(t => t.id === projectId);
      if (task) {
        task.project = project;
      }
    },
    initializeTaskTextbox() {
      const taskTextbox = this.$refs.taskTextBoxRef //this.$el.querySelector('.task-textbox');
      if (taskTextbox && taskTextbox.textContent.trim() === '') {
        // The textbox is empty, insert the initial checkbox
        taskTextbox.innerHTML = '<div class="checkbox"><input type="checkbox"><label for="p1"> Dummy Task</label> </div>';
      }
    },
    generateTaskId() {
      return 'task-' + Math.random().toString(36).substr(2, 9);
    },

    cycleView(direction) {
      if (direction === 'next') {
        this.currentViewIndex = (this.currentViewIndex + 1) % this.views.length;
      } else if (direction === 'previous') {
        this.currentViewIndex = (this.currentViewIndex - 1 + this.views.length) % this.views.length;
      }
      this.changeView(this.views[this.currentViewIndex]);
    },
    changeView(viewName) {
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.changeView(viewName);
    },

    handleDateSelect(selectInfo) {
      let startTime = new Date();
      let endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // One hour later
      //console.log('startTime.toTimeString().split()[0].substring(0, 5)', startTime.toTimeString().split(' ')[0].substring(0, 5));
      this.newEvent = {
        title: '',
        start: selectInfo.startStr.split('T')[0],
        end: selectInfo.endStr.split('T')[0],
        startTime: selectInfo.startStr.split('T')[1].substring(0, 5),
        endTime: selectInfo.endStr.split('T')[1].substring(0, 5),
        //startTime: startTime.toTimeString().split(' ')[0].substring(0, 5),
        //endTime: endTime.toTimeString().split(' ')[0].substring(0, 5),
          //         start: selectInfo.startStr,
          // end: selectInfo.endStr,
          // allDay: selectInfo.allDay
      };
      this.$nextTick(() => {
        this.$store.commit('toggleShowEventForm')
});
    },
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
    },
    adjustSidebarTop() {
      const calendarEl = this.$refs.fullCalendar ? this.$refs.fullCalendar.$el : null;
      const headerEl = calendarEl ? calendarEl.querySelector('.fc-header-toolbar') : null;
      const sidebarEl = this.$refs.tasksSidebarRef;
      if (headerEl && sidebarEl) {
        const headerHeight = headerEl.offsetHeight + 10;
        sidebarEl.style.marginTop = headerHeight + 'px';
      }
    },

    // handleDateSelect(selectInfo) {
    //   let title = prompt('Please enter a new title for your event')
    //   let calendarApi = selectInfo.view.calendar

    //   calendarApi.unselect() // clear date selection

    //   if (title) {
    //     calendarApi.addEvent({
    //       id: createEventId(),
    //       title,
    //       start: selectInfo.startStr,
    //       end: selectInfo.endStr,
    //       allDay: selectInfo.allDay
    //     })
    //   }
    // },
    handleEventClick(clickInfo) {
      //console.log('clickInfo: ', clickInfo);
      //clickInfo.event.setProp('title', 'NEW TITLE')
      //clickInfo.el.backgroundColor = "#ffffff"
      // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      //   clickInfo.event.remove()
      // }
    },
    handleEvents(events) {
      this.currentEvents = events
    },
  }
})

</script>

<template>

  <CalendarForm :newEvent="newEvent" v-if="showEventForm" @newEvent="newEvent" />
  

  <!-- <splitpanes vertical class="default-theme">
    <pane ref="pane1" :size="75"> -->
  <div class='demo-app'>
    <router-view />
    <div class='demo-app-main'>
      <FullCalendar class='demo-app-calendar' :options='calendarOptions' :key="calendarKey" ref="fullCalendar">
        <!-- <template #dayHeaderContent="arg">
          <div>{{ arg.date.toFormat('EEE') }}</div>
          <div class='small-text'>{{ arg.date.toFormat('d') }}</div>
        </template> -->
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
    <div class='tasks-sidebar'>
    <TaskView ref="tasksSidebarRef" />
  </div>


  </div>
  <!-- </pane>
    <pane :size="25"> -->

  <!-- </pane>
  </splitpanes> -->
</template>

<style lang='css'>
.fc-day-sat {
  background-color: #222222;
}

.fc-day-sun {
  background-color: #222222;
}




input {
  outline: none;
}

input:focus {
  border-color: red;
}

/* You may need to adjust your layout styles to accommodate the new sidebar */
.demo-app {
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  height: 100vh;
  padding: 0px;
  background: #1E1E1E;
  /* Full viewport height */
}

.demo-app-main {
  flex-grow: 1;
  width: 100%;
  margin: 1em 0;
  padding: 2em 0em 3em 0.8em;
  /* Ensure the calendar takes up the remaining space */
}


.demo-app-main,
.tasks-sidebar {
  box-sizing: border-box;
  height: 100%;
}


.tasks-sidebar {
  padding: 20px 10px;
  box-sizing: border-box;
  height: 100%;
  width: 40vw;
  overflow-y: auto;
  margin-top: 55px;
  /* Ensure no top margin */
  /* Scroll if content overflows */
  color: rgba(255, 225, 255, 0.8);
  font-weight: 900;
  background-color: #1E1E1E;
}



.splitpanes__splitter {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(255, 0, 0, 0.3);
  opacity: 0;
  z-index: 1;
  margin: 0;
  padding: 0;
  width: 0;
}

.default-theme.splitpanes--vertical>.splitpanes__splitter,
.default-theme .splitpanes--vertical>.splitpanes__splitter {
  width: 0px;
  cursor: col-resize;
}

splitpanes.default-theme .splitpanes__pane {
  background-color: #1E1E1E;
}


:root {
  --fc-border-color: #292929;
  --fc-today-bg-color: #292929;
  --fc-button-bg-color: #1E1E1E;
  --fc-button-active-bg-color: #2c2c2c;
  --fc-button-active-border-color: #2c2c2c;
  /* --fc-event-border-color: #000102; */
}

.fc .fc-button {
  font-size: 0.8em;
}

.fc-toolbar-title {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.2em;
}

.fc-timegrid-event-harness-inset .fc-timegrid-event,
.fc-timegrid-event.fc-event-mirror,
.fc-timegrid-more-link {
  box-shadow: 0px 0px 0px 0px var(--fc-page-bg-color);
}

.fc .fc-timegrid-slot-minor {
  border: 0px solid #d3e2e8;
}

.fc-scrollgrid-liquid {
  border-width: 0px;
}

.fc-scrollgrid {
  border-width: 0px !important;
}

.fc-col-header-cell-cushion {
  color: rgba(255, 225, 255, 0.6);
  text-decoration: none;
}

.fc-timegrid-slot-label-cushion {
  color: rgba(255, 225, 255, 0.6);
}

.fc-timegrid-axis-cushion {
  color: rgba(255, 225, 255, 0.6);
}

/* .fc-day-today{
  background-color: white;
} */



.event-form-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b {
  /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-left: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}


.fc {
  /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}





.event-form-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  z-index: 1000;
}

.event-form .form-group {
  margin-bottom: 15px;
}

.event-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.event-form .form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.event-form .form-actions {
  text-align: right;
  margin-top: 20px;
}

.event-form .btn-submit,
.event-form .btn-cancel {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.event-form .btn-submit {
  background-color: #4CAF50;
  color: white;
}

.event-form .btn-cancel {
  background-color: #f44336;
  color: white;
}



/* SCROLLBAR - START - */

/* width */
.fc-scroller::-webkit-scrollbar {
  width: 1px;
}

/* Track */
.fc-scroller::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 0px;
}



/* Handle */
.fc-scroller::-webkit-scrollbar-thumb {
  background: linear-gradient(#ffffff, #103E62);
  ;
}



/* Handle on hover */
.fc-scroller::-webkit-scrollbar-thumb:hover {
  background: #103E62;
}
</style>
