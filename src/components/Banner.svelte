<script lang="ts">
    import Calendar from "./Calendar/Calendar.svelte";
    import PriceCalculator from "./PriceCalculator.svelte";

    export let imageSrc: string;
</script>

<div class="container" style="background-image: url({imageSrc});">
    <div class="price-calculator">
        <PriceCalculator />
    </div>
    <div class="calendar">
        <Calendar />
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        min-height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        padding: 2rem;
        box-sizing: border-box;
        margin-bottom: 1rem;
    }

    .price-calculator {
        width: 100%;
        padding: 1rem;
    }

    .calendar {
        width: 100%;
        background: rgba(255, 255, 255, 0.9);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }

    @media (min-width: 800px) {
        .container {
            flex-direction: column;
            justify-content: flex-start;
        }

        .price-calculator {
            align-self: flex-start;
        }

        .calendar {
            margin-top: 1rem;
        }
    }
</style>
