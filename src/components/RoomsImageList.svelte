<script lang="ts">
    import Modal from "./Modal.svelte";
    import RoomsImageCarousel from "./RoomsImageCarousel.svelte";

    let showModal = false;
    let selectedImageUrl;

    function imageClicked(event) {
        selectedImageUrl = event.target?.src.replace(event.target?.baseURI, "");
        openModal();
    }

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }
</script>

<div>
    {#if showModal}
        <Modal onClose={closeModal}>
            <RoomsImageCarousel imageUrl={selectedImageUrl} />
        </Modal>
    {/if}

    <h1>Living Room</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/living-room/1.webp" />
        <div class="small-images">
            <img src="images/living-room/2.webp" />
            <img src="images/living-room/3.webp" />
            <img src="images/living-room/4.webp" />
            <img src="images/living-room/5.webp" />
        </div>
    </div>

    <h1>Kitchen</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/kitchen/1.webp" />
        <div class="small-images">
            <img src="images/kitchen/2.webp" />
            <img src="images/kitchen/3.webp" />
        </div>
    </div>

    <h1>1st Bedroom</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/bedroom-1/1.webp" />
        <img class="small-images" src="images/bedroom-1/2.webp" />
    </div>

    <h1>2nd Bedroom</h1>
    <img
        src="images/bedroom-2/1.webp"
        on:click={(event) => imageClicked(event)}
    />

    <h1>3rd Bedroom</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/bedroom-3/1.webp" />
        <div class="small-images">
            <img src="images/bedroom-3/2.webp" />
            <img src="images/bedroom-3/3.webp" />
            <img src="images/bedroom-3/4.webp" />
        </div>
    </div>

    <h1>Bathroom</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/bathroom/1.webp" />
        <div class="small-images">
            <img src="images/bathroom/2.webp" />
            <img src="images/bathroom/3.webp" />
        </div>
    </div>

    <h1>Workspace</h1>
    <img
        src="images/workspace/1.webp"
        on:click={(event) => imageClicked(event)}
    />

    <h1>Exterior</h1>
    <div class="gallery" on:click={(event) => imageClicked(event)}>
        <img class="large" src="images/exterior/1.webp" />
        <div class="small-images">
            <img src="images/exterior/2.webp" />
            <img src="images/exterior/3.webp" />
        </div>
    </div>
</div>

<style>
    .gallery {
        display: flex;
        width: 100%;
        height: 30rem;
    }

    .large {
        width: 50%;
        height: 100%;
        object-fit: cover;
        padding-right: 5px;
    }

    .small-images {
        width: 50%;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .small-images img {
        width: calc(50% - 5px);
        height: 50%;
        object-fit: cover;
    }

    img {
        cursor: pointer;
    }
</style>
