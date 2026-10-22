const backgroundMusic = document.querySelector("#background-music");
const background = document.querySelector(".background");
const profileCard = document.querySelector(".profile");
const playerStatus = document.querySelector("#player-status");
const trackList = document.querySelector(".track-list");
const entryGate = document.querySelector("#entry-gate");
const volumeToggle = document.querySelector("#volume-toggle");
const volumeSlider = document.querySelector("#volume-slider");
let trackCards = [];
let tracks = [];
let lastVolume = 0.5;

let currentTrackIndex = 0;
let isSeeking = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

backgroundMusic.volume = 0.5;
backgroundMusic.preload = "none";

function updateVolumeControl() {
    const volumePercent = Math.round(backgroundMusic.volume * 100);
    const isMuted = backgroundMusic.muted || backgroundMusic.volume === 0;

    volumeToggle.classList.toggle("is-muted", isMuted);
    volumeToggle.setAttribute("aria-pressed", String(backgroundMusic.muted));
    volumeToggle.setAttribute("aria-label", backgroundMusic.muted ? "Bật tiếng" : "Tắt tiếng");
    volumeSlider.value = String(volumePercent);
    volumeSlider.setAttribute("aria-valuetext", `${volumePercent}%`);
    volumeSlider.style.setProperty("--volume", `${volumePercent}%`);
}

volumeToggle.addEventListener("click", () => {
    if (backgroundMusic.muted || backgroundMusic.volume === 0) {
        if (backgroundMusic.volume === 0) {
            backgroundMusic.volume = lastVolume || 0.5;
        }
        backgroundMusic.muted = false;
    } else {
        lastVolume = backgroundMusic.volume;
        backgroundMusic.muted = true;
    }

    updateVolumeControl();
});

volumeSlider.addEventListener("input", () => {
    backgroundMusic.volume = Number(volumeSlider.value) / 100;
    backgroundMusic.muted = false;

    if (backgroundMusic.volume > 0) {
        lastVolume = backgroundMusic.volume;
    }

    updateVolumeControl();
});

updateVolumeControl();

const canTrackPointer = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);

if (canTrackPointer.matches) {
    let pointerFrame;
    let profileFrame;

    window.addEventListener("pointermove", (event) => {
        if (pointerFrame) {
            cancelAnimationFrame(pointerFrame);
        }

        pointerFrame = requestAnimationFrame(() => {
            const offsetX = (event.clientX / window.innerWidth - 0.5) * -18;
            const offsetY = (event.clientY / window.innerHeight - 0.5) * -18;

            background.style.setProperty("--pointer-x", `${offsetX}px`);
            background.style.setProperty("--pointer-y", `${offsetY}px`);
            background.style.setProperty("--pointer-scale", "1.05");
        });
    });

    profileCard.addEventListener("pointermove", (event) => {
        if (profileFrame) {
            cancelAnimationFrame(profileFrame);
        }

        profileFrame = requestAnimationFrame(() => {
            const bounds = profileCard.getBoundingClientRect();
            const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
            const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

            profileCard.style.setProperty("--tilt-x", `${horizontal * 3}deg`);
            profileCard.style.setProperty("--tilt-y", `${vertical * -3}deg`);
        });
    });

    profileCard.addEventListener("pointerleave", () => {
        profileCard.style.setProperty("--tilt-x", "0deg");
        profileCard.style.setProperty("--tilt-y", "0deg");
    });

    window.addEventListener("pointerleave", () => {
        background.style.setProperty("--pointer-x", "0px");
        background.style.setProperty("--pointer-y", "0px");
        background.style.setProperty("--pointer-scale", "1");
    });
}

