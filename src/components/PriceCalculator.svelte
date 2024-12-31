<script lang="ts">
    import Card from "./Card.svelte";
    import Fab from "@smui/fab";
    import DatePicker from "./DatePicker.svelte";
    import SelectField from "./SelectField.svelte";
    import Total from "./Total.svelte";

    export let days: number = 0;
    export let pricePerDay: number = 120;
    export let bookingFee: number = 12.5;

    let fromDate: Date;
    let toDate: Date;

    $: days = calculateDays(fromDate, toDate);

    function calculateDays(fromDate: Date, toDate: Date) {
        if (fromDate == null || toDate == null) return 0;
        if (fromDate == undefined || toDate == undefined) return 0;
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 0;

        const milliseconds = toDate.getTime() - fromDate.getTime();
        const days = Math.abs(milliseconds) / (1000 * 60 * 60 * 24);
        return Math.floor(days);
    }
</script>

<div class="container">
    <Card shadow={true}>
        <div class="content">
            <h3>Choose your stay</h3>
            <DatePicker title="From" bind:date={fromDate} />
            <DatePicker title="To" bind:date={toDate} />

            <SelectField label="Guests" items={["1", "2", "3", "4"]} />

            {#if days > 0}
                <div class="total">
                    <Total {days} {pricePerDay} {bookingFee} />
                </div>
            {/if}

            <Fab color="secondary" extended>Reserve</Fab>
        </div>
    </Card>
</div>

<style>
    .container {
        display: flex;
    }

    .content {
        padding: 5% 0;
    }

    .total {
        margin: 5% 0;
    }
</style>
