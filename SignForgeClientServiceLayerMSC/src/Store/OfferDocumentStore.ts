import { create } from 'zustand';
import { OfferDocument } from '../Types';
import OfferDocumentsService from '../Services/OfferDocumentsService';
import ApplicationThemeCON from '../Constants/ApplicationThemeCON';
import ApplicationRouteCON from '../Constants/ApplicationRouteCON';
import MockDataSeederService from '../Services/MockDataSeederService';

export interface OfferDocumentState {
  documents: OfferDocument[];
  selectedDocId: string | null;
  activeStatusFilter: string;
  searchQuery: string;
  currentView: string;
  theme: 'light' | 'dark';
  
  // Actions
  setDocuments: (docs: OfferDocument[]) => void;
  addDocument: (doc: OfferDocument) => void;
  updateDocument: (doc: OfferDocument) => void;
  deleteDocument: (id: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setActiveStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentView: (view: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  resetToSampleData: () => void;
}

export const useOfferDocumentStore = create<OfferDocumentState>((set, get) => {
  // Initialize theme
  let initialTheme: 'light' | 'dark' = 'light';
  try {
    const savedTheme = localStorage.getItem(ApplicationThemeCON.STORAGE_KEY_THEME);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    }
  } catch (e) {
    console.error(e);
  }

  // Load documents via service
  const initialDocuments = OfferDocumentsService.current.getDocuments();

  return {
    documents: initialDocuments,
    selectedDocId: initialDocuments[0]?.id || null,
    activeStatusFilter: 'ALL',
    searchQuery: '',
    currentView: ApplicationRouteCON.DOCUMENTS,
    theme: initialTheme,

    setDocuments: (docs) => {
      OfferDocumentsService.current.saveDocuments(docs);
      set({ documents: docs });
    },

    addDocument: (doc) => {
      const updated = OfferDocumentsService.current.addDocument(doc);
      set({ documents: updated, selectedDocId: doc.id });
    },

    updateDocument: (doc) => {
      const updated = OfferDocumentsService.current.updateDocument(doc);
      set({ documents: updated });
    },

    deleteDocument: (id) => {
      const updated = OfferDocumentsService.current.deleteDocument(id);
      const currentSelected = get().selectedDocId;
      set({ 
        documents: updated, 
        selectedDocId: currentSelected === id ? (updated[0]?.id || null) : currentSelected 
      });
    },

    setSelectedDocId: (id) => set({ selectedDocId: id }),
    setActiveStatusFilter: (status) => set({ activeStatusFilter: status }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCurrentView: (view) => set({ currentView: view }),

    setTheme: (theme) => {
      try {
        localStorage.setItem(ApplicationThemeCON.STORAGE_KEY_THEME, theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error(e);
      }
      set({ theme });
    },

    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },

    resetToSampleData: () => {
      const initial = MockDataSeederService.current.getInitialOfferDocuments();
      OfferDocumentsService.current.saveDocuments(initial);
      set({ documents: initial, selectedDocId: initial[0]?.id || null });
    }
  };
});
