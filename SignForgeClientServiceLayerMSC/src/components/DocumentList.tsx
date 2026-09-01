import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Upload,
  Search, 
  UserCheck, 
  ShieldCheck, 
  Send, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Layers,
  Sparkles,
  Trash2,
  X,
  ExternalLink,
  Mail,
  Link as LinkIcon
} from 'lucide-react';
import { OfferDocument, DocumentStatus } from '../types';
import { downloadExecutedPDF } from '../utils/pdfGenerator';
import { formatTimestamp } from '../utils/crypto';

interface DocumentListProps {
  documents: OfferDocument[];
  onSelectDocument: (doc: OfferDocument, view: 'CANDIDATE_VIEW' | 'HR_COUNTERSIGN' | 'AUDIT_LOG' | 'EXECUTIVE_DISPATCH') => void;
  onCreateNewOffer: () => void;
  onEditOffer?: (doc: OfferDocument) => void;
  onUploadPdfOffer?: () => void;
  onDeleteDocument: (id: string) => void;
  onClearAllDocuments?: () => void;
  onSendEmail?: (doc: OfferDocument) => void;
  searchQuery: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelectDocument,
  onCreateNewOffer,
  onEditOffer,
  onUploadPdfOffer,
  onDeleteDocument,
  onClearAllDocuments,
  onSendEmail,
  searchQuery
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [docToDelete, setDocToDelete] = useState<OfferDocument | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);

  const handleDownloadPdf = async (doc: OfferDocument) => {
    setDownloadingDocId(doc.id);
    const result = await downloadExecutedPDF(doc);
    setDownloadingDocId(null);

    if (result.success && result.blobUrl && result.fileName) {
      setDownloadReady({ blobUrl: result.blobUrl, fileName: result.fileName });
    } else if (result.error) {
      alert(`Could not generate PDF: ${result.error}`);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.offerDetails.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.offerDetails.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'OUT_FOR_SIGN') return doc.status === 'OUT_FOR_CANDIDATE_SIGN';
    if (selectedFilter === 'CANDIDATE_SIGNED') return doc.status === 'CANDIDATE_SIGNED';
    if (selectedFilter === 'FULLY_EXECUTED') return doc.status === 'FULLY_EXECUTED';
    return true;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'OUT_FOR_CANDIDATE_SIGN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3" />
            <span>Out for Candidate Sign</span>
          </span>
        );
      case 'CANDIDATE_SIGNED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <UserCheck className="h-3 w-3" />
            <span>Candidate Signed (Pending HR)</span>
          </span>
        );
      case 'HR_COUNTERSIGNED':
      case 'FULLY_EXECUTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Fully Executed & Dispatched</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="h-3 w-3" />
            <span>Declined by Candidate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Dashboard Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              EXECUTIVE DASHBOARD
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Offers: {documents.length}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            Employment Offers & Executive Contracts
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time offer management with dates, compensation packages, eSignature tracking, and inline offer editing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            id="create-offer-hero-btn"
            onClick={onCreateNewOffer}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Create Offer Letter</span>
          </button>

          {onUploadPdfOffer && (
            <button
              id="upload-pdf-hero-btn"
              onClick={onUploadPdfOffer}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all border border-emerald-500"
            >
              <Upload className="h-4.5 w-4.5" />
              <span>Upload External PDF Offer</span>
            </button>
          )}

          {onClearAllDocuments && documents.length > 0 && (
            <button
              id="clear-all-offers-btn"
              onClick={() => setShowClearAllConfirm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm border border-rose-200 dark:border-rose-800 transition-all shadow-sm"
              title="Delete all offers and clean up storage"
            >
              <Trash2 className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
              <span>Clear All Offers</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Offers ({documents.length})
          </button>

          <button
            onClick={() => setSelectedFilter('OUT_FOR_SIGN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'OUT_FOR_SIGN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Out for Sign ({documents.filter((d) => d.status === 'OUT_FOR_CANDIDATE_SIGN').length})
          </button>

          <button
            onClick={() => setSelectedFilter('CANDIDATE_SIGNED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'CANDIDATE_SIGNED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Pending HR Sign ({documents.filter((d) => d.status === 'CANDIDATE_SIGNED').length})
          </button>

          <button
            onClick={() => setSelectedFilter('FULLY_EXECUTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'FULLY_EXECUTED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Fully Executed ({documents.filter((d) => d.status === 'FULLY_EXECUTED').length})
          </button>
        </div>
      </div>

      {/* Document Grid Cards */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <Layers className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Offer Letters Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No documents match "${searchQuery}"` : 'Create your first candidate employment offer to initiate the dual-eSignature workflow.'}
          </p>
          <button
            onClick={onCreateNewOffer}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 inline-flex items-center space-x-2 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Offer Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                    {doc.documentNumber}
                  </span>
                  <div className="flex items-center space-x-1 shrink-0">
                    {getStatusBadge(doc.status)}
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                    {doc.offerDetails.candidateName}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center justify-between">
                    <span>{doc.offerDetails.jobTitle}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                      {formatTimestamp(doc.createdAt).split(',')[0]}
                    </span>
                  </p>
                </div>
              </div>

              {/* Card Footer Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                
                {/* Primary Workflow Button */}
                {doc.status === 'OUT_FOR_CANDIDATE_SIGN' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onSelectDocument(doc, 'CANDIDATE_VIEW')}
                      className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Open Portal</span>
                    </button>
                    {onSendEmail && (
                      <button
                        onClick={() => onSendEmail(doc)}
                        className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Send Email</span>
                      </button>
                    )}
                  </div>
                )}

                {doc.status === 'CANDIDATE_SIGNED' && (
                  <button
                    onClick={() => onSelectDocument(doc, 'HR_COUNTERSIGN')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>HR Counter-Sign & Execute Offer</span>
                  </button>
                )}

                {doc.status === 'FULLY_EXECUTED' && (
                  <button
                    onClick={() => onSelectDocument(doc, 'EXECUTIVE_DISPATCH')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>View Executive Email Logs</span>
                  </button>
                )}

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-5 gap-1 text-[11px]">
                  <button
                    onClick={() => onSelectDocument(doc, 'CANDIDATE_VIEW')}
                    className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-center font-bold"
                  >
                    View
                  </button>

                  {onEditOffer && (
                    <button
                      onClick={() => onEditOffer(doc)}
                      className="py-1.5 px-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 text-center font-bold"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => onSelectDocument(doc, 'AUDIT_LOG')}
                    className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-center font-bold"
                  >
                    Audit
                  </button>

                  <button
                    disabled={downloadingDocId === doc.id}
                    onClick={() => handleDownloadPdf(doc)}
                    className="py-1.5 px-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center font-bold disabled:opacity-50 flex items-center justify-center space-x-0.5"
                  >
                    {downloadingDocId === doc.id ? (
                      <span className="text-[9px]">Gen...</span>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="py-1.5 px-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 text-center font-bold flex items-center justify-center space-x-0.5"
                    title="Delete Offer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Download Success Floating Notification */}
      {downloadReady && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 max-w-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-white text-sm">PDF Generated Successfully!</p>
            <p className="text-slate-300 truncate mt-0.5">{downloadReady.fileName}</p>
            <p className="text-slate-400 text-[11px] mt-1">If automatic download was blocked by browser iframe settings, click below to open:</p>
            <a 
              href={downloadReady.blobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>Open & Save PDF in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button onClick={() => setDownloadReady(null)} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete Single Offer Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Offer Document?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permanent Action</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">{docToDelete.title || docToDelete.documentNumber}</p>
              <p className="text-slate-600 dark:text-slate-300">Candidate: <strong className="text-slate-900 dark:text-white">{docToDelete.offerDetails.candidateName}</strong></p>
              <p className="text-slate-600 dark:text-slate-300">Position: {docToDelete.offerDetails.jobTitle}</p>
              <p className="text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                Ref: {docToDelete.documentNumber}
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this offer? This will permanently remove it from your document list and storage.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Offers Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Clear All Offer Documents?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Clean up dummy and saved offers</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action will permanently delete all <strong className="text-slate-900 dark:text-white">{documents.length}</strong> offer documents from local storage.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearAllDocuments) onClearAllDocuments();
                  setShowClearAllConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Clear All Offers</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
