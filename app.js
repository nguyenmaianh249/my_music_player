const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAY_STORAGE = 'F8_player'
const heading = $('header h2');
const cd_thumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const app = {

    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAY_STORAGE)) || {},
    // config: {},
    songs: [{
            name: "Nevada",
            singer: "Vicetone",
            path: "./songs/song1.mp3",
            image: "./imgs/anh1.jpg"
        },
        {
            name: "Shape of you",
            singer: "Ed Sheeran",
            path: "./songs/song2.mp3",
            image: "./imgs/anh2.png"
        },
        {
            name: "Despacito",
            singer: "Luis Fonsi x Daddy Yankee",
            path: "./songs/song3.mp3",
            image: "./imgs/anh3.jpg"
        },
        {
            name: "Tat Nuoc Dau Dinh",
            singer: "Lynk Lee x Binz",
            path: "./songs/song4.mp3",
            image: "./imgs/anh4.jpg"
        },
        {
            name: "Kho Ve Nu Cuoi",
            singer: "Dat G x Du Uyen",
            path: "./songs/song5.mp3",
            image: "./imgs/anh5.jpg"
        },
        {
            name: "You don't know me",
            singer: "Ofenbach",
            path: "./songs/song6.mp3",
            image: "./imgs/anh6.jpg"
        },
        {
            name: "Khong The Cung Nhau Suot Kiep",
            singer: "Hoa Minzy",
            path: "./songs/song7.m4a",
            image: "./imgs/anh7.jpg"
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAY_STORAGE, JSON.stringify(this.config));
    },
    definedProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${ index === this.currentIndex ? "active" : ""} " data-index="${index}">
                 <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                     <h3 class="title">${song.name}</h3>
                     <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                 </div>
          </div>
      `;
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    handleEvent: function() {
        const cdWidth = cd.offsetWidth;
        // xử lí phóng to thu nhỏ 
        document.onscroll = function() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const newWidth = cdWidth - scrollTop;
                cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
                cd.style.opacity = newWidth / cdWidth;
            }
            // xử lí quay cd

        const cdThumbAnimate = cd.animate([
            { transform: "rotate(360deg)" }
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        // xử lí khi click play
        playBtn.onclick = function() {
            if (app.isPlaying) { audio.pause() } else { audio.play() }
            audio.onplay = function() {
                app.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play()
            }
            audio.onpause = function() {
                app.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause();

            }
            audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
                progress.oninput = function(e) {
                    const seekTime = audio.duration / 100 * e.target.value;
                    audio.currentTime = seekTime;
                }
            }
        }
        nextBtn.onclick = function() {
            if (app.isRandom) { app.randomSong() } else { app.nextSong(); };

            audio.play();
            app.render();
            app.scroolToActiveSong();
        }
        prevBtn.onclick = function() {
            if (app.isRandom) { app.randomSong() } else { app.prevSong(); };

            audio.play();
            app.render();
            app.scroolToActiveSong();
        }
        randomBtn.onclick = function(e) {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom)
        }
        audio.onended = function() {
            if (app.isRepeat) { audio.play() } else { nextBtn.click(); };

        }
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat)
        }
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.render();
                    audio.play()
                }
            }

        }
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cd_thumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) { this.currentIndex = 0 }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) { this.currentIndex = this.songs.length }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scroolToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behaviour: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    start: function() {
        //
        this.loadConfig();
        //Định nghĩa các thuộc tính cho object
        this.definedProperties();
        // lắng nghe các sự kiện
        this.handleEvent();
        // render playlist
        this.render();
        this.loadCurrentSong();
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)


    }
}
app.start();