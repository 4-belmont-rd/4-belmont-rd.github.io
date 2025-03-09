<script lang="ts">
    import Select, { Option } from "@smui/select";

    export let label: string;
    export let items: string[] = [];
</script>

<div class="container">
    <Select class="shaped-outlined" variant="outlined" {label}>
        {#each items as item}
            <Option value={item}>{item}</Option>
        {/each}
    </Select>
</div>

<style>
    .container {
        margin-bottom: 1rem;
    }
</style>
