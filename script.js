// ==========================================================================
// SCRIPT.JS - ĐIỀU KHIỂN ÂM THANH, SLIDESHOW 10S, ĐỔI NỀN MƯỢT MÀ & THẺ LANYARD
// ==========================================================================

const backgroundMusic = document.querySelector("#background-music");
const background = document.querySelector(".background-primary");
const bgSecondary = document.querySelector("#bg-secondary");
const lanyardContainer = document.querySelector("#lanyard-container");
const profileCard = document.querySelector(".profile-card");
const employeeBadge = document.querySelector("#employee-badge");
const metalRing = document.querySelector("#lanyard-metal-ring");
const lanyardSvg = document.querySelector("#lanyard-svg");
const lanyardStrapBody = document.querySelector("#lanyard-strap-body");
const lanyardEdgeLeft = document.querySelector("#lanyard-edge-left");
const lanyardEdgeRight = document.querySelector("#lanyard-edge-right");
const lanyardStitch = document.querySelector("#lanyard-stitch");
const heroSection = document.querySelector("#hero");
const musicSection = document.querySelector("#music-section");
const playerStatus = document.querySelector("#player-status");
const trackList = document.querySelector("#track-list");

// 1. MÀN HÌNH CHỜ "BẤM ĐỂ XEM"
const entryScreen = document.querySelector("#entry-screen");

// 2. KHUNG TO THÔNG BÁO ĐANG PHÁT (BÊN TRÁI)
const nowPlayingPanel = document.querySelector("#now-playing-panel");
const npTrackNum = document.querySelector("#np-track-num");
const npTitle = document.querySelector("#np-title");
const npProgress = document.querySelector("#np-progress");
const npCurrentTime = document.querySelector("#np-current-time");
const npDuration = document.querySelector("#np-duration");
const npPlayBtn = document.querySelector("#np-play-btn");
const npPlayIcon = document.querySelector("#np-play-icon");
const npPrevBtn = document.querySelector("#np-prev-btn");
const npNextBtn = document.querySelector("#np-next-btn");
const npVolumeToggle = document.querySelector("#np-volume-toggle");
const npVolIcon = document.querySelector("#np-vol-icon");
const npVolumeSlider = document.querySelector("#np-volume-slider");

// Khung ảnh trình chiếu 10s
const slideshowImg = document.querySelector("#slideshow-img");

// 3. TOPBAR KHI CUỘN XUỐNG
const topbar = document.querySelector("#topbar");
const topbarProfile = document.querySelector("#topbar-profile");
const scrollCue = document.querySelector("#scroll-cue");

let tracks = [];
let trackCards = [];
let galleryImages = [];
let currentTrackIndex = 0;
let lastVolume = 0.5;
let isSeeking = false;
let hasEntered = false;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

backgroundMusic.volume = 0.5;
backgroundMusic.preload = "none";

// ==========================================================================
// 1. XỬ LÝ MÀN HÌNH CHỜ: BẤM VÀO SẼ MỞ VÀ PHÁT NHẠC
// ==========================================================================

function enterSite() {
    if (hasEntered) return;
    hasEntered = true;

    // Phát bài nhạc đầu tiên
    if (tracks.length > 0) {
        void playTrack(currentTrackIndex);
    }

    if (entryScreen) {
        entryScreen.classList.add("is-hidden");
        setTimeout(() => {
            entryScreen.style.display = "none";
        }, 750);
    }
}

if (entryScreen) {
    entryScreen.addEventListener("click", enterSite);
}

// ==========================================================================
// 2. TRÌNH CHIẾU HÌNH ẢNH NGẪU NHIÊN 10 GIÂY MỖI ẢNH (ASSETS/GALLERY.JSON)
// ==========================================================================

