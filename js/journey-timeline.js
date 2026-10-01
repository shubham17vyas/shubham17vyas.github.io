/**
 * Purpose: preview compact timeline details on hover, focus, or explicit activation.
 * Used by: the portfolio journey section after deferred loading.
 * Parameters: none. Returns: void; missing markup retains native disclosures.
 * Exceptions: none under normal DOM operation with supplied markup.
 * Side effects: registers handlers and copies selected detail into an overlay.
 * Time complexity: O(n) setup for n entries. Space complexity: O(n).
 */
function initializeJourneyTimeline() {
  // DOM references identify the hover region and preview outside the scroll area.
  const stage = document.querySelector('.journey-stage');
  if (!stage) return;
  const preview = stage.querySelector('.journey-preview');
  const content = stage.querySelector('.journey-preview-content');
  const closeButton = stage.querySelector('.journey-close');
  const entries = Array.from(stage.querySelectorAll('.journey-entry'));
  if (!preview || !content || !closeButton || !entries.length) return;
  // Nullable element and booleans distinguish selection, persistent input, and dismissal.
  let activeEntry = null;
  let isPinned = false;
  let isPointerInside = false;
  let isDismissed = false;

  /**
   * Purpose: show one milestone without expanding the horizontal rail.
   * Used by: hover, focus, and click handlers.
   * Parameters: entry (HTMLDetailsElement), milestone containing a summary and card.
   * Returns: void. Exceptions: none.
   * Side effects: updates disclosure state and copies detail into the visible preview.
   * Time complexity: O(c) for c detail nodes. Space complexity: O(c).
   */
  function showEntry(entry) {
    const card = entry.querySelector('.journey-card');
    const summary = entry.querySelector('summary');
    if (!card || !summary) return;
    if (activeEntry && activeEntry !== entry) {
      activeEntry.open = false;
      activeEntry.querySelector('summary').setAttribute('aria-expanded', 'false');
    }
    activeEntry = entry;
    entry.open = true;
    summary.setAttribute('aria-expanded', 'true');
    content.replaceChildren(card.cloneNode(true));
    preview.hidden = false;
  }

  /**
   * Purpose: dismiss detail without moving keyboard focus.
   * Used by: close and departure handlers.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: collapses the disclosure and resets persistent selection.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function hidePreview() {
    if (activeEntry) {
      activeEntry.open = false;
      activeEntry.querySelector('summary').setAttribute('aria-expanded', 'false');
    }
    preview.hidden = true;
    isPinned = false;
  }

  for (const entry of entries) {
    // HTMLSummaryElement is a native focusable trigger with keyboard activation.
    const summary = entry.querySelector('summary');
    if (!summary) continue;
    summary.setAttribute('aria-controls', preview.id);
    summary.setAttribute('aria-expanded', 'false');

    /**
     * Purpose: reveal detail under a mouse or pen, without hover activation on touch.
     * Used by: entry pointerenter. Parameters: event (PointerEvent), pointer metadata.
     * Returns: void. Exceptions: none. Side effects: selects the hovered entry.
     * Time complexity: O(c) detail nodes. Space complexity: O(c).
     */
    function hoverEntry(event) {
      if (event.pointerType === 'touch') return;
      isDismissed = false;
      isPinned = false;
      showEntry(entry);
    }

    /**
     * Purpose: expose details on keyboard focus.
     * Used by: summary focus. Parameters: none. Returns: void. Exceptions: none.
     * Side effects: selects the entry unless focus is returning after dismissal.
     * Time complexity: O(c) detail nodes. Space complexity: O(c).
     */
    function focusEntry() { if (!isDismissed) showEntry(entry); }

    /**
     * Purpose: pin detail on tap or activation, and close a second activation.
     * Used by: summary click including keyboard activation.
     * Parameters: event (MouseEvent), native activation.
     * Returns: void. Exceptions: none. Side effects: replaces native toggling.
     * Time complexity: O(c) detail nodes. Space complexity: O(c).
     */
    function activateEntry(event) {
      event.preventDefault();
      if (activeEntry === entry && isPinned && !preview.hidden) {
        hidePreview();
        return;
      }
      isDismissed = false;
      showEntry(entry);
      isPinned = true;
    }

    entry.addEventListener('pointerenter', hoverEntry);
    summary.addEventListener('focus', focusEntry);
    summary.addEventListener('click', activateEntry);
  }

  /**
   * Purpose: preserve hover content while moving into the detail overlay.
   * Used by: stage pointerenter. Parameters: none. Returns: void. Exceptions: none.
   * Side effects: sets pointer state. Time complexity: O(1). Space complexity: O(1).
   */
  function enterStage() { isPointerInside = true; }

  /**
   * Purpose: close transient content when the pointer leaves the entire region.
   * Used by: stage pointerleave. Parameters: none. Returns: void. Exceptions: none.
   * Side effects: clears hover state and conditionally hides detail.
   * Time complexity: O(h) DOM depth. Space complexity: O(1).
   */
  function leaveStage() {
    isPointerInside = false;
    isDismissed = false;
    if (!isPinned && !stage.contains(document.activeElement)) hidePreview();
  }

  /**
   * Purpose: dismiss keyboard detail when focus exits the region.
   * Used by: stage focusout.
   * Parameters: event (FocusEvent), destination focus target.
   * Returns: void. Exceptions: none. Side effects: resets dismissal and hides detail.
   * Time complexity: O(h) DOM depth. Space complexity: O(1).
   */
  function leaveFocus(event) {
    isDismissed = false;
    if (!stage.contains(event.relatedTarget) && !isPointerInside) hidePreview();
  }

  /**
   * Purpose: dismiss on demand and return overlay focus to its activating year.
   * Used by: close button and Escape handler.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: hides detail and restores focus only if focus was inside the overlay.
   * Time complexity: O(h) DOM depth. Space complexity: O(1).
   */
  function dismissPreview() {
    const shouldRestoreFocus = preview.contains(document.activeElement);
    hidePreview();
    if (shouldRestoreFocus) {
      activeEntry?.querySelector('summary').focus();
      hidePreview();
    }
    isDismissed = true;
  }

  /**
   * Purpose: support Escape dismissal for both hover and keyboard detail.
   * Used by: document keydown.
   * Parameters: event (KeyboardEvent), keyboard input.
   * Returns: void. Exceptions: none. Side effects: dismisses a visible preview.
   * Time complexity: O(h) DOM depth. Space complexity: O(1).
   */
  function handleEscape(event) {
    if (event.key === 'Escape' && !preview.hidden) dismissPreview();
  }

  stage.addEventListener('pointerenter', enterStage);
  stage.addEventListener('pointerleave', leaveStage);
  stage.addEventListener('focusout', leaveFocus);
  closeButton.addEventListener('click', dismissPreview);
  document.addEventListener('keydown', handleEscape);
  stage.classList.add('is-interactive');
}

initializeJourneyTimeline();
