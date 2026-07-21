# Globe hero redesign plan

## Visual direction

**Luminous Clinical Observatory** (DFII: 13/15): a dark, refined desktop-like stage with a living wireframe globe at its centre. It draws from the supplied composition—framed screen, dense dark atmosphere, floating informational capsules—without copying its health-AI wording, heart graphic, or branded assets.

## Architecture decision

The current app is JavaScript/Next.js and does not yet have Tailwind, TypeScript, shadcn, or `components/ui`. The supplied Tailwind/TypeScript component cannot be pasted safely as-is. We will:

1. Add TypeScript, Tailwind, and shadcn-compatible path/configuration.
2. Place the adapted shader hero at `frontend/components/ui/animated-shader-hero.tsx`.
3. Replace the CSS orb with a performant R3F globe: sphere/wireframe, latitude/longitude lines, geographic pins, and limited glow. It remains fully readable with a static fallback for no-WebGL/reduced-motion devices.
4. Integrate the hero around TrialBridge’s real search action, privacy statement, registry status, and medical disclaimer.

## Workstreams

- **Foundation:** TypeScript/Tailwind/shadcn-compatible configuration, dependency migration, design tokens.
- **Hero:** canvas shader background, true R3F globe, GSAP choreography, responsive framed interface.
- **Product integration:** Search input, trial actions/results, accessibility, no-WebGL and reduced-motion fallback.
- **Quality:** production build, mobile performance checks, contrast/keyboard review.

## Acceptance criteria

- The globe is visibly spherical and rotates as 3D geometry—not a bitmap.
- The hero is responsive and keeps the search task primary.
- It supports keyboard use, reduced motion, and no-WebGL fallback.
- `npm run build` passes.
- Existing API integration is preserved.
