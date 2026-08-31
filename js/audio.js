/**
 * Audio Controller for Birthday Experience
 * Manages fireworks audio and photo memory soundtrack.
 */

const FIREWORKS_AUDIO_SRC = "assets/audio/fireworks.mpeg";
const PHOTO_AUDIO_SRC = "assets/audio/photo.mpeg";
const FIREWORKS_MAX_LOOPS = 4;

let fireworksAudio = null;
let fireworksLoopCount = 0;
let isFireworksPlaying = false;
let onFireworksCompleteCallback = null;

let photoAudio = null;
let isPhotoPlaying = false;

function getFireworksAudioInstance() {
  if (!fireworksAudio) {
    fireworksAudio = new Audio(FIREWORKS_AUDIO_SRC);
    fireworksAudio.preload = "auto";

    fireworksAudio.addEventListener("ended", () => {
      fireworksLoopCount++;
      if (fireworksLoopCount < FIREWORKS_MAX_LOOPS && isFireworksPlaying) {
        fireworksAudio.currentTime = 0;
        fireworksAudio.play().catch((err) => {
          console.warn("Fireworks audio play blocked:", err);
        });
      } else {
        stopFireworksAudio();
        if (typeof onFireworksCompleteCallback === "function") {
          onFireworksCompleteCallback();
        }
      }
    });
  }
  return fireworksAudio;
}

export function startFireworksAudio(onComplete) {
  stopFireworksAudio();

  onFireworksCompleteCallback = onComplete || null;
  fireworksLoopCount = 0;
  isFireworksPlaying = true;

  const audio = getFireworksAudioInstance();
  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.play().catch((err) => {
    console.warn("Fireworks audio play error or user interaction required:", err);
  });
}

export function stopFireworksAudio() {
  isFireworksPlaying = false;
  if (fireworksAudio) {
    fireworksAudio.pause();
    fireworksAudio.currentTime = 0;
  }
}

function getPhotoAudioInstance() {
  if (!photoAudio) {
    photoAudio = new Audio(PHOTO_AUDIO_SRC);
    photoAudio.preload = "auto";
    photoAudio.loop = true;
  }
  return photoAudio;
}

export function startPhotoAudio() {
  stopPhotoAudio(0);
  isPhotoPlaying = true;

  const audio = getPhotoAudioInstance();
  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.play().catch((err) => {
    console.warn("Photo audio play error or user interaction required:", err);
  });
}

export function stopPhotoAudio(fadeDuration = 600) {
  isPhotoPlaying = false;
  if (!photoAudio) return;

  if (fadeDuration > 0 && !photoAudio.paused) {
    const startVol = photoAudio.volume;
    const startTime = performance.now();

    function fadeStep() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      photoAudio.volume = Math.max(0, startVol * (1 - progress));

      if (progress < 1 && !isPhotoPlaying) {
        requestAnimationFrame(fadeStep);
      } else if (!isPhotoPlaying) {
        photoAudio.pause();
        photoAudio.currentTime = 0;
        photoAudio.volume = 1.0;
      }
    }
    requestAnimationFrame(fadeStep);
  } else {
    photoAudio.pause();
    photoAudio.currentTime = 0;
    photoAudio.volume = 1.0;
  }
}
