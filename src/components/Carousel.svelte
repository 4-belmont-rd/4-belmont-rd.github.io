<script>
    export let images = [];
    export let currentIndex = 0;

    let startX = 0;
    let endX = 0;

    function next() {
        currentIndex = (currentIndex + 1) % images.length;
    }

    function prev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    }

    function handleTouchStart(event) {
        startX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
        endX = event.changedTouches[0].clientX;
        let difference = startX - endX;

        if (Math.abs(difference) > 50) {
            // Only trigger if swipe is significant
            if (difference > 0) {
                next(); // Swipe left → Next image
            } else {
                prev(); // Swipe right → Previous image
            }
        }
    }
</script>

<div
    class="carousel"
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
>
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
        touch-action: pan-y; /* Prevents browser from handling horizontal swipes */
    }

    .image {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        transition: transform 0.3s ease-in-out;
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
