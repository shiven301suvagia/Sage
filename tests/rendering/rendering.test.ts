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

test('character runtime blends idle breathing blink and cursor follow into one frame', () => {
  const renderer = new RenderingEngine();
  renderer.wake(0);
  renderer.idle(800);
  renderer.updateCursor({ x: 1, y: 0 });

  const first = renderer.characterFrame(900);
  const second = renderer.characterFrame(1200);

  assert.equal(first.state, 'Idle');
  assert.equal(first.layers.some((layer) => layer.name === 'Breathing' && layer.weight > 0), true);
  assert.equal(first.layers.some((layer) => layer.name === 'CursorFollow' && layer.weight > 0), true);
  assert.equal(Math.abs(first.headX) <= 8 && Math.abs(first.headY) <= 6, true);
  assert.equal(Math.abs(first.eyeX) <= 6 && Math.abs(first.eyeY) <= 4, true);
  assert.equal(second.eyeX > first.eyeX, true);
  assert.equal(second.headX > first.headX, true);
});

test('character wake and sleep frames fade smoothly with expression changes', () => {
  const renderer = new RenderingEngine();

  renderer.wake(0);
  const waking = renderer.characterFrame(520);
  assert.equal(waking.opacity > 0 && waking.opacity <= 1, true);
  assert.equal(waking.glow > 0.36, true);
  assert.equal(waking.smile > 0, true);

  renderer.sleep(1000);
  const sleeping = renderer.characterFrame(1400);
  assert.equal(sleeping.opacity < waking.opacity, true);
  assert.equal(sleeping.eyeOpen, 0);
});

test('blink timing is randomized and idle can advance indefinitely', () => {
  const renderer = new RenderingEngine();
  renderer.idle(0);

  const blinkTimes: number[] = [];
  let wasBlinking = false;
  for (let now = 0; now <= 30_000; now += 50) {
    const frame = renderer.characterFrame(now);
    const blinking = frame.layers.some((layer) => layer.name === 'Blink' && layer.weight > 0.1);
    if (blinking && !wasBlinking) blinkTimes.push(now);
    wasBlinking = blinking;
    assert.equal(Number.isFinite(frame.offsetY), true);
  }

  const intervals = blinkTimes.slice(1).map((time, index) => time - blinkTimes[index]!);
  assert.equal(blinkTimes.length >= 4, true);
  assert.equal(new Set(intervals).size > 1, true);
});
