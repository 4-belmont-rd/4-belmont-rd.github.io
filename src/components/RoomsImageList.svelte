<script lang="ts">
</script>

<div>
    <h1>Living Room</h1>
    <div class="gallery">
        <img class="large" src="images/living-room/1.webp" />
        <div class="small-images">
            <img src="images/living-room/2.webp" />
            <img src="images/living-room/3.webp" />
            <img src="images/living-room/4.webp" />
            <img src="images/living-room/5.webp" />
        </div>
    </div>

    <h1>Kitchen</h1>
    <div class="gallery">
        <img class="large" src="images/kitchen/1.webp" />
        <div class="small-images">
            <img src="images/kitchen/2.webp" />
            <img src="images/kitchen/3.webp" />
        </div>
    </div>

    <h1>1st Bedroom</h1>
    <div class="gallery">
        <img class="large" src="images/bedroom-1/1.webp" />
        <img class="small-images" src="images/bedroom-1/2.webp" />
    </div>

    <h1>2nd Bedroom</h1>
    <img src="images/bedroom-2/1.webp" />

    <h1>3rd Bedroom</h1>
    <div class="gallery">
        <img class="large" src="images/bedroom-3/1.webp" />
        <div class="small-images">
            <img src="images/bedroom-3/2.webp" />
            <img src="images/bedroom-3/3.webp" />
            <img src="images/bedroom-3/4.webp" />
        </div>
    </div>

    <h1>Bathroom</h1>
    <div class="gallery">
        <img class="large" src="images/bathroom/1.webp" />
        <div class="small-images">
            <img src="images/bathroom/2.webp" />
            <img src="images/bathroom/3.webp" />
        </div>
    </div>

    <h1>Workspace</h1>
    <img src="images/workspace/1.webp" />

    <h1>Exterior</h1>
    <div class="gallery">
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
        height: 30rem; /* Adjust as needed */
    }

    .large {
        width: 10%;
        height: 100%;
        object-fit: cover;
        padding-right: 5px;
    }

    .small-images {
        width: 90%;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .small-images img {
        width: calc(50% - 5px);
        height: 50%;
        object-fit: cover;
    }

    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        width: 100%;
        height: 400px;
        gap: 5px;
    }

    .large {
        grid-row: span 2;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .small {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
