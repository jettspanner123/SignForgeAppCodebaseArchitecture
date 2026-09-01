export default class UserPreferencesUtility {
  public static current: UserPreferencesUtility = new UserPreferencesUtility();

  private activeTabKey = 'signforge_active_tab';
  private activeStatusFilterKey = 'signforge_active_status_filter';

  private inventoryViewModeKey = 'signforge_inventory_view_mode';
  private inventoryGridColumnsKey = 'signforge_inventory_grid_columns';
  private inventorySingleLineKey = 'signforge_inventory_single_line';

  private auditVaultViewModeKey = 'signforge_auditvault_view_mode';
  private auditVaultGridColumnsKey = 'signforge_auditvault_grid_columns';
  private auditVaultSingleLineKey = 'signforge_auditvault_single_line';

  private uploadPdfViewModeKey = 'signforge_uploadpdf_view_mode';
  private uploadPdfGridColumnsKey = 'signforge_uploadpdf_grid_columns';
  private uploadPdfSingleLineKey = 'signforge_uploadpdf_single_line';

  private showMockDataKey = 'signforge_show_mock_data';

  // Smart Tab-Scoped Storage Accessors 1:1 AssetSphere
  private getStorageItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionVal = sessionStorage.getItem(key);
      if (sessionVal !== null) return sessionVal;
      const localVal = localStorage.getItem(key);
      if (localVal !== null) {
        sessionStorage.setItem(key, localVal);
        return localVal;
      }
    } catch {
      // Ignore storage access errors
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage access errors
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {
      // Ignore storage access errors
    }
  }

  // Active Tab Persistence
  public getActiveTab(defaultTab: string = 'documents'): string {
    const saved = this.getStorageItem(this.activeTabKey);
    return saved || defaultTab;
  }

  public setActiveTab(tab: string): void {
    this.setStorageItem(this.activeTabKey, tab);
  }

  // Active Status Filter Persistence
  public getActiveStatusFilter(defaultFilter: string = 'ALL'): string {
    const saved = this.getStorageItem(this.activeStatusFilterKey);
    return saved || defaultFilter;
  }

  public setActiveStatusFilter(filter: string): void {
    this.setStorageItem(this.activeStatusFilterKey, filter);
  }

  // Document Inventory View Mode - Default: grid
  public getInventoryViewMode(defaultMode: 'table' | 'grid' = 'grid'): 'table' | 'grid' {
    const saved = this.getStorageItem(this.inventoryViewModeKey);
    if (saved === 'table' || saved === 'grid') return saved;
    return defaultMode;
  }

  public setInventoryViewMode(mode: 'table' | 'grid'): void {
    this.setStorageItem(this.inventoryViewModeKey, mode);
  }

  // Document Inventory Grid Columns (2 vs 3) - Default: 2
  public getInventoryGridColumns(defaultCols: 2 | 3 = 2): 2 | 3 {
    const saved = this.getStorageItem(this.inventoryGridColumnsKey);
    if (saved === '2') return 2;
    if (saved === '3') return 3;
    return defaultCols;
  }

  public setInventoryGridColumns(cols: 2 | 3): void {
    this.setStorageItem(this.inventoryGridColumnsKey, cols.toString());
  }

  // Document Inventory Single-Line Mode - Default: false (Wrap Text)
  public getInventorySingleLine(defaultVal: boolean = false): boolean {
    const saved = this.getStorageItem(this.inventorySingleLineKey);
    if (saved !== null) return saved === 'true';
    return defaultVal;
  }

  public setInventorySingleLine(val: boolean): void {
    this.setStorageItem(this.inventorySingleLineKey, val.toString());
  }

  // Audit Vault View Mode - Default: table
  public getAuditVaultViewMode(defaultMode: 'table' | 'grid' = 'table'): 'table' | 'grid' {
    const saved = this.getStorageItem(this.auditVaultViewModeKey);
    if (saved === 'table' || saved === 'grid') return saved;
    return defaultMode;
  }

  public setAuditVaultViewMode(mode: 'table' | 'grid'): void {
    this.setStorageItem(this.auditVaultViewModeKey, mode);
  }

  public getAuditVaultGridColumns(defaultCols: 2 | 3 = 2): 2 | 3 {
    const saved = this.getStorageItem(this.auditVaultGridColumnsKey);
    if (saved === '2') return 2;
    if (saved === '3') return 3;
    return defaultCols;
  }

  public setAuditVaultGridColumns(cols: 2 | 3): void {
    this.setStorageItem(this.auditVaultGridColumnsKey, cols.toString());
  }

  public getAuditVaultSingleLine(defaultVal: boolean = true): boolean {
    const saved = this.getStorageItem(this.auditVaultSingleLineKey);
    if (saved !== null) return saved === 'true';
    return defaultVal;
  }

  public setAuditVaultSingleLine(val: boolean): void {
    this.setStorageItem(this.auditVaultSingleLineKey, val.toString());
  }

  // Upload PDF View Mode - Default: grid
  public getUploadPdfViewMode(defaultMode: 'table' | 'grid' = 'grid'): 'table' | 'grid' {
    const saved = this.getStorageItem(this.uploadPdfViewModeKey);
    if (saved === 'table' || saved === 'grid') return saved;
    return defaultMode;
  }

  public setUploadPdfViewMode(mode: 'table' | 'grid'): void {
    this.setStorageItem(this.uploadPdfViewModeKey, mode);
  }

  // Development Tools: Show Mock Data Preference
  public getShowMockData(defaultVal: boolean = true): boolean {
    const saved = this.getStorageItem(this.showMockDataKey);
    if (saved !== null) return saved === 'true';
    return defaultVal;
  }

  public setShowMockData(val: boolean): void {
    this.setStorageItem(this.showMockDataKey, val.toString());
  }

  // Clear All Preferences
  public clearAllPreferences(): void {
    const keys = [
      this.activeTabKey,
      this.activeStatusFilterKey,
      this.inventoryViewModeKey,
      this.inventoryGridColumnsKey,
      this.inventorySingleLineKey,
      this.auditVaultViewModeKey,
      this.auditVaultGridColumnsKey,
      this.auditVaultSingleLineKey,
      this.uploadPdfViewModeKey,
      this.uploadPdfGridColumnsKey,
      this.uploadPdfSingleLineKey,
      this.showMockDataKey,
    ];
    for (const key of keys) {
      this.removeStorageItem(key);
    }
  }
}
