'use client';

export default function AnimatedShaderHero({children, className = ''}) {
  return (
    <section className={`animated-shader-hero ${className}`}>
      <div className="shader-field" aria-hidden="true">
        <span className="shader-bloom shader-bloom-a" />
        <span className="shader-bloom shader-bloom-b" />
        <span className="shader-noise" />
      </div>
      {children}
    </section>
  );
}
