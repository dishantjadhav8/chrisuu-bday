// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// API Configuration - works both locally and on Vercel
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Global Variables
let currentSlide = 0;
let currentTrack = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let shuffledPlaylist = [];

// Music tracks
const tracks = [
    { title: 'Tu Jo Mila', artist: 'Pritam', duration: '4:48', file: 'Tu jo mila/SpotiDownloader.com - Tu Jo Mila - Pritam.mp3' },
    { title: 'I Think They Call This Love', artist: 'Matthew Ifield', duration: '3:28', file: 'I THINK THEY CALL THIS LOVE/SpotiDownloader.com - I Think They Call This Love - Cover - Matthew Ifield.mp3' },
    { title: 'Photograph', artist: 'Ed Sheeran', duration: '4:19', file: 'Photograph/SpotiDownloader.com - Photograph - Ed Sheeran.mp3' },
    { title: 'Until I Found You', artist: 'Stephen Sanchez', duration: '2:55', file: 'Until i found you/SpotiDownloader.com - Until I Found You - Stephen Sanchez.mp3' }
];

let countdownInterval = null;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeNavigation();
    initializeGallery();
    initializeMusicPlayer();
    initializeCountdown();
    initializeWishes();
    initializeEventListeners();
});

// Initialize Animations
function initializeAnimations() {
    // Create confetti
    createConfetti();
    
    // Create particles
    createParticles();
    
    // Smooth scroll for navigation links
    $$('.nav-link, .footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = $(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Create Confetti
function createConfetti() {
    const container = $('#confettiContainer');
    const colors = ['#ff6b9d', '#c44569', '#ffa502', '#4facfe', '#00f2fe', '#667eea', '#764ba2'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 3) + 's';
        container.appendChild(confetti);
    }
}

// Create Particles
function createParticles() {
    const container = $('#particles');
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(particle);
    }
}

