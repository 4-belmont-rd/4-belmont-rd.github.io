<script lang="ts">
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let takenDates: Date[] = [new Date(2024, 8, 30), new Date("02/11/2024")]
  
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    // Utility function to calculate the days in a given month/year
    function getDaysInMonth(year, month) {
      return new Date(year, month + 1, 0).getDate();
    }
  
    // Utility function to calculate the day of the week the month starts on
    function getStartDayOfMonth(year, month) {
      return new Date(year, month, 1).getDay();
    }
  
    // Function to handle month navigation
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
  
    function isToday(day, month, year) {
      return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      );
    }

    function isTaken(day, month, year) {
        let date = new Date(year, month, day);
        let currentDate = new Date();
        let condition = takenDates.some(d => d.getTime() == date.getTime() || d.getTime() < currentDate.getTime())
        console.log("Ciccio", date, takenDates[0], condition)
        return condition
    }
  </script>
  
  <style>
    .calendar-wrapper {
      display: flex;
      justify-content: space-around;
      padding: 10px;
    }
  
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
        text-decoration: line-through;
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
  
  <div class="navigation">
    <button on:click={() => changeMonth(-1)}>&lt; Previous</button>
    <button on:click={() => changeMonth(1)}>Next &gt;</button>
  </div>
  
  <div class="calendar-wrapper">

  
    <!-- Current Month -->
    <div class="calendar">
      <div class="header">
        <strong>{months[currentMonth]} {currentYear}</strong><br/>
      </div>
  
      <!-- Days of the week -->
      {#each daysOfWeek as dayOfWeek}
        <div class="day"><strong>{dayOfWeek}</strong></div>
      {/each}
  
      <!-- Empty cells for the first week -->
      {#each Array(getStartDayOfMonth(currentYear, currentMonth)).fill(0) as _}
        <div class="day"></div>
      {/each}
  
      <!-- Days of the month -->
      {#each Array(getDaysInMonth(currentYear, currentMonth)).fill(0).map((_, i) => i + 1) as day}
        <div class="day {isToday(day, currentMonth, currentYear) ? 'today' : ''} {isTaken(day, currentMonth, currentYear) ? 'taken' : ''}">{day}</div>
      {/each}
    </div>
  
    <!-- Next Month -->
    <div class="calendar">
      <div class="header">
        <strong>{months[(currentMonth + 1) % 12]} {currentMonth === 11 ? currentYear + 1 : currentYear}</strong>
      </div>
  
      <!-- Days of the week -->
      {#each daysOfWeek as dayOfWeek}
        <div class="day"><strong>{dayOfWeek}</strong></div>
      {/each}
  
      <!-- Empty cells for the first week -->
      {#each Array(getStartDayOfMonth(currentYear, (currentMonth + 1) % 12)).fill(0) as _}
        <div class="day"></div>
      {/each}
  
      <!-- Days of the month -->
      {#each Array(getDaysInMonth(currentYear, (currentMonth + 1) % 12)).fill(0).map((_, i) => i + 1) as day}
        <div class="day {isTaken(day, currentMonth + 1, currentYear) ? 'taken' : ''}">{day}</div>
      {/each}
    </div>

        <!-- Month after next > -->
        <div class="calendar">
            <div class="header">
              <strong>{months[(currentMonth + 2 + 12) % 12]} {currentMonth === 0 ? currentYear + 2 : currentYear}</strong>
            </div>
        
            <!-- Days of the week -->
            {#each daysOfWeek as dayOfWeek}
              <div class="day"><strong>{dayOfWeek}</strong></div>
            {/each}
        
            <!-- Empty cells for the first week -->
            {#each Array(getStartDayOfMonth(currentYear, (currentMonth + 2 + 12) % 12)).fill(0) as _}
              <div class="day"></div>
            {/each}
        
            <!-- Days of the month -->
            {#each Array(getDaysInMonth(currentYear, (currentMonth + 2 + 12) % 12)).fill(0).map((_, i) => i + 1) as day}
              <div class="day {isTaken(day, currentMonth + 2, currentYear) ? 'taken' : ''}">{day}</div>
            {/each}
          </div>
  </div>
  