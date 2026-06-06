<script lang="ts">
    export let shadow: boolean = false;
</script>

<div class:shadow={shadow}>
    <slot />
</div>

<style>
    .shadow {
        border-radius: 0.5rem;
        background-color: #ffffff;
        padding: 1rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        margin: 5%;
        text-align: center;
    }

    @media (prefers-color-scheme: dark) {
        .shadow {
            background-color: #222;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
    }
</style>
