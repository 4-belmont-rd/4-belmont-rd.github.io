<script lang="ts">
  import svelteLogo from "./assets/icons/svelte.svg";
  import Banner from "./components/Banner.svelte";
  import Card from './components/Card.svelte';
  import PriceCalculator from './components/PriceCalculator.svelte';
  import Carousel from './components/Carousel.svelte';
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>



  <Banner imageSrc="/images/house01.jpg" />

  <Carousel />

  <div class="info-section">
    <div class="info-section-card">
      <Card>
        Some texts
      </Card>
    </div>

    <div class="info-section-price-calculator">
    <PriceCalculator/>

    </div>
  
  </div>




  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank"
      >SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
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
