/**
 * Application Cryptographic, Audit ID, and Timestamp Utility Singleton.
 */
export default class ApplicationCryptoUtility {
  public static current: ApplicationCryptoUtility = new ApplicationCryptoUtility();

  public async generateSHA256(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  public generateUUID(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public generateDocNumber(prefix: string = 'OFF'): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${num}`;
  }

  public getSimulatedIP(): string {
    const ips = [
      '198.51.100.42',
      '203.0.113.88',
      '172.56.21.104',
      '74.125.200.100',
      '104.28.14.99',
    ];
    return ips[Math.floor(Math.random() * ips.length)];
  }

  public formatTimestamp(isoDateStr?: string): string {
    const date = isoDateStr ? new Date(isoDateStr) : new Date();
    return date.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  }
}
