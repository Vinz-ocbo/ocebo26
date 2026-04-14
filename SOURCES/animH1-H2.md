HTML

<h1 class="ml10">

&#x20; <span class="text-wrapper">

&#x20;   <span class="letters">Domino Dreams</span>

&#x20; </span>

</h1>



<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>

CSS

.ml10 {

&#x20; position: relative;

&#x20; font-weight: 900;

&#x20; font-size: 4em;

}



.ml10 .text-wrapper {

&#x20; position: relative;

&#x20; display: inline-block;

&#x20; padding-top: 0.2em;

&#x20; padding-right: 0.05em;

&#x20; padding-bottom: 0.1em;

&#x20; overflow: hidden;

}



.ml10 .letter {

&#x20; display: inline-block;

&#x20; line-height: 1em;

&#x20; transform-origin: 0 0;

}

Javascript

// Wrap every letter in a span

var textWrapper = document.querySelector('.ml10 .letters');

textWrapper.innerHTML = textWrapper.textContent.replace(/\\S/g, "<span class='letter'>$\&</span>");



anime.timeline({loop: true})

&#x20; .add({

&#x20;   targets: '.ml10 .letter',

&#x20;   rotateY: \[-90, 0],

&#x20;   duration: 1300,

&#x20;   delay: (el, i) => 45 \* i

&#x20; }).add({

&#x20;   targets: '.ml10',

&#x20;   opacity: 0,

&#x20;   duration: 1000,

&#x20;   easing: "easeOutExpo",

&#x20;   delay: 1000

&#x20; });

