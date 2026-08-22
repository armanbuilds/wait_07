import { MESSAGES, getVisitorMessage, testMode } from "./config.js";
import { recordVisit } from "./visitor.js";
import { startCountdown } from "./countdown.js";
import { initPrankManager } from "./prank.js";
import { FireworksEngine } from "./fireworks.js";
import { initRevealSequence } from "./reveal.js";

const DARK_BEAT_MS = 380;
const VISITOR_SETTLE_MS = 780;
const EXPERIENCE_FOLLOW_MS = 560;
const COUNTDOWN_FOLLOW_MS = 420;

const elements = {
  experience: document.querySelector("#experience"),
  openingStage: document.querySelector("#opening-stage"),
  visitorBox: document.querySelector("#visitor-box"),
  visitorTilt: document.querySelector(".visitor-box__tilt"),
  visitorMessage: document.querySelector("#visitor-message"),
  experienceBox: document.querySelector("#experience-box"),
  mainMessage: document.querySelector("#main-message"),
  startButton: document.querySelector("#start-button"),
  startText: document.querySelector(".start-button__text"),
  countdown: document.querySelector("#countdown"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  unlocked: document.querySelector("#unlocked-placeholder"),
  fireworksCanvas: document.querySelector("#fireworks-canvas"),
  revealStage: document.querySelector("#reveal-stage"),
  revealMessage: document.querySelector("#reveal-message"),
};

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function revealLayer(element) {
  if (!element) {
    return;
  }

  element.classList.add("is-visible");
}

function renderCountdown(remaining) {
  elements.days.textContent = remaining.display.days;
  elements.hours.textContent = remaining.display.hours;
  elements.minutes.textContent = remaining.display.minutes;
  elements.seconds.textContent = remaining.display.seconds;
}

function showUnlockedState() {
  if (elements.openingStage) {
    elements.openingStage.hidden = true;
  }
  if (elements.unlocked) {
    elements.unlocked.hidden = false;
    elements.unlocked.textContent = MESSAGES.unlockedPlaceholder;
    elements.unlocked.classList.add("is-visible");
  }
}

function canUsePointerTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function initVisitorTilt() {
  const tilt = elements.visitorTilt;

  if (!tilt || !canUsePointerTilt()) {
    return;
  }

  const maxTilt = 5.5;

  function resetTilt() {
    tilt.classList.remove("is-tilting");
    tilt.style.setProperty("--tilt-x", "0deg");
    tilt.style.setProperty("--tilt-y", "0deg");
    elements.visitorBox.style.setProperty("--glow-x", "50%");
    elements.visitorBox.style.setProperty("--glow-y", "50%");
  }

  tilt.addEventListener("pointermove", (event) => {
    const bounds = tilt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;

    tilt.classList.add("is-tilting");
    tilt.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    tilt.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    elements.visitorBox.style.setProperty("--glow-x", `${(x * 100).toFixed(2)}%`);
    elements.visitorBox.style.setProperty("--glow-y", `${(y * 100).toFixed(2)}%`);
  });

  tilt.addEventListener("pointerleave", resetTilt);
}

async function playOpeningSequence(visitCount) {
  elements.visitorMessage.textContent = getVisitorMessage(visitCount);
  elements.mainMessage.textContent = MESSAGES.experienceWaiting;

  await wait(DARK_BEAT_MS);
  revealLayer(elements.visitorBox);
  await wait(VISITOR_SETTLE_MS);
  revealLayer(elements.experienceBox);
  await wait(EXPERIENCE_FOLLOW_MS);

  if (elements.unlocked && !elements.unlocked.hidden) {
    return;
  }

  if (testMode) {
    if (elements.countdown) {
      elements.countdown.hidden = true;
    }
    if (elements.startButton) {
      elements.startButton.hidden = false;
      revealLayer(elements.startButton);
    }
    await wait(COUNTDOWN_FOLLOW_MS);
  } else {
    if (elements.startButton) {
      elements.startButton.hidden = true;
    }
    if (elements.countdown) {
      elements.countdown.hidden = false;
      revealLayer(elements.countdown);
    }
    await wait(COUNTDOWN_FOLLOW_MS);
  }
}

function init() {
  if (!elements.experience) {
    return;
  }

  const visitCount = recordVisit();
  elements.experience.dataset.visitCount = String(visitCount);

  initVisitorTilt();

  // Setup Fireworks and Reveal managers
  let fireworks = null;
  let revealSequence = null;

  if (elements.fireworksCanvas) {
    fireworks = new FireworksEngine(elements.fireworksCanvas);
    fireworks.init();
  }

  if (elements.revealStage && elements.revealMessage) {
    revealSequence = initRevealSequence(
      elements.revealStage,
      elements.revealMessage,
      () => {
        if (fireworks) {
          fireworks.enableAmbientStardust();
        }
      }
    );
  }

  function handleLaunchExperience() {
    if (!elements.openingStage) return;

    elements.openingStage.classList.add("is-exiting");

    window.setTimeout(() => {
      elements.openingStage.hidden = true;
      if (fireworks) {
        fireworks.start(() => {
          if (revealSequence) {
            revealSequence.startReveal();
          }
        });
      }
    }, 750);
  }

  // Setup 4-click prank state machine on the start button
  if (elements.startButton) {
    initPrankManager(elements.startButton, elements.startText, handleLaunchExperience);
  }

  if (!testMode) {
    startCountdown(
      (remaining) => {
        renderCountdown(remaining);
      },
      () => {
        showUnlockedState();
      }
    );
  }

  playOpeningSequence(visitCount);
}

init();
