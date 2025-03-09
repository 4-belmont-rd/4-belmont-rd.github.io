<script lang="ts">
  import Month from "./Month.svelte";
  import type { DateRange } from "src/services/airbnb";

  export var bookedDates: Date[] = [];

  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
  }
</script>

<div class="navigation">
  <button on:click={() => changeMonth(-1)}>&lt; Previous</button>
  <button on:click={() => changeMonth(1)}>Next &gt;</button>
</div>

<div class="calendar-wrapper">
  <Month {currentMonth} {bookedDates}></Month>
  <Month currentMonth={currentMonth + 1} {bookedDates}></Month>
  <Month currentMonth={currentMonth + 2} {bookedDates}></Month>
</div>

<style>
  .calendar-wrapper {
    display: flex;
    justify-content: space-around;
    padding: 10px;
  }

  button {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    cursor: pointer;
    padding: 5px 10px;
  }

  .navigation {
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }
</style>

