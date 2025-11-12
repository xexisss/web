const gallery = [{
        img: 'img/doctor1.png',
        audio: 'audio/sound1.mp3',
        caption: '1'
    },
    {
        img: 'img/doctor2.png',
        audio: 'audio/sound2.mp3',
        caption: '2'
    },
    {
        img: 'img/doctor3.png',
        audio: 'audio/sound3.mp3',
        caption: '3'
    },
    {
        img: 'img/doctor4.png',
        audio: 'audio/sound4.mp3',
        caption: '4'
    },
    {
        img: 'img/doctor5.png',
        audio: 'audio/sound5.mp3',
        caption: '5'
    },
    {
        img: 'img/doctor7.png',
        audio: 'audio/sound6.mp3',
        caption: '6'
    },
    {
        img: 'img/gallery7.jpg',
        audio: 'audio/sound7.mp3',
        video: 'video/demo.mp4',
        caption: '7, Видео'
    },
    {
        img: 'img/gallery8.jpg',
        audio: 'audio/sound8.mp3',
        caption: '8'
    },
    {
        img: 'img/gallery9.jpg',
        audio: 'audio/sound9.mp3',
        caption: '9'
    },
    {
        img: 'img/gallery10.jpg',
        audio: 'audio/sound10.mp3',
        caption: '10'
    }
];

let idx = 0;
const img = document.getElementById('gallery-img');
const audio = new Audio(gallery[0].audio);
audio.preload = 'auto';
let playing = false;

const videoBtn = document.getElementById('gallery-video-btn');
const videoBg = document.getElementById('modal-video-bg');
const video = document.getElementById('gallery-video');
const videoClose = document.getElementById('modal-video-close');

function showImage(i) {
    idx = (i + gallery.length) % gallery.length;
    const el = gallery[idx];
    img.classList.remove('visible');
    setTimeout(() => {
        img.src = el.img;
        img.alt = el.caption;
        img.onload = () => img.classList.add('visible');
        if (el.video) videoBtn.style.display = '';
        else videoBtn.style.display = 'none';
    }, 200);

    audio.src = el.audio;
    if (playing) {
        audio.play().catch(() => {});
    }
    updateStateIcon();
}

function updateStateIcon() {
    document.getElementById('audio-state').textContent = playing ? "🔊" : "⏸";
}

document.getElementById('gallery-prev').onclick = () => {
    showImage(idx - 1);
};
document.getElementById('gallery-next').onclick = () => {
    showImage(idx + 1);
};

document.getElementById('gallery-random').onclick = () => {
    let nxt;
    do {
        nxt = Math.floor(Math.random() * gallery.length);
    } while (nxt === idx);
    showImage(nxt);
}

document.getElementById('gallery-volume').oninput = function () {
    audio.volume = parseFloat(this.value);
};

document.getElementById('audio-state').onclick = () => {
    playing = !playing;
    if (playing) audio.play();
    else audio.pause();
    updateStateIcon();
};
audio.onended = () => {
    playing = false;
    updateStateIcon();
};

img.onclick = () => {
    playing = true;
    audio.play();
    updateStateIcon();
};

videoBtn.onclick = () => {
    video.querySelectorAll = "";
    video.src = gallery[idx].video;
    video.currentTime = 0;
    videoBg.classList.add('open');
    video.play();
    document.body.classList.add('modal-open');
};
videoClose.onclick = () => {
    video.pause();
    videoBg.classList.remove('open');
    document.body.classList.remove('modal-open');
};

showImage(0);
