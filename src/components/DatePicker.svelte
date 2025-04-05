<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let title: string;
    export let value: string = "";
    export let date: Date;

    const dispatch = createEventDispatcher();
    const today = new Date().toISOString().split("T")[0];

    //$: date = convertToDate(value);
    $: value = date
        ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
              .toISOString()
              .split("T")[0]
        : "";

    function convertToDate(date: string): Date {
        return new Date(date);
    }
</script>

<div class="container">
    <p>{title}</p>
    <input
        type="date"
        bind:value
        min={today}
        on:change={() => dispatch("datePickerChanged", new Date(value))}
    />
</div>

<style>
    p {
        margin: 0.3rem;
    }

    .container {
        margin: 1rem;
    }

    input[type="date"] {
        border-radius: 8px;
        border-color: rgb(33, 53, 71);
        color: rgb(33, 53, 71);
        padding: 8px 12px;
        font-size: 16px;
        background-color: #f9f9f9;
        cursor: pointer;
    }

    @media (max-width: 800px) {
        p {
            color: #213547;
        }
    }
</style>