async function loadGallery() {
    try {
        const response = await fetch("assets/gallery.json");
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                galleryImages = data;
            }
        }
    } catch (e) {
        console.warn("Dùng ảnh mặc định cho slideshow:", e);
    }

    if (!galleryImages.length) {
        galleryImages = [
            { src: "assets/Zenless%20Zone%20Zero%20GIF.gif" },
            { src: "assets/Happy%20Robin%20GIF.gif" },
            { src: "assets/Star%20Monitoring%20GIF.gif" },
            { src: "assets/Robin%20Looking%20Around%20GIF.gif" },
            { src: "assets/background.jpg" },
            { src: "assets/avatar.png" }
        ];
    }
}

function rotateSlideshow() {
    if (!slideshowImg || galleryImages.length <= 1) return;

    const currentSrc = slideshowImg.getAttribute("src");
    const otherImages = galleryImages.filter(img => img.src !== currentSrc);
    const chosen = otherImages.length
        ? otherImages[Math.floor(Math.random() * otherImages.length)]
        : galleryImages[0];

    // Chuyển cảnh mờ mềm mại
    slideshowImg.classList.add("fade-out");
    setTimeout(() => {
        slideshowImg.src = chosen.src;
        slideshowImg.onload = () => {
            slideshowImg.classList.remove("fade-out");
        };
    }, 400);
}

void loadGallery().then(() => {
    // Tự động đổi ngẫu nhiên mỗi 10 giây (10000ms)
    setInterval(rotateSlideshow, 10000);
});

// ==========================================================================
// 3. CHUYỂN ĐỔI BACKGROUND MƯỢT MÀ TỪ TRÊN XUỐNG KHI CUỘN XUỐNG PHẦN NHẠC
// ==========================================================================

function updateBackgroundOnScroll() {
    if (!bgSecondary || !musicSection) return;

    const scrollY = window.scrollY;
    const heroHeight = (heroSection ? heroSection.offsetHeight : window.innerHeight) * 0.75;

    // Tiến trình chuyển đổi từ 0 (ở trang 1) đến 1 (ở phần nhạc)
    const progress = Math.min(Math.max((scrollY - 60) / heroHeight, 0), 1);

    // Ảnh 2 trượt từ trên xuống và từ từ hiện ra
    bgSecondary.style.opacity = progress.toFixed(3);
    const translateY = ((1 - progress) * -50).toFixed(1);
    bgSecondary.style.transform = `translateY(${translateY}px) scale(${1.02 + progress * 0.03})`;

    // Kiểm tra hiển thị Topbar
    if (topbar) {
        const shouldShowTopbar = scrollY > 120;
        topbar.classList.toggle("is-visible", shouldShowTopbar);
    }
}

let scrollFrame;
window.addEventListener("scroll", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateBackgroundOnScroll);
}, { passive: true });

window.addEventListener("resize", updateBackgroundOnScroll, { passive: true });

// ==========================================================================
// 4. CHUYỂN ĐỘNG KÉO THẢ VẬT LÝ & DÂY ĐEO CO GIÃN TƯƠNG TÁC (LANYARD PHYSICS)
// ==========================================================================

let currentBadgeX = 0;
let currentBadgeY = 0;
let currentBadgeTilt = 0;
let badgeVelX = 0;
let badgeVelY = 0;
let lanyardIdleTime = 0;
let lanyardRestY = 160;

// Trạng thái vật lý: "IDLE" (đung đưa nhẹ) | "DRAGGING" (bị kéo theo chuột) | "SPRING" (bật nảy đàn hồi)
let lanyardState = "IDLE";

let isBadgeDragging = false;
let hasBadgeMoved = false;
let activeBadgePointerId = null;

let dragStartMouseX = 0;
let dragStartMouseY = 0;
let dragStartBadgeX = 0;
let dragStartBadgeY = 0;

let lastPointerPosX = 0;
let lastPointerPosY = 0;
let lastPointerTimestamp = 0;
let pointerReleaseVelX = 0;
let pointerReleaseVelY = 0;