// Navigation
function initializeNavigation() {
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');
    const navbar = $('#navbar');
    
    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(45deg) translate(5px, 5px)' : '';
        spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(-45deg) translate(7px, -6px)' : '';
    });
    
    // Close mobile menu when link is clicked
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Gallery
function initializeGallery() {
    const gridViewBtn = $('#gridViewBtn');
    const slideshowViewBtn = $('#slideshowViewBtn');
    const galleryGrid = $('#galleryGrid');
    const gallerySlideshow = $('#gallerySlideshow');
    const prevBtn = $('#prevSlideBtn');
    const nextBtn = $('#nextSlideBtn');
    
    // Switch views
    gridViewBtn?.addEventListener('click', () => {
        galleryGrid.style.display = 'grid';
        gallerySlideshow.style.display = 'none';
    });
    
    slideshowViewBtn?.addEventListener('click', () => {
        galleryGrid.style.display = 'none';
        gallerySlideshow.style.display = 'block';
    });
    
    // Slideshow controls
    prevBtn?.addEventListener('click', () => changeSlide(-1));
    nextBtn?.addEventListener('click', () => changeSlide(1));
    
    // Indicator clicks
    $$('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto slideshow
    setInterval(() => {
        if (gallerySlideshow.style.display !== 'none') {
            changeSlide(1);
        }
    }, 5000);
}

function changeSlide(direction) {
    const slides = $$('.slide');
    currentSlide += direction;
    
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    showSlide(currentSlide);
}

function showSlide(index) {
    const slides = $$('.slide');
    const indicators = $$('.indicator');
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

// Music Player
function initializeMusicPlayer() {
    const playPauseBtn = $('#playPauseBtn');
    const prevTrackBtn = $('#prevTrackBtn');
    const nextTrackBtn = $('#nextTrackBtn');
    const volumeSlider = $('#volumeSlider');
    const progressBar = $('#progressBar');
    const vinylRecord = $('#vinylRecord');
    const audioPlayer = $('#audioPlayer');
    
    // Initialize shuffled playlist
    shuffledPlaylist = [...Array(tracks.length).keys()];
    
    // Load first track
    if (audioPlayer && tracks[0].file) {
        audioPlayer.src = tracks[0].file;
        audioPlayer.load();
    }
    
    // Set volume slider to 5% to match background music volume
    if (volumeSlider) {
        volumeSlider.value = 5;
    }
    
    // Autoplay on page load
    setTimeout(() => {
        if (audioPlayer) {
            // Unmute and set volume to 5% for background music
            audioPlayer.muted = false;
            audioPlayer.volume = 0.05;
            
            audioPlayer.play().then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸️';
                vinylRecord.classList.add('playing');
            }).catch(() => {
                // If autoplay fails, play on first click
                const playOnClick = () => {
                    audioPlayer.muted = false;
                    audioPlayer.volume = 0.05;
                    audioPlayer.play().then(() => {
                        isPlaying = true;
                        playPauseBtn.textContent = '⏸️';
                        vinylRecord.classList.add('playing');
                    });
                    document.removeEventListener('click', playOnClick);
                };
                document.addEventListener('click', playOnClick, { once: true });
            });
        }
    }, 1000);
    
    // Shuffle button
    const shuffleBtn = $('#shuffleBtn');
    shuffleBtn?.addEventListener('click', () => {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('active', isShuffled);
        shuffleBtn.textContent = isShuffled ? '🔀' : '🔀';
        
        if (isShuffled) {
            // Create shuffled playlist
            shuffledPlaylist = [...Array(tracks.length).keys()];
            for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
            }
        }
    });
    
    // Repeat button
    const repeatBtn = $('#repeatBtn');
    repeatBtn?.addEventListener('click', () => {
        if (repeatMode === 'off') {
            repeatMode = 'all';
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.add('active');
        } else if (repeatMode === 'all') {
            repeatMode = 'one';
            repeatBtn.textContent = '🔂';
        } else {
            repeatMode = 'off';
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.remove('active');
        }
    });
    
    // Play/Pause
    playPauseBtn?.addEventListener('click', () => {
        if (!audioPlayer) return;
        
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
            playPauseBtn.textContent = '⏸️';
            vinylRecord.classList.add('playing');
        } else {
            audioPlayer.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶️';
            vinylRecord.classList.remove('playing');
        }
    });
    
    // Previous track
    prevTrackBtn?.addEventListener('click', () => {
        currentTrack = currentTrack > 0 ? currentTrack - 1 : tracks.length - 1;
        loadTrack(currentTrack);
        if (isPlaying && audioPlayer) {
            audioPlayer.play();
        }
    });
    
    // Next track
    nextTrackBtn?.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack(currentTrack);
        if (isPlaying && audioPlayer) {
            audioPlayer.play();
        }
    });
    
    // Volume control
    volumeSlider?.addEventListener('input', (e) => {
        if (audioPlayer) {
            audioPlayer.volume = e.target.value / 100;
        }
    });
    
    // Progress bar click
    progressBar?.addEventListener('click', (e) => {
        if (!audioPlayer) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });
    
    // Update progress as song plays
    audioPlayer?.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            $('#progress').style.width = percent + '%';
            
            // Update time display
            const currentMins = Math.floor(audioPlayer.currentTime / 60);
            const currentSecs = Math.floor(audioPlayer.currentTime % 60);
            $('#currentTime').textContent = `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
            
            const totalMins = Math.floor(audioPlayer.duration / 60);
            const totalSecs = Math.floor(audioPlayer.duration % 60);
            $('#totalTime').textContent = `${totalMins}:${totalSecs.toString().padStart(2, '0')}`;
        }
    });
    
    // Auto play next track when current ends
    audioPlayer?.addEventListener('ended', () => {
        if (repeatMode === 'one') {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            let nextTrack;
            if (isShuffled) {
                const currentIndex = shuffledPlaylist.indexOf(currentTrack);
                const nextIndex = (currentIndex + 1) % shuffledPlaylist.length;
                nextTrack = shuffledPlaylist[nextIndex];
            } else {
                nextTrack = (currentTrack + 1) % tracks.length;
            }
            
            if (nextTrack === 0 && repeatMode === 'off') {
                // End of playlist
                $('#playPauseBtn').textContent = '▶️';
                isPlaying = false;
                $('#vinylRecord').classList.remove('playing');
            } else {
                currentTrack = nextTrack;
                loadTrack(currentTrack);
                audioPlayer.play();
            }
        }
    });
    
    // Playlist click
    $$('.playlist-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            currentTrack = index;
            loadTrack(currentTrack);
            audioPlayer?.play();
            
            $$('.playlist-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function loadTrack(trackIndex) {
    const track = tracks[trackIndex];
    const audioPlayer = $('#audioPlayer');
    
    $('#trackTitle').textContent = track.title;
    $('#trackArtist').textContent = track.artist;
    $('#currentTime').textContent = '0:00';
    $('#progress').style.width = '0%';
    
    if (audioPlayer && track.file) {
        audioPlayer.src = track.file;
        audioPlayer.load();
    }
    
    // Update playlist active state
    $$('.playlist-item').forEach((item, index) => {
        item.classList.toggle('active', index === trackIndex);
    });
}

// Countdown Timer
function initializeCountdown() {
    const birthdayInput = $('#birthdayDate');
    
    // Start countdown immediately if date is pre-filled
    if (birthdayInput?.value) {
        const targetDate = new Date(birthdayInput.value);
        startCountdown(targetDate);
    }
    
    birthdayInput?.addEventListener('change', (e) => {
        const targetDate = new Date(e.target.value);
        startCountdown(targetDate);
    });
}

function startCountdown(targetDate) {
    clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            $('#countdownMessage p').textContent = '🎉 Happy Birthday! 🎉';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        $('#days').textContent = days.toString().padStart(2, '0');
        $('#hours').textContent = hours.toString().padStart(2, '0');
        $('#minutes').textContent = minutes.toString().padStart(2, '0');
        $('#seconds').textContent = seconds.toString().padStart(2, '0');
        
        $('#countdownMessage p').textContent = 
            `${days} days until the big celebration!`;
    }, 1000);
}

// Wishes System
function initializeWishes() {
    const wishForm = $('#wishForm');
    
    // Load wishes on page load
    loadWishes();
    
    // Handle wish form submission
    wishForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = $('#wishName').value;
        const message = $('#wishMessage').value;
        
        await addWish(name, message);
    });
}

async function loadWishes() {
    const wishesList = $('#wishesList');
    const wishCount = $('#wishCount');
    
    if (!wishesList) return;
    
    wishesList.innerHTML = '<div class="loading-spinner">Loading wishes...</div>';
    
    try {
        // Try API first
        const response = await fetch(`${API_BASE_URL}/wishes`);
        const data = await response.json();
        
        if (data.success) {
            wishCount.textContent = data.count;
            displayWishes(data.wishes);
            return;
        }
    } catch (error) {
        console.log('API not available, using localStorage');
    }
    
    // Fallback to localStorage
    const wishes = getWishesFromLocalStorage();
    wishCount.textContent = wishes.length;
    displayWishes(wishes);
}

function displayWishes(wishes) {
    const wishesList = $('#wishesList');
    
    if (wishes.length === 0) {
        wishesList.innerHTML = '<p style="text-align: center; color: #666;">Be the first to leave a birthday wish! 🎉</p>';
    } else {
        wishesList.innerHTML = wishes.map(wish => `
            <div class="wish-card">
                <div class="wish-header">
                    <span class="wish-author">🎈 ${escapeHtml(wish.name)}</span>
                    <span class="wish-date">${formatDate(wish.timestamp)}</span>
                </div>
                <p class="wish-message">${escapeHtml(wish.message)}</p>
            </div>
        `).reverse().join('');
    }
}

async function addWish(name, message) {
    const wishForm = $('#wishForm');
    
    try {
        // Try API first
        const response = await fetch(`${API_BASE_URL}/wishes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('success', 'Your wish has been sent! 💝');
            wishForm.reset();
            await loadWishes();
            createMiniConfetti();
            return;
        }
    } catch (error) {
        console.log('API not available, using localStorage');
    }
    
    // Fallback to localStorage
    const wish = {
        id: Date.now(),
        name: name.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString()
    };
    
    const wishes = getWishesFromLocalStorage();
    wishes.push(wish);
    localStorage.setItem('birthday:wishes', JSON.stringify(wishes));
    
    showMessage('success', 'Your wish has been sent! 💝');
    wishForm.reset();
    loadWishes();
    createMiniConfetti();
}

