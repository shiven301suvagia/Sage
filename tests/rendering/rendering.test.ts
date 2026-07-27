import assert from 'node:assert/strict';
import test from 'node:test';
import { renderAnimations, RenderingEngine, renderLayers } from '../../frontend/src/rendering/index.js';
import { WindowController } from '../../frontend/src/presence/index.js';

test('rendering engine exposes the required transparent desktop window options', () => {
  const renderer = new RenderingEngine();
  renderer.show(0);
  renderer.setPosition({ x: 1440, y: 760 });
  renderer.setScale(1.5);

  const state = renderer.windowState(260);

  assert.equal(state.visible, true);
  assert.equal(state.opacity, 1);
  assert.deepEqual(state.position, { x: 1440, y: 760 });
  assert.deepEqual(state.size, { width: 480, height: 480 });
  assert.deepEqual(state.options, {
    transparent: true,
    frameless: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000',
  });
});



test('fade animations expose smooth opacity frames', () => {
  const renderer = new RenderingEngine();

  renderer.show(0);
  assert.equal(renderer.windowState(0).opacity, 0);
  assert.equal(renderer.windowState(130).opacity > 0 && renderer.windowState(130).opacity < 1, true);
  assert.equal(renderer.windowState(260).opacity, 1);

  renderer.hide(300);
  assert.equal(renderer.windowState(300).opacity, 1);
  assert.equal(renderer.windowState(410).opacity > 0 && renderer.windowState(410).opacity < 1, true);
  assert.equal(renderer.windowState(520).opacity, 0);
});

test('layer stack reserves future character, UI, and notification layers', () => {
  assert.deepEqual(renderLayers.map((layer) => layer.name), [
    'Rendering',
    'Particle',
    'FutureCharacter',
    'FutureUI',
    'FutureNotification',
  ]);
  assert.deepEqual(renderLayers.map((layer) => layer.zIndex), [10, 20, 30, 40, 50]);
  assert.equal(renderLayers[2]?.reservedForFutureUse, true);
  assert.equal(renderLayers[3]?.reservedForFutureUse, true);
  assert.equal(renderLayers[4]?.reservedForFutureUse, true);
});

test('holographic placeholder pulses and floats without acting like a spinner', () => {
  const renderer = new RenderingEngine();
  renderer.wake(0);
  renderer.idle(0);

  const first = renderer.placeholderFrame(0);
  const later = renderer.placeholderFrame(800);

  assert.equal(first.coreRadius, 42);
  assert.equal(later.glowRadius > first.glowRadius, true);
  assert.equal(later.glowOpacity > first.glowOpacity, true);
  assert.equal(later.floatOffsetY === first.floatOffsetY, false);
});

test('particles are lightweight and only present while Sage is visible', () => {
  const renderer = new RenderingEngine();

  assert.deepEqual(renderer.particlesFrame(), []);
  renderer.show(0);
  const particles = renderer.particlesFrame();

  assert.equal(particles.length, 18);
  assert.equal(particles.every((particle) => Math.abs(particle.driftX) <= 0.036 && Math.abs(particle.driftY) <= 0.038), true);
});

test('animation registry supports current and future render states', () => {
  assert.deepEqual(Object.keys(renderAnimations), ['Idle', 'FadeIn', 'FadeOut', 'Wake', 'Sleep', 'Hover']);
  assert.equal(renderAnimations.Idle.loops, true);
  assert.equal(renderAnimations.FadeIn.loops, false);
  assert.equal(renderAnimations.FadeOut.loops, false);
});

test('presence window controller delegates position, scaling, and visibility to rendering engine', () => {
  const renderer = new RenderingEngine();
  const window = new WindowController(renderer);

  window.moveTo({ x: 200, y: 300 });
  window.setDpiScale(2);
  window.show();
  window.renderCharacter();

  assert.equal(window.renderState.visible, true);
  assert.deepEqual(window.renderState.position, { x: 200, y: 300 });
  assert.deepEqual(window.renderState.size, { width: 640, height: 640 });
  assert.equal(window.hasCharacter, true);
});
