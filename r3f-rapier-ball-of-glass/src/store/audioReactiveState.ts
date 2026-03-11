/**
 * Mutable params driven by AudioReactive each frame.
 * Module-level object — no React state, zero re-render cost.
 */
export const audioReactiveState = {
  targetSpeedMultiplier: 1,
  attractForce: 0.02,
  bloomStrength: 0.1,
  explosionImpulse: 0,   // outward impulse applied to each fragment this frame
};
