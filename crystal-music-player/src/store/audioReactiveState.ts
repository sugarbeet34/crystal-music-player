/**
 * Mutable params driven by AudioReactive each frame.
 * Module-level object — no React state, zero re-render cost.
 */
export const audioReactiveState = {
  targetSpeedMultiplier: 1,
  attractForce: 0.02,
  bloomStrength: 0.1,
  explosionImpulse: 0,
  trebleHueShift: 0, // positive = cooler (toward blue), range 0~0.18
};
