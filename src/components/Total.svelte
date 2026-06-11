<script lang="ts">
    import Card from "./Card.svelte";

    export let days: number = 0;
    export let pricePerDay: number = 0;
    export let bookingFee: number = 0;

    $: total = days * pricePerDay + bookingFee;
</script>

<div class="container">
    <Card>
        <div class="row">
            <span> {days} x £{pricePerDay.toFixed(2)} </span>
            <span> £{(days * pricePerDay).toFixed(2)} </span>
        </div>
        <div class="row">
            <span> Booking fee </span>
            <span> £{bookingFee.toFixed(2)} </span>
        </div>
        <div class="row total-row">
            <span> Total </span>
            <span> £{total.toFixed(2)} </span>
        </div>
    </Card>
</div>

<style>
    .row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.2rem 0;
    }

    .total-row {
        margin-top: 0.4rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(128, 128, 128, 0.4);
        font-weight: 600;
    }
</style>
