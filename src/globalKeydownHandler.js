export function handleGlobalKeyDown(e) {
    if (e.ctrlKey && e.altKey) {
      switch (e.key) {
        case 'n':
          this.newEvent.startTime = this.getCurrentTime()
          this.newEvent.endTime = this.getCurrentTimePlusOneHour()
          this.showEventForm = true;
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
  }