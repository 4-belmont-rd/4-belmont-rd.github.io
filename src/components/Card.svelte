<script lang="ts">
    import Card from "@smui/card";

    export let shadow: boolean = false;
</script>

<div class:shadow>
    <Card variant="outlined" padded>
        <slot />
    </Card>
</div>

<style>
    .shadow {
        margin: 5%;
        box-shadow: 0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.5);
    }
</style>
