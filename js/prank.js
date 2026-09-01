/** Keeps the entry interaction separate from the existing birthday launch flow. */
export function initPrankManager(buttonElement, _buttonTextElement, onPrankComplete) {
  const errorStates = [
    ["404 — Page not found", "The requested experience could not be loaded."],
    ["503 — Service temporarily unavailable", "We're having trouble connecting to this experience. Please try again."],
    ["502 — Bad gateway", "The experience is taking longer than expected to respond."],
    ["504 — Gateway timeout", "The server did not respond in time. Reconnecting one last time…"],
  ];
  let attempt = 0;
  let isBusy = false;
  let hasLaunched = false;
  let timerId = null;
  let overlay = null;
  let retryButton = null;

  function clearPendingTimer() {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  }

  function showError(index) {
    const [code, message] = errorStates[index];
    overlay.querySelector(".server-error__title").textContent = code;
    overlay.querySelector(".server-error__message").textContent = message;
    overlay.querySelector(".server-error__loading").hidden = true;
    overlay.querySelector(".server-error__action").hidden = false;
    retryButton.disabled = false;
    overlay.classList.remove("is-loading");
    overlay.classList.add("is-visible");
    isBusy = false;
  }

  function launchExperience() {
    if (hasLaunched) return;
    hasLaunched = true;
    clearPendingTimer();
    retryButton?.removeEventListener("click", handleRetry);
    buttonElement?.removeEventListener("click", handleEntry);
    overlay?.classList.add("is-leaving");
    timerId = window.setTimeout(() => {
      overlay?.remove();
      overlay = null;
      timerId = null;
    }, 220);
    if (typeof onPrankComplete === "function") onPrankComplete();
  }

  function completeReconnect() {
    timerId = null;
    showError(attempt);
    if (attempt === errorStates.length - 1) {
      timerId = window.setTimeout(launchExperience, 1050);
    }
  }

  function handleRetry(event) {
    event.preventDefault();
    if (isBusy || hasLaunched) return;
    isBusy = true;
    attempt += 1;
    retryButton.disabled = true;
    overlay.querySelector(".server-error__action").hidden = true;
    overlay.querySelector(".server-error__loading").hidden = false;
    overlay.classList.add("is-loading");
    clearPendingTimer();
    timerId = window.setTimeout(completeReconnect, 1250);
  }

  function handleEntry(event) {
    event.preventDefault();
    if (isBusy || hasLaunched || overlay) return;
    isBusy = true;
    buttonElement.disabled = true;
    overlay = document.createElement("section");
    overlay.className = "server-error";
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", "Connection error");
    overlay.innerHTML = `<div class="server-error__content"><div class="server-error__copy"><p class="server-error__eyebrow">Connection problem</p><h1 class="server-error__title"></h1><p class="server-error__message"></p></div><div class="server-error__action"><button class="server-error__retry" type="button">Try again</button></div><div class="server-error__loading" hidden aria-label="Reconnecting"><span class="server-error__spinner" aria-hidden="true"></span><span>Reconnecting</span></div></div>`;
    document.body.append(overlay);
    retryButton = overlay.querySelector(".server-error__retry");
    retryButton.addEventListener("click", handleRetry);
    showError(attempt);
  }

  buttonElement?.addEventListener("click", handleEntry);
  return {
    reset() {
      clearPendingTimer();
      retryButton?.removeEventListener("click", handleRetry);
      overlay?.remove();
      overlay = null;
      retryButton = null;
      attempt = 0;
      isBusy = false;
      hasLaunched = false;
      if (buttonElement) buttonElement.disabled = false;
    },
    destroy() {
      this.reset();
      buttonElement?.removeEventListener("click", handleEntry);
    },
    getClickCount() { return attempt + (overlay ? 1 : 0); },
  };
}
