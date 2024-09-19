<script lang="ts">
    import Card from "./Card.svelte";
    import Fab from "@smui/fab";
    import DatePicker from "./DatePicker.svelte";
    import SelectField from "./SelectField.svelte";
    import Total from './Total.svelte';

    export let days: number = 5;
    export let pricePerDay: number = 25;
    export let bookingFee: number = 12.5;
</script>

<div class="container">
    <Card>
        <div class="content">
            <p>Other text thats longer than</p>
            <DatePicker text="Start Date" />
            <DatePicker text="End Date" />
    
            <SelectField />
    
    
            <div class="total">
                <Total {days} {pricePerDay} {bookingFee} />
            </div>
    
            <Fab color="secondary" extended>something else</Fab>
    
        </div>
    </Card>
</div>

<style>
    .container {
        display: flex;
    }

    .content {
        /* padding: 10% 0; */
    }

    .total {
        margin: 5% 0;
    }


</style>
