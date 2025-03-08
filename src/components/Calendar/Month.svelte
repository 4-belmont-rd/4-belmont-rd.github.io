<script lang="ts">
  export let addMonths: number = 0;

  let today = new Date();
  export let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let takenDates: Date[] = [new Date(2025, 3, 3), new Date(2025, 3, 9)];

  if (addMonths > 0) currentMonth += addMonths;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getStartDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function isToday(day: number, month: number, year: number): boolean {
    const inputDate = new Date(year, month, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate.getTime() == today.getTime();
  }

  function isBeforeToday(day: number, month: number, year: number): boolean {
    const inputDate = new Date(year, month, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate.getTime() < today.getTime();
  }

  function isTaken(day, month, year) {
    let date = new Date(year, month, day);
    let condition = takenDates.some((d) => {
      return (
        d.toDateString() === date.toDateString() ||
        isBeforeToday(day, month, year)
      );
    });
    return condition;
  }
</script>

<div class="calendar">
  <div class="header">
    <strong
      >{months[currentMonth % 12]}
      {currentMonth === 11 ? currentYear + 1 : currentYear}</strong
    >
  </div>
  <br />

  <!-- Days of the week -->
  {#each daysOfWeek as dayOfWeek}
    <div class="day"><strong>{dayOfWeek}</strong></div>
  {/each}

  <!-- Empty cells for the first week -->
  {#each Array(getStartDayOfMonth(currentYear, currentMonth % 12)).fill(0) as _}
    <div class="day"></div>
  {/each}

  <!-- Days of the month -->
  {#each Array(getDaysInMonth(currentYear, currentMonth % 12))
    .fill(0)
    .map((_, i) => i + 1) as day}
    <div
      class="day"
      class:taken={isTaken(day, currentMonth, currentYear)}
      class:today={isToday(day, currentMonth, currentYear)}
    >
      {day}
    </div>
  {/each}
</div>

<style>
  .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    width: 300px;
    margin: 10px;
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
  }

  .day {
    padding: 10px;
  }

  .today {
    background-color: #3498db;
    color: white;
    border-radius: 50%;
  }

  .taken {
    color: grey;
    opacity: 50%;
  }
</style>
