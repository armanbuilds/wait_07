/**
 * Audio Controller for Fireworks Experience
 * Synchronizes playback of assets/audio/firework.wav across exactly 4 loops (~27 seconds).
 */

const AUDIO_SRC = "assets/audio/firework.wav";
const MAX_LOOPS = 4;

let audioElement = null;
let currentLoop = 0;
let isPlaying = false;
let onAudioCompleteCallback = null;

function getAudioInstance() {
  if (!audioElement) {
    audioElement = new Audio(AUDIO_SRC);
    audioElement.preload = "auto";

    audioElement.addEventListener("ended", () => {
      currentLoop++;
      if (currentLoop < MAX_LOOPS && isPlaying) {
        audioElement.currentTime = 0;
        audioElement.play().catch((err) => {
          console.warn("Fireworks audio play blocked:", err);
        });
      } else {
        stopFireworksAudio();
        if (typeof onAudioCompleteCallback === "function") {
          onAudioCompleteCallback();
        }
      }
    });
  }
  return audioElement;
}

export function startFireworksAudio(onComplete) {
  stopFireworksAudio();

  onAudioCompleteCallback = onComplete || null;
  currentLoop = 0;
  isPlaying = true;

  const audio = getAudioInstance();
  audio.currentTime = 0;
  audio.play().catch((err) => {
    console.warn("Fireworks audio play error or user interaction required:", err);
  });
}

export function stopFireworksAudio() {
  isPlaying = false;
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}
