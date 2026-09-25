/**
 * Purpose: build reusable, keyboard-accessible carousel dot controls.
 * Used by: the Life photo strip and motivational quote section.
 * Parameters:
 *   container (HTMLElement): the group receiving the dot buttons.
 *   labels (string[]): accessible names for the items in display order.
 *   controlsId (string): ID of the region controlled by these dots.
 *   onSelect (function(number): void): callback for visitor selection.
 * Returns: function(number): void; updates the active dot without changing focus.
 * Exceptions: TypeError for invalid configuration.
 * Side effects: creates buttons and registers click/keyboard handlers.
 * Time complexity: O(n) setup for n dots; O(1) per selection.
 * Space complexity: O(n).
 */
function createCarouselPagination(container, labels, controlsId, onSelect) {
  if (!(container instanceof HTMLElement) || !Array.isArray(labels) || labels.length === 0 ||
      labels.some(label => typeof label !== 'string' || !label.trim()) ||
      typeof controlsId !== 'string' || !document.getElementById(controlsId) ||
      typeof onSelect !== 'function') throw new TypeError('Invalid carousel pagination configuration.');

  // HTMLButtonElement[] stores controls in the same order as their carousel items.
  const buttons = [];
  // Number identifies the dot exposed as the current keyboard tab stop.
  let activeIndex = 0;
  for (let index = 0; index < labels.length; index += 1) {
    // HTMLButtonElement provides a semantic button without relying on visual dot size.
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-dot';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', labels[index]);
    button.setAttribute('aria-controls', controlsId);
    button.setAttribute('aria-current', String(index === 0));
    button.tabIndex = index === 0 ? 0 : -1;
    buttons.push(button);
    container.append(button);
  }

  /**
   * Purpose: synchronize the visible current dot and keyboard tab stop.
   * Used by: carousel scroll/selection handlers and dot interaction.
   * Parameters: index (number), a zero-based item index.
   * Returns: void; invalid indices are ignored. Exceptions: none.
   * Side effects: updates button attributes. Time complexity: O(1). Space: O(1).
   */
  function setActive(index) {
    if (!Number.isInteger(index) || index < 0 || index >= buttons.length) return;
    buttons[activeIndex].setAttribute('aria-current', 'false');
    buttons[activeIndex].tabIndex = -1;
    activeIndex = index;
    buttons[activeIndex].setAttribute('aria-current', 'true');
    buttons[activeIndex].tabIndex = 0;
  }

  /**
   * Purpose: select the item associated with an activated dot.
   * Used by: delegated click events on the pagination group.
   * Parameters: event (MouseEvent), the button activation.
   * Returns: void. Exceptions: none for valid configured callbacks.
   * Side effects: updates dot state and invokes onSelect.
   * Time complexity: O(h) for DOM ancestor depth h. Space: O(1).
   */
  function selectClickedDot(event) {
    if (!(event.target instanceof Element)) return;
    // HTMLButtonElement|null identifies the nearest button within this group.
    const button = event.target.closest('button');
    if (!button || !container.contains(button)) return;
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= buttons.length) return;
    setActive(index);
    onSelect(index);
  }

  /**
   * Purpose: support arrow, Home, and End navigation without many Tab stops.
   * Used by: the pagination group's keydown event.
   * Parameters: event (KeyboardEvent), a navigation key press.
   * Returns: void. Exceptions: none for valid configured callbacks.
   * Side effects: prevents native scrolling, moves focus, and selects an item.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function navigateDots(event) {
    // Number|null identifies the destination of a recognized navigation key.
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % buttons.length;
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = buttons.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
  }

  container.addEventListener('click', selectClickedDot);
  container.addEventListener('keydown', navigateDots);
  container.hidden = false;
  return setActive;
}
