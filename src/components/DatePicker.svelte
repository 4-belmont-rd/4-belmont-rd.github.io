<script lang="ts">
    export let title: string;
    export let value: string = "";
    export let date: Date = new Date();

    $: {
        date = convertToDate(value);
    }

    function convertToDate(date: string): Date {
        if (date == "") return new Date();
        return new Date(date);
    }
</script>

<div class="container">
    <p>{title}</p>
    <input type="date" bind:value />
</div>
