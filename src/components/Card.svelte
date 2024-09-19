<script lang="ts">
    import Card from "@smui/card";
</script>

<div class="container">
    <Card variant="outlined" padded>
        <slot />
    </Card>
</div>

<style>
    .container {
        margin: 5%;
    }
</style>
