import { MESSAGES, getRepeatVisitMessage } from "./config.js";
import { recordVisit } from "./visitor.js";
import { startCountdown } from "./countdown.js";

const ENTRANCE_MS = 450;
const SETTLE_MS = 700;

const elements = {
  experience: document.querySelector("#experience"),
  messageStage: document.querySelector("#message-stage"),
  mainMessage: document.querySelector("#main-message"),
  countdown: document.querySelector("#countdown"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  unlocked: document.querySelector("#unlocked-placeholder"),
};

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function setMessage(text) {
  elements.mainMessage.textContent = text;
}

async function showMessage(text) {
  elements.messageStage.hidden = false;
  elements.mainMessage.classList.remove("is-visible");
  setMessage(text);
  await wait(40);
  elements.mainMessage.classList.add("is-visible");
  await wait(ENTRANCE_MS + SETTLE_MS);
}

async function hideMessage() {
  elements.mainMessage.classList.remove("is-visible");
  await wait(ENTRANCE_MS);
}

function renderCountdown(remaining) {
  elements.days.textContent = remaining.display.days;
  elements.hours.textContent = remaining.display.hours;
  elements.minutes.textContent = remaining.display.minutes;
  elements.seconds.textContent = remaining.display.seconds;
}

async function showCountdown() {
  elements.unlocked.hidden = true;
  elements.countdown.hidden = false;
  await wait(40);
  elements.countdown.classList.add("is-visible");
}

function showUnlockedState() {
  elements.countdown.hidden = true;
  elements.countdown.classList.remove("is-visible");
  elements.messageStage.hidden = true;
  elements.unlocked.hidden = false;
  elements.unlocked.classList.add("is-visible");
  elements.unlocked.textContent = MESSAGES.unlockedPlaceholder;
}

async function playOpeningSequence(visitCount) {
  if (visitCount > 1) {
    await showMessage(getRepeatVisitMessage(visitCount));
    await hideMessage();
  }

  await showMessage(MESSAGES.firstVisit);
}

function init() {
  if (!elements.experience) {
    return;
  }

  const visitCount = recordVisit();
  elements.experience.dataset.visitCount = String(visitCount);

  startCountdown(
    (remaining) => {
      renderCountdown(remaining);
    },
    () => {
      showUnlockedState();
    }
  );

  playOpeningSequence(visitCount).then(() => {
    if (elements.unlocked.hidden) {
      return showCountdown();
    }
  });
}

init();
