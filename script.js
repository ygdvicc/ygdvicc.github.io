
const musicButton = document.querySelector("#music-button");
const backgroundMusic = document.querySelector("#background-music");

musicButton.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
        try {
            await backgroundMusic.play();
            musicButton.textContent = "♫ MUSIC: ON";
        } catch (error) {
            musicButton.textContent = "KHÔNG THỂ PHÁT NHẠC";
            console.error("Không thể phát nhạc:", error);
        }
    } else {
        backgroundMusic.pause();
        musicButton.textContent = "♫ MUSIC: OFF";
    }
});
