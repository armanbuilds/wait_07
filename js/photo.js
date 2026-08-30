/**
 * Premium Cinematic Photo Memory Montage Controller
 * Implements high-end camera movements, viewport-aware responsive scaling,
 * dual-buffered crossfades, ambient backdrop bloom, and exact 5s intro & outro sequences.
 */

const PHOTOS = [
  "images/img1.jpeg",
  "images/img2.jpeg",
  "images/img3.jpeg",
  "images/img4.jpeg",
  "images/img5.jpeg",
  "images/img6.jpeg",
  "images/img7.jpeg",
  "images/img8.jpeg",
  "images/img9.jpeg",
  "images/img10.jpeg",
  "images/img11.jpeg",
  "images/img12.jpeg",
  "images/img13.jpeg",
  "images/img14.jpeg",
];

// Curated cinematic camera moves per image
const CAMERA_MOVES = [
  "cam-push-in",        // 1: Slow cinematic push-in
  "cam-pan-right",      // 2: Horizontal camera glide left-to-right
  "cam-pan-left",       // 3: Pan right-to-left with subtle lift
  "cam-diag-up",        // 4: Diagonal sweep bottom-left to top-right
  "cam-tilt-zoom",      // 5: Slight 1.2deg tilt & gentle zoom
  "cam-pull-back",      // 6: Cinematic pull-back
  "cam-pedestal-up",    // 7: Vertical upward glide
  "cam-deep-zoom",      // 8: Deep dramatic zoom with subtle parallax
  "cam-diag-down",      // 9: Diagonal glide top-left to bottom-right
  "cam-float-drift",    // 10: Dreamy slow drift with gentle warmth
  "cam-pan-slow-right", // 11: Gentle focus-pull glide
  "cam-soft-orbit",     // 12: Subtle soft-orbit float
  "cam-filmic-push",    // 13: Filmic push into finale
  "cam-finale-settle",  // 14: Hero final entrance, settling cleanly
];

// Natural rhythmic timing per image (in ms)
const PHOTO_TIMINGS = [
  3200, // 1
  3000, // 2
  3100, // 3
  3300, // 4
  3000, // 5
  3200, // 6
  3100, // 7
  3400, // 8
  3000, // 9
  3200, // 10
  3100, // 11
  3000, // 12
  3400, // 13
  5000, // 14 (5-second finale hold)
];

const INTRO_HOLD_MS = 5000;
const OUTRO_HOLD_MS = 5000;
const FADE_TRANSITION_MS = 750;