function calibrateLanyardMetrics() {
    if (!heroSection || !metalRing) return;
    const heroRect = heroSection.getBoundingClientRect();
    const ringRect = metalRing.getBoundingClientRect();
    // Đo khoảng cách thực tế từ đỉnh web (top: 0 của hero) tới khuyên móc kim loại
    const measuredY = ringRect.top + ringRect.height / 2 - heroRect.top - currentBadgeY;
    if (measuredY > 50) {
        lanyardRestY = measuredY;
    }
}

function drawDynamicLanyardStrap() {
    if (!lanyardSvg || !metalRing || !heroSection || !lanyardStrapBody) return;

    const heroRect = heroSection.getBoundingClientRect();
    const ringRect = metalRing.getBoundingClientRect();

    // Điểm neo trên cùng của web (top: 0 của hero, căn giữa)
    const Ax = heroRect.width / 2;
    const Ay = 0;

    // Vị trí móc khuyên kim loại trên đỉnh thẻ
    const Cx = ringRect.left + ringRect.width / 2 - heroRect.left;
    const Cy = ringRect.top + 2 - heroRect.top;

    const dx = Cx - Ax;
    const dy = Cy - Ay;
    const currentLength = Math.hypot(dx, dy) || 1;

    // Véc-tơ đơn vị dọc theo dây
    const ux = dx / currentLength;
    const uy = dy / currentLength;

    // Véc-tơ pháp tuyến vuông góc với dây
    const nx = -uy;
    const ny = ux;

    // Bán kính bề rộng dây ruy-băng (11px chuẩn = bề rộng 22px)
    // Hiệu ứng co dãn đàn hồi: khi kéo dãn dài hơn vị trí nghỉ, bề rộng dây co nhỏ nhẹ
    const baseHalfWidth = 11;
    let halfWidth = baseHalfWidth;
    if (currentLength > lanyardRestY && lanyardRestY > 0) {
        const stretchRatio = lanyardRestY / currentLength;
        halfWidth = Math.max(7, baseHalfWidth * Math.sqrt(stretchRatio));
    }

    // Điểm uốn cong Bezier giữa dây
    let Mx = (Ax + Cx) / 2;
    let My = (Ay + Cy) / 2;

    // Nếu đẩy thẻ lên phía trên (chùng dây), dây uốn lượn mềm mại
    if (currentLength < lanyardRestY - 10) {
        const slack = lanyardRestY - currentLength;
        const sagAmount = Math.min(slack * 0.42, 55);
        Mx += nx * sagAmount;
        My += ny * sagAmount;
    }

    // Tọa độ 4 góc polygon ruy-băng
    const p1x = (Ax - nx * halfWidth).toFixed(1);
    const p1y = (Ay - ny * halfWidth).toFixed(1);
    const p2x = (Cx - nx * halfWidth).toFixed(1);
    const p2y = (Cy - ny * halfWidth).toFixed(1);
    const p3x = (Cx + nx * halfWidth).toFixed(1);
    const p3y = (Cy + ny * halfWidth).toFixed(1);
    const p4x = (Ax + nx * halfWidth).toFixed(1);
    const p4y = (Ay + ny * halfWidth).toFixed(1);

    const mx1 = (Mx - nx * halfWidth).toFixed(1);
    const my1 = (My - ny * halfWidth).toFixed(1);
    const mx2 = (Mx + nx * halfWidth).toFixed(1);
    const my2 = (My + ny * halfWidth).toFixed(1);

    const bodyPath = `M ${p1x} ${p1y} Q ${mx1} ${my1} ${p2x} ${p2y} L ${p3x} ${p3y} Q ${mx2} ${my2} ${p4x} ${p4y} Z`;
    const leftPath = `M ${p1x} ${p1y} Q ${mx1} ${my1} ${p2x} ${p2y}`;
    const rightPath = `M ${p4x} ${p4y} Q ${mx2} ${my2} ${p3x} ${p3y}`;
    const stitchPath = `M ${Ax.toFixed(1)} ${Ay.toFixed(1)} Q ${Mx.toFixed(1)} ${My.toFixed(1)} ${Cx.toFixed(1)} ${Cy.toFixed(1)}`;

    lanyardStrapBody.setAttribute("d", bodyPath);
    if (lanyardEdgeLeft) lanyardEdgeLeft.setAttribute("d", leftPath);
    if (lanyardEdgeRight) lanyardEdgeRight.setAttribute("d", rightPath);
    if (lanyardStitch) lanyardStitch.setAttribute("d", stitchPath);
}

