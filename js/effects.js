/**
 * Purpose: add finite entrance, project, and diagram animations with optional pointer depth.
 * Used by: the single-page portfolio after its markup loads.
 * Parameters: none. Returns: void. Exceptions: none under normal DOM operation.
 * Side effects: observes content, registers input listeners, and plays decorative animations.
 * Time: O(n) setup for n targets; space: O(n). No continuous animation loop is used.
 */
function initializeEffects() {
  if (!Element.prototype.animate || !window.IntersectionObserver) return;
  // MediaQueryList objects distinguish visitor motion preferences and precise pointers.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
  // Sets retain only current animations and pending pointer cleanup callbacks.
  const animations = new Set();
  const resetPointers = new Set();
  // Number is the shared duration in milliseconds; CSS pixels define movement below.
  const entranceDuration = 650;

  /**
   * Purpose: play a tracked animation only when motion is allowed and the tab is visible.
   * Used by: reveal, project artwork, and data-flow effects.
   * Parameters: element (Element), target; frames (Keyframe[]), visual states;
   *   options (object), optional Web Animations timing overrides in milliseconds.
   * Returns: void. Exceptions: none for the fixed keyframes supplied here.
   * Side effects: starts an animation and releases it on completion or cancellation.
   * Time/space: O(1) per animation.
   */
  function playAnimation(element, frames, options = {}) {
    if (!element || motionPreference.matches || document.hidden) return;
    const animation = element.animate(frames, {
      duration: entranceDuration, easing: 'cubic-bezier(.22,.61,.36,1)', ...options
    });
    animations.add(animation);
    animation.addEventListener('finish', () => animations.delete(animation), { once: true });
    animation.addEventListener('cancel', () => animations.delete(animation), { once: true });
  }

  /**
   * Purpose: bring each project's existing illustration to life without invented product UI.
   * Used by: viewport entry, pointer entry, and keyboard focus.
   * Parameters: card (HTMLElement), a project card.
   * Returns: void. Exceptions: none. Side effects: cancels old artwork effects and replays them.
   * Time/space: O(k) for k artwork elements in the card.
   */
  function animateProject(card) {
    for (const animation of card.querySelector('.project-art').getAnimations({ subtree: true })) {
      animation.cancel();
    }
    const line = card.querySelector('.chart-line');
    if (line) {
      // Number measures the actual SVG path length, independent of its displayed size.
      const length = line.getTotalLength();
      playAnimation(line, [
        { strokeDasharray: `${length}`, strokeDashoffset: length },
        { strokeDasharray: `${length}`, strokeDashoffset: 0 }
      ], { duration: 1100 });
    }
    card.querySelectorAll('.progress-steps i').forEach((bar, index) => {
      playAnimation(bar, [
        { transform: 'scaleY(.15)', transformOrigin: 'bottom' },
        { transform: 'scaleY(1)', transformOrigin: 'bottom' }
      ], { delay: index * 85, duration: 700 });
    });
    card.querySelectorAll('.foundation-blocks i').forEach((block, index) => {
      playAnimation(block, [
        { translate: `0 ${-24 - index * 9}px`, opacity: .35 },
        { translate: '0 0', opacity: 1 }
      ], { delay: index * 100, duration: 750 });
    });
  }

  /**
   * Purpose: add subtle pointer-following depth and a light spot to a card.
   * Used by: project and education cards on devices with a fine pointer.
   * Parameters: card (HTMLElement), the visual surface.
   * Returns: void. Exceptions: none.
   * Side effects: registers listeners, sets CSS variables, and schedules one frame per update.
   * Time/space: O(1) per card update.
   */
  function enableDepth(card) {
    // Nullable number coalesces pointer events into at most one scheduled animation frame.
    let frameId = null;
    // Numbers store viewport-relative pointer coordinates in CSS pixels.
    let pointerX = 0;
    let pointerY = 0;

    /**
     * Purpose: apply a bounded tilt and highlight at the latest pointer position.
     * Used by: requestAnimationFrame following pointer movement.
     * Parameters: none. Returns: void. Exceptions: none.
     * Side effects: reads card geometry and updates four CSS properties and a class.
     * Time/space: O(1).
     */
    function updateDepth() {
      frameId = null;
      if (motionPreference.matches || !pointerPreference.matches || document.hidden) return;
      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
      card.style.setProperty('--light-x', `${x * 100}%`);
      card.style.setProperty('--light-y', `${y * 100}%`);
      card.classList.add('has-depth');
    }

    /**
     * Purpose: queue a visual update for mouse/pen input, leaving touch scrolling native.
     * Used by: the card's pointermove event.
     * Parameters: event (PointerEvent), latest pointer coordinates.
     * Returns: void. Exceptions: none. Side effects: stores coordinates and schedules a frame.
     * Time/space: O(1).
     */
    function movePointer(event) {
      if (event.pointerType === 'touch' || motionPreference.matches || !pointerPreference.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frameId === null) frameId = window.requestAnimationFrame(updateDepth);
    }

    /**
     * Purpose: restore the flat surface when interaction or motion permission ends.
     * Used by: pointer exit/cancellation, document visibility, and preference changes.
     * Parameters: none. Returns: void. Exceptions: none.
     * Side effects: cancels a pending frame and removes the depth class.
     * Time/space: O(1).
     */
    function resetPointer() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      card.classList.remove('has-depth');
    }

    card.addEventListener('pointermove', movePointer, { passive: true });
    card.addEventListener('pointerleave', resetPointer);
    card.addEventListener('pointercancel', resetPointer);
    resetPointers.add(resetPointer);
  }

  /**
   * Purpose: reveal content once as it enters the viewport; content is never CSS-hidden.
   * Used by: IntersectionObserver callbacks.
   * Parameters: entries (IntersectionObserverEntry[]), changed viewport targets.
   * Returns: void. Exceptions: none.
   * Side effects: plays finite effects and stops observing revealed elements.
   * Time/space: O(n) for n entries.
   */
  function revealEntries(entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      playAnimation(entry.target, [
        { opacity: .65, translate: '0 18px' },
        { opacity: 1, translate: '0 0' }
      ]);
      if (entry.target.matches('.project-card')) animateProject(entry.target);
    }
  }

  /**
   * Purpose: stop decorative work when the visitor requests less motion or leaves the tab.
   * Used by: motion/pointer preferences, visibility changes, and beforeprint.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: cancels animations and resets pointer surfaces.
   * Time/space: O(n) for active animations and card surfaces.
   */
  function stopEffects() {
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const reset of resetPointers) reset();
  }

  // Observer animates only below-the-fold content; the hero renders immediately for fast reading.
  const observer = new IntersectionObserver(revealEntries, { threshold: .08 });
  document.querySelectorAll('.section-heading, .experience-card, .project-card, .education-card, .recommendation-card')
    .forEach(element => observer.observe(element));
  document.querySelectorAll('.project-card, .education-card').forEach(enableDepth);
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') animateProject(card);
    });
    card.addEventListener('focusin', event => {
      if (!card.contains(event.relatedTarget)) animateProject(card);
    });
  });

  // Optional button demonstrates the already-described three-stage integration sequence.
  const flowButton = document.querySelector('[data-flow-replay]');
  const flow = document.querySelector('.integration-flow');
  if (flowButton && flow) {
    flowButton.hidden = motionPreference.matches;
    flowButton.addEventListener('click', () => {
      for (const animation of flow.getAnimations({ subtree: true })) animation.cancel();
      flow.querySelectorAll('li').forEach((step, index) => {
        playAnimation(step, [
          { backgroundColor: '#eeefe6', borderColor: '#d9ddd0', transform: 'translateY(0)' },
          { backgroundColor: '#d4ef80', borderColor: '#749b28', transform: 'translateY(-4px)', offset: .45 },
          { backgroundColor: '#eeefe6', borderColor: '#d9ddd0', transform: 'translateY(0)' }
        ], { duration: 850, delay: index * 420 });
      });
    });
    motionPreference.addEventListener('change', () => { flowButton.hidden = motionPreference.matches; });
  }
  motionPreference.addEventListener('change', stopEffects);
  pointerPreference.addEventListener('change', stopEffects);
  document.addEventListener('visibilitychange', stopEffects);
  window.addEventListener('beforeprint', stopEffects);
}

initializeEffects();
