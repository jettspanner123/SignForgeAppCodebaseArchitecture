export default class ConfigurationConstantCON {
  // System Configuration Keys
  public static readonly KEY_PDF_UPLOAD_FEATURE_WORKING: string = 'PDFUploadFeatureWorking';

  // Default Fallback Values
  public static readonly DEFAULT_VALUES: Record<string, string> = {
    [ConfigurationConstantCON.KEY_PDF_UPLOAD_FEATURE_WORKING]: 'false',
  };

  public static isKeyEnabled(key: string, constantsMap?: Record<string, string>): boolean {
    if (!constantsMap) return false;
    const val = constantsMap[key];
    if (val === undefined || val === null) return false;
    return val.toLowerCase() === 'true' || val === '1';
  }
}