function handleBadgePointerDown(event) {
    if (event.button !== undefined && event.button !== 0 && event.pointerType === "mouse") return;
    if (!employeeBadge) return;

    isBadgeDragging = true;
    hasBadgeMoved = false;
    activeBadgePointerId = event.pointerId;

    try {
        employeeBadge.setPointerCapture(event.pointerId);
    } catch (_) {}

    dragStartMouseX = event.clientX;
    dragStartMouseY = event.clientY;
    dragStartBadgeX = currentBadgeX;
    dragStartBadgeY = currentBadgeY;

    lastPointerPosX = event.clientX;
    lastPointerPosY = event.clientY;
    lastPointerTimestamp = performance.now();
    pointerReleaseVelX = 0;
    pointerReleaseVelY = 0;

    lanyardState = "DRAGGING";
    employeeBadge.classList.add("is-dragging");
}

function handleBadgePointerMove(event) {
    if (!isBadgeDragging || (activeBadgePointerId !== null && event.pointerId !== activeBadgePointerId)) return;

    const deltaX = event.clientX - dragStartMouseX;
    const deltaY = event.clientY - dragStartMouseY;

    if (Math.hypot(deltaX, deltaY) > 5) {
        hasBadgeMoved = true;
    }

    // Tính vận tốc vung tay khi kéo
    const now = performance.now();
    const dt = Math.max(now - lastPointerTimestamp, 1);
    pointerReleaseVelX = ((event.clientX - lastPointerPosX) / dt) * 16.6;
    pointerReleaseVelY = ((event.clientY - lastPointerPosY) / dt) * 16.6;
    lastPointerPosX = event.clientX;
    lastPointerPosY = event.clientY;
    lastPointerTimestamp = now;

    let targetX = dragStartBadgeX + deltaX;
    let targetY = dragStartBadgeY + deltaY;

    // Giới hạn đàn hồi khi đẩy lên quá đỉnh web
    const maxUpward = -(lanyardRestY - 35);
    if (targetY < maxUpward) {
        targetY = maxUpward + (targetY - maxUpward) * 0.22;
    }

    // Khi kéo xuống dưới: chuyển động mượt mà và cho phép kéo dãn dây rất dài
    if (targetY > 360) {
        targetY = 360 + (targetY - 360) * 0.4;
    }

    // Giới hạn kéo ngang
    if (Math.abs(targetX) > 320) {
        targetX = Math.sign(targetX) * (320 + (Math.abs(targetX) - 320) * 0.3);
    }

    currentBadgeX = targetX;
    currentBadgeY = targetY;

    // Góc nghiêng tự nhiên của thẻ theo góc kéo dây
    const effectiveHangingY = Math.max(lanyardRestY + currentBadgeY, 40);
    const ropeAngleDeg = (Math.atan2(currentBadgeX, effectiveHangingY) * 180 / Math.PI);
    const targetTilt = ropeAngleDeg * 0.72 + pointerReleaseVelX * 0.22;
    currentBadgeTilt = Math.max(-28, Math.min(28, targetTilt));
}

