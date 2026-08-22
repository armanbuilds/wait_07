import { REVEAL_MESSAGES } from "./config.js";

/**
 * Manages the final two-stage birthday message typography reveal sequence.
 */
export function initRevealSequence(revealStageElement, revealMessageElement, enableStardustCallback) {
  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function startReveal() {
    if (!revealStageElement || !revealMessageElement) {
      return;
    }

    // Step 1: Unhide stage container
    revealStageElement.hidden = false;
    // Force reflow for CSS transition
    void revealStageElement.offsetWidth;
    revealStageElement.classList.add("is-visible");

    // Step 2: Show Message 1 ("HAPPY BIRTHDAY TO THE PRECIOUS PERSON OF MY LIFE")
    revealMessageElement.textContent = REVEAL_MESSAGES.message1;
    revealMessageElement.classList.remove("is-leaving");
    void revealMessageElement.offsetWidth;
    revealMessageElement.classList.add("is-revealed");

    // Step 3: Hold Message 1 for ~3.5 seconds
    await wait(3500);

    // Step 4: Fade out Message 1
    revealMessageElement.classList.remove("is-revealed");
    revealMessageElement.classList.add("is-leaving");
    await wait(1000);

    // Step 5: Reveal Message 2 ("HAPPY BIRTHDAY CHAUDRAY")
    revealMessageElement.textContent = REVEAL_MESSAGES.message2;
    revealMessageElement.classList.remove("is-leaving");
    void revealMessageElement.offsetWidth;
    revealMessageElement.classList.add("is-revealed");

    // Step 6: Trigger ambient gold stardust particles in background
    if (typeof enableStardustCallback === "function") {
      enableStardustCallback();
    }
  }

  return {
    startReveal,
  };
}
