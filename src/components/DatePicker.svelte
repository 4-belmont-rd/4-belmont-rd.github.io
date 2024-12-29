<script lang="ts">
    export let title: string;
    export let value: string = "";
    export let date: Date;

    $: {
        date = convertToDate(value);
    }

    function convertToDate(date: string): Date {
        return new Date(date);
    }
</script>

<div class="container">
    <p>{title}</p>
    <input type="date" bind:value />
</div>

<style>
    p {
        margin: 0.3rem;
    }

    .container {
        margin: 1rem;
    }
</style>
