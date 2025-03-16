<script lang="ts">
    import Carousel from "./Carousel.svelte";

    let images_livingRoom = [
        "images/living-room/1.webp",
        "images/living-room/2.webp",
        "images/living-room/3.webp",
        "images/living-room/4.webp",
        "images/living-room/5.webp",
        "images/kitchen/1.webp",
        "images/kitchen/2.webp",
        "images/kitchen/3.webp",
        "images/bedroom-1/1.webp",
        "images/bedroom-1/2.webp",
        "images/bedroom-2/1.webp",

        "images/bedroom-3/1.webp",
        "images/bedroom-3/2.webp",
        "images/bedroom-3/3.webp",
        "images/bedroom-3/4.webp",
        "images/bathroom/1.webp",
        "images/bathroom/2.webp",
        "images/bathroom/3.webp",
        "images/workspace/1.webp",

        "images/exterior/1.webp",
        "images/exterior/2.webp",
        "images/exterior/3.webp",
    ];
</script>

<Carousel images={images_livingRoom} />
