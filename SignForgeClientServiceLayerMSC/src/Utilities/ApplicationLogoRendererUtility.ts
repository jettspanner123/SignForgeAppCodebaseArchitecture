import { WE_PLM_SVG_STRING } from '../components/WePlmLogo';

/**
 * Application Brand Logo Canvas Renderer Utility Singleton.
 */
export default class ApplicationLogoRendererUtility {
  public static current: ApplicationLogoRendererUtility = new ApplicationLogoRendererUtility();

  private cachedLogoPngDataUrl: string | null = null;

  public async getWePlmLogoPngDataUrl(): Promise<string> {
    if (this.cachedLogoPngDataUrl) return this.cachedLogoPngDataUrl;

    if (typeof window === 'undefined') {
      return '';
    }

    return new Promise((resolve) => {
      try {
        const img = new Image();
        const svgBlob = new Blob([WE_PLM_SVG_STRING], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 380;
          canvas.height = 230;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            this.cachedLogoPngDataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(this.cachedLogoPngDataUrl);
            return;
          }
          URL.revokeObjectURL(url);
          resolve('');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };

        img.src = url;
      } catch {
        resolve('');
      }
    });
  }
}
