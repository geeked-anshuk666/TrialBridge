'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';

const AnimatedShaderHero = dynamic(() => import('../components/ui/animated-shader-hero'), { ssr: false });
const RotatingEarth = dynamic(() => import('../components/ui/wireframe-dotted-globe'), { ssr: false });
const PwaInstaller = dynamic(() => import('../components/ui/pwa-installer'), { ssr: false });

const storageKey = 'trialbridge-shortlist';

export default function Home() {
  const root = useRef(null);

  const globeColRef = useRef(null);
  const [text, setText] = useState('');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState([]);
  const [compare, setCompare] = useState([]);
  const [globeZoom, setGlobeZoom] = useState(0);
  const [expansion, setExpansion] = useState({ scale: 2.5, tx: 0, ty: 0 });

  // Compute how much to translate/scale the globe column to cover the viewport
  useEffect(() => {
    const compute = () => {
      if (!globeColRef.current) return;
      const rect = globeColRef.current.getBoundingClientRect();
      const colCx = rect.left + rect.width / 2;
      const colCy = rect.top + rect.height / 2;
      const scale = Math.max(
        (window.innerWidth * 1.08) / rect.width,
        (window.innerHeight * 1.08) / rect.height
      );
      setExpansion({
        scale,
        tx: window.innerWidth / 2 - colCx,
        ty: window.innerHeight / 2 - colCy,
      });
    };
    const t = setTimeout(compute, 150);
    window.addEventListener('resize', compute);
    return () => { clearTimeout(t); window.removeEventListener('resize', compute); };
  }, []);

  const handleGlobeZoom = useCallback((fraction) => {
    setGlobeZoom(fraction);
  }, []);

  useEffect(() => {
    setSaved(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({defaults: {ease: 'power3.out'}})
        .from('.nav-item', {y: -18, opacity: 0, stagger: 0.07})
        .from('.hero-kicker, .hero-title span, .hero-copy, .search-panel', {y: 34, opacity: 0, stagger: 0.09}, '-=.25')
        .from('.signal-card, .metric-card', {scale: 0.94, y: 22, opacity: 0, stagger: 0.08}, '-=.2');

      gsap.to('.signal-wrap', {
        y: -45,
        scale: 0.93,
        scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1}
      });

      gsap.utils.toArray('.reveal').forEach((element) => {
        gsap.from(element, {y: 42, opacity: 0, scrollTrigger: {trigger: element, start: 'top 86%'}});
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const persistSaved = (next) => {
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  async function search() {
    const query = text.trim();
    if (!query) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({patient_description: query})
      });
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }
      const payload = await response.json();
      setData(payload);
      setTimeout(() => document.getElementById('trial-results')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 40);
    } catch (searchError) {
      setError('TrialBridge could not complete the search. Check that the backend is running, then try again.');
    } finally {
      setBusy(false);
    }
  }

  const toggleSave = (trial) => {
    persistSaved(saved.some((item) => item.trial_id === trial.trial_id)
      ? saved.filter((item) => item.trial_id !== trial.trial_id)
      : [...saved, trial]);
  };

  const toggleCompare = (trial) => {
    setCompare(compare.some((item) => item.trial_id === trial.trial_id)
      ? compare.filter((item) => item.trial_id !== trial.trial_id)
      : compare.length < 3 ? [...compare, trial] : compare);
  };

  const isExpanded = globeZoom > 0.05;
  const backdropOpacity = Math.max(0, (globeZoom - 0.25) / 0.75);
  const textOpacity = Math.max(0, 1 - globeZoom * 2.2);
  const textY = globeZoom * -28;
  const globeTransform = `translate(${globeZoom * expansion.tx}px, ${globeZoom * expansion.ty}px) scale(${1 + globeZoom * (expansion.scale - 1)})`;
  const cardOpacity = Math.max(0, 1 - globeZoom * 3);

  return (
    <main ref={root}>
      {/* Fixed WebGL shader canvas — always behind everything */}
      <AnimatedShaderHero />

      <PwaInstaller />

      {/* Dark backdrop that fades in as globe expands to fullscreen */}
      <div className="globe-backdrop" style={{ opacity: backdropOpacity }} />


      <section className="animated-shader-hero hero">
        <nav className="topbar">
          <a className="wordmark nav-item">Trial<span>Bridge</span></a>
          <div className="nav-links">
            <span className="nav-item active">Discovery</span>
            <span className="nav-item">Saved</span>
            <span className="nav-item">Doctor Brief</span>
          </div>
          <div className="nav-right">
            <span className="status nav-item"><i /> Private by design</span>
          </div>
        </nav>

        <div className="hero-open-grid">
          {/* Left — editorial text, fades out as globe expands */}
          <div
            className="hero-intel"
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              transition: 'opacity 0.35s ease, transform 0.35s ease',
              pointerEvents: isExpanded ? 'none' : 'auto',
            }}
          >
            <p className="hero-kicker">Global clinical trial discovery</p>
            <h1 className="hero-title">
              <span>Your private</span>
              <span>trial intelligence</span>
              <span>desk.</span>
            </h1>
            <p className="hero-copy">
              Describe symptoms, diagnosis, stage, prior treatments, or location. TrialBridge turns registry noise into a calm shortlist you can discuss with a clinician.
            </p>

            <div className="search-panel">
              <label htmlFor="trial-query">What are you looking for?</label>
              <textarea
                id="trial-query"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Example: metastatic breast cancer, HER2 negative, already tried chemotherapy, near Boston..."
              />
              <div className="search-actions">
                <span>No account. No raw text stored.</span>
                <button disabled={!text.trim() || busy} onClick={search}>
                  {busy ? 'Searching registries...' : 'Begin discovery'}
                </button>
              </div>
            </div>
            {error && <div className="search-alert" role="alert">{error}</div>}
          </div>

          {/* Right — globe, expands to fill page on max zoom */}
          <div
            className="globe-stage globe-expand-col"
            ref={globeColRef}
            style={{
              transform: globeTransform,
              transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              zIndex: isExpanded ? 100 : undefined,
            }}
          >
            <div className="signal-wrap">
              <RotatingEarth width={520} height={520} onZoomFractionChange={handleGlobeZoom} />
            </div>
            <div style={{ opacity: cardOpacity, transition: 'opacity 0.25s ease' }}>
              <div className="signal-card signal-card-top">
                <strong>{data?.explained_trials?.length || 'AI+'}</strong>
                <span>Ranked matches</span>
              </div>
              <div className="signal-card signal-card-mid">
                <strong>{data?.registries_responded?.length || '6'}</strong>
                <span>Data sources</span>
              </div>
              <div className="signal-card signal-card-low">
                <strong>Local</strong>
                <span>Saved shortlist</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="metric-strip"
          style={{ opacity: textOpacity, transition: 'opacity 0.35s ease', pointerEvents: isExpanded ? 'none' : 'auto' }}
        >
          <div className="metric-card"><strong>Plain language</strong><span>Eligibility translated for real conversations</span></div>
          <div className="metric-card"><strong>Core access without AI</strong><span>Registry discovery still works if Groq is unavailable</span></div>
          <div className="metric-card"><strong>Doctor-ready</strong><span>Compare, save, and print a focused brief</span></div>
        </div>
      </section>


      {(saved.length > 0 || compare.length > 0) && (
        <section className="workspace reveal">
          <div>
            <span className="section-label">Private workspace</span>
            <h2>Keep the few trials worth a closer look.</h2>
          </div>
          <div className="workspace-actions">
            <button onClick={() => persistSaved([])}>Clear saved ({saved.length})</button>
            {compare.length > 0 && <button onClick={() => window.print()}>Print doctor brief</button>}
            {compare.length > 0 && <p>Ask: Is this suitable for me? What must be confirmed? What travel, time, and risks should I consider?</p>}
          </div>
        </section>
      )}

      {data && (
        <section className="results reveal" id="trial-results" aria-live="polite">
          <div className="results-head">
            <div>
              <p className="section-label">Signals received {data.explained_trials?.length || 0}</p>
              <h2>Paths worth exploring.</h2>
            </div>
            <p>
              Sources responding: {data.registries_responded?.join(' | ') || 'Awaiting registry signal'}.
              Status can change, so confirm every trial with the study team.
            </p>
          </div>

          {data.explained_trials?.length === 0 && (
            <div className="empty-state" role="status">
              <p className="section-label">No shortlist yet</p>
              <h3>No matching trials came back from the live registry search.</h3>
              <p>
                Try adding a formal diagnosis, disease stage, biomarker status, prior treatments, age, and preferred country or city.
                Broad symptoms alone can be hard for trial registries to match.
              </p>
              <div className="empty-prompts">
                <button onClick={() => setText('metastatic breast cancer HER2 negative prior chemotherapy near Boston')}>
                  Use oncology example
                </button>
                <button onClick={() => setText(`${text.trim()} diagnosis stage prior treatments age location`.trim())}>
                  Add detail prompts
                </button>
              </div>
            </div>
          )}

          {data.explained_trials?.map((trial, index) => (
            <article className="trial" key={trial.trial_id}>
              <div className="trial-index">0{index + 1}</div>
              <div>
                <p className="trial-source">{trial.trial_id} | Potential path</p>
                <h3>{trial.title}</h3>
                <p className="trial-copy">{trial.explanation}</p>
                <p className="trial-detail">{trial.eligibility_plain}<br />{trial.location_plain}</p>
                <div className="trial-actions">
                  <button onClick={() => toggleSave(trial)}>
                    {saved.some((item) => item.trial_id === trial.trial_id) ? 'Saved locally' : 'Save locally'}
                  </button>
                  <button onClick={() => toggleCompare(trial)} disabled={!compare.some((item) => item.trial_id === trial.trial_id) && compare.length === 3}>
                    {compare.some((item) => item.trial_id === trial.trial_id) ? 'Remove' : 'Compare'}
                  </button>
                </div>
              </div>
              <div className="potential">
                <strong>{trial.eligibility_score}</strong>
                <span>Potential match</span>
              </div>
            </article>
          ))}

          <p className="disclaimer">TrialBridge is for discovery, never a clinical decision. Discuss every possibility with a qualified healthcare professional.</p>
        </section>
      )}
    </main>
  );
}
