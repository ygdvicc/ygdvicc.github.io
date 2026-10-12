const backgroundMusic = document.querySelector("#background-music");
const background = document.querySelector(".background");
const profileCard = document.querySelector(".profile");
const playToggle = document.querySelector("#play-toggle");
const playIcon = document.querySelector("#play-icon");
const progressBar = document.querySelector("#track-progress");
const currentTimeDisplay = document.querySelector("#current-time");
const durationDisplay = document.querySelector("#duration");
const playerStatus = document.querySelector("#player-status");
const entryGate = document.querySelector("#entry-gate");

backgroundMusic.volume = 0.95;

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

            profileCard.style.setProperty("--tilt-x", `${horizontal * 8}deg`);
            profileCard.style.setProperty("--tilt-y", `${vertical * -8}deg`);
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

function updatePlayButton() {
    const isPlaying = !backgroundMusic.paused;
    document.querySelector(".audio-player").classList.toggle("is-playing", isPlaying);
    playToggle.setAttribute("aria-pressed", String(isPlaying));
    playToggle.setAttribute(
        "aria-label",
        isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"
    );
    playToggle.classList.toggle("is-playing", isPlaying);
    playIcon.innerHTML = isPlaying
        ? '<path d="M7 5h3v14H7zM14 5h3v14h-3z" />'
        : '<path d="m8 5 12 7-12 7V5Z" />';
}

function setPlayerStatus(message) {
    playerStatus.textContent = message;
    playerStatus.classList.toggle("is-visible", Boolean(message));
}

function updateProgress() {
    const duration = backgroundMusic.duration;
    const progress = Number.isFinite(duration) && duration > 0
        ? (backgroundMusic.currentTime / duration) * 100
        : 0;

    progressBar.value = Number.isFinite(duration) ? String(backgroundMusic.currentTime) : "0";
    progressBar.style.setProperty("--progress", `${progress}%`);
    currentTimeDisplay.textContent = formatTime(backgroundMusic.currentTime);
}

function updateTrackAvailability() {
    const hasDuration = Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration > 0;

    progressBar.disabled = !hasDuration;
    progressBar.max = hasDuration ? String(backgroundMusic.duration) : "0";
    document.querySelector("#skip-back").disabled = !hasDuration;
    document.querySelector("#skip-forward").disabled = !hasDuration;

    if (hasDuration) {
        durationDisplay.textContent = formatTime(backgroundMusic.duration);
    }

    updateProgress();
}

backgroundMusic.addEventListener("playing", updatePlayButton);
backgroundMusic.addEventListener("playing", () => setPlayerStatus(""));
backgroundMusic.addEventListener("pause", updatePlayButton);
backgroundMusic.addEventListener("timeupdate", updateProgress);
backgroundMusic.addEventListener("loadedmetadata", updateTrackAvailability);
backgroundMusic.addEventListener("durationchange", updateTrackAvailability);
backgroundMusic.addEventListener("error", () => {
    console.error(
        "Không thể tải file nhạc:",
        backgroundMusic.currentSrc || "assets/music.mp3"
    );
    setPlayerStatus("Không thể tải nhạc. Hãy kiểm tra assets/music.mp3.");
});

playToggle.addEventListener("click", async () => {
    if (!backgroundMusic.paused) {
        backgroundMusic.pause();
        return;
    }

    try {
        await backgroundMusic.play();
        setPlayerStatus("");
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        if (error.name === "NotAllowedError") {
            setPlayerStatus("Trình duyệt chặn tự phát. Hãy bấm nút phát nhạc.");
            return;
        }

        console.error("Không thể phát nhạc:", error);
        setPlayerStatus("Không thể phát nhạc. Hãy kiểm tra file assets/music.mp3.");
    }
});

entryGate.addEventListener("click", () => {
    let playback;

    entryGate.blur();

    try {
        playback = backgroundMusic.play();
    } catch (error) {
        console.error("Không thể phát nhạc:", error);
        setPlayerStatus("Không thể phát nhạc. Hãy kiểm tra file assets/music.mp3.");
    }

    document.body.classList.add("has-entered");
    document.body.classList.remove("is-locked");
    document.querySelector(".page-content").classList.remove("is-locked");
    entryGate.remove();

    if (playback) {
        playback.then(() => {
            setPlayerStatus("");
        }).catch((error) => {
            if (error.name === "AbortError") {
                return;
            }

            if (error.name === "NotAllowedError") {
                setPlayerStatus("Trình duyệt chặn phát nhạc. Hãy bấm nút phát.");
                return;
            }

            console.error("Không thể phát nhạc:", error);
            setPlayerStatus("Không thể phát nhạc. Hãy kiểm tra file assets/music.mp3.");
        });
    }
});

document.querySelector("#skip-back").addEventListener("click", () => {
    if (Number.isFinite(backgroundMusic.duration)) {
        backgroundMusic.currentTime = Math.max(0, backgroundMusic.currentTime - 10);
    }
});

document.querySelector("#skip-forward").addEventListener("click", () => {
    if (Number.isFinite(backgroundMusic.duration)) {
        backgroundMusic.currentTime = Math.min(backgroundMusic.duration, backgroundMusic.currentTime + 10);
    }
});

progressBar.addEventListener("input", () => {
    const duration = backgroundMusic.duration;
    if (!Number.isFinite(duration) || !durationBarIsAvailable()) {
        return;
    }

    backgroundMusic.currentTime = Number(progressBar.value);
    updateProgress();
});

function durationBarIsAvailable() {
    return Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration > 0;
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

updatePlayButton();
updateTrackAvailability();
updateProgress();
