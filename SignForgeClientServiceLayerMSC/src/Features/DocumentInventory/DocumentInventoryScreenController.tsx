import React, { useState, useMemo } from 'react';
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
  FileSignature,
  Layers,
  Grid,
  List,
  Maximize2,
  WrapText,
  Send
} from 'lucide-react';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';
import { OfferDocument } from '../../Types';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import { motion } from 'motion/react';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import BadgeSharedComponent from '../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import CustomSelectSharedComponent, { SelectOption } from '../../Shared/Components/CustomSelectSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import { downloadExecutedPDF } from '../../utils/pdfGenerator';
import { formatTimestamp } from '../../utils/crypto';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface DocumentInventoryScreenControllerProps {
  onOpenAuditModalForDoc: (doc: OfferDocument) => void;
  onOpenSendEmailModal: (doc: OfferDocument) => void;
}

export default function DocumentInventoryScreenController({
  onOpenAuditModalForDoc,
  onOpenSendEmailModal,
}: DocumentInventoryScreenControllerProps): React.JSX.Element {
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

  const {
    inventoryViewMode: viewMode,
    setInventoryViewMode: setViewMode,
    inventoryGridColumns: gridColumns,
    setInventoryGridColumns: setGridColumns,
    inventorySingleLineMode: isSingleLineMode,
    setInventorySingleLineMode: setIsSingleLineMode,
  } = useOfferDocumentStore();

  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<OfferDocument | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  const lastDocToDeleteRef = React.useRef<OfferDocument | null>(null);
  if (docToDelete) {
    lastDocToDeleteRef.current = docToDelete;
  }
  const displayDocForDelete = docToDelete || lastDocToDeleteRef.current;

  // Status Filter Options for CustomSelectSharedComponent 1:1 AssetSphere
  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: `All Documents (${documents.length})` },
    { value: 'DRAFT', label: `Drafts (${documents.filter((d) => d.status === 'DRAFT').length})` },
    { value: 'SENT', label: `Pending Candidate (${documents.filter((d) => d.status === 'SENT' || d.status === 'OUT_FOR_CANDIDATE_SIGN').length})` },
    { value: 'CANDIDATE_SIGNED', label: `Pending Countersign (${documents.filter((d) => d.status === 'CANDIDATE_SIGNED').length})` },
    { value: 'HR_COUNTERSIGNED', label: `Fully Executed (${documents.filter((d) => d.status === 'HR_COUNTERSIGNED' || d.status === 'FULLY_EXECUTED').length})` },
    { value: 'EXPIRED', label: `Expired (${documents.filter((d) => d.status === 'EXPIRED').length})` },
    { value: 'VOID', label: `Void (${documents.filter((d) => d.status === 'VOID').length})` },
  ];

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
        const role = (doc.offerDetails.roleTitle || doc.offerDetails.jobTitle || 'Position').toLowerCase();
        const department = doc.offerDetails.department.toLowerCase();
        const docNum = (doc.documentNumber || doc.docNumber || 'DOC-000').toLowerCase();

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

  const handleDownloadPdf = async (doc: OfferDocument) => {
    setDownloadingDocId(doc.id);
    const result = await downloadExecutedPDF(doc);
    setDownloadingDocId(null);

    if (result.success && result.blobUrl && result.fileName) {
      const link = document.createElement('a');
      link.href = result.blobUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (result.error) {
      alert(`Could not generate PDF: ${result.error}`);
    }
  };

  const handleCopySigningLink = (doc: OfferDocument) => {
    const url = `${window.location.origin}${window.location.pathname}#/candidate/${doc.id}`;
    navigator.clipboard.writeText(url);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  const handleExportCSV = () => {
    if (filteredDocuments.length === 0) return;
    const headers = ['Document Number', 'Candidate Name', 'Email', 'Job Title', 'Department', 'Annual CTC', 'Status', 'Created At'];
    const rows = filteredDocuments.map((doc) => [
      doc.documentNumber,
      `"${doc.offerDetails?.candidateName || 'N/A'}"`,
      doc.offerDetails?.candidateEmail || 'N/A',
      `"${doc.offerDetails?.jobTitle || doc.offerDetails?.roleTitle || 'N/A'}"`,
      `"${doc.offerDetails?.department || 'N/A'}"`,
      `"${doc.offerDetails?.annualSalary || 'N/A'}"`,
      doc.status,
      formatTimestamp(doc.createdAt),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `signforge_documents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* 1. Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Document Inventory <br className="sm:hidden" />&amp; Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            Monitor real-time candidate signing status, verify dual cryptographic audit trails, and dispatch executed offer packages.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:items-center sm:w-auto sm:shrink-0">
          <ButtonSharedComponent
            variant="outline"
            size="sm"
            leftIcon={<FileCode2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-zinc-400" />}
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={() => setCurrentView(ApplicationRouteCON.UPLOAD_PDF)}
            className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 sm:px-3.5 text-sm sm:text-xs font-bold"
          >
            Upload PDF
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={() => setCurrentView(ApplicationRouteCON.CREATE_OFFER)}
            icon={<Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
            className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 sm:px-3.5 text-sm sm:text-xs font-bold"
          >
            <span className="sm:hidden">New Offer</span>
            <span className="hidden sm:inline">New Offer Package</span>
          </PrimaryActionButtonSharedComponent>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Documents */}
        <div className="rounded-xl bg-white dark:bg-[#0d0d10] border border-slate-300/90 dark:border-zinc-800 p-4 shadow-sm dark:shadow-2xs">
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
        <div className="rounded-xl bg-white dark:bg-[#0d0d10] border border-amber-300/90 dark:border-amber-900/60 p-4 shadow-sm dark:shadow-2xs">
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
        <div className="rounded-xl bg-white dark:bg-[#0d0d10] border border-blue-300/90 dark:border-blue-900/60 p-4 shadow-sm dark:shadow-2xs">
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
        <div className="rounded-xl bg-white dark:bg-[#0d0d10] border border-emerald-300/90 dark:border-emerald-900/60 p-4 shadow-sm dark:shadow-2xs">
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
        <div className="rounded-xl bg-white dark:bg-[#0d0d10] border border-slate-300/90 dark:border-zinc-800 p-4 shadow-sm dark:shadow-2xs col-span-2 sm:col-span-1">
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

      {/* 3. Control Toolbar Card 1:1 AssetSphere */}
      <CardSharedComponent className="p-4 space-y-4">
        {/* Row 1: Search Input & Primary Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate, role, doc #, or email..."
              className="w-full h-11 sm:h-9 pl-11 pr-4 text-base sm:text-xs rounded-xl sm:rounded-lg bg-slate-50 dark:bg-[#08080a] text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <ButtonSharedComponent
              variant="outline"
              size="sm"
              onPointerDown={() => triggerHapticFeedback(12)}
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-zinc-400" />}
              className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
            >
              Export CSV
            </ButtonSharedComponent>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters & Uniform View Switchers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800/80 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 dark:text-zinc-400 font-medium shrink-0">Status:</span>
            <CustomSelectSharedComponent
              value={activeStatusFilter}
              options={statusOptions}
              onChange={(val) => setActiveStatusFilter(val)}
              size="sm"
              className="w-full sm:w-60"
            />
          </div>

          {/* View Switchers Container (Separate Rows on Mobile, Side-by-Side on Desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Row A: Sub-View Options (Grid Density / Single-Line Mode) */}
            {viewMode === 'grid' && (
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full sm:w-auto">
                <button
                  type="button"
                  onPointerDown={() => triggerHapticFeedback(12)}
                  onClick={() => setGridColumns(2)}
                  className="flex-1 sm:flex-initial relative flex items-center justify-center px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  title="Show 2 Items Per Row"
                >
                  {gridColumns === 2 && (
                    <motion.div
                      layoutId="activeGridDensityPill"
                      className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 ${
                    gridColumns === 2
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    2 Per Row
                  </span>
                </button>
                <button
                  type="button"
                  onPointerDown={() => triggerHapticFeedback(12)}
                  onClick={() => setGridColumns(3)}
                  className="flex-1 sm:flex-initial relative flex items-center justify-center px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  title="Show 3 Items Per Row"
                >
                  {gridColumns === 3 && (
                    <motion.div
                      layoutId="activeGridDensityPill"
                      className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 ${
                    gridColumns === 3
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    3 Per Row
                  </span>
                </button>
              </div>
            )}

            {/* Table Single-Line Segmented Control */}
            {viewMode === 'table' && (
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full sm:w-auto">
                <button
                  type="button"
                  onPointerDown={() => triggerHapticFeedback(12)}
                  onClick={() => setIsSingleLineMode(true)}
                  className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  title="Single-Line Table Mode"
                >
                  {isSingleLineMode && (
                    <motion.div
                      layoutId="activeTableSingleLinePill"
                      className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${
                    isSingleLineMode
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Single-Line</span>
                  </span>
                </button>
                <button
                  type="button"
                  onPointerDown={() => triggerHapticFeedback(12)}
                  onClick={() => setIsSingleLineMode(false)}
                  className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  title="Wrap Text Table Mode"
                >
                  {!isSingleLineMode && (
                    <motion.div
                      layoutId="activeTableSingleLinePill"
                      className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${
                    !isSingleLineMode
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    <WrapText className="w-3.5 h-3.5" />
                    <span>Wrap Text</span>
                  </span>
                </button>
              </div>
            )}

            {/* Row B: View Mode Segmented Control (Table, Grid) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full sm:w-auto">
              <button
                type="button"
                onPointerDown={() => triggerHapticFeedback(12)}
                onClick={() => setViewMode('table')}
                className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                title="Table View"
              >
                {viewMode === 'table' && (
                  <motion.div
                    layoutId="activeInventoryViewModePill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </span>
              </button>
              <button
                type="button"
                onPointerDown={() => triggerHapticFeedback(12)}
                onClick={() => setViewMode('grid')}
                className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                title="Grid View"
              >
                {viewMode === 'grid' && (
                  <motion.div
                    layoutId="activeInventoryViewModePill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </CardSharedComponent>

      {/* 4. Document Presentation (Table View vs Grid Cards) */}
      {filteredDocuments.length === 0 ? (
        <EmptyStateSharedComponent
          icon={<Layers className="w-6 h-6" />}
          title="No Documents Found"
          description={
            searchQuery
              ? `No offer documents match your search query "${searchQuery}".`
              : 'No documents match the selected status filter.'
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW 1:1 AssetSphere */
        <CardSharedComponent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121215] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-4">Candidate & Contact</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamps</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-zinc-800/60 text-xs">
                {filteredDocuments.map((doc) => {
                  const isReadyForCountersign = doc.status === 'CANDIDATE_SIGNED';
                  const isPendingCandidate = doc.status === 'SENT';
                  const isFullyExecuted = doc.status === 'HR_COUNTERSIGNED';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Document Details */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate font-mono">
                          {doc.documentNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          {doc.title}
                        </div>
                      </td>

                      {/* Candidate & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-zinc-200">
                          {doc.offerDetails?.candidateName || 'N/A'}
                        </div>
                        {!isSingleLineMode && (
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{doc.offerDetails?.candidateEmail || 'N/A'}</span>
                          </div>
                        )}
                      </td>

                      {/* Role & Department */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                          {doc.offerDetails?.jobTitle || doc.offerDetails?.roleTitle || 'N/A'}
                        </div>
                        {!isSingleLineMode && (
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                            {doc.offerDetails?.department || 'Operations'} • {doc.offerDetails?.location || doc.offerDetails?.workLocation || 'Bengaluru'}
                          </div>
                        )}
                      </td>

                      {/* Compensation */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-zinc-100">
                        {doc.offerDetails?.annualSalary || 'Confidential'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <BadgeSharedComponent status={doc.status} size="sm" />
                      </td>

                      {/* Timestamps */}
                      <td className="py-3 px-4 text-[11px] font-mono text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                        <div>{formatTimestamp(doc.createdAt)}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isReadyForCountersign && (
                            <ButtonSharedComponent
                              variant="primary"
                              size="sm"
                              leftIcon={<FileSignature className="w-3.5 h-3.5 !text-white" />}
                              onClick={() => handleOpenCountersignPortal(doc)}
                            >
                              Countersign
                            </ButtonSharedComponent>
                          )}

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

                          {isFullyExecuted && (
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(doc)}
                              title="Download Certified PDF"
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-900/60 cursor-pointer transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenSendEmailModal(doc)}
                            title="Dispatch Email to Candidate"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 cursor-pointer transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenAuditModalForDoc(doc)}
                            title="View Cryptographic Audit Trail"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            title="Delete Document"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 cursor-pointer transition-colors"
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
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#121215] border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>
              Showing <strong className="font-mono text-slate-700 dark:text-zinc-200">{filteredDocuments.length}</strong> of{' '}
              <strong className="font-mono text-slate-700 dark:text-zinc-200">{documents.length}</strong> offer documents
            </span>
            <span className="font-mono text-[11px]">
              SignForge Cryptographic Audit Ledger Active
            </span>
          </div>
        </CardSharedComponent>
      ) : (
        /* GRID CARD VIEW 1:1 AssetSphere */
        <div className={`grid gap-4 ${gridColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredDocuments.map((doc) => {
            const isReadyForCountersign = doc.status === 'CANDIDATE_SIGNED';
            const isPendingCandidate = doc.status === 'SENT';

            return (
              <CardSharedComponent
                key={doc.id}
                hoverable
                className="p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Top: Document # & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-300 dark:border-zinc-700 inline-block w-fit">
                        {doc.documentNumber}
                      </span>
                      {/* Mobile: Badge placed on next line below Document ID */}
                      <div className="sm:hidden w-fit">
                        <BadgeSharedComponent status={doc.status} size="sm" />
                      </div>
                    </div>
                    <h3 className="font-serif-headline font-bold text-base text-slate-900 dark:text-zinc-100 mt-2 truncate">
                      {doc.offerDetails?.candidateName || 'N/A'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      {doc.offerDetails?.jobTitle || doc.offerDetails?.roleTitle || 'N/A'}
                    </p>
                  </div>
                  {/* Desktop: Badge on top-right */}
                  <div className="hidden sm:block shrink-0">
                    <BadgeSharedComponent status={doc.status} size="sm" />
                  </div>
                </div>

                {/* Middle: Details Grid */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Compensation</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{doc.offerDetails?.annualSalary || 'Confidential'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Department</span>
                    <span>{doc.offerDetails?.department || 'Operations'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Created</span>
                    <span className="font-mono text-[11px]">{formatTimestamp(doc.createdAt)}</span>
                  </div>
                </div>

                {/* Bottom Actions Cluster */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80">
                  {/* Row 1: 4-Column Equal Icon Actions Grid on Mobile */}
                  <div className="grid grid-cols-4 gap-2 w-full sm:flex sm:items-center sm:gap-1 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => onOpenAuditModalForDoc(doc)}
                      title="Audit Trail Logs"
                      className="w-full sm:w-auto h-10 sm:h-auto py-2 sm:p-1.5 flex items-center justify-center rounded-xl sm:rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={downloadingDocId === doc.id}
                      onClick={() => handleDownloadPdf(doc)}
                      title="Download PDF"
                      className="w-full sm:w-auto h-10 sm:h-auto py-2 sm:p-1.5 flex items-center justify-center rounded-xl sm:rounded-lg text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/60 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenSendEmailModal(doc)}
                      title="Dispatch Email"
                      className="w-full sm:w-auto h-10 sm:h-auto py-2 sm:p-1.5 flex items-center justify-center rounded-xl sm:rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      title="Delete Document"
                      className="w-full sm:w-auto h-10 sm:h-auto py-2 sm:p-1.5 flex items-center justify-center rounded-xl sm:rounded-lg text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Row 2: Full-Width Workflow Button on Mobile */}
                  {(isReadyForCountersign || isPendingCandidate) && (
                    <div className="w-full sm:w-auto">
                      {isReadyForCountersign && (
                        <ButtonSharedComponent
                          variant="primary"
                          size="sm"
                          leftIcon={<FileSignature className="w-3.5 h-3.5 !text-white" />}
                          onClick={() => handleOpenCountersignPortal(doc)}
                          className="w-full sm:w-auto justify-center !h-10 sm:!h-9 px-4 text-xs font-semibold"
                        >
                          Countersign
                        </ButtonSharedComponent>
                      )}

                      {isPendingCandidate && (
                        <ButtonSharedComponent
                          variant="secondary"
                          size="sm"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenCandidatePortal(doc)}
                          className="w-full sm:w-auto justify-center !h-10 sm:!h-9 px-4 text-xs font-semibold"
                        >
                          Sign Portal
                        </ButtonSharedComponent>
                      )}
                    </div>
                  )}
                </div>
              </CardSharedComponent>
            );
          })}
        </div>
      )}

      {/* 5. Delete Confirmation Modal (Always mounted for smooth AnimatePresence directional exit animations) */}
      <ConfirmationModalSharedComponent
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) {
            deleteDocument(docToDelete.id);
            setDocToDelete(null);
          }
        }}
        title="Delete Offer Document?"
        subtitle="Permanent document deletion"
        description={
          displayDocForDelete
            ? `Are you sure you want to delete ${displayDocForDelete.documentNumber} for ${displayDocForDelete.offerDetails?.candidateName || 'this candidate'}? This document will be permanently removed.`
            : 'Are you sure you want to delete this document? This document will be permanently removed.'
        }
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
