import { MESSAGES, PRANK_MESSAGES } from "./config.js";

/**
 * Manages the 4-click theatrical prank state sequence.
 * 
 * Click 1: "INITIALIZING EXPERIENCE..." (loading state)
 * Click 2: "RUNNING ERROR... PLEASE TRY AGAIN" (error state)
 * Click 3: "SERVICE CRASHED... TRY AGAIN" (glitch state)
 * Click 4: Launches main fireworks experience
 */
export function initPrankManager(buttonElement, buttonTextElement, onPrankComplete) {
  let clickCount = 0;
  let isDebouncing = false;

  const defaultText = MESSAGES.entryButtonDefault || "ENTER TO VIEW AN EXPERIENCE";

  function getTextElement() {
    if (buttonTextElement) {
      return buttonTextElement;
    }
    if (buttonElement) {
      return buttonElement.querySelector(".start-button__text") || buttonElement;
    }
    return null;
  }

  function setButtonState(text, stateClass) {
    const textEl = getTextElement();
    if (textEl) {
      textEl.textContent = text;
    }
    if (buttonElement) {
      buttonElement.classList.remove("is-loading", "is-error", "is-glitch");
      if (stateClass) {
        buttonElement.classList.add(stateClass);
      }
    }
  }

  function handleClick(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!buttonElement || isDebouncing) {
      return;
    }

    // Debounce rapid double-clicks (250ms)
    isDebouncing = true;
    window.setTimeout(() => {
      isDebouncing = false;
    }, 250);

    clickCount += 1;

    if (clickCount === 1) {
      setButtonState(PRANK_MESSAGES.click1, "is-loading");
    } else if (clickCount === 2) {
      setButtonState(PRANK_MESSAGES.click2, "is-error");
    } else if (clickCount === 3) {
      setButtonState(PRANK_MESSAGES.click3, "is-glitch");
    } else if (clickCount >= 4) {
      buttonElement.disabled = true;
      buttonElement.classList.remove("is-loading", "is-error", "is-glitch");
      if (typeof onPrankComplete === "function") {
        onPrankComplete();
      }
    }
  }

  if (buttonElement) {
    buttonElement.addEventListener("click", handleClick);
    // Ensure initial text is ready
    setButtonState(defaultText, null);
  }

  return {
    reset() {
      clickCount = 0;
      isDebouncing = false;
      if (buttonElement) {
        buttonElement.disabled = false;
      }
      setButtonState(defaultText, null);
    },
    getClickCount() {
      return clickCount;
    },
  };
}
