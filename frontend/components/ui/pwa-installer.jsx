'use client';

import React, { useEffect, useState } from 'react';

export default function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already running as PWA
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      navigator.standalone || 
      document.referrer.includes('android-app://');
    
    setIsStandalone(checkStandalone);

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isDeviceIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isDeviceIos);

    // Save prompt event for Chromium browsers
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show custom install prompt if not already running standalone
      if (!checkStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari detection helper
    if (isDeviceIos && !checkStandalone) {
      // Show iOS prompt after a slight delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowPrompt(false);
    setShowIosTip(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className={`pwa-prompt-container ${showIosTip ? 'ios-tip-active' : ''}`}>
      <div className="pwa-glass-pill" onClick={handleInstallClick}>
        <div className="pwa-logo-icon">
          <span>TB</span>
        </div>
        <div className="pwa-text">
          <strong>Install TrialBridge</strong>
          <span>Add to Home Screen for private, instant access</span>
        </div>
        <button className="pwa-action-btn">
          {isIos ? 'Instructions' : 'Install'}
        </button>
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>

      {isIos && showIosTip && (
        <div className="pwa-ios-sheet">
          <div className="pwa-ios-sheet-head">
            <h3>Install on iOS</h3>
            <button className="pwa-sheet-close" onClick={handleDismiss}>✕</button>
          </div>
          <ol className="pwa-steps">
            <li>
              Tap the <strong>Share</strong> button
              <span className="pwa-icon-share">⎋</span> (at the bottom of your Safari window).
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>
              <span className="pwa-icon-plus">⊞</span>.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
