<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let title: string;
    export let value: string = "";
    export let date: Date;

    const dispatch = createEventDispatcher();
    const today = toIsoDate(new Date());

    $: value = date && !isNaN(date.getTime()) ? toIsoDate(date) : "";

    // Local-time formatting: must round-trip exactly with the input's own
    // value, otherwise Svelte writes the value back mid-typing and wipes
    // the user's partially entered date.
    function toIsoDate(d: Date): string {
        const year = String(d.getFullYear()).padStart(4, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function onChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        if (value === "") {
            dispatch("datePickerChanged", null);
            return;
        }
        // While typing, the browser commits transient dates (e.g. year 0002
        // after the first year digit). Those fail the min check — wait for a
        // valid date before notifying the parent.
        if (!input.checkValidity()) return;
        dispatch("datePickerChanged", new Date(value + "T00:00:00"));
    }
</script>

<div class="container">
    <p>{title}</p>
    <input type="date" bind:value min={today} on:change={onChange} />
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

    @media (prefers-color-scheme: dark) {
        p {
            color: inherit;
        }

        /* Dark surface so the browser's light calendar icon is visible */
        input[type="date"] {
            background-color: #2a2a2a;
            border-color: rgba(255, 255, 255, 0.3);
            color: rgba(255, 255, 255, 0.87);
        }
    }
</style>
