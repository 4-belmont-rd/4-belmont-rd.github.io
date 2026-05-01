<script lang="ts">
    export let label: string;
    export let items: string[] = [];
    export let value: string = "";
</script>

<div class="container">
    <label for="select">{label}</label>
    <select bind:value class="select">
        {#each items as item}
            <option value={item}>{item}</option>
        {/each}
    </select>
</div>

<style>
    .container {
        margin-bottom: 1rem;
    }

    .select {
        width: 100%;
        border-radius: 0.375rem;
        border-width: 1px;
        border-color: #d1d5db;
        background-color: #ffffff;
        padding: 0.5rem 0.75rem;
        color: #111827;
    }

    .select:focus {
        outline: none;
        border-color: #2563eb;
    }

    @media (prefers-color-scheme: dark) {
        .select {
            border-color: #4b5563;
            background-color: #374151;
            color: #f9fafb;
        }
    }
</style>
