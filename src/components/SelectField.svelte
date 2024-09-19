<script lang="ts">
    import Select from "@smui/select";

    export let items: string[] = [];
    items = ["one", "two"];
</script>

<div class="container">
    <!-- <Select bind:value label="Select Menu">
            {#each fruits as fruit}
              <Option value={fruit}>{fruit}</Option>
            {/each}
          </Select> -->
<Select class="shaped-outlined" variant="outlined" label="Select Menu">
    {#each items as item}
        <p>{item}</p>
    {/each}
</Select>

</div>

<style>
    .container {
        margin: 5%;
    }

</style>