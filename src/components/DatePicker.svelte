<script lang="ts">
    export let title: string;
    export let value: string = "";
    export let date: Date;

    const today = new Date().toISOString().split("T")[0];

    $: date = convertToDate(value);

    function convertToDate(date: string): Date {
        return new Date(date);
    }
</script>

<div class="container">
    <p>{title}</p>
    <input type="date" bind:value min={today} />
    <p>Selected date: {value}</p>
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
</style>
