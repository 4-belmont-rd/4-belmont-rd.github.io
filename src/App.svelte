<script lang="ts">
  import Banner from "./components/Banner.svelte";
  import Card from './components/Card.svelte';
  import PriceCalculator from './components/PriceCalculator.svelte';
  import Carousel from './components/Carousel.svelte';
</script>

<main>
  <h1>4 Belmont Road</h1>

  <Banner imageSrc="/images/exterior/1.webp" />

  <!-- <Carousel /> -->

  <div class="info-section">
    <div class="info-section-card">
      <Card>
        <p>Traditional cottage within easy reach of the beach and town centre.</p>
<p>Three bedroom cottage spread over 3 floors.<br/>
  Bedroom 1 with double bed, bedroom 2 with petite double, attic bedroom with double bed (additional single bed can be requested in advance).
  </p>

<p>Fully equipped kitchen. Open plan living room with wood burner, fast WiFi and TV.</p>

<p>11 minute walk from the beach, 9 minute walk from the station. Free on street parking.</p>

<p>Town centre, many cafe’s, pubs and shops are all within a short walk.</p>
      </Card>
    </div>

    <div class="info-section-price-calculator">
    <PriceCalculator/>

    </div>
  </div>

  <div>
    <h1>Living Room</h1>
    <img src="images/living-room/1.webp">
    <img src="images/living-room/2.webp">
    <img src="images/living-room/3.webp">
    <img src="images/living-room/4.webp">
    <img src="images/living-room/5.webp">

    <h1>Kitchen</h1>
    <img src="images/kitchen/1.webp">
    <img src="images/kitchen/2.webp">
    <img src="images/kitchen/3.webp">

    <h1>1st Bedroom</h1>
    <img src="images/bedroom-1/1.webp">
    <img src="images/bedroom-1/2.webp">

    <h1>2nd Bedroom</h1>
    <img src="images/bedroom-2/1.webp">

    <h1>3rd Bedroom</h1>
    <img src="images/bedroom-3/1.webp">
    <img src="images/bedroom-3/2.webp">
    <img src="images/bedroom-3/3.webp">
    <img src="images/bedroom-3/4.webp">

    <h1>Bathroom</h1>
    <img src="images/bathroom/1.webp">
    <img src="images/bathroom/2.webp">
    <img src="images/bathroom/3.webp">

    <h1>Workspace</h1>
    <img src="images/workspace/1.webp">

    <h1>Exterior</h1>
    <img src="images/exterior/1.webp">
    <img src="images/exterior/2.webp">
    <img src="images/exterior/3.webp">
  </div>

</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }

  .info-section {
    display: flex;
    padding: 0 5%;
  }

  .info-section-card {
    flex-grow: 4;
  }

  .info-section-price-calculator {
    flex-grow: 1;
  }
</style>
