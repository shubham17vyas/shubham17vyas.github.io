/**
 * Purpose: turn the Life photographs into a gently moving, scrollable photo strip.
 * Used by: the portfolio's Life section after the document loads.
 * Parameters: none.
 * Returns: void; incomplete markup retains a usable static gallery.
 * Exceptions: none under normal browser operation.
 * Side effects: duplicates decorative photos, observes visibility and size, registers
 * interaction handlers, and animates horizontal scrolling while visible.
 * Time complexity: O(n) setup for n photographs; O(1) per animation frame.
 * Space complexity: O(n) for the decorative duplicate group.
 */
function initializeLifeGallery() {
  // HTMLElement references identify the scroll region, original photos, and motion control.
  const gallery = document.querySelector('.life-gallery');
  const photoGroup = gallery?.querySelector('.life-photo-group');
  const controls = document.querySelector('.life-controls');
  const toggle = document.querySelector('[data-life-toggle]');
  const pagination = document.querySelector('[data-life-pagination]');
  if (!gallery || !photoGroup || !controls || !toggle || !pagination || photoGroup.children.length < 2) return;

  // HTMLElement[] contains original photographs only; duplicates have no additional dots.
  const photos = Array.from(photoGroup.querySelectorAll('.life-photo'));

  // MediaQueryList objects track reduced motion and genuine pointer hover capabilities.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPreference = window.matchMedia('(hover: hover)');
  // HTMLElement provides the seamless visual repeat without duplicate accessible content.
  const duplicateGroup = photoGroup.cloneNode(true);
  duplicateGroup.setAttribute('aria-hidden', 'true');
  duplicateGroup.inert = true;
  gallery.append(duplicateGroup);

  // Number specifies gentle movement in CSS pixels per second, independent of frame rate.
  const pixelsPerSecond = 22;
  // Number caps elapsed milliseconds to prevent jumps after a delayed frame.
  const maximumFrameDuration = 64;
  // Boolean state respects visitor intent, pointer inspection, and viewport visibility.
  let isPaused = motionPreference.matches;
  let isPointerInside = false;
  let isOnScreen = false;
  // Number is the width in CSS pixels of one complete photo group, including its final gap.
  let loopWidth = photoGroup.getBoundingClientRect().width;
  // Numbers preserve fractional scrolling even when the browser rounds scrollLeft.
  let scrollPosition = gallery.scrollLeft;
  let lastAppliedScroll = gallery.scrollLeft;
  // Nullable numbers identify the scheduled frame and the previous timestamp in milliseconds.
  let animationFrameId = null;
  let previousTimestamp = null;
  // Number[] caches original photo offsets in CSS pixels after layout changes.
  let photoPositions = [];
  // Number avoids changing dot attributes when the leading photo has not changed.
  let currentPhotoIndex = -1;
  // Function updates the active dot; labels distinguish every photo for assistive technology.
  const setActiveDot = createCarouselPagination(pagination,
    photos.map((photo, index) => `Show photo ${index + 1}: ${photo.querySelector('figcaption').textContent.trim()}`),
    gallery.id, selectPhoto);
  gallery.classList.add('has-pagination');

  /**
   * Purpose: navigate directly to a photo and pause automatic motion for inspection.
   * Used by: the photo dot controls.
   * Parameters: index (number), a zero-based original photo index.
   * Returns: void; invalid indices are ignored. Exceptions: none.
   * Side effects: pauses playback, scrolls the strip, and updates the active dot.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function selectPhoto(index) {
    if (!Number.isInteger(index) || index < 0 || index >= photoPositions.length) return;
    isPaused = true;
    synchronizePlayback();
    gallery.scrollTo({ left: photoPositions[index], behavior: motionPreference.matches ? 'instant' : 'smooth' });
    setActiveDot(index);
  }

  /**
   * Purpose: keep the current dot synchronized with motion, swipes, and loop wrapping.
   * Used by: native gallery scroll events and responsive layout updates.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: updates pagination attributes when the leading photo changes.
   * Time complexity: O(n) for n original photos. Space complexity: O(1).
   */
  function updateActivePhoto() {
    if (loopWidth <= 0 || photoPositions.length === 0) return;
    // Number normalizes repeated content back to its original photo group, in CSS pixels.
    const position = ((gallery.scrollLeft % loopWidth) + loopWidth) % loopWidth;
    let index = 0;
    while (index + 1 < photoPositions.length && photoPositions[index + 1] <= position + 1) index += 1;
    if (index === currentPhotoIndex) return;
    currentPhotoIndex = index;
    setActiveDot(index);
  }

  /**
   * Purpose: advance continuously and wrap at an identical visual position.
   * Used by: requestAnimationFrame while playback is enabled.
   * Parameters: timestamp (number), browser animation timestamp in milliseconds.
   * Returns: void. Exceptions: none.
   * Side effects: scrolls the gallery and schedules the next frame.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function advanceFrame(timestamp) {
    // Number stores elapsed milliseconds, capped to keep motion smooth after interruptions.
    const elapsed = previousTimestamp === null ? 0 :
      Math.min(timestamp - previousTimestamp, maximumFrameDuration);
    previousTimestamp = timestamp;
    if (Math.abs(gallery.scrollLeft - lastAppliedScroll) > 1) scrollPosition = gallery.scrollLeft;
    scrollPosition = (scrollPosition + pixelsPerSecond * elapsed / 1000) % loopWidth;
    gallery.scrollLeft = scrollPosition;
    lastAppliedScroll = gallery.scrollLeft;
    animationFrameId = window.requestAnimationFrame(advanceFrame);
  }

  /**
   * Purpose: run animation only when visible and free of visitor interaction.
   * Used by: motion control, visibility, focus, hover, and resize handlers.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: updates the control label and starts or cancels animation frames.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function synchronizePlayback() {
    toggle.textContent = isPaused ? 'Play motion' : 'Pause motion';
    if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    previousTimestamp = null;
    scrollPosition = gallery.scrollLeft;
    lastAppliedScroll = gallery.scrollLeft;
    if (isPaused || !isOnScreen || document.hidden || isPointerInside ||
        gallery.matches(':focus-within') || loopWidth <= 0) return;
    animationFrameId = window.requestAnimationFrame(advanceFrame);
  }

  /**
   * Purpose: apply an explicit choice to pause or play the photo strip.
   * Used by: the motion button click event.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: changes playback intent and updates animation scheduling.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function togglePlayback() {
    isPaused = !isPaused;
    synchronizePlayback();
  }

  /**
   * Purpose: keep touch, wheel, and reduced-motion changes under visitor control.
   * Used by: pointerdown, wheel, and motion preference change events.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: pauses until the visitor chooses Play motion.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function pauseForInteraction() {
    isPaused = true;
    synchronizePlayback();
  }

  /**
   * Purpose: pause temporarily while a mouse pointer inspects the photographs.
   * Used by: the gallery pointerenter event.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: updates hover state and playback scheduling.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function pauseForHover() {
    isPointerInside = hoverPreference.matches;
    synchronizePlayback();
  }

  /**
   * Purpose: resume eligible playback when the pointer leaves the strip.
   * Used by: the gallery pointerleave event.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: clears hover state and updates playback scheduling.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function resumeAfterHover() {
    isPointerInside = false;
    synchronizePlayback();
  }

  /**
   * Purpose: keep the loop aligned when responsive image dimensions change.
   * Used by: ResizeObserver for the original photo group.
   * Parameters: none. Returns: void. Exceptions: none.
   * Side effects: measures layout and updates playback scheduling.
   * Time complexity: O(n) for n original photos. Space complexity: O(n).
   */
  function updateLoopWidth() {
    loopWidth = photoGroup.getBoundingClientRect().width;
    photoPositions = photos.map(photo => photo.offsetLeft - photos[0].offsetLeft);
    updateActivePhoto();
    synchronizePlayback();
  }

  /**
   * Purpose: stop animation work when the gallery leaves the viewport.
   * Used by: IntersectionObserver for the gallery.
   * Parameters: entries (IntersectionObserverEntry[]), observations for the one gallery.
   * Returns: void. Exceptions: none.
   * Side effects: updates viewport state and playback scheduling.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function updateVisibility(entries) {
    isOnScreen = entries[0]?.isIntersecting ?? false;
    synchronizePlayback();
  }

  toggle.addEventListener('click', togglePlayback);
  gallery.addEventListener('pointerenter', pauseForHover);
  gallery.addEventListener('pointerleave', resumeAfterHover);
  gallery.addEventListener('pointerdown', pauseForInteraction, { passive: true });
  gallery.addEventListener('wheel', pauseForInteraction, { passive: true });
  gallery.addEventListener('focusin', synchronizePlayback);
  gallery.addEventListener('focusout', synchronizePlayback);
  gallery.addEventListener('scroll', updateActivePhoto, { passive: true });
  document.addEventListener('visibilitychange', synchronizePlayback);
  motionPreference.addEventListener('change', pauseForInteraction);
  new ResizeObserver(updateLoopWidth).observe(photoGroup);
  new IntersectionObserver(updateVisibility).observe(gallery);
  controls.hidden = false;
  updateLoopWidth();
}

initializeLifeGallery();
