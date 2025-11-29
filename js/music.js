/**
 * MUSIC PLAYER SYSTEM
 * Ambient background music player with visualizer
 */

const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    volume: 0.5,
    analyser: null,
    audioContext: null,
    dataArray: null,
    visualizerCanvas: null,

    // To use local music files, place .mp3 files in assets/music/ folder
    // and update the src paths below to: 'assets/music/your-song.mp3'
    // Current tracks use public domain audio from Internet Archive
    playlist: [
        {
            title: 'Gymnopedie No.1',
            artist: 'Erik Satie',
            src: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Gymnop%C3%A9die_No._1_%28Lent_et_douloureux%29.ogg',
            cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80'
        },
        {
            title: 'Clair de Lune',
            artist: 'Claude Debussy',
            src: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Debussy_-_Clair_de_Lune.ogg',
            cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80'
        },
        {
            title: 'Arabesque No.1',
            artist: 'Claude Debussy',
            src: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Debussy_-_Arabesque_No._1.ogg',
            cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80'
        }
    ],

    init: function() {
        if (localStorage.getItem('musicPlayerDisabled') === 'true') {
            return;
        }
        this.createPlayer();
        this.bindEvents();
        this.bindAudioEvents();
        this.loadTrack(0);
        this.loadSettings();
    },

    createPlayer: function() {
        const player = document.createElement('div');
        player.className = 'music-player';
        player.innerHTML = `
            <div class="music-player-collapsed">
                <button class="music-toggle-btn" aria-label="Toggle music player">
                    <svg class="icon-music" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                    <div class="music-visualizer-mini">
                        <span></span><span></span><span></span><span></span>
                    </div>
                </button>
            </div>

            <div class="music-player-expanded">
                <div class="music-player-header">
                    <span class="music-player-title">Now Playing</span>
                    <button class="music-minimize-btn" aria-label="Minimize">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>

                <div class="music-cover-container">
                    <img class="music-cover" src="" alt="Album cover">
                    <canvas class="music-visualizer"></canvas>
                </div>

                <div class="music-info">
                    <div class="music-title">Track Title</div>
                    <div class="music-artist">Artist Name</div>
                </div>

                <div class="music-progress">
                    <div class="music-progress-bar">
                        <div class="music-progress-fill"></div>
                        <div class="music-progress-handle"></div>
                    </div>
                    <div class="music-time">
                        <span class="music-current">0:00</span>
                        <span class="music-duration">0:00</span>
                    </div>
                </div>

                <div class="music-controls">
                    <button class="music-btn music-prev" aria-label="Previous">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="19 20 9 12 19 4 19 20"/>
                            <line x1="5" y1="19" x2="5" y2="5"/>
                        </svg>
                    </button>
                    <button class="music-btn music-play" aria-label="Play">
                        <svg class="icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        <svg class="icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                    </button>
                    <button class="music-btn music-next" aria-label="Next">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 4 15 12 5 20 5 4"/>
                            <line x1="19" y1="5" x2="19" y2="19"/>
                        </svg>
                    </button>
                </div>

                <div class="music-volume">
                    <button class="music-mute-btn" aria-label="Mute">
                        <svg class="icon-volume" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        </svg>
                        <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                            <line x1="23" y1="9" x2="17" y2="15"/>
                            <line x1="17" y1="9" x2="23" y2="15"/>
                        </svg>
                    </button>
                    <div class="music-volume-slider">
                        <div class="music-volume-fill"></div>
                        <div class="music-volume-handle"></div>
                    </div>
                </div>

                <div class="music-playlist">
                    <div class="music-playlist-title">Playlist</div>
                    <div class="music-playlist-items"></div>
                </div>
            </div>
        `;
        document.body.appendChild(player);
        this.player = player;

        this.audio = new Audio();
        this.visualizerCanvas = player.querySelector('.music-visualizer');
        this.renderPlaylist();
    },

    bindEvents: function() {
        const player = this.player;

        // Toggle expanded/collapsed
        player.querySelector('.music-toggle-btn').addEventListener('click', () => {
            player.classList.toggle('expanded');
            if (player.classList.contains('expanded') && this.isPlaying) {
                this.initVisualizer();
            }
        });

        player.querySelector('.music-minimize-btn').addEventListener('click', () => {
            player.classList.remove('expanded');
        });

        // Playback controls
        player.querySelector('.music-play').addEventListener('click', () => this.togglePlay());
        player.querySelector('.music-prev').addEventListener('click', () => this.prevTrack());
        player.querySelector('.music-next').addEventListener('click', () => this.nextTrack());

        // Progress bar
        const progressBar = player.querySelector('.music-progress-bar');
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });

        // Volume
        player.querySelector('.music-mute-btn').addEventListener('click', () => this.toggleMute());

        const volumeSlider = player.querySelector('.music-volume-slider');
        volumeSlider.addEventListener('click', (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.setVolume(Math.max(0, Math.min(1, percent)));
        });

        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
    },

    renderPlaylist: function() {
        const container = this.player.querySelector('.music-playlist-items');
        container.innerHTML = this.playlist.map((track, i) => `
            <div class="music-playlist-item ${i === this.currentTrack ? 'active' : ''}" data-index="${i}">
                <img src="${track.cover}" alt="${track.title}">
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${track.title}</div>
                    <div class="playlist-item-artist">${track.artist}</div>
                </div>
                <div class="playlist-item-playing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.music-playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                this.loadTrack(parseInt(item.dataset.index));
                this.play();
            });
        });
    },

    loadTrack: function(index) {
        this.currentTrack = index;
        const track = this.playlist[index];

        this.audio.src = track.src;
        this.player.querySelector('.music-cover').src = track.cover;
        this.player.querySelector('.music-title').textContent = track.title;
        this.player.querySelector('.music-artist').textContent = track.artist;

        this.player.querySelectorAll('.music-playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        this.saveSettings();
    },

    togglePlay: function() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    play: function() {
        this.audio.play().then(() => {
            this.initVisualizer();
        }).catch(err => {
            console.log('Playback prevented:', err);
            if (typeof Toast !== 'undefined') {
                Toast.warning('Click the play button again to start music');
            }
        });
    },

    errorCount: 0,
    maxErrors: 3,

    bindAudioEvents: function() {
        this.audio.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            this.errorCount++;
            if (this.errorCount >= this.maxErrors) {
                console.log('Music player disabled due to repeated errors');
                this.disablePlayer();
                return;
            }
        });

        this.audio.addEventListener('canplay', () => {
            console.log('Audio ready to play');
            this.errorCount = 0;
        });
    },

    disablePlayer: function() {
        if (this.player) {
            this.player.style.display = 'none';
        }
        localStorage.setItem('musicPlayerDisabled', 'true');
    },

    pause: function() {
        this.audio.pause();
    },

    onPlay: function() {
        this.isPlaying = true;
        this.player.classList.add('playing');
        this.saveSettings();
    },

    onPause: function() {
        this.isPlaying = false;
        this.player.classList.remove('playing');
        this.saveSettings();
    },

    prevTrack: function() {
        const newIndex = this.currentTrack > 0 ? this.currentTrack - 1 : this.playlist.length - 1;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.play();
    },

    nextTrack: function() {
        const newIndex = this.currentTrack < this.playlist.length - 1 ? this.currentTrack + 1 : 0;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.play();
    },

    setVolume: function(value) {
        this.volume = value;
        this.audio.volume = value;
        this.player.querySelector('.music-volume-fill').style.width = `${value * 100}%`;
        this.player.classList.toggle('muted', value === 0);
        this.saveSettings();
    },

    toggleMute: function() {
        if (this.audio.volume > 0) {
            this.previousVolume = this.audio.volume;
            this.setVolume(0);
        } else {
            this.setVolume(this.previousVolume || 0.5);
        }
    },

    updateProgress: function() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0;
        this.player.querySelector('.music-progress-fill').style.width = `${percent}%`;
        this.player.querySelector('.music-current').textContent = this.formatTime(this.audio.currentTime);
    },

    updateDuration: function() {
        this.player.querySelector('.music-duration').textContent = this.formatTime(this.audio.duration);
    },

    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    initVisualizer: function() {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.drawVisualizer();
        } catch (e) {
            console.log('Visualizer not supported');
        }
    },

    drawVisualizer: function() {
        if (!this.analyser || !this.visualizerCanvas) return;

        const canvas = this.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        const draw = () => {
            requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(this.dataArray);

            ctx.clearRect(0, 0, width, height);

            const barCount = 32;
            const barWidth = width / barCount;
            const step = Math.floor(this.dataArray.length / barCount);

            for (let i = 0; i < barCount; i++) {
                const value = this.dataArray[i * step];
                const barHeight = (value / 255) * height * 0.8;

                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, 'rgba(180, 143, 95, 0.8)');
                gradient.addColorStop(1, 'rgba(180, 143, 95, 0.2)');

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    i * barWidth + 1,
                    height - barHeight,
                    barWidth - 2,
                    barHeight
                );
            }
        };

        draw();
    },

    saveSettings: function() {
        localStorage.setItem('musicPlayer', JSON.stringify({
            currentTrack: this.currentTrack,
            volume: this.volume,
            wasPlaying: this.isPlaying
        }));
    },

    loadSettings: function() {
        const saved = localStorage.getItem('musicPlayer');
        if (saved) {
            const settings = JSON.parse(saved);
            this.loadTrack(settings.currentTrack || 0);
            this.setVolume(settings.volume ?? 0.5);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
});
