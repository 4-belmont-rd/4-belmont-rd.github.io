<script lang="ts">
    import Calendar from "./Calendar/Calendar.svelte";
    import PriceCalculator from "./PriceCalculator.svelte";

    export let imageSrc: string;
</script>

<div class="container">
    <div class="price-calculator">
        <PriceCalculator />
    </div>
    <div class="calendar"><Calendar></Calendar></div>

    <img src={imageSrc} alt="" />
</div>

<style>
    .container {
        display: flex;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    @media (max-width: 800px) {
        .container {
            flex-direction: column;
        }
    }

    .price-calculator {
        position: absolute;
        padding: 5%;
        max-width: 1280px;
        left: 0;
        right: 0;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    .calendar {
        position: absolute;
        background: white;
        bottom: 1rem;
        left: 0;
        right: 0;
        margin: auto;
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }
</style>
