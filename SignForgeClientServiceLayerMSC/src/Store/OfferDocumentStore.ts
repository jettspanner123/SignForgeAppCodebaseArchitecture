import { create } from 'zustand';
import { OfferDocument } from '../Types';
import ApplicationRouteCON from '../Constants/ApplicationRouteCON';
import ApplicationThemeUtility from '../Utilities/ApplicationThemeUtility';
import UserPreferencesUtility from '../Utilities/UserPreferencesUtility';

// Purge any legacy client-side offline document cache on startup
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.removeItem('signcorp_documents');
    localStorage.removeItem('signcorp_documents_v2');
    localStorage.removeItem('signcorp_documents_storage');
  } catch {
    // Ignore storage access errors
  }
}

interface OfferDocumentState {
  documents: OfferDocument[];
  currentView: string;
  selectedDocId: string | null;
  searchQuery: string;
  activeStatusFilter: string;
  theme: string;
  inventoryViewMode: 'table' | 'grid';
  inventoryGridColumns: 2 | 3;
  inventorySingleLineMode: boolean;
  configurationConstants: Record<string, string>;

  // Actions
  setCurrentView: (view: string, docId?: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveStatusFilter: (status: string) => void;
  setInventoryViewMode: (mode: 'table' | 'grid') => void;
  setInventoryGridColumns: (cols: 2 | 3) => void;
  setInventorySingleLineMode: (val: boolean) => void;
  setConfigurationConstants: (constants: Record<string, string>) => void;
  isFeatureEnabled: (key: string) => boolean;
  setDocuments: (docs: OfferDocument[]) => void;
  addDocument: (doc: OfferDocument) => void;
  updateDocument: (doc: OfferDocument) => void;
  deleteDocument: (id: string) => void;
  resetToSampleData: () => void;
  toggleTheme: () => void;
  goBack: () => void;
  getSelectedDocument: () => OfferDocument | undefined;
}

export const useOfferDocumentStore = create<OfferDocumentState>((set, get) => ({
  documents: [],
  currentView: ApplicationRouteCON.fromPathname(window.location.pathname, window.location.hash).view,
  selectedDocId: ApplicationRouteCON.fromPathname(window.location.pathname, window.location.hash).docId || null,
  searchQuery: '',
  activeStatusFilter: UserPreferencesUtility.current.getActiveStatusFilter('ALL'),
  theme: ApplicationThemeUtility.current.getSavedTheme(),
  inventoryViewMode: UserPreferencesUtility.current.getInventoryViewMode('grid'),
  inventoryGridColumns: UserPreferencesUtility.current.getInventoryGridColumns(2),
  inventorySingleLineMode: UserPreferencesUtility.current.getInventorySingleLine(false),
  configurationConstants: {},

  setConfigurationConstants: (constants) => {
    set({ configurationConstants: constants });
  },

  isFeatureEnabled: (key) => {
    const val = get().configurationConstants[key];
    if (val === undefined || val === null) return false;
    return val.toLowerCase() === 'true' || val === '1';
  },

  setCurrentView: (view, docId) => {
    const targetPath = ApplicationRouteCON.toPath(view, docId);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    // Clear legacy hash if present
    if (window.location.hash) {
      window.history.replaceState(null, '', targetPath);
    }
    UserPreferencesUtility.current.setActiveTab(view);
    set({ currentView: view, selectedDocId: docId || null });
  },

  setSelectedDocId: (id) => set({ selectedDocId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setActiveStatusFilter: (status) => {
    UserPreferencesUtility.current.setActiveStatusFilter(status);
    set({ activeStatusFilter: status });
  },

  setInventoryViewMode: (mode) => {
    UserPreferencesUtility.current.setInventoryViewMode(mode);
    set({ inventoryViewMode: mode });
  },

  setInventoryGridColumns: (cols) => {
    UserPreferencesUtility.current.setInventoryGridColumns(cols);
    set({ inventoryGridColumns: cols });
  },

  setInventorySingleLineMode: (val) => {
    UserPreferencesUtility.current.setInventorySingleLine(val);
    set({ inventorySingleLineMode: val });
  },

  setDocuments: (docs) => {
    set({ documents: docs });
  },

  addDocument: (doc) => {
    const updated = [doc, ...get().documents.filter((d) => d.id !== doc.id)];
    set({ documents: updated });
  },

  updateDocument: (doc) => {
    const exists = get().documents.some((d) => d.id === doc.id);
    const updated = exists
      ? get().documents.map((d) => (d.id === doc.id ? doc : d))
      : [doc, ...get().documents];
    set({ documents: updated });
  },

  deleteDocument: (id) => {
    const updated = get().documents.filter((d) => d.id !== id);
    set({ documents: updated });
  },

  resetToSampleData: () => {
    set({ documents: [] });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const next = ApplicationThemeUtility.current.toggleTheme(currentTheme);
    set({ theme: next });
  },

  goBack: () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      get().setCurrentView(ApplicationRouteCON.DOCUMENTS);
    }
  },

  getSelectedDocument: () => {
    const { documents, selectedDocId } = get();
    return documents.find((d) => d.id === selectedDocId);
  },
}));