function handleBadgePointerUp(event) {
    if (!isBadgeDragging || (activeBadgePointerId !== null && event.pointerId !== activeBadgePointerId)) return;

    isBadgeDragging = false;
    try {
        employeeBadge.releasePointerCapture(event.pointerId);
    } catch (_) {}
    activeBadgePointerId = null;

    if (employeeBadge) {
        employeeBadge.classList.remove("is-dragging");
    }

    // Chặn click nhầm vào các link trong thẻ khi đang thực hiện thao tác kéo
    if (hasBadgeMoved) {
        const suppressClickEvent = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };
        window.addEventListener("click", suppressClickEvent, { capture: true, once: true });
        setTimeout(() => {
            window.removeEventListener("click", suppressClickEvent, { capture: true });
        }, 120);
    }

    // Chuyển sang trạng thái bật đàn hồi (Spring physics)
    lanyardState = "SPRING";
    badgeVelX = Math.max(-22, Math.min(22, pointerReleaseVelX * 0.85));
    badgeVelY = Math.max(-22, Math.min(22, pointerReleaseVelY * 0.85));
}

function updateLanyardPhysics() {
    if (lanyardState === "SPRING") {
        // Hệ số lò xo đàn hồi (Stiffness) & ma sát không khí (Damping)
        const springK = 0.062;
        const damping = 0.83;

        const forceX = -springK * currentBadgeX;
        const forceY = -springK * currentBadgeY;

        badgeVelX = (badgeVelX + forceX) * damping;
        badgeVelY = (badgeVelY + forceY) * damping;

        currentBadgeX += badgeVelX;
        currentBadgeY += badgeVelY;

        const effectiveHangingY = Math.max(lanyardRestY + currentBadgeY, 40);
        const ropeAngleDeg = (Math.atan2(currentBadgeX, effectiveHangingY) * 180 / Math.PI) * 0.72;
        currentBadgeTilt = ropeAngleDeg + badgeVelX * 0.32;

        // Khi dao động tắt dần, chuyển về đung đưa nhẹ nhàn
        if (Math.hypot(currentBadgeX, currentBadgeY, badgeVelX, badgeVelY) < 0.25) {
            currentBadgeX = 0;
            currentBadgeY = 0;
            currentBadgeTilt = 0;
            badgeVelX = 0;
            badgeVelY = 0;
            lanyardState = "IDLE";
            lanyardIdleTime = 0;
        }
    } else if (lanyardState === "IDLE") {
        if (!reduceMotion) {
            lanyardIdleTime += 0.022;
            // Đung đưa con lắc nhịp nhàng ±2.5 độ
            const sway = Math.sin(lanyardIdleTime) * 2.5;
            currentBadgeTilt = sway;
            const hangDist = lanyardRestY || 160;
            currentBadgeX = Math.sin(sway * Math.PI / 180) * (hangDist * 0.6);
            currentBadgeY = (1 - Math.cos(sway * Math.PI / 180)) * 16;
        } else {
            currentBadgeX = 0;
            currentBadgeY = 0;
            currentBadgeTilt = 0;
        }
    }

    if (employeeBadge) {
        employeeBadge.style.transform = `translate3d(${currentBadgeX.toFixed(2)}px, ${currentBadgeY.toFixed(2)}px, 0) rotate(${currentBadgeTilt.toFixed(2)}deg)`;
    }

    drawDynamicLanyardStrap();

    requestAnimationFrame(updateLanyardPhysics);
}

if (employeeBadge) {
    employeeBadge.addEventListener("pointerdown", handleBadgePointerDown);
    window.addEventListener("pointermove", handleBadgePointerMove, { passive: false });
    window.addEventListener("pointerup", handleBadgePointerUp);
    window.addEventListener("pointercancel", handleBadgePointerUp);

    // Hiệu chỉnh độ dài ban đầu và khởi chạy vòng lặp vật lý
    window.addEventListener("load", calibrateLanyardMetrics);
    window.addEventListener("resize", calibrateLanyardMetrics);
    setTimeout(calibrateLanyardMetrics, 100);

    requestAnimationFrame(updateLanyardPhysics);
}

if (topbarProfile) {
    topbarProfile.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    });
}

if (scrollCue) {
    scrollCue.addEventListener("click", (event) => {
        event.preventDefault();
        if (musicSection) {
            musicSection.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start",
            });
        }
    });
}

