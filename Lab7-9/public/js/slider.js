const slides = ['img/doctor1.png', 'img/doctor2.png', 'img/doctor3.png'];
let curr = 0;

function showSlide(i) {
    curr = (i + slides.length) % slides.length;
    document.getElementById('slide-img').src = slides[curr];
}
document.getElementById('slider-prev').onclick = () => showSlide(curr - 1);
document.getElementById('slider-next').onclick = () => showSlide(curr + 1);
setInterval(() => showSlide(curr + 1), 4000);