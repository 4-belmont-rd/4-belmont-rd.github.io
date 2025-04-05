<script lang="ts">
    import Card from "./Card.svelte";
    import Fab from "@smui/fab";
    import DatePicker from "./DatePicker.svelte";
    import SelectField from "./SelectField.svelte";
    import Total from "./Total.svelte";
    import { createEventDispatcher } from "svelte";

    export let days: number = 0;
    export let pricePerDay: number = 120;
    export let bookingFee: number = 12.5;
    export let shadow: boolean = true;

    export let fromDate: Date = null;
    export let toDate: Date = null;

    const dispatch = createEventDispatcher();

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
    <Card {shadow}>
        <div class="content">
            <h3>Choose your stay</h3>
            <DatePicker
                title="From"
                date={fromDate}
                on:datePickerChanged={(event) => (fromDate = event.detail)}
            />
            <DatePicker
                title="To"
                date={toDate}
                on:datePickerChanged={(event) => (toDate = event.detail)}
            />

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

    @media (max-width: 800px) {
        .container {
            justify-content: center;
            margin-bottom: 2rem;
            color: #213547;
        }

        .content {
            width: 70vw;
        }
    }
</style>