// ==========================================================================
// 5. ĐIỀU KHIỂN ÂM LƯỢNG
// ==========================================================================

function updateVolumeControls() {
    const isMuted = backgroundMusic.muted || backgroundMusic.volume === 0;
    const volumePercent = isMuted ? 0 : Math.round(backgroundMusic.volume * 100);

    if (npVolumeSlider) {
        npVolumeSlider.value = String(volumePercent);
        npVolumeSlider.style.setProperty("--volume", `${volumePercent}%`);
    }

    if (npVolIcon) {
        const wave = npVolIcon.querySelector(".vol-wave");
        if (wave) {
            wave.style.display = isMuted ? "none" : "block";
        }
        npVolIcon.style.opacity = isMuted ? "0.4" : "1";
    }
}

function handleVolumeToggle() {
    if (backgroundMusic.muted || backgroundMusic.volume === 0) {
        backgroundMusic.volume = lastVolume > 0 ? lastVolume : 0.5;
        backgroundMusic.muted = false;
    } else {
        lastVolume = backgroundMusic.volume;
        backgroundMusic.muted = true;
    }
    updateVolumeControls();
}

function handleVolumeSliderInput(value) {
    const newVol = Number(value) / 100;
    backgroundMusic.volume = newVol;
    backgroundMusic.muted = newVol === 0;

    if (newVol > 0) {
        lastVolume = newVol;
    }
    updateVolumeControls();
}

if (npVolumeToggle) {
    npVolumeToggle.addEventListener("click", handleVolumeToggle);
}

if (npVolumeSlider) {
    npVolumeSlider.addEventListener("input", (e) => handleVolumeSliderInput(e.target.value));
}

updateVolumeControls();

// ==========================================================================
// 6. ĐỊNH DẠNG THỜI GIAN & TRẠNG THÁI
// ==========================================================================

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
}

function setPlayerStatus(message) {
    if (!playerStatus) return;
    playerStatus.textContent = message;
    playerStatus.style.display = message ? "block" : "none";
}

// ==========================================================================
// 7. TẠO THẺ BÀI HÁT CHO DANH SÁCH BÊN PHẢI (PLAYLIST)
// ==========================================================================

function createTrackCard(track, index) {
    const card = document.createElement("div");
    card.className = "track-card";
    card.dataset.trackIndex = String(index);

    const indexFormatted = String(index + 1).padStart(2, "0");

    card.innerHTML = `
        <div class="track-left-meta">
            <span class="track-idx">#${indexFormatted}</span>
            <div class="track-texts">
                <h4 class="track-name" title="${track.title}">${track.title}</h4>
                <span class="track-duration">Audio File</span>
            </div>
        </div>
        <div class="track-right-meta">
            <div class="track-mini-eq">
                <span></span><span></span><span></span>
            </div>
            <button class="track-play-btn" type="button" aria-label="Phát ${track.title}">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
            </button>
        </div>
    `;

    return card;
}

