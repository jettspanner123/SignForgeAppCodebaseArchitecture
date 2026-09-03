export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PWAInstallListener = (canInstall: boolean) => void;

/**
 * PWAService
 * Singleton service managing Service Worker registration, PWA installation prompts, and display mode state.
 */
export default class PWAService {
  public static current: PWAService = new PWAService();

  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isAppInstallable = false;
  private listeners: Set<PWAInstallListener> = new Set();
  private isInitialized = false;

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }
    this.isInitialized = true;

    // 1. Detect and tag Standalone Mode
    const checkStandalone = () => {
      if (this.isStandalone()) {
        document.documentElement.classList.add('is-pwa-standalone');
      } else {
        document.documentElement.classList.remove('is-pwa-standalone');
      }
    };
    checkStandalone();
    try {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
    } catch (e) {}

    // 2. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 3. Capture BeforeInstallPromptEvent
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.isAppInstallable = true;
      this.notifyListeners();
    });

    // 4. Listen to appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Application successfully installed.');
      this.deferredPrompt = null;
      this.isAppInstallable = false;
      this.notifyListeners();
    });
  }

  public isInstallable(): boolean {
    return this.isAppInstallable && !this.isStandalone();
  }

  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      const isAccepted = choiceResult.outcome === 'accepted';
      
      this.deferredPrompt = null;
      this.isAppInstallable = false;
      this.notifyListeners();

      return isAccepted;
    } catch (error) {
      console.error('[PWA] Error during promptInstall:', error);
      return false;
    }
  }

  public subscribe(listener: PWAInstallListener): () => void {
    this.listeners.add(listener);
    listener(this.isInstallable());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const installable = this.isInstallable();
    this.listeners.forEach((listener) => {
      try {
        listener(installable);
      } catch (err) {
        console.error('[PWA] Listener callback error:', err);
      }
    });
  }
}