function formatTime(time) {
    if (!Number.isFinite(time)) {
        return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function setPlayerStatus(message) {
    playerStatus.textContent = message;
    playerStatus.classList.toggle("is-visible", Boolean(message));
}

function createTrackCard(track, index) {
    const card = document.createElement("article");
    card.className = "audio-player";
    card.dataset.trackIndex = String(index);

    const artwork = document.createElement("div");
    artwork.className = "track-art";
    artwork.setAttribute("aria-hidden", "true");

    const waveform = document.createElement("span");
    waveform.className = "waveform";
    for (let bar = 0; bar < 15; bar += 1) {
        waveform.append(document.createElement("span"));
    }
    artwork.append(waveform);

    const content = document.createElement("div");
    content.className = "player-content";

    const title = document.createElement("h3");
    title.className = "track-title";
    title.textContent = track.title;

    const controls = document.createElement("div");
    controls.className = "player-controls";

    const currentTime = document.createElement("span");
    currentTime.className = "time-display current-time";
    currentTime.textContent = "0:00";

    const progress = document.createElement("input");
    progress.className = "track-progress";
    progress.type = "range";
    progress.min = "0";
    progress.max = "0";
    progress.value = "0";
    progress.disabled = true;
    progress.setAttribute("aria-label", `Tiến độ bài ${track.title}`);

    const duration = document.createElement("span");
    duration.className = "time-display duration";
    duration.textContent = "--:--";

    const playButton = document.createElement("button");
    playButton.className = "player-button play-button";
    playButton.type = "button";
    playButton.setAttribute("aria-label", `Phát ${track.title}`);
    playButton.setAttribute("aria-pressed", "false");
    playButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7V5Z" /></svg>';

    const repeat = document.createElement("span");
    repeat.className = "track-repeat";
    repeat.setAttribute("aria-hidden", "true");
    repeat.textContent = "↻";

    controls.append(currentTime, progress, duration, playButton, repeat);
    content.append(title, controls);
    card.append(artwork, content);

    return card;
}

function updateTrackCards() {
    const isPlaying = !backgroundMusic.paused;

    trackCards.forEach((card, index) => {
        const isActive = index === currentTrackIndex;
        const playButton = card.querySelector(".play-button");
        const progress = card.querySelector(".track-progress");
        const currentTime = card.querySelector(".current-time");
        const duration = card.querySelector(".duration");
        const isActiveAndReady = isActive && Number.isFinite(backgroundMusic.duration);

        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-playing", isActive && isPlaying);
        playButton.setAttribute("aria-pressed", String(isActive && isPlaying));
        playButton.setAttribute(
            "aria-label",
            isActive && isPlaying ? `Tạm dừng ${tracks[index].title}` : `Phát ${tracks[index].title}`
        );
        playButton.innerHTML = isActive && isPlaying
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7V5Z" /></svg>';

        if (!isActive) {
            progress.value = "0";
            progress.max = "0";
            progress.disabled = true;
            progress.style.setProperty("--progress", "0%");
            currentTime.textContent = "0:00";
            duration.textContent = "--:--";
            return;
        }

        progress.disabled = !isActiveAndReady;
        progress.max = isActiveAndReady ? String(backgroundMusic.duration) : "0";
        if (!isSeeking) {
            progress.value = isActiveAndReady ? String(backgroundMusic.currentTime) : "0";
        }
        progress.style.setProperty(
            "--progress",
            isActiveAndReady
                ? `${(backgroundMusic.currentTime / backgroundMusic.duration) * 100}%`
                : "0%"
        );
        currentTime.textContent = formatTime(backgroundMusic.currentTime);
        duration.textContent = isActiveAndReady ? formatTime(backgroundMusic.duration) : "--:--";
    });
}

async function playTrack(index, { scroll = false } = {}) {
    if (!tracks[index]) {
        setPlayerStatus("Không có bài nhạc để phát. Hãy kiểm tra tệp assets/playlist.json.");
        return;
    }

    currentTrackIndex = index;
    isSeeking = false;
    setPlayerStatus("");

    if (backgroundMusic.getAttribute("src") !== tracks[index].src) {
        backgroundMusic.src = tracks[index].src;
        backgroundMusic.load();
    } else if (backgroundMusic.ended) {
        backgroundMusic.currentTime = 0;
    }

    updateTrackCards();

    if (scroll) {
        trackCards[index].scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
        });
    }

    try {
        await backgroundMusic.play();
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        if (error.name === "NotAllowedError") {
            setPlayerStatus("Trình duyệt chặn tự phát. Hãy bấm nút phát nhạc.");
            return;
        }

        console.error("Không thể phát nhạc:", error);
        setPlayerStatus("Không thể phát nhạc. Hãy kiểm tra tệp nhạc trong assets.");
        return;
    }

    updateTrackCards();
}

trackList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const playButton = event.target.closest(".play-button");
    if (!playButton) {
        return;
    }

    const card = playButton.closest(".audio-player");
    const index = Number(card?.dataset.trackIndex);
    if (!Number.isInteger(index) || !tracks[index]) {
        return;
    }

    if (index === currentTrackIndex && !backgroundMusic.paused) {
        backgroundMusic.pause();
        return;
    }

    void playTrack(index);
});

trackList.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.matches(".track-progress")) {
        return;
    }

    const card = event.target.closest(".audio-player");
    const index = Number(card?.dataset.trackIndex);
    if (index !== currentTrackIndex || !Number.isFinite(backgroundMusic.duration)) {
        return;
    }

    isSeeking = true;
    backgroundMusic.currentTime = Number(event.target.value);
    updateTrackCards();
});

trackList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.matches(".track-progress")) {
        return;
    }

    isSeeking = false;
    updateTrackCards();
});

function enterPage() {
    entryGate.blur();
    document.body.classList.add("has-entered");
    document.body.classList.remove("is-locked");
    document.querySelector(".page-content").classList.remove("is-locked");
    entryGate.remove();
}

