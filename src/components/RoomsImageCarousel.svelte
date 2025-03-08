<script lang="ts">
    import Carousel from "./Carousel.svelte";

    let images_livingRoom = [
        "images/living-room/1.webp",
        "images/living-room/2.webp",
        "images/living-room/3.webp",
        "images/living-room/4.webp",
        "images/living-room/5.webp",
    ];
    let images_kitchen = [
        "images/kitchen/1.webp",
        "images/kitchen/2.webp",
        "images/kitchen/3.webp",
    ];

    let images_bedroom1 = [
        "images/bedroom-1/1.webp",
        "images/bedroom-1/2.webp",
    ];

    let images_bedroom2 = ["images/bedroom-2/1.webp"];

    let images_bedroom3 = [
        "images/bedroom-3/1.webp",
        "images/bedroom-3/2.webp",
        "images/bedroom-3/3.webp",
        "images/bedroom-3/4.webp",
    ];

    let images_bathroom = [
        "images/bathroom/1.webp",
        "images/bathroom/2.webp",
        "images/bathroom/3.webp",
    ];

    let images_workspace = ["images/workspace/1.webp"];

    let images_exterior = [
        "images/exterior/1.webp",
        "images/exterior/2.webp",
        "images/exterior/3.webp",
    ];
</script>

<h1>Living Room</h1>
<Carousel images={images_livingRoom} />

<h1>Kitchen</h1>
<Carousel images={images_kitchen} />

<h1>1st Bedroom</h1>
<Carousel images={images_bedroom1} />

<h1>2nd Bedroom</h1>
<Carousel images={images_bedroom2} />

<h1>3rd Bedroom</h1>
<Carousel images={images_bedroom3} />

<h1>Bathroom</h1>
<Carousel images={images_bathroom} />

<h1>Workspace</h1>
<Carousel images={images_workspace} />

<h1>Exterior</h1>
<Carousel images={images_exterior} />
