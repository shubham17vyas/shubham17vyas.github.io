'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

// String contains the actual browser implementation, executed against isolated fake DOMs.
const source = readFileSync(join(__dirname, '../js/journey-timeline.js'), 'utf8');

/**
 * Purpose: create a small DOM boundary that records events, state, and cloned content.
 * Used by: timeline interaction tests.
 * Parameters: none. Returns: object; document, stage, preview, entries, and controls.
 * Exceptions: none. Side effects: none outside returned test objects.
 * Time complexity: O(n) for n fake entries. Space complexity: O(n).
 */
function createHarness() {
  // Object models just the browser APIs used by the timeline.
  const document = { activeElement: null, handlers: {},
    addEventListener(name, callback) { this.handlers[name] = callback; } };

  /**
   * Purpose: create an event-capable test node with attributes and optional descendants.
   * Used by: the fake DOM builder.
   * Parameters: none. Returns: object; a mutable fake element.
   * Exceptions: none. Side effects: focus updates the fake document.
   * Time complexity: O(1). Space complexity: O(1).
   */
  function createNode() {
    return {
      handlers: {}, attributes: {}, children: [],
      addEventListener(name, callback) { this.handlers[name] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      contains(node) { return node === this || this.children.includes(node); },
      focus() { document.activeElement = this; this.handlers.focus?.(); }
    };
  }

  // Nodes supply a preview region, dismissal control, and replacement content destination.
  const preview = Object.assign(createNode(), { hidden: true, id: 'journey-preview' });
  const close = createNode();
  preview.children.push(close);
  const content = { replaceChildren(card) { this.card = card; } };
  const entries = [];
  for (let index = 0; index < 2; index += 1) {
    const summary = createNode();
    const card = { cloneNode: () => ({ index }) };
    const entry = Object.assign(createNode(), { open: false, summary,
      querySelector: selector => selector === 'summary' ? summary : card });
    entries.push(entry);
  }
  const stage = Object.assign(createNode(), {
    classList: { add() {} },
    querySelector: selector => ({ '.journey-preview': preview,
      '.journey-preview-content': content, '.journey-close': close })[selector],
    querySelectorAll: () => entries
  });
  stage.children.push(preview, close, ...entries.map(entry => entry.summary));
  document.querySelector = () => stage;
  runInNewContext(source, { document });
  return { document, stage, preview, content, close, entries };
}

/**
 * Purpose: verify hover replacement, departure, Escape, focus, and touch pinning.
 * Used by: Node's built-in test runner.
 * Parameters: none. Returns: void. Exceptions: AssertionError on regression.
 * Side effects: exercises production handlers inside an isolated VM.
 * Time complexity: O(1). Space complexity: O(1).
 */
function testPreviewInteractions() {
  const harness = createHarness();
  const [first, second] = harness.entries;
  harness.stage.handlers.pointerenter();
  first.handlers.pointerenter({ pointerType: 'mouse' });
  assert.equal(harness.preview.hidden, false);
  assert.equal(first.summary.attributes['aria-expanded'], 'true');
  second.handlers.pointerenter({ pointerType: 'mouse' });
  assert.equal(first.open, false);
  assert.equal(harness.content.card.index, 1);
  harness.document.handlers.keydown({ key: 'Escape' });
  assert.equal(harness.preview.hidden, true);
  harness.stage.handlers.pointerleave();
  first.handlers.pointerenter({ pointerType: 'touch' });
  assert.equal(harness.preview.hidden, true);
  first.summary.handlers.click({ preventDefault() {} });
  harness.stage.handlers.pointerleave();
  assert.equal(harness.preview.hidden, false);
  first.summary.handlers.click({ preventDefault() {} });
  assert.equal(harness.preview.hidden, true);
  second.summary.focus();
  assert.equal(harness.preview.hidden, false);
  harness.close.focus();
  harness.close.handlers.click();
  assert.equal(harness.preview.hidden, true);
  assert.equal(harness.document.activeElement, second.summary);
  assert.equal(second.summary.attributes['aria-expanded'], 'false');
}

/**
 * Purpose: verify absent or incomplete markup remains a safe native fallback.
 * Used by: Node's built-in test runner.
 * Parameters: none. Returns: void. Exceptions: thrown VM errors on regression.
 * Side effects: executes production setup in isolated VM contexts.
 * Time complexity: O(1). Space complexity: O(1).
 */
function testFallback() {
  runInNewContext(source, { document: { querySelector: () => null } });
  runInNewContext(source, { document: { querySelector: () => ({
    querySelector: () => null, querySelectorAll: () => []
  }) } });
}

test('Compact timeline supports hover, keyboard dismissal, focus, and touch toggling', testPreviewInteractions);
test('Missing or incomplete markup preserves native fallback', testFallback);