entryGate.addEventListener("click", () => {
    if (tracks.length > 0) {
        void playTrack(currentTrackIndex);
    }

    enterPage();
});

async function loadPlaylist() {
    entryGate.disabled = true;

    try {
        const playlistUrl = new URL("assets/playlist.json", document.baseURI);
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`Không tải được playlist (HTTP ${response.status}).`);
        }

        const playlist = await response.json();
        if (!Array.isArray(playlist) || playlist.length === 0) {
            throw new Error("Playlist phải là một danh sách có ít nhất một bài nhạc.");
        }

        tracks = playlist.map((track, index) => {
            if (
                !track
                || typeof track.title !== "string"
                || !track.title.trim()
                || typeof track.src !== "string"
                || !track.src.trim()
            ) {
                throw new Error(`Bài nhạc thứ ${index + 1} cần có title và src hợp lệ.`);
            }

            return {
                title: track.title.trim(),
                src: new URL(
                    track.src.split("/").map(encodeURIComponent).join("/"),
                    playlistUrl
                ).href,
            };
        });

        trackCards = tracks.map(createTrackCard);
        trackList.replaceChildren(...trackCards);
        updateTrackCards();
    } catch (error) {
        console.error("Không thể tải playlist:", error);
        setPlayerStatus("Không thể tải danh sách nhạc. Hãy kiểm tra tệp assets/playlist.json.");
    } finally {
        entryGate.disabled = false;
    }
}

entryGate.disabled = true;
void loadPlaylist();

backgroundMusic.addEventListener("playing", updateTrackCards);
backgroundMusic.addEventListener("pause", updateTrackCards);
backgroundMusic.addEventListener("timeupdate", updateTrackCards);
backgroundMusic.addEventListener("loadedmetadata", updateTrackCards);
backgroundMusic.addEventListener("durationchange", updateTrackCards);
backgroundMusic.addEventListener("ended", () => {
    if (tracks.length === 0) {
        return;
    }

    const nextTrackIndex = (currentTrackIndex + 1) % tracks.length;
    void playTrack(nextTrackIndex, { scroll: true });
});
backgroundMusic.addEventListener("error", () => {
    console.error("Không thể tải file nhạc:", backgroundMusic.currentSrc || tracks[currentTrackIndex].src);
    setPlayerStatus("Không thể tải nhạc. Hãy kiểm tra tệp nhạc trong assets.");
    updateTrackCards();
});

if (!reduceMotion) {
    const rainLayers = [
        { element: document.querySelector(".rain-back"), count: 34, minDuration: 6.5, durationRange: 3.5 },
        { element: document.querySelector(".rain-front"), count: 24, minDuration: 4.5, durationRange: 3 },
    ];

    for (const layer of rainLayers) {
        for (let index = 0; index < layer.count; index += 1) {
            const raindrop = document.createElement("span");
            const duration = layer.minDuration + Math.random() * layer.durationRange;

            raindrop.className = "raindrop";
            raindrop.style.setProperty("--start-x", `${Math.random() * 105}%`);
            raindrop.style.setProperty("--width", `${1 + Math.random() * 1.1}px`);
            raindrop.style.setProperty("--length", `${12 + Math.random() * 14}px`);
            raindrop.style.setProperty("--drop-opacity", `${0.45 + Math.random() * 0.5}`);
            raindrop.style.setProperty("--drift", `${18 + Math.random() * 38}px`);
            raindrop.style.setProperty("--fall-duration", `${duration}s`);
            raindrop.style.setProperty("--fall-delay", `${-Math.random() * duration}s`);
            layer.element.append(raindrop);
        }
    }

    const fireflies = document.querySelector(".fireflies");
    const fireflyCount = 18;

    for (let index = 0; index < fireflyCount; index += 1) {
        const firefly = document.createElement("span");
        const duration = 10 + Math.random() * 12;

        firefly.className = "firefly";
        firefly.style.setProperty("--start-x", `${68 + Math.random() * 38}%`);
        firefly.style.setProperty("--start-y", `${78 + Math.random() * 32}%`);
        firefly.style.setProperty("--travel-x", `${-(window.innerWidth * (0.2 + Math.random() * 0.55))}px`);
        firefly.style.setProperty("--travel-y", `${-(window.innerHeight * (0.45 + Math.random() * 0.55))}px`);
        firefly.style.setProperty("--size", `${2 + Math.random() * 3}px`);
        firefly.style.setProperty("--duration", `${duration}s`);
        firefly.style.setProperty("--delay", `${-Math.random() * duration}s`);
        firefly.style.setProperty("--glow-delay", `${-Math.random() * 2.4}s`);
        fireflies.append(firefly);
    }
}
