import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Early capture beforeinstallprompt at window level if possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed or launched from home screen / PWA)
    const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const navigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const activeStandalone = standaloneMedia || navigatorStandalone;
    setIsStandalone(activeStandalone);
    setIsInstalled(activeStandalone);

    // 2. Detect iOS device (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if prompt was captured already
    if (window.__deferredPWAInstallPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    // 3. Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
      window.__deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const installApp = async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt : null);
    if (!promptToUse) {
      return false;
    }

    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsStandalone(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__deferredPWAInstallPrompt = null;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('PWA install error:', err);
      return false;
    }
  };

  return {
    canInstall: !isStandalone,
    isInstalled: isStandalone,
    isStandalone,
    isIOS,
    installApp,
    hasDeferredPrompt: !!deferredPrompt || (typeof window !== 'undefined' && !!window.__deferredPWAInstallPrompt),
  };
}
