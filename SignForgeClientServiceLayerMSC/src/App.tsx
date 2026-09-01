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
  } = useOfferDocumentStore();

  const [editingDoc, setEditingDoc] = useState<OfferDocument | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showEmailModalDoc, setShowEmailModalDoc] = useState<OfferDocument | null>(null);

  // Hash-based URL Router Sync (Bidirectional & Deep-linking)
  useEffect(() => {
    const handleHashSync = () => {
      try {
        const hash = window.location.hash;
        if (!hash || hash === '#/' || hash === '#/documents') {
          setCurrentView(ApplicationRouteCON.DOCUMENTS);
        } else if (hash === '#/create-offer') {
          setCurrentView(ApplicationRouteCON.CREATE_OFFER);
        } else if (hash === '#/upload-pdf') {
          setCurrentView(ApplicationRouteCON.UPLOAD_PDF);
        } else if (hash === '#/audit-trail') {
          setShowAuditModal(true);
        } else if (hash.startsWith('#/candidate')) {
          const parts = hash.split('/');
          if (parts[2]) {
            setSelectedDocId(parts[2]);
          }
          setCurrentView(ApplicationRouteCON.CANDIDATE_VIEW);
        } else if (hash.startsWith('#/countersign')) {
          const parts = hash.split('/');
          if (parts[2]) {
            setSelectedDocId(parts[2]);
          }
          setCurrentView(ApplicationRouteCON.HR_COUNTERSIGN);
        }
      } catch (err) {
        console.error('Hash routing error:', err);
      }
    };

    // Initial sync
    handleHashSync();

    // Listen to browser Back / Forward buttons
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [setCurrentView, setSelectedDocId]);

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DocumentEditor
              initialDocument={editingDoc}
              onSaveAndSend={handleSaveOffer}
              onCancel={() => {
                setEditingDoc(null);
                setCurrentView(ApplicationRouteCON.DOCUMENTS);
              }}
              onSwitchToUpload={() => setCurrentView(ApplicationRouteCON.UPLOAD_PDF)}
            />
          </div>
        )}

        {/* Custom PDF Upload Editor */}
        {currentView === ApplicationRouteCON.UPLOAD_PDF && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <UploadPdfEditor
              onSaveAndSend={handleSaveOffer}
              onCancel={() => setCurrentView(ApplicationRouteCON.DOCUMENTS)}
              onSwitchToTemplate={() => setCurrentView(ApplicationRouteCON.CREATE_OFFER)}
            />
          </div>
        )}

        {/* Audit Trail Vault Screen (When navigated via Top Nav Tab) */}
        {currentView === ApplicationRouteCON.AUDIT_TRAILS && (
          <DocumentInventoryScreenController
            onOpenAuditModalForDoc={handleOpenAuditModalForDoc}
            onOpenSendEmailModal={(doc) => setShowEmailModalDoc(doc)}
          />
        )}

        {/* Candidate Signing Portal */}
        {currentView === ApplicationRouteCON.CANDIDATE_VIEW && activeDoc && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CandidatePortal
              document={activeDoc}
              onUpdateDocument={(updated) => updateDocument(updated)}
              onSwitchToHRView={() => setCurrentView(ApplicationRouteCON.HR_COUNTERSIGN, activeDoc.id)}
            />
          </div>
        )}

        {/* HR Countersigning Portal */}
        {currentView === ApplicationRouteCON.HR_COUNTERSIGN && activeDoc && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <HRCounterSignPortal
              document={activeDoc}
              onUpdateDocument={(updated) => updateDocument(updated)}
            />
          </div>
        )}

        {/* Hosting Guide */}
        {currentView === ApplicationRouteCON.VERCEL_GUIDE && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <VercelHostingGuide />
          </div>
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

      {/* 3. AssetSphere Enterprise Footer */}
      <footer className="border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-sm py-6 text-xs text-slate-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-headline font-semibold text-slate-900 dark:text-zinc-100">
              We.SignForge
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="font-mono text-[11px]">AssetSphere MSC Architecture v2.2</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">
            SHA-256 Dual-Signature Cryptographic Verification System
          </div>
        </div>
      </footer>
    </NavigationController>
  );
}
