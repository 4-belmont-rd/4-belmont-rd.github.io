<script lang="ts">
    import Card from "./Card.svelte";

    export let days: number = 0;
    export let pricePerDay: number = 0;
    export let bookingFee: number = 0;

    $: total = days * pricePerDay + bookingFee;
</script>

<div class="container">
    <Card>
        <div>
            <span class="left"> {days} x £{pricePerDay.toFixed(2)} </span>
            <span class="right"> £{(days * pricePerDay).toFixed(2)} </span>
        </div>
        <div>
            <span class="left"> Booking fee </span>
            <span class="right"> £{bookingFee.toFixed(2)} </span>
        </div>
        <div>
            <span class="left"> Total </span>
            <span class="right"> £{total.toFixed(2)} </span>
        </div>
    </Card>
</div>

<style>
    .right {
        float: right;
    }

    .left {
        float: left;
    }
</style>
