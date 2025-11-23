<script lang="ts">
    import Calendar from "./Calendar/Calendar.svelte";
    import PriceCalculator from "./PriceCalculator.svelte";

    export let imageSrc: string;
    export let bookedDates: Date[] = [];
    export let startDate: Date;
    export let endDate: Date;
</script>

<div class="container" style="background-image: url({imageSrc});">
    <div class="price-calculator">
        <PriceCalculator fromDate={startDate} toDate={endDate} />
    </div>
    <div class="calendar">
        <Calendar {bookedDates} {startDate} {endDate} on:dateSelected />
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
        border-width: 2px;
        border-style: solid;
        border-color: #e0e0e0;
        text-align: center;
    }

    @media (max-width: 800px) {
        .container {
            width: 100dvw;
            height: 60dvh;
            min-height: unset;
            background-size: cover;
            background-position: center;
        }

        .price-calculator {
            display: none;
        }

        .calendar {
            display: none;
        }
    }

    @media (min-width: 800px) {
        .container {
            background-size: contain;
            background-position: center;
        }

        .price-calculator {
            align-self: flex-start;
        }

        .calendar {
            margin-top: 1rem;
        }
    }

    @media (prefers-color-scheme: dark) {
        .calendar {
            background-color: #222;
        }
    }
</style>
