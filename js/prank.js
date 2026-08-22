import { MESSAGES, PRANK_MESSAGES } from "./config.js";

/**
 * Manages the 4-click theatrical prank state sequence.
 */
export function initPrankManager(buttonElement, buttonTextElement, onPrankComplete) {
  let clickCount = 0;
  let isTransitioning = false;

  const defaultText = MESSAGES.entryButtonDefault || "ENTER TO VIEW AN EXPERIENCE";

  function setButtonState(text, stateClass) {
    if (buttonTextElement) {
      buttonTextElement.textContent = text;
    }
    buttonElement.classList.remove("is-loading", "is-error", "is-glitch");
    if (stateClass) {
      buttonElement.classList.add(stateClass);
    }
  }

  function resetToDefaultState() {
    setButtonState(defaultText, null);
    buttonElement.disabled = false;
    isTransitioning = false;
  }

  function handleClick(event) {
    if (event) {
      event.preventDefault();
    }

    if (isTransitioning || buttonElement.disabled) {
      return;
    }

    clickCount += 1;
    isTransitioning = true;

    if (clickCount === 1) {
      buttonElement.disabled = true;
      setButtonState(PRANK_MESSAGES.click1, "is-loading");

      window.setTimeout(() => {
        resetToDefaultState();
      }, 1300);
    } else if (clickCount === 2) {
      buttonElement.disabled = true;
      setButtonState(PRANK_MESSAGES.click2, "is-error");

      window.setTimeout(() => {
        resetToDefaultState();
      }, 1400);
    } else if (clickCount === 3) {
      buttonElement.disabled = true;
      setButtonState(PRANK_MESSAGES.click3, "is-glitch");

      window.setTimeout(() => {
        resetToDefaultState();
      }, 1500);
    } else if (clickCount >= 4) {
      buttonElement.disabled = true;
      buttonElement.classList.remove("is-loading", "is-error", "is-glitch");
      if (typeof onPrankComplete === "function") {
        onPrankComplete();
      }
    }
  }

  buttonElement.addEventListener("click", handleClick);

  return {
    reset() {
      clickCount = 0;
      resetToDefaultState();
    },
    getClickCount() {
      return clickCount;
    },
  };
}
