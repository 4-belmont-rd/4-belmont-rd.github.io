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

<div class="overlay" on:click={handleBackdropClick} in:fade out:fade>
    <div
        class="modal"
        in:scale={{ duration: 200 }}
        out:scale={{ duration: 200 }}
    >
        <button class="close-btn" on:click={onClose}>&#10005;</button>
        <slot />
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .modal {
        position: relative;
        background-color: white;
        width: 400px;
        height: 750px;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        font-size: 20px;
        font-weight: bold;
        color: black;
        cursor: pointer;
        z-index: 1;
    }

    @media (max-width: 800px) {
        .modal {
            transform: scale(0.7);
            width: 90vw;
            height: 110vh;
        }
    }
</style>
