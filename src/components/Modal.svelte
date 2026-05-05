<script lang="ts">
    import { fade, scale } from "svelte/transition";

    export let onClose: () => void;

    function handleBackdropClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        // Only close if the user clicks on the backdrop, not the modal itself
        if (target.classList.contains("overlay")) {
            onClose?.();
        }
    }
</script>

<div
    class="overlay fixed inset-0 bg-black/50 flex items-center justify-center z-100"
    role="button"
    tabindex="0"
    on:click={handleBackdropClick}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBackdropClick() }}
    in:fade out:fade>
    <div
        class="modal relative bg-white w-400px h-750px rounded-lg p-8 shadow-lg"
        in:scale={{ duration: 200 }}
        out:scale={{ duration: 200 }}
    >
        <button class="close-btn absolute top-2.5 right-2.5 bg-transparent border-0 text-xl font-bold cursor-pointer z-1" on:click={onClose}>&#10005;</button>
        <slot />
    </div>
</div>

<style>
    @media (max-width: 800px) {
        .modal {
            transform: scale(0.7);
            width: 90vw;
            height: 110vh;
        }
    }
</style>
