<script lang="ts">
  import { onMount } from "svelte";
  import Month from "./Month.svelte";

  export var bookedDates: Date[] = [];
  export let startDate: Date;
  export let endDate: Date;

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

  let isMobile = window.innerWidth <= 800;

  function handleResize() {
    isMobile = window.innerWidth <= 800;
  }

  onMount(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });
</script>

{#if !isMobile}
  <div class="navigation">
    <button on:click={() => changeMonth(-1)}>&lt; Previous</button>
    <button on:click={() => changeMonth(1)}>Next &gt;</button>
  </div>
  <div class="calendar-wrapper">
    <Month {currentMonth} {bookedDates} {startDate} {endDate} on:dateSelected
    ></Month>
    <Month
      currentMonth={currentMonth + 1}
      {bookedDates}
      {startDate}
      {endDate}
      on:dateSelected
    ></Month>
    <Month
      currentMonth={currentMonth + 2}
      {bookedDates}
      {startDate}
      {endDate}
      on:dateSelected
    ></Month>
  </div>
{:else}
  <div class="mobile-navigation">
    <button on:click={() => changeMonth(-1)} class="prev">&#9665;</button>
    <button on:click={() => changeMonth(1)} class="next">&#9655;</button>
    <Month {currentMonth} {bookedDates} {startDate} {endDate} on:dateSelected
    ></Month>
  </div>
{/if}

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

  .mobile-navigation {
    position: relative;
  }

  .prev,
  .next {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .prev {
    left: 5px;
  }

  .next {
    right: 5px;
  }
</style>
