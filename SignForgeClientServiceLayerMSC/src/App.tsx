import React, { useState, useEffect } from 'react';
import { useOfferDocumentStore } from './Store/OfferDocumentStore';
import { OfferDocument } from './Types';
import ApplicationRouteCON from './Constants/ApplicationRouteCON';
import { decodeOfferFromUrl } from './utils/urlEncoder';

// Navigation Feature Controller Shell
import NavigationController from './Features/Navigation/NavigationController';

// Feature Controllers
import DocumentInventoryScreenController from './Features/DocumentInventory/DocumentInventoryScreenController';

// Sub-Screens & Portals
import { DocumentEditor } from './components/DocumentEditor';
import { UploadPdfEditor } from './components/UploadPdfEditor';
import { CandidatePortal } from './components/CandidatePortal';
import { HRCounterSignPortal } from './components/HRCounterSignPortal';
import { VercelHostingGuide } from './components/VercelHostingGuide';

// Modals
import { AuditTrailModal } from './components/AuditTrailModal';
import { ExecutiveDispatchModal } from './components/ExecutiveDispatchModal';
import { SendEmailModal } from './components/SendEmailModal';

import LoginScreenController from './Features/LoginScreen/LoginScreenController';

export default function App() {
  const {
    documents,
    selectedDocId,
    currentView,
    theme,
    addDocument,
    updateDocument,
    setSelectedDocId,
    setCurrentView,
    toggleTheme,
  } = useOfferDocumentStore();

  const [editingDoc, setEditingDoc] = useState<OfferDocument | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showEmailModalDoc, setShowEmailModalDoc] = useState<OfferDocument | null>(null);

  // HTML5 History API URL Router Sync (Bidirectional & Deep-linking)
  useEffect(() => {
    const handlePathSync = () => {
      try {
        const { pathname, hash } = window.location;
        const resolved = ApplicationRouteCON.fromPathname(pathname, hash);

        // If arrived via legacy hash, clean it up to standard pathname
        if (hash && hash.startsWith('#/')) {
          const targetPath = ApplicationRouteCON.toPath(resolved.view, resolved.docId);
          window.history.replaceState(null, '', targetPath);
        }

        setCurrentView(resolved.view, resolved.docId);
      } catch (err) {
        console.error('Pathname routing error:', err);
      }
    };

    // Initial sync
    handlePathSync();

    // Listen to browser Back / Forward buttons
    window.addEventListener('popstate', handlePathSync);
    window.addEventListener('hashchange', handlePathSync);
    return () => {
      window.removeEventListener('popstate', handlePathSync);
      window.removeEventListener('hashchange', handlePathSync);
    };
  }, [setCurrentView]);

  // Handle direct query parameters (?view=sign&payload=... or ?docId=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlDocId = searchParams.get('docId') || searchParams.get('doc');
      const dataParam = searchParams.get('data') || searchParams.get('payload');
      const viewParam = searchParams.get('view');

      if (dataParam) {
        const decodedDoc = decodeOfferFromUrl(dataParam);
        if (decodedDoc) {
          addDocument(decodedDoc);
          setSelectedDocId(decodedDoc.id);
          if (viewParam === 'sign' || viewParam === 'candidate' || !viewParam) {
            setCurrentView(ApplicationRouteCON.CANDIDATE_VIEW, decodedDoc.id);
          }
          return;
        }
      }

      if (urlDocId) {
        const found = documents.find((d) => d.id === urlDocId);
        if (found) {
          setSelectedDocId(found.id);
        }
        if (viewParam === 'sign' || viewParam === 'candidate') {
          setCurrentView(ApplicationRouteCON.CANDIDATE_VIEW, urlDocId);
        }
      }
    } catch (err) {
      console.error('Error parsing URL parameters:', err);
    }
  }, []);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  const handleSaveOffer = (savedDoc: OfferDocument) => {
    addDocument(savedDoc);
    setEditingDoc(null);
    setCurrentView(ApplicationRouteCON.DOCUMENTS);
  };

  const handleOpenAuditModalForDoc = (doc: OfferDocument) => {
    setSelectedDocId(doc.id);
    setShowAuditModal(true);
  };

  if (currentView === ApplicationRouteCON.LOGIN) {
    return (
      <LoginScreenController
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={() => setCurrentView(ApplicationRouteCON.DOCUMENTS)}
      />
    );
  }

  return (
    <NavigationController
      onOpenAuditLogs={() => {
        if (activeDoc) setShowAuditModal(true);
      }}
    >
      {/* 1. Main View Content */}
      <div className="pb-16 min-h-[calc(100vh-140px)]">
        {/* Document Inventory Dashboard */}
        {currentView === ApplicationRouteCON.DOCUMENTS && (
          <DocumentInventoryScreenController
            onOpenAuditModalForDoc={handleOpenAuditModalForDoc}
            onOpenSendEmailModal={(doc) => setShowEmailModalDoc(doc)}
          />
        )}

        {/* Offer Document Builder */}
        {currentView === ApplicationRouteCON.CREATE_OFFER && (
          <DocumentEditor
            initialDocument={editingDoc}
            onSaveAndSend={handleSaveOffer}
            onCancel={() => {
              setEditingDoc(null);
              setCurrentView(ApplicationRouteCON.DOCUMENTS);
            }}
            onSwitchToUpload={() => setCurrentView(ApplicationRouteCON.UPLOAD_PDF)}
          />
        )}

        {/* Custom PDF Upload Editor */}
        {currentView === ApplicationRouteCON.UPLOAD_PDF && (
          <UploadPdfEditor
            onSaveAndSend={handleSaveOffer}
            onCancel={() => setCurrentView(ApplicationRouteCON.DOCUMENTS)}
            onSwitchToTemplate={() => setCurrentView(ApplicationRouteCON.CREATE_OFFER)}
          />
        )}

        {/* Candidate Signing Portal */}
        {currentView === ApplicationRouteCON.CANDIDATE_VIEW && activeDoc && (
          <CandidatePortal
            document={activeDoc}
            onUpdateDocument={(updated) => updateDocument(updated)}
            onSwitchToHRView={() => setCurrentView(ApplicationRouteCON.HR_COUNTERSIGN, activeDoc.id)}
          />
        )}

        {/* HR Countersigning Portal */}
        {currentView === ApplicationRouteCON.HR_COUNTERSIGN && activeDoc && (
          <HRCounterSignPortal
            document={activeDoc}
            onUpdateDocument={(updated) => updateDocument(updated)}
          />
        )}

        {/* Hosting Guide */}
        {currentView === ApplicationRouteCON.VERCEL_GUIDE && (
          <VercelHostingGuide />
        )}
      </div>

      {/* 2. Global Dialog Modals */}
      {showAuditModal && activeDoc && (
        <AuditTrailModal
          document={activeDoc}
          onClose={() => {
            setShowAuditModal(false);
            if (window.location.hash === '#/audit-trail') {
              window.location.hash = '#/documents';
            }
          }}
        />
      )}

      {showDispatchModal && activeDoc && (
        <ExecutiveDispatchModal
          document={activeDoc}
          onClose={() => setShowDispatchModal(false)}
        />
      )}

      {showEmailModalDoc && (
        <SendEmailModal
          document={showEmailModalDoc}
          onClose={() => setShowEmailModalDoc(null)}
        />
      )}
    </NavigationController>
  );
}