function getWishesFromLocalStorage() {
    try {
        const wishes = localStorage.getItem('birthday:wishes');
        return wishes ? JSON.parse(wishes) : [];
    } catch (error) {
        return [];
    }
}

function showMessage(type, text) {
    const wishForm = $('#wishForm');
    const existingMessage = wishForm.querySelector('.success-message, .error-message');
    
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = type === 'success' ? 'success-message' : 'error-message';
    message.textContent = text;
    
    wishForm.insertBefore(message, wishForm.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function createMiniConfetti() {
    const colors = ['#ff6b9d', '#c44569', '#ffa502', '#4facfe', '#00f2fe'];
    const wishForm = $('#wishForm');
    const rect = wishForm.getBoundingClientRect();
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = rect.left + rect.width / 2 + 'px';
            confetti.style.top = rect.top + 'px';
            confetti.style.zIndex = '10001';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = 'confettiFall 2s linear forwards';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }, i * 20);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Event Listeners
function initializeEventListeners() {
    const celebrateBtn = $('#celebrateBtn');
    
    celebrateBtn?.addEventListener('click', () => {
        // Create controlled confetti celebration (much smaller amount)
        createOptimizedCelebration();
        
        // Scroll to gallery
        $('#gallery').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Gallery item modal (simplified version)
    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const caption = item.dataset.caption;
            
            // You could implement a lightbox/modal here
            console.log('Opening image:', img.src, caption);
        });
    });
}

