/**
 * Purpose: progressively enhance the original motivational quotes with rotation and dots.
 * Used by: the portfolio's motivation section after the document loads.
 * Parameters: none. Returns: void; missing markup preserves the static quotes.
 * Exceptions: none under normal DOM operation.
 * Side effects: toggles quote visibility, registers controls, and starts a guarded timer.
 * Time complexity: O(n) setup and selection for n quotes. Space complexity: O(n).
 */
function initializeMotivation() {
  // HTMLElement references identify the section, quote window, and optional controls.
  const section = document.querySelector('#motivation');
  const windowElement = document.querySelector('#motivation-quotes');
  const pagination = document.querySelector('[data-quote-pagination]');
  const toggle = document.querySelector('[data-quote-toggle]');
  if (!section || !windowElement || !pagination || !toggle) return;
  // HTMLElement[] preserves the source order of the original four quotes.
  const quotes = Array.from(windowElement.querySelectorAll('.quote-card'));
  if (quotes.length < 2) return;
  // MediaQueryList objects honor motion preferences and genuine mouse hover.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPreference = window.matchMedia('(hover: hover)');
  // Boolean and numeric state track visitor intent and the currently displayed quote.
  let isPaused = motionPreference.matches;
  let isOnScreen = false;
  let currentIndex = 0;
  // Number gives visitors eight seconds to read before automatic advancement.
  const rotationInterval = 8000;
  // Function synchronizes the accessible dot control with the displayed quotation.
  const setActiveDot = createCarouselPagination(pagination,
    quotes.map((quote, index) => `Show quote ${index + 1}: ${quote.querySelector('figcaption').textContent.trim()}`),
    windowElement.id, selectQuote);

  /**
   * Purpose: render one quote and synchronize its active indicator.
   * Used by: initialization, dot selection, and automatic rotation.
   * Parameters: index (number), a zero-based quote index.
   * Returns: void; invalid indices are ignored. Exceptions: none.
   * Side effects: changes hidden attributes and pagination state.
   * Time complexity: O(n). Space complexity: O(1).
   */
  function showQuote(index) {
    if (!Number.isInteger(index) || index < 0 || index >= quotes.length) return;
    currentIndex = index;
    for (let quoteIndex = 0; quoteIndex < quotes.length; quoteIndex += 1) {
      quotes[quoteIndex].hidden = quoteIndex !== index;
    }
    setActiveDot(index);
  }

  /**
   * Purpose: communicate playback state without announcing automatic quote changes.
   * Used by: setup, pause/play, and manual selection.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: updates button text and live-region behavior.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function updatePlayback() {
    toggle.textContent = isPaused ? 'Play quotes' : 'Pause quotes';
    windowElement.setAttribute('aria-live', isPaused ? 'polite' : 'off');
  }

  /**
   * Purpose: show a chosen quote until the visitor explicitly resumes rotation.
   * Used by: dot controls.
   * Parameters: index (number), a zero-based quote index.
   * Returns: void. Exceptions: none.
   * Side effects: pauses rotation and renders the selected quote.
   * Time complexity: O(n). Space complexity: O(1).
   */
  function selectQuote(index) {
    isPaused = true;
    updatePlayback();
    showQuote(index);
  }

  /**
   * Purpose: change automatic rotation according to an explicit visitor action.
   * Used by: the quote pause/play button.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: changes playback state and label. Time complexity: O(1). Space: O(1).
   */
  function togglePlayback() {
    isPaused = !isPaused;
    updatePlayback();
  }

  /**
   * Purpose: stop motion when the operating-system motion preference changes.
   * Used by: media query change events.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: pauses rotation and updates its control. Time: O(1). Space: O(1).
   */
  function pauseForMotionChange() {
    isPaused = true;
    updatePlayback();
  }

  /**
   * Purpose: rotate only while visible and free from active reading or navigation.
   * Used by: the rotation interval.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: may display the next quote. Time complexity: O(n). Space: O(1).
   */
  function advanceQuote() {
    if (isPaused || !isOnScreen || document.hidden ||
        (hoverPreference.matches && section.matches(':hover')) ||
        (section.contains(document.activeElement) && document.activeElement !== toggle)) return;
    showQuote((currentIndex + 1) % quotes.length);
  }

  /**
   * Purpose: keep offscreen quotes from rotating.
   * Used by: IntersectionObserver for the quote window.
   * Parameters: entries (IntersectionObserverEntry[]), observations for one window.
   * Returns: void. Exceptions: none.
   * Side effects: updates viewport state. Time complexity: O(1). Space: O(1).
   */
  function updateVisibility(entries) {
    isOnScreen = entries[0]?.isIntersecting ?? false;
  }

  toggle.addEventListener('click', togglePlayback);
  motionPreference.addEventListener('change', pauseForMotionChange);
  new IntersectionObserver(updateVisibility).observe(windowElement);
  windowElement.classList.add('is-enhanced');
  toggle.hidden = false;
  showQuote(0);
  updatePlayback();
  window.setInterval(advanceQuote, rotationInterval);
}

initializeMotivation();
