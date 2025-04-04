<script lang="ts">
  import { fetchBookedDates } from "./services/airbnb";
  import { onMount } from "svelte";

  import Banner from "./components/Banner.svelte";
  import Card from "./components/Card.svelte";
  import PriceCalculator from "./components/PriceCalculator.svelte";
  import Calendar from "./components/Calendar/Calendar.svelte";
  import RoomsImageList from "./components/RoomsImageList.svelte";
  import RoomsImageCarousel from "./components/RoomsImageCarousel.svelte";

  let bookedDates: Date[] = [];

  let selectedStartDate: Date;
  let selectedEndDate: Date;

  onMount(async () => {
    bookedDates = await fetchBookedDates();
  });

  function onDateSelected(date: Date) {
    if (date == null) return;
    if (selectedStartDate == null && selectedEndDate == null) {
      selectedStartDate = date;
      return;
    }
    if (date.getTime() < selectedStartDate.getTime()) {
      //selectedEndDate = selectedStartDate;
      selectedStartDate = date;
    } else {
      selectedEndDate = date;
    }
  }
</script>

<main>
  <div class="title">
    <h1>4 Belmont Road</h1>
  </div>

  <div class="mobile-only carousel">
    <RoomsImageCarousel imageUrl={"images/exterior/1.webp"} />
  </div>

  <div class="hide-on-mobile">
    <Banner
      imageSrc="/images/exterior/1.webp"
      {bookedDates}
      startDate={selectedStartDate}
      endDate={selectedEndDate}
      on:dateSelected={(event) => onDateSelected(event.detail)}
    />
  </div>

  <div class="info-section">
    <div class="info-section-card">
      <Card>
        <p>
          Traditional cottage within easy reach of the beach and town centre.
        </p>
        <p>
          Three bedroom cottage spread over 3 floors.<br />
          Bedroom 1 with double bed, bedroom 2 with petite double, attic bedroom
          with double bed (additional single bed can be requested in advance).
        </p>

        <p>
          Fully equipped kitchen. Open plan living room with wood burner, fast
          WiFi and TV.
        </p>

        <p>
          11 minute walk from the beach, 9 minute walk from the station. Free on
          street parking.
        </p>

        <p>
          Town centre, many cafe’s, pubs and shops are all within a short walk.
        </p>
      </Card>
    </div>

    <div class="info-section-price-calculator">
      <PriceCalculator
        shadow={false}
        bind:fromDate={selectedStartDate}
        bind:toDate={selectedEndDate}
      />
    </div>
  </div>

  <Calendar
    {bookedDates}
    startDate={selectedStartDate}
    endDate={selectedEndDate}
    on:dateSelected={(event) => onDateSelected(event.detail)}
  ></Calendar>
  <div class="hide-on-mobile">
    <RoomsImageList />
  </div>
</main>

<style>
  .info-section {
    display: flex;
    padding: 0 5%;
    margin-top: 0.7rem;
    margin-bottom: 2rem;
  }

  .info-section-card {
    flex-grow: 4;
  }

  .info-section-price-calculator {
    flex-grow: 1;
    margin-left: 1rem;
  }

  @media (max-width: 800px) {
    .hide-on-mobile,
    .info-section-price-calculator {
      display: none;
    }

    .title {
      font-size: 0.5rem;
    }

    .info-section-card {
      color: #213547;
    }

    p {
      margin: 0.5rem;
    }

    .carousel {
      height: 70vh;
    }
  }

  @media (min-width: 801px) {
    .mobile-only {
      display: none;
    }
  }
</style>
