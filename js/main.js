/**
 * Purpose: initialize accessible mobile navigation on the portfolio.
 * Used by: initial page setup.
 * Parameters: none. Returns: void. Exceptions: none under normal DOM operation.
 * Side effects: registers click and keyboard listeners and updates menu state.
 * Time complexity: O(1). Space complexity: O(1).
 */
function initializeNavigation() {
  // HTMLElement references identify the navigation and its disclosure button.
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (!menuToggle || !siteNav) return;

  /**
   * Purpose: keep the menu's visible and accessible states synchronized.
   * Used by: toggle, navigation, and Escape handlers.
   * Parameters: isOpen (boolean), whether to show the menu.
   * Returns: void. Exceptions: none.
   * Side effects: changes a CSS class, button text, and aria-expanded.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function setMenuState(isOpen) {
    siteNav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? 'Close' : 'Menu';
  }

  /**
   * Purpose: toggle the mobile menu from its button.
   * Used by: menu button clicks. Parameters: none. Returns: void. Exceptions: none.
   * Side effects: updates menu state. Time complexity: O(1). Space complexity: O(1).
   */
  function toggleMenu() {
    setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
  }

  /**
   * Purpose: dismiss navigation after selecting a link, including its child icon.
   * Used by: navigation clicks.
   * Parameters: event (MouseEvent), the click event.
   * Returns: void. Exceptions: none.
   * Side effects: closes the menu. Time complexity: O(h) for DOM depth h. Space: O(1).
   */
  function closeAfterNavigation(event) {
    if (event.target instanceof Element && event.target.closest('a')) setMenuState(false);
  }

  /**
   * Purpose: support keyboard dismissal without losing the user's focus.
   * Used by: document keydown events.
   * Parameters: event (KeyboardEvent), the keyboard event.
   * Returns: void. Exceptions: none.
   * Side effects: closes the menu and focuses its button on Escape.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function closeOnEscape(event) {
    if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
    setMenuState(false);
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', toggleMenu);
  siteNav.addEventListener('click', closeAfterNavigation);
  document.addEventListener('keydown', closeOnEscape);
}

initializeNavigation();
