import React from 'react';
import { Upload, FileCheck2, Sparkles } from 'lucide-react';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';

export interface UploadPdfDropzoneStaticComponentProps {
  pdfUrl: string | null;
  pdfFileName: string;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
}

export default function UploadPdfDropzoneStaticComponent({
  pdfUrl,
  pdfFileName,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onLoadSample,
}: UploadPdfDropzoneStaticComponentProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            1. Select / Drop PDF Document
          </h4>
        </div>

        {!pdfUrl && (
          <button
            type="button"
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={onLoadSample}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline flex items-center gap-1 cursor-pointer select-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Demo PDF Sample</span>
          </button>
        )}
      </div>

      {/* Drop Zone Box */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all ${
          pdfUrl
            ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20'
            : dragOver
            ? 'border-[#0C2086] bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]'
            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 hover:bg-slate-100/60 dark:hover:bg-zinc-900/70'
        }`}
      >
        {pdfUrl ? (
          <div className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm font-mono truncate max-w-sm mx-auto">
                {pdfFileName || 'PDF Offer Document Loaded'}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Ready for eSign Placement & Routing
              </p>
            </div>
            <div className="flex justify-center pt-1">
              <label
                onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer select-none transition-colors"
              >
                <span>Replace PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0C2086] dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                Drag & drop your generated PDF offer here
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Supports standard PDF files (.pdf) from any document editor
              </p>
            </div>
            <label
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0C2086] hover:bg-[#081765] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors select-none"
            >
              <span>Browse PDF File</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
