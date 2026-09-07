import React from 'react';
import { FileText, Upload } from 'lucide-react';

export interface UploadPdfViewerStaticComponentProps {
  pdfUrl: string | null;
  pdfFileName: string;
  signatureCount?: 2 | 3;
}

export default function UploadPdfViewerStaticComponent({
  pdfUrl,
  pdfFileName,
}: UploadPdfViewerStaticComponentProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-slate-700 dark:border-zinc-800 bg-slate-900 overflow-hidden shadow-xl min-h-[640px] flex flex-col relative">
      {pdfUrl ? (
        <div className="flex-1 flex flex-col h-full relative">
          {/* Embedded Header Info Bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate max-w-[280px] font-mono text-slate-200">
              {pdfFileName}
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              PDF LOADED
            </span>
          </div>

          {/* Embedded Object Frame */}
          <div className="flex-1 bg-slate-800/90 relative p-2 min-h-[580px]">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-[580px] sm:h-[620px] rounded-lg bg-white shadow-inner"
            >
              <div className="p-8 text-center text-slate-300 space-y-2">
                <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm">PDF Uploaded Successfully</p>
                <p className="text-xs text-slate-400 font-mono">{pdfFileName}</p>
              </div>
            </object>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 min-h-[640px]">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
            <Upload className="w-7 h-7 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-slate-200 text-sm font-sans">No PDF Selected</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Upload your PDF on the left or click &quot;Use Demo PDF Sample&quot; to preview your document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
