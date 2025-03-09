<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let addMonths: number = 0;
  export var bookedDates: Date[] = [];

  let today = new Date();
  export let currentMonth = today.getMonth();

  const dispatch = createEventDispatcher();

  let currentYear = today.getFullYear();
  let takenDates: Date[] = [new Date(2025, 3, 3), new Date(2025, 3, 9)];
  $: takenDates = bookedDates;

  export let startDate: Date;
  export let endDate: Date;

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

  function dateSelected(date: Date) {
    dispatch("dateSelected", date);
  }

  function isSelected(day: number, month: number, year: number) {
    const inputDate = new Date(year, month, day);
    let x = startDate?.getTime() == inputDate.getTime();
    let y = endDate?.getTime() == inputDate.getTime();
    return x || y;
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
  {#key takenDates}
    {#key startDate}
      {#key endDate}
        {#each Array(getDaysInMonth(currentYear, currentMonth % 12))
          .fill(0)
          .map((_, i) => i + 1) as day}
          <div
            class="day"
            class:taken={isTaken(day, currentMonth, currentYear)}
            class:today={isToday(day, currentMonth, currentYear)}
            class:selected={isSelected(day, currentMonth, currentYear)}
            on:click={() =>
              dateSelected(new Date(currentYear, currentMonth, day))}
          >
            {day}
          </div>
        {/each}
      {/key}
    {/key}
  {/key}
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
    cursor: pointer;
  }
  .day:hover {
    background-color: #018786;
    color: white;
    border-radius: 50%;
  }

  .taken {
    color: grey;
    opacity: 50%;
  }

  .today {
    background-color: grey;
    color: white;
    opacity: 50%;
    border-radius: 50%;
  }

  .selected {
    background-color: #018786;
    color: white;
    opacity: 50%;
    border-radius: 50%;
  }
</style>
