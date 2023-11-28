<template>
  <div class='event-form-modal'>

<form @submit.prevent="addNewEvent" class="event-form">
  <div class="form-group">
    <label for="title">Title:</label>
    <input type="text" id="title" ref="titleInput" v-model="newEvent.title" required class="form-control" />
  </div>

  <div class="form-group">
    <label for="start-date">Start Date:</label>
    <input type="date" id="start-date" v-model="newEvent.start" required class="form-control" />
  </div>

  <div class="form-group">
    <label for="end-date">End Date:</label>
    <input type="date" id="end-date" v-model="newEvent.end" required class="form-control" />
  </div>

  <div class="form-group">
    <label for="start-time">Start Time:</label>
    <input type="time" id="start-time" v-model="newEvent.startTime" required class="form-control" />
  </div>

  <div class="form-group">
    <label for="end-time">End Time:</label>
    <input type="time" id="end-time" v-model="newEvent.endTime" required class="form-control" />
  </div>

  <div class="form-actions">
    <button type="submit" class="btn-submit">Add Event</button>
    <button type="button" class="btn-cancel" @click="toggleShowEventForm">Cancel</button>
    <!-- <button type="button" class="btn-cancel" @click="console.log(newEvent)">Show newEvent</button> -->
  </div>
</form>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'


export default {
  name: 'CalendarForm',
  computed: {
        ...mapState(['showEventForm'])
    },
  props: {
    newEvent: {
      type: Object, // or the type of your `newEvent`
      required: true
    }
  },
  methods: {
    toggleShowEventForm() {
      this.$store.commit('toggleShowEventForm')
    },
    addNewEvent() {
      // this.events = [
      //   ...this.events,
      //   {
      //     title: this.newEvent.title,
      //     start: this.newEvent.start + 'T' + this.newEvent.startTime,
      //     end: this.newEvent.end + 'T' + this.newEvent.endTime,
      //     allDay: false,
      //   }
      // ];

      let eventy = {
                  title: this.newEvent.title,
                  start: this.newEvent.start + 'T' + this.newEvent.startTime,
                  end: this.newEvent.end + 'T' + this.newEvent.endTime,
                  allDay: false,
                }
      this.$store.commit('addEvent', eventy);

      // Reset form and hide
      let emptyEvent = { title: '', start: '', end: '', startTime: '', endTime: '' };
      //this.$store.commit('addEvent', emptyEvent);
      this.$store.commit('toggleShowEventForm')
    },
  }
}
</script>

<style scoped>
/* Your component's styles go here */
</style>
