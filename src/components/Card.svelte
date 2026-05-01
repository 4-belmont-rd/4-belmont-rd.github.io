<script lang="ts">
    export let shadow: boolean = false;
</script>

<div class:shadow>
    <slot />
</div>

<style>
    .shadow {
        border-radius: 0.5rem;
        background-color: #ffffff;
        padding: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 5%;
    }

    @media (prefers-color-scheme: dark) {
        .shadow {
            background-color: #222;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
    }
</style>