// Optimized celebration effect that won't crash the browser
function createOptimizedCelebration() {
    const colors = ['#ff6b9d', '#c44569', '#ffa502', '#4facfe', '#00f2fe', '#667eea', '#764ba2'];
    const confettiCount = 80; // Reasonable amount
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '10001';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            // Clean up after animation completes
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 15);
    }
}

// Add smooth reveal on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.addEventListener('DOMContentLoaded', () => {
    $$('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Keyboard controls for music player
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const audioPlayer = $('#audioPlayer');
        const playPauseBtn = $('#playPauseBtn');
        const vinylRecord = $('#vinylRecord');
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                // Play/Pause
                if (audioPlayer && playPauseBtn) {
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        isPlaying = true;
                        playPauseBtn.textContent = '⏸️';
                        vinylRecord.classList.add('playing');
                    } else {
                        audioPlayer.pause();
                        isPlaying = false;
                        playPauseBtn.textContent = '▶️';
                        vinylRecord.classList.remove('playing');
                    }
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                // Next track
                currentTrack = (currentTrack + 1) % 4; // 4 tracks total
                loadTrack(currentTrack);
                if (isPlaying) audioPlayer.play();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                // Previous track
                currentTrack = currentTrack > 0 ? currentTrack - 1 : 3;
                loadTrack(currentTrack);
                if (isPlaying) audioPlayer.play();
                break;
            case 'ArrowUp':
                e.preventDefault();
                // Volume up
                if (audioPlayer) {
                    audioPlayer.volume = Math.min(1, audioPlayer.volume + 0.1);
                    $('#volumeSlider').value = audioPlayer.volume * 100;
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Volume down
                if (audioPlayer) {
                    audioPlayer.volume = Math.max(0, audioPlayer.volume - 0.1);
                    $('#volumeSlider').value = audioPlayer.volume * 100;
                }
                break;
        }
    });
});
