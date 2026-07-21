'use client';

import {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import AnimatedShaderHero from '../components/ui/animated-shader-hero';

gsap.registerPlugin(ScrollTrigger);

const storageKey = 'trialbridge-shortlist';

export default function Home() {
  const root = useRef(null);
  const [text, setText] = useState('');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState([]);
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    setSaved(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  }, []);

  useGSAP(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
  }, {scope: root});

  const persistSaved = (next) => {
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  async function search() {
    setBusy(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({patient_description: text})
      });
      setData(await response.json());
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

  return (
    <main ref={root}>
      <AnimatedShaderHero className="hero">
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

        <div className="device-shell">
          <div className="device-bar">
            <span />
            <span />
            <span />
          </div>

          <div className="hero-grid">
            <div className="hero-intel">
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
                  <button disabled={!text || busy} onClick={search}>
                    {busy ? 'Searching registries...' : 'Begin discovery'}
                  </button>
                </div>
              </div>
            </div>

            <div className="globe-stage" aria-label="Animated global clinical trial signal">
              <div className="signal-wrap">
                <div className="signal-object">
                  <div className="halo h1" />
                  <div className="halo h2" />
                  <div className="core"><span>TB</span></div>
                </div>
              </div>
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

          <div className="metric-strip">
            <div className="metric-card"><strong>Plain language</strong><span>Eligibility translated for real conversations</span></div>
            <div className="metric-card"><strong>Core access without AI</strong><span>Registry discovery still works if Groq is unavailable</span></div>
            <div className="metric-card"><strong>Doctor-ready</strong><span>Compare, save, and print a focused brief</span></div>
          </div>
        </div>
      </AnimatedShaderHero>

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
        <section className="results reveal">
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
