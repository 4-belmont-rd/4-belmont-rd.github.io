<script lang="ts">
  import { fetchBookedDates } from "./services/airbnb";
  import { onMount } from "svelte";

  import Banner from "./components/Banner.svelte";
  import Card from "./components/Card.svelte";
  import PriceCalculator from "./components/PriceCalculator.svelte";
  import Calendar from "./components/Calendar/Calendar.svelte";
  import RoomsImageList from "./components/RoomsImageList.svelte";
  import RoomsImageCarousel from "./components/RoomsImageCarousel.svelte";
  import Contact from "./components/Contact.svelte";
  import property from "./property.json";

  let bookedDates: Date[] = [];

  let selectedStartDate: Date;
  let selectedEndDate: Date;

  let isMobile = window.innerWidth <= 800;

  onMount(async () => {
    bookedDates = await fetchBookedDates();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  function handleResize() {
    isMobile = window.innerWidth <= 800;
  }

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
      bind:startDate={selectedStartDate}
      bind:endDate={selectedEndDate}
      on:dateSelected={(event) => onDateSelected(event.detail)}
    />
  </div>

  <div class="info-section">
    <div class="info-section-card">
      <Card>
        {#each property.description as paragraph}
          <p class="description">{paragraph}</p>
        {/each}

        <p>
          You can see the latest reviews on
          <a href={property.reviewsUrl}>Airbnb</a>.
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
  {#if isMobile}
    <PriceCalculator
      shadow={false}
      bind:fromDate={selectedStartDate}
      bind:toDate={selectedEndDate}
    />
  {/if}
  <div class="hide-on-mobile">
    <RoomsImageList />
  </div>

  <Contact />
</main>

<style>
  .description {
    white-space: pre-line;
  }

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

  @media (prefers-color-scheme: dark) {
    .info-section-card {
      --mdc-theme-surface: #222;
      color: rgba(255, 255, 255, 0.87);
    }

    .info-section-card :global(.mdc-card--outlined) {
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
</style>
