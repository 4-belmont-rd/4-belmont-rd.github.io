<script lang="ts">
    import PriceCalculator from "./PriceCalculator.svelte";

    export let imageSrc: string;
</script>

<div class="container">
    <div class="price-calculator">
        <PriceCalculator />
    </div>
    <img src={imageSrc} alt="" />
</div>

<style>
    .container {
        display: flex;
        display: flex;
        flex-direction: row;
    }

    @media (max-width: 800px) {
        .container {
            flex-direction: column;
        }
    }

    .price-calculator {
        position: absolute;
        padding: 5%;
    }
</style>