function updateTrackCards() {
    const isPlaying = !backgroundMusic.paused && Boolean(backgroundMusic.src);
    const activeTrack = tracks[currentTrackIndex];

    // Cập nhật khung to bên trái (Now Playing Panel)
    if (activeTrack) {
        if (npTitle) npTitle.textContent = activeTrack.title;
        if (npTrackNum) npTrackNum.textContent = `#${String(currentTrackIndex + 1).padStart(2, "0")}`;
    }

    if (npPlayIcon) {
        npPlayIcon.innerHTML = isPlaying
            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>'
            : '<path d="M8 5v14l11-7z" fill="currentColor"/>';
    }

    const isActiveAndReady = Number.isFinite(backgroundMusic.duration);

    if (npProgress) {
        npProgress.disabled = !isActiveAndReady;
        npProgress.max = isActiveAndReady ? String(backgroundMusic.duration) : "0";

        if (!isSeeking) {
            npProgress.value = isActiveAndReady ? String(backgroundMusic.currentTime) : "0";
        }

        const percent = isActiveAndReady ? (backgroundMusic.currentTime / backgroundMusic.duration) * 100 : 0;
        npProgress.style.setProperty("--progress", `${percent}%`);
    }

    if (npCurrentTime) npCurrentTime.textContent = formatTime(backgroundMusic.currentTime);
    if (npDuration) npDuration.textContent = isActiveAndReady ? formatTime(backgroundMusic.duration) : "--:--";

    // Cập nhật danh sách thẻ bài hát bên phải
    trackCards.forEach((card, index) => {
        const isActive = index === currentTrackIndex;
        const playBtn = card.querySelector(".track-play-btn");
        const svg = playBtn ? playBtn.querySelector("svg") : null;

        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-playing", isActive && isPlaying);

        if (svg) {
            svg.innerHTML = isActive && isPlaying
                ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>'
                : '<path d="M8 5v14l11-7z" fill="currentColor"/>';
        }
    });
}

// ==========================================================================
// 8. PHÁT VÀ DỪNG NHẠC
// ==========================================================================

async function playTrack(index, { scroll = false } = {}) {
    if (!tracks[index]) {
        setPlayerStatus("Không tìm thấy bài nhạc.");
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

    // Hiệu ứng phản hồi nhẹ ở khung to bên trái khi chuyển bài
    if (nowPlayingPanel) {
        nowPlayingPanel.style.transform = "scale(1.015)";
        setTimeout(() => {
            nowPlayingPanel.style.transform = "none";
        }, 300);
    }

    updateTrackCards();

    if (scroll && trackCards[index]) {
        trackCards[index].scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "nearest",
        });
    }

    try {
        await backgroundMusic.play();
    } catch (error) {
        if (error.name === "AbortError") return;
        if (error.name === "NotAllowedError") {
            setPlayerStatus("Hãy bấm 'bấm để xem' để cấp quyền âm thanh.");
            return;
        }
        console.error("Lỗi phát nhạc:", error);
        setPlayerStatus("Không thể mở tệp nhạc này.");
        return;
    }

    updateTrackCards();
}

function toggleGlobalPlay() {
    if (!tracks.length) return;

    if (backgroundMusic.paused) {
        void playTrack(currentTrackIndex);
    } else {
        backgroundMusic.pause();
    }
}

if (npPlayBtn) {
    npPlayBtn.addEventListener("click", toggleGlobalPlay);
}

if (npPrevBtn) {
    npPrevBtn.addEventListener("click", () => {
        if (!tracks.length) return;
        const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        void playTrack(prev);
    });
}

if (npNextBtn) {
    npNextBtn.addEventListener("click", () => {
        if (!tracks.length) return;
        const next = (currentTrackIndex + 1) % tracks.length;
        void playTrack(next);
    });
}

if (npProgress) {
    npProgress.addEventListener("input", (e) => {
        if (!Number.isFinite(backgroundMusic.duration)) return;
        isSeeking = true;
        backgroundMusic.currentTime = Number(e.target.value);
        updateTrackCards();
    });

    npProgress.addEventListener("change", () => {
        isSeeking = false;
        updateTrackCards();
    });
}

// Sự kiện click trong danh sách bài hát bên phải
if (trackList) {
    trackList.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;

        const card = event.target.closest(".track-card");
        if (!card) return;

        const index = Number(card.dataset.trackIndex);
        if (!Number.isInteger(index) || !tracks[index]) return;

        if (index === currentTrackIndex) {
            toggleGlobalPlay();
            return;
        }

        void playTrack(index);
    });
}

// ==========================================================================
// 9. TẢI PLAYLIST TỪ ASSETS/PLAYLIST.JSON
// ==========================================================================

