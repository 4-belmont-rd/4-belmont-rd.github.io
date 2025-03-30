<script>
    import { createEventDispatcher } from "svelte";

    export let title = "";
    export let mainImage = "";
    export let smallImages = [];

    const dispatch = createEventDispatcher();

    let selectedImage = mainImage;

    function openModal(image) {
        dispatch("imageClick", image);
    }
</script>

<div class="gallery">
    <h1>{title}</h1>

    <img
        class="large"
        src={selectedImage}
        on:click={() => openModal(selectedImage)}
    />

    {#if smallImages.length}
        <div class="small-images">
            {#each smallImages as img}
                <img src={img} on:click={() => (selectedImage = img)} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .gallery {
        margin-bottom: 20px;
    }

    .large {
        width: 100%;
        max-width: 500px;
        cursor: pointer;
        border-radius: 8px;
    }

    .small-images {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .small-images img {
        width: 80px;
        height: 80px;
        cursor: pointer;
        border-radius: 5px;
        transition: transform 0.2s;
    }

    .small-images img:hover {
        transform: scale(1.1);
    }
</style>
