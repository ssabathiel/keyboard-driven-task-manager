export function getCurrentTime() {
    let startTime = new Date();
    let currentTime = startTime.toTimeString().split(' ')[0].substring(0, 5)
    return currentTime
  }

export function getCurrentDay() {
    let currentTime = new Date();
    let currentDay = currentTime.toLocaleDateString();
    return currentDay
  }

export function getCurrentTimePlusOneHour() {
    let startTime = new Date();
    let endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // One hour later
    let currentTimePluseOneHour = endTime.toTimeString().split(' ')[0].substring(0, 5)
    return currentTimePluseOneHour
  }