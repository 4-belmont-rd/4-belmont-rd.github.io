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
    }

    .modal {
        position: relative;
        background-color: white;
        width: 80vw;
        height: 80vh;
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
</style>
