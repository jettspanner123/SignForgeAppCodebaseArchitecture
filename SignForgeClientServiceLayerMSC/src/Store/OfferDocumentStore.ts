import ApplicationThemeUtility from '../Utilities/ApplicationThemeUtility';
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
  setCurrentView: (view: string, docId?: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  resetToSampleData: () => void;
}

export const useOfferDocumentStore = create<OfferDocumentState>((set, get) => {
  // Initialize theme
  const initialTheme = ApplicationThemeUtility.current.getSavedTheme() as 'light' | 'dark';
  ApplicationThemeUtility.current.applyTheme(initialTheme);

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
      setCurrentView: (view: string, docId?: string) => {
    if (docId) {
      set({ selectedDocId: docId });
    }
    if (typeof window !== 'undefined') {
      try {
        if (view === 'documents') window.location.hash = '#/documents';
        else if (view === 'create_offer') window.location.hash = '#/create-offer';
        else if (view === 'upload_pdf') window.location.hash = '#/upload-pdf';
        else if (view === 'audit_trail') window.location.hash = '#/audit-trail';
        else if (view === 'candidate_view') window.location.hash = docId ? `#/candidate/${docId}` : '#/candidate';
        else if (view === 'hr_countersign') window.location.hash = docId ? `#/countersign/${docId}` : '#/countersign';
      } catch (e) {}
    }
    set({ currentView: view });
  },

    setTheme: (theme) => {
      ApplicationThemeUtility.current.applyTheme(theme);
      set({ theme });
    },

    toggleTheme: () => {
      const next = ApplicationThemeUtility.current.toggleTheme(get().theme) as 'light' | 'dark';
      set({ theme: next });
    },

    resetToSampleData: () => {
      const initial = MockDataSeederService.current.getInitialOfferDocuments();
      OfferDocumentsService.current.saveDocuments(initial);
      set({ documents: initial, selectedDocId: initial[0]?.id || null });
    }
  };
});
