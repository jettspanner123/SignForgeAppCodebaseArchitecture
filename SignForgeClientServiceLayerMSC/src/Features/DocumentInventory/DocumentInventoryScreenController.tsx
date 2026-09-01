import React, { useMemo } from 'react';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  FileCode2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  Plus, 
  Building2,
  MapPin,
  FileSignature
} from 'lucide-react';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';
import { OfferDocument } from '../../Types';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import BadgeSharedComponent from '../../Shared/Components/BadgeSharedComponent';
import InputSharedComponent from '../../Shared/Components/InputSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import { downloadExecutedPDF } from '../../utils/pdfGenerator';
import { encodeOfferForUrl } from '../../utils/urlEncoder';

export interface DocumentInventoryScreenControllerProps {
  onOpenAuditModalForDoc: (doc: OfferDocument) => void;
  onOpenSendEmailModal: (doc: OfferDocument) => void;
}

export default function DocumentInventoryScreenController({
  onOpenAuditModalForDoc,
  onOpenSendEmailModal,
}: DocumentInventoryScreenControllerProps) {
  const {
    documents,
    searchQuery,
    setSearchQuery,
    activeStatusFilter,
    setActiveStatusFilter,
    setSelectedDocId,
    setCurrentView,
    deleteDocument,
  } = useOfferDocumentStore();

  // KPI Metrics Calculations
  const metrics = useMemo(() => {
    const total = documents.length;
    const pendingCandidate = documents.filter((d) => d.status === 'SENT').length;
    const pendingCountersign = documents.filter((d) => d.status === 'CANDIDATE_SIGNED').length;
    const fullyExecuted = documents.filter((d) => d.status === 'HR_COUNTERSIGNED').length;
    const drafts = documents.filter((d) => d.status === 'DRAFT').length;
    const others = documents.filter((d) => d.status === 'EXPIRED' || d.status === 'VOID').length;

    return { total, pendingCandidate, pendingCountersign, fullyExecuted, drafts, others };
  }, [documents]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Status Filter
      if (activeStatusFilter !== 'ALL' && doc.status !== activeStatusFilter) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateName = doc.offerDetails.candidateName.toLowerCase();
        const candidateEmail = doc.offerDetails.candidateEmail.toLowerCase();
        const role = doc.offerDetails.roleTitle.toLowerCase();
        const department = doc.offerDetails.department.toLowerCase();
        const docNum = doc.docNumber.toLowerCase();

        return (
          candidateName.includes(query) ||
          candidateEmail.includes(query) ||
          role.includes(query) ||
          department.includes(query) ||
          docNum.includes(query)
        );
      }

      return true;
    });
  }, [documents, activeStatusFilter, searchQuery]);

  const handleOpenCandidatePortal = (doc: OfferDocument) => {
    setSelectedDocId(doc.id);
    setCurrentView(ApplicationRouteCON.CANDIDATE_VIEW);
  };

  const handleOpenCountersignPortal = (doc: OfferDocument) => {
    setSelectedDocId(doc.id);
    setCurrentView(ApplicationRouteCON.HR_COUNTERSIGN);
  };

  const handleCopySigningLink = (doc: OfferDocument) => {
    const encodedPayload = encodeOfferForUrl(doc);
    const origin = window.location.origin;
    const shareUrl = `${origin}?view=sign&payload=${encodedPayload}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Candidate signing link copied to clipboard!\n\n${shareUrl}`);
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR') {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} LPA`;
      }
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${currency} ${amount.toLocaleString('en-US')}`;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* 1. Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0C2086] dark:text-blue-400">
              Enterprise Document Management
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">
              Canonical Repository
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100">
            Document Inventory & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Monitor real-time candidate signing status, verify dual cryptographic audit trails, and dispatch executed offer packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <ButtonSharedComponent
            variant="outline"
            size="sm"
            leftIcon={<FileCode2 className="w-3.5 h-3.5" />}
            onClick={() => setCurrentView(ApplicationRouteCON.UPLOAD_PDF)}
          >
            Upload PDF
          </ButtonSharedComponent>
          <ButtonSharedComponent
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCurrentView(ApplicationRouteCON.CREATE_OFFER)}
          >
            New Offer Package
          </ButtonSharedComponent>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Documents */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Pipeline</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-serif-headline text-slate-900 dark:text-zinc-100">
            {metrics.total}
          </div>
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
            Registered offer letters
          </p>
        </div>

        {/* Pending Candidate Signature */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-medium">Candidate Action</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-serif-headline text-amber-600 dark:text-amber-400">
            {metrics.pendingCandidate}
          </div>
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
            Awaiting eSignature
          </p>
        </div>

        {/* Pending Countersign */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-blue-200/60 dark:border-blue-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#0C2086] dark:text-blue-400 mb-2">
            <span className="text-xs font-medium">HR Countersign</span>
            <FileSignature className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-serif-headline text-[#0C2086] dark:text-blue-400">
            {metrics.pendingCountersign}
          </div>
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
            Signed by candidate
          </p>
        </div>

        {/* Fully Executed */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-medium">Fully Executed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-serif-headline text-emerald-600 dark:text-emerald-400">
            {metrics.fullyExecuted}
          </div>
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
            Dual signature complete
          </p>
        </div>

        {/* Drafts */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium">Drafts / In Prep</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-serif-headline text-slate-900 dark:text-zinc-100">
            {metrics.drafts}
          </div>
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
            Unsent offer packages
          </p>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-zinc-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
        {/* Search Input */}
        <div className="w-full lg:w-96">
          <InputSharedComponent
            placeholder="Search by candidate, role, doc #..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All', count: metrics.total },
            { id: 'SENT', label: 'Candidate Pending', count: metrics.pendingCandidate },
            { id: 'CANDIDATE_SIGNED', label: 'Countersign Pending', count: metrics.pendingCountersign },
            { id: 'HR_COUNTERSIGNED', label: 'Executed', count: metrics.fullyExecuted },
            { id: 'DRAFT', label: 'Drafts', count: metrics.drafts },
          ].map((tab) => {
            const isSelected = activeStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? '!bg-[#0C2086] !text-white border-[#0C2086] font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Enterprise Document Inventory Table */}
      {filteredDocuments.length === 0 ? (
        <EmptyStateSharedComponent
          title="No Documents Found"
          description={
            searchQuery
              ? `No offer documents match your search query "${searchQuery}".`
              : 'No documents match the selected status filter.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setActiveStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/75 dark:bg-zinc-900/90 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-4">Candidate & Contact</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamps</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                {filteredDocuments.map((doc) => {
                  const isReadyForCountersign = doc.status === 'CANDIDATE_SIGNED';
                  const isPendingCandidate = doc.status === 'SENT';
                  const isFullyExecuted = doc.status === 'HR_COUNTERSIGNED';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* 1. Document ID & Type */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[#0C2086] dark:text-blue-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 block">
                              {doc.docNumber}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
                              {doc.documentType.replace('_', ' ')} • {doc.signatureCount} Signatures
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Candidate & Contact */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">
                          {doc.offerDetails.candidateName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {doc.offerDetails.candidateEmail}
                        </div>
                        {doc.offerDetails.candidatePhone && (
                          <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {doc.offerDetails.candidatePhone}
                          </div>
                        )}
                      </td>

                      {/* 3. Role & Department */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">
                          {doc.offerDetails.roleTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{doc.offerDetails.department}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{doc.offerDetails.location}</span>
                        </div>
                      </td>

                      {/* 4. Compensation */}
                      <td className="py-3.5 px-4 align-middle font-mono">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          {formatCurrency(doc.offerDetails.ctc, doc.offerDetails.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                          Fixed: {formatCurrency(doc.offerDetails.fixedSalary, doc.offerDetails.currency)}
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 align-middle">
                        <BadgeSharedComponent status={doc.status} />
                      </td>

                      {/* 6. Timestamps */}
                      <td className="py-3.5 px-4 align-middle font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <div>Created: {formatDate(doc.createdAt)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                          Expires: {formatDate(doc.offerDetails.expiryDate)}
                        </div>
                      </td>

                      {/* 7. Action Menu Cluster */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ready for Countersign CTA */}
                          {isReadyForCountersign && (
                            <ButtonSharedComponent
                              variant="primary"
                              size="sm"
                              leftIcon={<FileSignature className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenCountersignPortal(doc)}
                            >
                              Countersign
                            </ButtonSharedComponent>
                          )}

                          {/* Candidate Sign Link CTA */}
                          {isPendingCandidate && (
                            <ButtonSharedComponent
                              variant="secondary"
                              size="sm"
                              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenCandidatePortal(doc)}
                            >
                              Sign Portal
                            </ButtonSharedComponent>
                          )}

                          {/* Download Executed PDF */}
                          {isFullyExecuted && (
                            <button
                              onClick={() => downloadExecutedPDF(doc)}
                              title="Download Certified PDF"
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/40 cursor-pointer transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}

                          {/* Send Email Modal */}
                          <button
                            onClick={() => onOpenSendEmailModal(doc)}
                            title="Dispatch Email to Candidate"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Audit Trail Modal */}
                          <button
                            onClick={() => onOpenAuditModalForDoc(doc)}
                            title="View Cryptographic Audit Trail"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Delete Document */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove document ${doc.docNumber}?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            title="Delete Document"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200/60 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-4 py-3 bg-slate-50/75 dark:bg-zinc-900/90 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>
              Showing <strong className="font-mono text-slate-700 dark:text-zinc-200">{filteredDocuments.length}</strong> of{' '}
              <strong className="font-mono text-slate-700 dark:text-zinc-200">{documents.length}</strong> offer documents
            </span>
            <span className="font-mono text-[11px]">
              AssetSphere Cryptographic Audit Ledger Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
