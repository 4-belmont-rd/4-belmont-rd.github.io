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
        box-shadow: 0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.5);
    }
</style>