export function initPhotoMemory(stageElement) {
  if (!stageElement) return null;

  const introPanel = stageElement.querySelector("#photo-intro-panel");
  const montage = stageElement.querySelector("#photo-montage");
  const outroPanel = stageElement.querySelector("#photo-outro-panel");
  const flash = stageElement.querySelector("#photo-flash");

  const slideA = stageElement.querySelector("#photo-slide-a");
  const slideB = stageElement.querySelector("#photo-slide-b");
  const bgA = stageElement.querySelector("#photo-bg-a");
  const bgB = stageElement.querySelector("#photo-bg-b");
  const fgA = stageElement.querySelector("#photo-fg-a");
  const fgB = stageElement.querySelector("#photo-fg-b");

  let activeSlot = "a";
  let isRunning = false;

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  // Robust preload promise so all 14 images are decoded in memory
  function preloadAllPhotos() {
    return Promise.all(
      PHOTOS.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            img.src = src;
          })
      )
    );
  }

  function triggerSubtleFlash() {
    if (!flash) return;
    flash.classList.remove("is-flashing");
    void flash.offsetWidth;
    flash.classList.add("is-flashing");
    window.setTimeout(() => {
      flash.classList.remove("is-flashing");
    }, 450);
  }

  async function renderPhotoSlide(index) {
    const src = PHOTOS[index];
    const cameraMoveClass = CAMERA_MOVES[index] || "cam-push-in";

    const currentSlide = activeSlot === "a" ? slideA : slideB;
    const nextSlide = activeSlot === "a" ? slideB : slideA;
    const nextBg = activeSlot === "a" ? bgB : bgA;
    const nextFg = activeSlot === "a" ? fgB : fgA;

    // Reset old camera move classes on incoming slide
    CAMERA_MOVES.forEach((cls) => nextSlide.classList.remove(cls));
    nextSlide.classList.add(cameraMoveClass);

    // Set source
    nextBg.src = src;
    nextFg.src = src;

    // Start transition
    nextSlide.classList.remove("is-leaving");
    void nextSlide.offsetWidth;
    nextSlide.classList.add("is-active");

    if (currentSlide.classList.contains("is-active")) {
      currentSlide.classList.add("is-leaving");
      currentSlide.classList.remove("is-active");
    }

    // Occasional subtle lens flash on dynamic transitions
    if (index === 4 || index === 8 || index === 13) {
      triggerSubtleFlash();
    }

    activeSlot = activeSlot === "a" ? "b" : "a";
  }

  async function start(onComplete) {
    if (isRunning) return;
    isRunning = true;

    // 1. Preload all images upfront to prevent any blank frames
    await preloadAllPhotos();

    // Prepare stage
    stageElement.hidden = false;
    stageElement.classList.remove("is-exiting");
    void stageElement.offsetWidth;
    stageElement.classList.add("is-visible");

    // ==========================================
    // STEP 1: INTRO MESSAGE (5s)
    // "Now see what I have collected for you... ✨"
    // ==========================================
    if (introPanel) {
      introPanel.hidden = false;
      void introPanel.offsetWidth;
      introPanel.classList.add("is-visible");
      await wait(INTRO_HOLD_MS);
      introPanel.classList.remove("is-visible");
      introPanel.classList.add("is-leaving");
      await wait(750);
      introPanel.hidden = true;
      introPanel.classList.remove("is-leaving");
    }

    // ==========================================
    // STEP 2: PREMIUM CINEMATIC PHOTO MONTAGE
    // img1.jpeg -> img14.jpeg
    // ==========================================
    if (montage) {
      montage.hidden = false;
      void montage.offsetWidth;
      montage.classList.add("is-visible");

      // Loop img1 (0) to img13 (12)
      for (let i = 0; i < PHOTOS.length - 1; i++) {
        await renderPhotoSlide(i);
        await wait(PHOTO_TIMINGS[i] || 3000);
      }

      // Final photo: img14 (index 13)
      await renderPhotoSlide(PHOTOS.length - 1);
      // Wait for entrance transition
      await wait(FADE_TRANSITION_MS);

      // Stop slideshow and HOLD img14.jpeg stable for 5 seconds
      await wait(PHOTO_TIMINGS[PHOTOS.length - 1]);

      // Smoothly fade out montage
      montage.classList.remove("is-visible");
      montage.classList.add("is-leaving");
      await wait(800);
      montage.hidden = true;
      montage.classList.remove("is-leaving");
    }

    // ==========================================
    // STEP 3: OUTRO CINEMATIC MESSAGE BOX (5s)
    // "This is what I can do for you... ✨
    //  But there is one more thing to show you!
    //  So be ready... 👀🔥"
    // ==========================================
    if (outroPanel) {
      outroPanel.hidden = false;
      void outroPanel.offsetWidth;
      outroPanel.classList.add("is-visible");

      await wait(OUTRO_HOLD_MS);

      outroPanel.classList.remove("is-visible");
      outroPanel.classList.add("is-leaving");
      await wait(850);
      outroPanel.hidden = true;
      outroPanel.classList.remove("is-leaving");
    }

    // ==========================================
    // STEP 4: SEAMLESS HANDOFF TO FIREWORKS
    // ==========================================
    stageElement.classList.remove("is-visible");
    stageElement.classList.add("is-exiting");
    await wait(750);
    stageElement.hidden = true;
    stageElement.classList.remove("is-exiting");

    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  return {
    start,
  };
}