async function loadPlaylist() {
    try {
        const playlistUrl = new URL("assets/playlist.json", document.baseURI);
        const response = await fetch(playlistUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const playlist = await response.json();
        if (!Array.isArray(playlist) || playlist.length === 0) {
            throw new Error("Playlist rỗng.");
        }

        tracks = playlist.map((track, index) => {
            if (!track || !track.title || !track.src) {
                throw new Error(`Bài nhạc thứ ${index + 1} thiếu title hoặc src.`);
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
        setPlayerStatus("Không thể tải danh sách bài hát.");
    }
}

void loadPlaylist();

// ==========================================================================
// 10. AUDIO EVENT LISTENERS & AUTO-LOOP
// ==========================================================================

backgroundMusic.addEventListener("playing", updateTrackCards);
backgroundMusic.addEventListener("pause", updateTrackCards);
backgroundMusic.addEventListener("timeupdate", updateTrackCards);
backgroundMusic.addEventListener("loadedmetadata", updateTrackCards);
backgroundMusic.addEventListener("durationchange", updateTrackCards);

backgroundMusic.addEventListener("ended", () => {
    if (tracks.length === 0) return;
    const nextTrackIndex = (currentTrackIndex + 1) % tracks.length;
    void playTrack(nextTrackIndex, { scroll: true });
});

backgroundMusic.addEventListener("error", () => {
    console.error("Lỗi file nhạc:", backgroundMusic.currentSrc || tracks[currentTrackIndex]?.src);
    setPlayerStatus("Không thể mở tệp nhạc này.");
    updateTrackCards();
});

// ==========================================================================
// 11. HẠT MƯA VÀ ĐOM ĐÓM TỰ NHIÊN
// ==========================================================================

if (!reduceMotion) {
    const rainBack = document.querySelector(".rain-back");
    const rainFront = document.querySelector(".rain-front");

    const rainLayers = [
        { element: rainBack, count: 28, minDuration: 6.5, durationRange: 3.5 },
        { element: rainFront, count: 20, minDuration: 4.5, durationRange: 3 },
    ];

    for (const layer of rainLayers) {
        if (!layer.element) continue;
        for (let index = 0; index < layer.count; index += 1) {
            const raindrop = document.createElement("span");
            const duration = layer.minDuration + Math.random() * layer.durationRange;

            raindrop.className = "raindrop";
            raindrop.style.setProperty("--start-x", `${Math.random() * 105}%`);
            raindrop.style.setProperty("--width", `${1 + Math.random() * 1.1}px`);
            raindrop.style.setProperty("--length", `${12 + Math.random() * 14}px`);
            raindrop.style.setProperty("--drop-opacity", `${0.35 + Math.random() * 0.5}`);
            raindrop.style.setProperty("--drift", `${18 + Math.random() * 38}px`);
            raindrop.style.setProperty("--fall-duration", `${duration}s`);
            raindrop.style.setProperty("--fall-delay", `${-Math.random() * duration}s`);
            layer.element.append(raindrop);
        }
    }

    const fireflies = document.querySelector(".fireflies");
    if (fireflies) {
        const fireflyCount = 16;
        for (let index = 0; index < fireflyCount; index += 1) {
            const firefly = document.createElement("span");
            const duration = 10 + Math.random() * 12;

            firefly.className = "firefly";
            firefly.style.setProperty("--start-x", `${65 + Math.random() * 40}%`);
            firefly.style.setProperty("--start-y", `${75 + Math.random() * 35}%`);
            firefly.style.setProperty("--travel-x", `${-(window.innerWidth * (0.2 + Math.random() * 0.55))}px`);
            firefly.style.setProperty("--travel-y", `${-(window.innerHeight * (0.45 + Math.random() * 0.55))}px`);
            firefly.style.setProperty("--size", `${2 + Math.random() * 3}px`);
            firefly.style.setProperty("--duration", `${duration}s`);
            firefly.style.setProperty("--delay", `${-Math.random() * duration}s`);
            firefly.style.setProperty("--glow-delay", `${-Math.random() * 2.4}s`);
            fireflies.append(firefly);
        }
    }
}
