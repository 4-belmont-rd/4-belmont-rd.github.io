<script>
    export let images = [];
    export let currentIndex = 0;

    function next() {
        currentIndex = (currentIndex + 1) % images.length;
    }

    function prev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    }
</script>

<div class="carousel">
    <button on:click={prev} class="prev">&#9665;</button>
    <img src={images[currentIndex]} alt="Carousel Image" class="image" />
    <button on:click={next} class="next">&#9655;</button>
</div>

<style>
    .carousel {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .image {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
    }

    .prev,
    .next {
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .prev {
        left: 10px;
    }

    .next {
        right: 10px;
    }
</style>
