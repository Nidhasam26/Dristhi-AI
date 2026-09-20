/**
 * Connectivity Detector
 * Detects online/offline/slow network states using:
 * - navigator.onLine
 * - navigator.connection (effectiveType, rtt, downlink)
 * - lightweight health checks (when API URL is configured)
 */

export const NetworkState = {
  ONLINE: 'ONLINE',
  SLOW: 'SLOW',
  OFFLINE: 'OFFLINE',
};

class ConnectivityDetector {
  constructor() {
    this.listeners = new Set();
    this.state = navigator.onLine ? NetworkState.ONLINE : NetworkState.OFFLINE;
    this.latencyMs = 0;
    this.effectiveType = navigator.connection?.effectiveType || '4g';
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.checkInterval = null;

    this.init();
  }

  init() {
    window.addEventListener('online', () => this.handleOnlineChange());
    window.addEventListener('offline', () => this.handleOfflineChange());

    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => this.evaluateConnectionQuality());
    }

    // Evaluate initial state
    this.evaluateConnectionQuality();

    // Start periodic background check every 30s
    this.startPeriodicCheck();
  }

  setApiUrl(url) {
    this.apiUrl = url;
    this.checkHealth();
  }

  handleOnlineChange() {
    this.state = NetworkState.ONLINE;
    this.evaluateConnectionQuality();
    this.notify();
    this.checkHealth();
  }

  handleOfflineChange() {
    this.state = NetworkState.OFFLINE;
    this.latencyMs = 0;
    this.notify();
  }

  evaluateConnectionQuality() {
    if (!navigator.onLine) {
      this.state = NetworkState.OFFLINE;
      return;
    }

    if (navigator.connection) {
      const { effectiveType, rtt } = navigator.connection;
      this.effectiveType = effectiveType;

      if (effectiveType === 'slow-2g' || effectiveType === '2g' || (rtt && rtt > 1500)) {
        this.state = NetworkState.SLOW;
      } else {
        this.state = NetworkState.ONLINE;
      }
    } else {
      this.state = NetworkState.ONLINE;
    }
  }

  async checkHealth() {
    if (!navigator.onLine) {
      this.state = NetworkState.OFFLINE;
      this.notify();
      return { online: false, state: NetworkState.OFFLINE };
    }

    // If no backend API URL configured, treat network as available if browser is online
    if (!this.apiUrl) {
      this.evaluateConnectionQuality();
      this.notify();
      return { online: true, state: this.state, backendConfigured: false };
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.apiUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const duration = performance.now() - start;
      this.latencyMs = Math.round(duration);

      if (res.ok) {
        this.state = duration > 1500 ? NetworkState.SLOW : NetworkState.ONLINE;
      } else {
        this.state = NetworkState.SLOW; // Server reachable but non-200
      }
    } catch (err) {
      // Timeout or unreachable backend
      this.latencyMs = 9999;
      this.state = NetworkState.SLOW; // Local internet is on, backend unreachable
    }

    this.notify();
    return { online: true, state: this.state, latencyMs: this.latencyMs, backendConfigured: true };
  }

  startPeriodicCheck() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => this.checkHealth(), 30000);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({
      state: this.state,
      isOnline: this.state !== NetworkState.OFFLINE,
      isSlow: this.state === NetworkState.SLOW,
      latencyMs: this.latencyMs,
      effectiveType: this.effectiveType,
    });

    return () => this.listeners.delete(listener);
  }

  notify() {
    const payload = {
      state: this.state,
      isOnline: this.state !== NetworkState.OFFLINE,
      isSlow: this.state === NetworkState.SLOW,
      latencyMs: this.latencyMs,
      effectiveType: this.effectiveType,
    };
    this.listeners.forEach((fn) => fn(payload));
  }
}

export const connectivity = new ConnectivityDetector();
